import "dotenv/config";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voltchain } from "../target/types/voltchain";
import { PublicKey } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.Voltchain as Program<Voltchain>;

async function main() {
  console.log("🚀 Deploying VoltChain Energy Platform...");
  console.log(`Program ID: ${program.programId.toString()}`);
  console.log(`Cluster: ${provider.connection.rpcEndpoint}`);

  const authority = provider.wallet.publicKey;
  console.log(`Authority: ${authority.toString()}`);

  const [poolPda] = PublicKey.findProgramAddressSync([Buffer.from("pool")], program.programId);
  console.log(`Pool PDA: ${poolPda.toString()}`);

  try {
    console.log("📝 Creating VoltChain mint...");
    
    // Create a new VoltChain mint
    const voltchainMint = await createMint(
      provider.connection,
      provider.wallet as any,
      authority, // mint authority
      null, // freeze authority
      6 // decimals
    );
    
    console.log(`✅ VoltChain mint created: ${voltchainMint.toString()}`);
    console.log("🏊 Initializing pool...");

    // Initialize pool using the same pattern as the tests
    const tx = await program.methods
      .initializePool(authority, voltchainMint)
      .rpc();

    console.log(`✅ Pool initialized: ${tx}`);

    // Fetch and display pool state
    const poolAccount = await program.account.pool.fetch(poolPda);
    console.log("\n📊 Pool State:");
    console.log(`   Authority: ${poolAccount.authority.toString()}`);
    console.log(`   VoltChain Mint: ${poolAccount.voltchainMint.toString()}`);
    console.log(`   Total kWh: ${poolAccount.totalKwh.toString()} microkWh`);
    console.log(`   Period: ${poolAccount.period.toString()}`);

    console.log("\n🎉 VoltChain Energy Platform deployed successfully!");
    console.log("\n📋 Next steps:");
    console.log("   1. Run 'anchor test' to run the test suite");
    console.log("   2. Run 'yarn run:simulate' to start IoT simulation");
    console.log("   3. Run 'yarn run:listener' to monitor events");
    console.log("   4. Run 'yarn run:settlement' to process sales");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);
