import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";

// Event types from the program
interface EnergyReported {
  owner: PublicKey;
  deltaKwhMicro: anchor.BN;
  newUserTotal: anchor.BN;
  poolTotal: anchor.BN;
}

interface SaleRecorded {
  saleId: anchor.BN;
  kwhSoldMicro: anchor.BN;
  revenueBrlCents: anchor.BN;
  feeBps: number;
}

interface TokensBurned {
  owner: PublicKey;
  saleId: anchor.BN;
  kwhBurnedMicro: anchor.BN;
}

interface SaleFinalized {
  saleId: anchor.BN;
  kwhSold: anchor.BN;
  revenueBrlCents: anchor.BN;
  feeBps: number;
}

async function startEventListener() {
  console.log("Starting ENX Energy Platform Event Listener...");
  
  // Setup connection
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const programId = new PublicKey("ENXEnergyToken1111111111111111111111111111111111");
  
  // Load the program
  const program = new anchor.Program(require("../target/idl/enx.json"), programId);

  console.log(`Connected to devnet`);
  console.log(`Program ID: ${programId.toString()}`);
  console.log(`Listening for events...\n`);

  // Subscribe to program events
  const subscriptionId = program.addEventListener("EnergyReported", (event: EnergyReported) => {
  console.log(`EnergyReported Event:`);
    console.log(`Owner: ${event.owner.toString()}`);
    console.log(`Delta kWh: ${event.deltaKwhMicro.toString()} microkWh`);
    console.log(`New User Total: ${event.newUserTotal.toString()} microkWh`);
    console.log(`Pool Total: ${event.poolTotal.toString()} microkWh`);
    console.log(`Timestamp: ${new Date().toISOString()}\n`);
  });

  const saleSubscriptionId = program.addEventListener("SaleRecorded", (event: SaleRecorded) => {
  console.log(`SaleRecorded Event:`);
    console.log(`Sale ID: ${event.saleId.toString()}`);
    console.log(`kWh Sold: ${event.kwhSoldMicro.toString()} microkWh`);
    console.log(`Revenue: ${event.revenueBrlCents.toString()} BRL cents`);
    console.log(`Fee: ${event.feeBps} basis points`);
    console.log(`Timestamp: ${new Date().toISOString()}\n`);
  });

  const burnSubscriptionId = program.addEventListener("TokensBurned", (event: TokensBurned) => {
  console.log(`TokensBurned Event:`);
    console.log(`Owner: ${event.owner.toString()}`);
    console.log(`Sale ID: ${event.saleId.toString()}`);
    console.log(`kWh Burned: ${event.kwhBurnedMicro.toString()} microkWh`);
    console.log(`Timestamp: ${new Date().toISOString()}\n`);
  });

  const finalizeSubscriptionId = program.addEventListener("SaleFinalized", (event: SaleFinalized) => {
  console.log(`SaleFinalized Event:`);
    console.log(`Sale ID: ${event.saleId.toString()}`);
    console.log(`kWh Sold: ${event.kwhSold.toString()} microkWh`);
    console.log(`Revenue: ${event.revenueBrlCents.toString()} BRL cents`);
    console.log(`Fee: ${event.feeBps} basis points`);
    console.log(`Timestamp: ${new Date().toISOString()}\n`);
  });

  console.log(`Subscribed to events:`);
  console.log(`EnergyReported (ID: ${subscriptionId})`);
  console.log(`SaleRecorded (ID: ${saleSubscriptionId})`);
  console.log(`TokensBurned (ID: ${burnSubscriptionId})`);
  console.log(`SaleFinalized (ID: ${finalizeSubscriptionId})`);
  console.log(`\nListening for events... (Press Ctrl+C to stop)\n`);

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
  console.log("\nStopping event listener...");
    
    try {
      await program.removeEventListener(subscriptionId);
      await program.removeEventListener(saleSubscriptionId);
      await program.removeEventListener(burnSubscriptionId);
      await program.removeEventListener(finalizeSubscriptionId);
  console.log("Event listeners removed");
    } catch (error) {
  console.error("Error removing listeners:", error);
    }
    
    process.exit(0);
  });
}

// Run listener
if (require.main === module) {
  startEventListener().catch(console.error);
}
