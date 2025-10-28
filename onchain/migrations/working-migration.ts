import "dotenv/config";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voltchain } from "../target/types/voltchain";
import { PublicKey, Keypair } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

// Configure the client to use the local cluster
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.Voltchain as Program<Voltchain>;
const connection = provider.connection;

async function main() {
  console.log("🚀 VoltChain Working Migration");
  console.log(`Program ID: ${program.programId.toString()}`);
  console.log(`Cluster: ${provider.connection.rpcEndpoint}`);

  const authority = provider.wallet.publicKey;
  console.log(`Authority: ${authority.toString()}`);

  try {
    // Create VoltChain mint (exact same pattern as tests)
    console.log("📝 Creating VoltChain mint...");
    const voltchainMint = await createMint(
      connection,
      provider.wallet as any,
      authority, // mint authority
      null, // freeze authority
      6 // decimals
    );
    console.log(`✅ VoltChain mint: ${voltchainMint.toString()}`);

    // Initialize pool (exact same pattern as tests)
    console.log("🏊 Initializing pool...");
    const tx = await program.methods
      .initializePool(authority, voltchainMint)
      .rpc();

    console.log(`✅ Pool initialized: ${tx}`);

    // Fetch and display pool state
    const [poolPda] = PublicKey.findProgramAddressSync([Buffer.from("pool")], program.programId);
    const poolAccount = await program.account.pool.fetch(poolPda);
    
    console.log("\n📊 Pool State:");
    console.log(`   Authority: ${poolAccount.authority.toString()}`);
    console.log(`   VoltChain Mint: ${poolAccount.voltchainMint.toString()}`);
    console.log(`   Total kWh: ${poolAccount.totalKwh.toString()} microkWh`);
    console.log(`   Period: ${poolAccount.period.toString()}`);

    console.log("\n🎉 VoltChain Pool initialized successfully!");
    console.log("\n📋 Next steps:");
    console.log("   1. Run 'anchor test' to run the test suite");
    console.log("   2. The pool is ready for energy trading");

  } catch (error) {
    console.error("❌ Initialization failed:", error);
    console.log("\n💡 Troubleshooting:");
    console.log("   1. Make sure the validator is running: solana-test-validator");
    console.log("   2. Deploy the program first: anchor deploy");
    console.log("   3. Check your wallet configuration: solana config get");
    process.exit(1);
  }
}

main().catch(console.error);