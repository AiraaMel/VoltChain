import "dotenv/config";

import { chdir, cwd } from "process";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voltchain } from "../target/types/voltchain";
import { PublicKey, clusterApiUrl } from "@solana/web3.js";

console.log("Starting VoltChain migration...");
console.log("Current working directory:", cwd());

// Ensure current working directory is /onchain (where Anchor.toml is)
if (!cwd().endsWith("/onchain")) {
  chdir(__dirname + "/..");
  console.log("Changed working directory to:", cwd());
}

// Get cluster from environment variable or default to localnet
const cluster = process.env.CLUSTER || "localnet";
console.log("Cluster:", cluster);

// Configure connection based on cluster
const connection = new anchor.web3.Connection(
  clusterApiUrl(cluster as any),
  "confirmed"
);

// Create provider with the specific cluster connection
const wallet = anchor.Wallet.local();
const provider = new anchor.AnchorProvider(connection, wallet, {
  commitment: "confirmed",
});

anchor.setProvider(provider);

const program = anchor.workspace.Voltchain as Program<Voltchain>;

async function main() {
  console.log("Deploying VoltChain Energy Platform...");
  console.log(`Program ID: ${program.programId.toString()}`);
  console.log(`Cluster: ${provider.connection.rpcEndpoint}`);

  const authority = provider.wallet.publicKey;
  console.log(`Authority: ${authority.toString()}`);

  const [poolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool")],
    program.programId
  );
  console.log(`Pool PDA: ${poolPda.toString()}`);

  try {
    // Check if pool already exists
    let poolAccount;
    try {
      poolAccount = await program.account.pool.fetch(poolPda);
      console.log("Pool already exists, skipping initialization...");
    } catch (error) {
      console.log("Pool does not exist, initializing...");
      
      // Placeholder mint (replace with real mint later if needed)
      const voltchainMint = new PublicKey("11111111111111111111111111111111");

      const tx = await (program.methods as any)
        .initializePool(authority, voltchainMint)
        .accounts({
          pool: poolPda,
          payer: authority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log(`Pool initialized: ${tx}`);
      
      // Fetch the newly created pool account
      poolAccount = await program.account.pool.fetch(poolPda);
    }

    // Generate explorer URL based on cluster
    const explorerUrl = cluster === "localnet" 
      ? `https://explorer.solana.com/address/${program.programId.toString()}`
      : `https://explorer.solana.com/address/${program.programId.toString()}/?cluster=${cluster}`;
    console.log("\nPool state:");
    console.log(`Authority: ${poolAccount.authority.toString()}`);
    console.log(`VoltChain Mint: ${poolAccount.voltchainMint.toString()}`);
    console.log(`Total kWh: ${poolAccount.totalKwh.toString()} microkWh`);
    console.log(`Period: ${poolAccount.period.toString()}`);
    console.log("\nVoltChain Energy Platform deployed successfully!");
    console.log(`\nExplorer URL: ${explorerUrl}`);
    console.log("\nNext steps:");
    console.log("Run 'yarn run:simulate' to start IoT simulation");
    console.log("Run 'yarn run:listener' to monitor events");
    console.log("Run 'yarn run:settlement' to process sales");
    console.log("Run 'yarn test' to run the test suite");
  } catch (error) {
    console.error("Deployment failed:", error);
    
    // Check if it's a SOL balance issue
    if (error instanceof Error && error.message && error.message.includes("debit an account but found no record of a prior credit")) {
      console.log("\nTip: You need SOL to deploy to testnet.");
      console.log("Run: solana airdrop 2 --url https://api.testnet.solana.com");
    }
    
    process.exit(1);
  }
}

main().catch(console.error);
