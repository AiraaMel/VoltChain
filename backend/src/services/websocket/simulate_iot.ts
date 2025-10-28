import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { readFileSync } from "fs";
import { join } from "path";

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

async function simulateIoT() {
  console.log("Starting IoT Energy Simulation...");
  
  // Setup connection and provider
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const keypair = loadKeypair();
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(keypair), {});
  anchor.setProvider(provider);

  // Load the program
  const programId = new PublicKey("ENXEnergyToken1111111111111111111111111111111111");
  const program = new anchor.Program(require("../target/idl/enx.json"), programId, provider);

  // Get pool PDA
  const [poolPda] = PublicKey.findProgramAddressSync([Buffer.from("pool")], programId);
  
  // Get user position PDA
  const [userPositionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user_position"), keypair.publicKey.toBuffer()],
    programId
  );

  console.log(`Pool PDA: ${poolPda.toString()}`);
  console.log(`User Position PDA: ${userPositionPda.toString()}`);

  // Simulation parameters
  const simulationDuration = 300000; // 5 minutes
  const reportInterval = 30000; // 30 seconds
  const energyRange = { min: 1000, max: 5000 }; // microkWh range

  let totalEnergyReported = 0;
  let reportCount = 0;

  console.log(`Simulation will run for ${simulationDuration / 1000} seconds`);
  console.log(`Reporting every ${reportInterval / 1000} seconds`);

  const startTime = Date.now();
  const interval = setInterval(async () => {
    try {
      // Generate random energy delta
      const deltaKwhMicro = Math.floor(
        Math.random() * (energyRange.max - energyRange.min) + energyRange.min
      );

  console.log(`\nReporting energy: ${deltaKwhMicro} microkWh`);

      // Send energy report
      const tx = await program.methods
        .energyReport(new anchor.BN(deltaKwhMicro))
        .accounts({
          pool: poolPda,
          userPosition: userPositionPda,
          owner: keypair.publicKey,
        })
        .rpc();

  console.log(`Transaction: ${tx}`);
      
      totalEnergyReported += deltaKwhMicro;
      reportCount++;

      // Check if simulation should end
      if (Date.now() - startTime >= simulationDuration) {
  clearInterval(interval);
  console.log("\nSimulation completed!");
  console.log(`Total reports: ${reportCount}`);
  console.log(`Total energy reported: ${totalEnergyReported} microkWh`);
  console.log(`Average per report: ${Math.round(totalEnergyReported / reportCount)} microkWh`);
        process.exit(0);
      }
    } catch (error) {
      console.error("Error sending energy report:", error);
    }
  }, reportInterval);

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\nSimulation stopped by user");
    clearInterval(interval);
    console.log(`Final stats:`);
    console.log(`Reports sent: ${reportCount}`);
    console.log(`Total energy: ${totalEnergyReported} microkWh`);
    process.exit(0);
  });
}

// Run simulation
if (require.main === module) {
  simulateIoT().catch(console.error);
}
