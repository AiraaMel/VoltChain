import "dotenv/config";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Enx } from "../target/types/enx";
import { PublicKey } from "@solana/web3.js";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.Enx as Program<Enx>;

async function main() {
  console.log("Deploying ENX Energy Platform...");
  console.log(`Program ID: ${program.programId.toString()}`);
  console.log(`Cluster: ${provider.connection.rpcEndpoint}`);

  const authority = provider.wallet.publicKey;
  console.log(`Authority: ${authority.toString()}`);

  const [poolPda] = PublicKey.findProgramAddressSync([Buffer.from("pool")], program.programId);
  console.log(`Pool PDA: ${poolPda.toString()}`);

  try {
    console.log("Initializing pool...");

    const enxMint = new PublicKey("11111111111111111111111111111111");

    const tx = await (program.methods as any)
      .initializePool(authority, enxMint)
      .accounts({
        pool: poolPda,
        payer: authority,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    

    console.log(`Pool initialized: ${tx}`);

    const poolAccount = await program.account.pool.fetch(poolPda);
    console.log("Pool state:");
    console.log(`Authority: ${poolAccount.authority.toString()}`);
    console.log(`ENX Mint: ${poolAccount.enxMint.toString()}`);
    console.log(`Total kWh: ${poolAccount.totalKwh.toString()} microkWh`);
    console.log(`Period: ${poolAccount.period.toString()}`);

    console.log("\nENX Energy Platform deployed successfully!");
    console.log("\nNext steps:");
    console.log("1. Run 'yarn run:simulate' to start IoT simulation");
    console.log("2. Run 'yarn run:listener' to monitor events");
    console.log("3. Run 'yarn run:settlement' to process sales");
    console.log("4. Run 'yarn test' to run the test suite");

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);
