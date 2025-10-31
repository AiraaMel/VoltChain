import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { readFileSync } from "fs";
import { join } from "path";
import { writeFileSync } from "fs";

// Load keypair from environment or default location
function loadKeypair(): Keypair {
  const keypairPath = process.env.KEYPAIR_PATH || join(process.env.HOME || "~", ".config/solana/id.json");
  
  try {
    const keypairData = JSON.parse(readFileSync(keypairPath, "utf8"));
    return Keypair.fromSecretKey(new Uint8Array(keypairData));
  } catch (error) {
    console.error("Failed to load keypair:", error);
    process.exit(1);
  }
}

interface SettlementReport {
  saleId: number;
  totalKwhSold: number;
  totalRevenue: number;
  totalFee: number;
  netRevenue: number;
  totalBurned: number;
  users: Array<{
    user: string;
    burnedKwh: number;
    share: number;
    claimableCents: number;
  }>;
}

async function recordSale(
  program: anchor.Program,
  poolPda: PublicKey,
  authority: Keypair,
  kwhSoldMicro: number,
  revenueBrlCents: number,
  feeBps: number
): Promise<string> {
  console.log(`Recording sale...`);
  console.log(`kWh Sold: ${kwhSoldMicro} microkWh`);
  console.log(`Revenue: ${revenueBrlCents} BRL cents`);
  console.log(`Fee: ${feeBps} basis points`);

  const tx = await program.methods
    .recordSale(
      new anchor.BN(kwhSoldMicro),
      new anchor.BN(revenueBrlCents),
      feeBps
    )
    .accounts({
      pool: poolPda,
      authority: authority.publicKey,
    })
    .signers([authority])
    .rpc();

  console.log(`Sale recorded: ${tx}`);
  return tx;
}

async function finalizeSale(
  program: anchor.Program,
  poolPda: PublicKey,
  salePda: PublicKey,
  authority: Keypair,
  saleId: number
): Promise<string> {
  console.log(`Finalizing sale ${saleId}...`);

  const tx = await program.methods
    .finalizeSale(new anchor.BN(saleId))
    .accounts({
      pool: poolPda,
      sale: salePda,
      authority: authority.publicKey,
    })
    .signers([authority])
    .rpc();

  console.log(`Sale finalized: ${tx}`);
  return tx;
}

async function generateSettlementReport(
  connection: Connection,
  program: anchor.Program,
  saleId: number
): Promise<SettlementReport> {
  console.log(`Generating settlement report for sale ${saleId}...`);

  // Get all user claims for this sale
  const userClaims = await program.account.userClaim.all([
    {
      memcmp: {
        offset: 8 + 32, // skip discriminator + user pubkey
        bytes: Buffer.from(saleId.toString()).toString("base64"),
      },
    },
  ]);

  console.log(`Found ${userClaims.length} user claims`);

  // Calculate totals
  let totalBurned = 0;
  const users: SettlementReport["users"] = [];

  for (const claim of userClaims) {
    const burnedKwh = claim.account.burnedVoltchain.toNumber();
    totalBurned += burnedKwh;
    
    users.push({
      user: claim.account.user.toString(),
      burnedKwh,
      share: 0, // Will calculate after we know total
      claimableCents: 0, // Will calculate after we know net revenue
    });
  }

  // Get sale details
  const [salePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("sale"), Buffer.from(saleId.toString())],
    program.programId
  );

  const saleAccount = await program.account.sale.fetch(salePda);
  const totalKwhSold = saleAccount.kwhSold.toNumber();
  const totalRevenue = saleAccount.revenueBrlCents.toNumber();
  const feeBps = saleAccount.feeBps;
  const totalFee = Math.floor((totalRevenue * feeBps) / 10000);
  const netRevenue = totalRevenue - totalFee;

  // Calculate user shares and claimable amounts
  for (const user of users) {
    user.share = totalBurned > 0 ? user.burnedKwh / totalBurned : 0;
    user.claimableCents = Math.floor(netRevenue * user.share);
  }

  return {
    saleId,
    totalKwhSold,
    totalRevenue,
    totalFee,
    netRevenue,
    totalBurned,
    users,
  };
}

async function runSettlement() {
  console.log("Starting VoltChain Energy Settlement Process...");
  
  // Setup connection and provider
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const keypair = loadKeypair();
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(keypair), {});
  anchor.setProvider(provider);

  // Load the program
  const programId = new PublicKey("VoltChainEnergy1111111111111111111111111111111111");
  const program = new anchor.Program(require("../target/idl/voltchain.json"), programId, provider);

  // Get pool PDA
  const [poolPda] = PublicKey.findProgramAddressSync([Buffer.from("pool")], programId);
  
  // Get current pool state
  const poolAccount = await program.account.pool.fetch(poolPda);
  const currentPeriod = poolAccount.period.toNumber();
  const saleId = currentPeriod - 1; // Sale for previous period

  console.log(`Current pool period: ${currentPeriod}`);
  console.log(`Processing sale ID: ${saleId}`);

  // Simulate sale parameters (in real implementation, these would come from CCEE integration)
  const kwhSoldMicro = 1000000; // 1 kWh in microkWh
  const revenueBrlCents = 50000; // R$ 500.00 in cents
  const feeBps = 1500; // 15% fee

  try {
    // Step 1: Record the sale
    await recordSale(program, poolPda, keypair, kwhSoldMicro, revenueBrlCents, feeBps);

    // Step 2: Get sale PDA for finalization
    const [salePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("sale"), Buffer.from(saleId.toString())],
      programId
    );

    // Step 3: Finalize the sale
    await finalizeSale(program, poolPda, salePda, keypair, saleId);

    // Step 4: Generate settlement report
    const report = await generateSettlementReport(connection, program, saleId);

    // Step 5: Save report to CSV
    const csvContent = generateCSVReport(report);
    const csvFilename = `settlement_report_sale_${saleId}_${Date.now()}.csv`;
    writeFileSync(csvFilename, csvContent);

  console.log(`\nSettlement Report Generated:`);
    console.log(`Sale ID: ${report.saleId}`);
    console.log(`Total kWh Sold: ${report.totalKwhSold} microkWh`);
    console.log(`Total Revenue: R$ ${(report.totalRevenue / 100).toFixed(2)}`);
    console.log(`Total Fee: R$ ${(report.totalFee / 100).toFixed(2)}`);
    console.log(`Net Revenue: R$ ${(report.netRevenue / 100).toFixed(2)}`);
    console.log(`Total Burned: ${report.totalBurned} microkWh`);
    console.log(`Users: ${report.users.length}`);
    console.log(`CSV saved: ${csvFilename}`);

    // Display user breakdown
  console.log(`\nUser Breakdown:`);
    for (const user of report.users) {
      console.log(`${user.user}: ${user.burnedKwh} microkWh (${(user.share * 100).toFixed(2)}%) -> R$ ${(user.claimableCents / 100).toFixed(2)}`);
    }

  } catch (error) {
    console.error("Settlement error:", error);
    process.exit(1);
  }
}

function generateCSVReport(report: SettlementReport): string {
  const headers = [
    "Sale ID",
    "User",
    "Burned kWh (micro)",
    "Share (%)",
    "Claimable (BRL cents)",
    "Claimable (BRL)"
  ];

  const rows = report.users.map(user => [
    report.saleId,
    user.user,
    user.burnedKwh,
    (user.share * 100).toFixed(4),
    user.claimableCents,
    (user.claimableCents / 100).toFixed(2)
  ]);

  return [headers, ...rows].map(row => row.join(",")).join("\n");
}

// Run settlement
if (require.main === module) {
  runSettlement().catch(console.error);
}
