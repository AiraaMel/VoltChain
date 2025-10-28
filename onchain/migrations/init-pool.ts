import "dotenv/config";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voltchain } from "../target/types/voltchain";
import { PublicKey, Keypair } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.Voltchain as Program<Voltchain>;

async function main() {
  console.log("🚀 Initializing VoltChain Pool...");
  console.log(`Program ID: ${program.programId.toString()}`);
  console.log(`Cluster: ${provider.connection.rpcEndpoint}`);

  const authority = provider.wallet.publicKey;
  console.log(`Authority: ${authority.toString()}`);

  try {
    // Create VoltChain mint
    console.log("📝 Creating VoltChain mint...");
    const voltchainMint = await createMint(
      provider.connection,
      provider.wallet as any,
      authority, // mint authority
      null, // freeze authority
      6 // decimals
    );
    console.log(`✅ VoltChain mint: ${voltchainMint.toString()}`);

    // Initialize pool using the same pattern as tests
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
    process.exit(1);
  }
}

main().catch(console.error);
