import "dotenv/config";

import { chdir, cwd } from "process";
console.log("Starting VoltChain migration...");
console.log("Current working directory:", cwd());

// Ensure current working directory is /onchain (where Anchor.toml is)
if (!cwd().endsWith("/onchain")) {
  chdir(__dirname + "/..");
  console.log("Changed working directory to:", cwd());
}


import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voltchain } from "../target/types/voltchain";
import { PublicKey } from "@solana/web3.js";

const provider = anchor.AnchorProvider.env();
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
  console.log("Initializing pool...");

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

    const poolAccount = await program.account.pool.fetch(poolPda);
    console.log("\nPool state:");
    console.log(`Authority: ${poolAccount.authority.toString()}`);
    console.log(`VoltChain Mint: ${poolAccount.voltchainMint.toString()}`);
    console.log(`Total kWh: ${poolAccount.totalKwh.toString()} microkWh`);
    console.log(`Period: ${poolAccount.period.toString()}`);
    console.log("\nVoltChain Energy Platform deployed successfully!");
    console.log("\nNext steps:");
    console.log("Run 'yarn run:simulate' to start IoT simulation");
    console.log("Run 'yarn run:listener' to monitor events");
    console.log("Run 'yarn run:settlement' to process sales");
    console.log("Run 'yarn test' to run the test suite");
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);
