import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Enx } from "../target/types/enx";
import { expect } from "chai";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

describe("ENX Energy Platform", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Enx as Program<Enx>;
  const connection = provider.connection;

  // Test accounts
  let authority: Keypair;
  let user1: Keypair;
  let user2: Keypair;
  let enxMint: PublicKey;

  // PDAs
  let poolPda: PublicKey;
  let user1PositionPda: PublicKey;
  let user2PositionPda: PublicKey;

  before(async () => {
    // Generate test keypairs
    authority = Keypair.generate();
    user1 = Keypair.generate();
    user2 = Keypair.generate();

    // Airdrop SOL to test accounts
    await connection.requestAirdrop(authority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await connection.requestAirdrop(user1.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await connection.requestAirdrop(user2.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);

    // Wait for airdrops to confirm
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create ENX mint
    enxMint = await createMint(
      connection,
      authority,
      authority.publicKey,
      null,
      6 // 6 decimals
    );

    // Get PDAs
    [poolPda] = PublicKey.findProgramAddressSync([Buffer.from("pool")], program.programId);
    [user1PositionPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_position"), user1.publicKey.toBuffer()],
      program.programId
    );
    [user2PositionPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_position"), user2.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Initializes the pool", async () => {
    const tx = await program.methods
      .initializePool(authority.publicKey, enxMint)
      .accounts({
        pool: poolPda,
        payer: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    console.log("Initialize pool transaction:", tx);

    // Verify pool state
    const poolAccount = await program.account.pool.fetch(poolPda);
    expect(poolAccount.authority.toString()).to.equal(authority.publicKey.toString());
    expect(poolAccount.enxMint.toString()).to.equal(enxMint.toString());
    expect(poolAccount.totalKwh.toNumber()).to.equal(0);
    expect(poolAccount.period.toNumber()).to.equal(0);
  });

  it("Registers users", async () => {
    // Register user1
    const tx1 = await program.methods
      .registerUser()
      .accounts({
        userPosition: user1PositionPda,
        owner: user1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user1])
      .rpc();

    console.log("Register user1 transaction:", tx1);

    // Register user2
    const tx2 = await program.methods
      .registerUser()
      .accounts({
        userPosition: user2PositionPda,
        owner: user2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user2])
      .rpc();

    console.log("Register user2 transaction:", tx2);

    // Verify user positions
    const user1Position = await program.account.userPosition.fetch(user1PositionPda);
    const user2Position = await program.account.userPosition.fetch(user2PositionPda);

    expect(user1Position.owner.toString()).to.equal(user1.publicKey.toString());
    expect(user1Position.accruedKwh.toNumber()).to.equal(0);
    expect(user1Position.lifetimeKwh.toNumber()).to.equal(0);

    expect(user2Position.owner.toString()).to.equal(user2.publicKey.toString());
    expect(user2Position.accruedKwh.toNumber()).to.equal(0);
    expect(user2Position.lifetimeKwh.toNumber()).to.equal(0);
  });

  it("Reports energy from users", async () => {
    // User1 reports 1000 microkWh
    const tx1 = await program.methods
      .energyReport(new anchor.BN(1000))
      .accounts({
        pool: poolPda,
        userPosition: user1PositionPda,
        owner: user1.publicKey,
      })
      .signers([user1])
      .rpc();

    console.log("User1 energy report transaction:", tx1);

    // User2 reports 2000 microkWh
    const tx2 = await program.methods
      .energyReport(new anchor.BN(2000))
      .accounts({
        pool: poolPda,
        userPosition: user2PositionPda,
        owner: user2.publicKey,
      })
      .signers([user2])
      .rpc();

    console.log("User2 energy report transaction:", tx2);

    // Verify pool and user positions
    const poolAccount = await program.account.pool.fetch(poolPda);
    const user1Position = await program.account.userPosition.fetch(user1PositionPda);
    const user2Position = await program.account.userPosition.fetch(user2PositionPda);

    expect(poolAccount.totalKwh.toNumber()).to.equal(3000);
    expect(user1Position.accruedKwh.toNumber()).to.equal(1000);
    expect(user1Position.lifetimeKwh.toNumber()).to.equal(1000);
    expect(user2Position.accruedKwh.toNumber()).to.equal(2000);
    expect(user2Position.lifetimeKwh.toNumber()).to.equal(2000);
  });

  it("Records a sale", async () => {
    const kwhSoldMicro = 2500; // 2.5 kWh in microkWh
    const revenueBrlCents = 12500; // R$ 125.00 in cents
    const feeBps = 1500; // 15%

    const tx = await program.methods
      .recordSale(
        new anchor.BN(kwhSoldMicro),
        new anchor.BN(revenueBrlCents),
        feeBps
      )
      .accounts({
        pool: poolPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    console.log("Record sale transaction:", tx);

    // Verify pool period incremented
    const poolAccount = await program.account.pool.fetch(poolPda);
    expect(poolAccount.period.toNumber()).to.equal(1);

    // Verify sale account
    const [salePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("sale"), Buffer.from([0, 0, 0, 0, 0, 0, 0, 0])], // Sale ID 0 as u64 little-endian
      program.programId
    );

    const saleAccount = await program.account.sale.fetch(salePda);
    expect(saleAccount.id.toNumber()).to.equal(0);
    expect(saleAccount.kwhSold.toNumber()).to.equal(kwhSoldMicro);
    expect(saleAccount.revenueBrlCents.toNumber()).to.equal(revenueBrlCents);
    expect(saleAccount.feeBps).to.equal(feeBps);
    expect(saleAccount.finalized).to.be.false;
  });

  it("Burns tokens and marks claims", async () => {
    const saleId = 0;
    const kwhToBurn1 = 500; // User1 burns 500 microkWh
    const kwhToBurn2 = 1000; // User2 burns 1000 microkWh

    // User1 burns tokens
    const [user1ClaimPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_claim"), user1.publicKey.toBuffer(), Buffer.from([0, 0, 0, 0, 0, 0, 0, 0])], // Sale ID 0 as u64 little-endian
      program.programId
    );

    const tx1 = await program.methods
      .burnAndMark(new anchor.BN(saleId), new anchor.BN(kwhToBurn1))
      .accounts({
        pool: poolPda,
        userPosition: user1PositionPda,
        userClaim: user1ClaimPda,
        owner: user1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user1])
      .rpc();

    console.log("User1 burn transaction:", tx1);

    // User2 burns tokens
    const [user2ClaimPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_claim"), user2.publicKey.toBuffer(), Buffer.from([0, 0, 0, 0, 0, 0, 0, 0])], // Sale ID 0 as u64 little-endian
      program.programId
    );

    const tx2 = await program.methods
      .burnAndMark(new anchor.BN(saleId), new anchor.BN(kwhToBurn2))
      .accounts({
        pool: poolPda,
        userPosition: user2PositionPda,
        userClaim: user2ClaimPda,
        owner: user2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user2])
      .rpc();

    console.log("User2 burn transaction:", tx2);

    // Verify user positions updated
    const user1Position = await program.account.userPosition.fetch(user1PositionPda);
    const user2Position = await program.account.userPosition.fetch(user2PositionPda);

    expect(user1Position.accruedKwh.toNumber()).to.equal(500); // 1000 - 500
    expect(user2Position.accruedKwh.toNumber()).to.equal(1000); // 2000 - 1000

    // Verify user claims
    const user1Claim = await program.account.userClaim.fetch(user1ClaimPda);
    const user2Claim = await program.account.userClaim.fetch(user2ClaimPda);

    expect(user1Claim.user.toString()).to.equal(user1.publicKey.toString());
    expect(user1Claim.saleId.toNumber()).to.equal(saleId);
    expect(user1Claim.burnedEnx.toNumber()).to.equal(kwhToBurn1);
    expect(user1Claim.claimed).to.be.false;

    expect(user2Claim.user.toString()).to.equal(user2.publicKey.toString());
    expect(user2Claim.saleId.toNumber()).to.equal(saleId);
    expect(user2Claim.burnedEnx.toNumber()).to.equal(kwhToBurn2);
    expect(user2Claim.claimed).to.be.false;
  });

  it("Finalizes the sale", async () => {
    const saleId = 0;
    const [salePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("sale"), Buffer.from([0, 0, 0, 0, 0, 0, 0, 0])], // Sale ID 0 as u64 little-endian
      program.programId
    );

    const tx = await program.methods
      .finalizeSale(new anchor.BN(saleId))
      .accounts({
        pool: poolPda,
        sale: salePda,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();

    console.log("Finalize sale transaction:", tx);

    // Verify sale is finalized
    const saleAccount = await program.account.sale.fetch(salePda);
    expect(saleAccount.finalized).to.be.true;
  });

  it("Verifies final state", async () => {
    // Check final pool state
    const poolAccount = await program.account.pool.fetch(poolPda);
    expect(poolAccount.totalKwh.toNumber()).to.equal(3000);
    expect(poolAccount.period.toNumber()).to.equal(1);

    // Check final user positions
    const user1Position = await program.account.userPosition.fetch(user1PositionPda);
    const user2Position = await program.account.userPosition.fetch(user2PositionPda);

    expect(user1Position.accruedKwh.toNumber()).to.equal(500);
    expect(user1Position.lifetimeKwh.toNumber()).to.equal(1000);
    expect(user2Position.accruedKwh.toNumber()).to.equal(1000);
    expect(user2Position.lifetimeKwh.toNumber()).to.equal(2000);

    console.log("All tests passed!");
    console.log(`Final pool total: ${poolAccount.totalKwh.toNumber()} microkWh`);
    console.log(`Final pool period: ${poolAccount.period.toNumber()}`);
    console.log(`User1 remaining: ${user1Position.accruedKwh.toNumber()} microkWh`);
    console.log(`User2 remaining: ${user2Position.accruedKwh.toNumber()} microkWh`);
  });
});
