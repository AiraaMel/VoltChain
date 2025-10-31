import "dotenv/config";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

// Get cluster from environment variable or default to localnet
const cluster = process.env.CLUSTER || "localnet";
console.log("Event Listener starting on cluster:", cluster);

// Configure connection based on cluster
const getClusterUrl = (cluster: string) => {
  switch (cluster) {
    case "localnet":
      return "http://localhost:8899";
    case "devnet":
      return clusterApiUrl("devnet");
    case "testnet":
      return clusterApiUrl("testnet");
    case "mainnet":
      return clusterApiUrl("mainnet-beta");
    default:
      return "http://localhost:8899";
  }
};

const connection = new Connection(
  getClusterUrl(cluster),
  "confirmed"
);

class EventListener {
  private isListening = false;
  private subscriptionId: number | null = null;

  async startListening() {
    if (this.isListening) {
      console.log("Listener is already running!");
      return;
    }

    console.log("Starting VoltChain Event Listener...");
    console.log(`Program ID: 718k7JFp8Tf56eMTpTJMqmwNxME738nh48bXCiCm1BrR`);
    console.log("Press Ctrl+C to stop\n");

    this.isListening = true;

    try {
      // Listen for program logs (using a placeholder program ID for now)
      const programId = new PublicKey("718k7JFp8Tf56eMTpTJMqmwNxME738nh48bXCiCm1BrR");
      this.subscriptionId = connection.onLogs(
        programId,
        (logs, context) => {
          this.handleLogs(logs, context);
        },
        "confirmed"
      );

      console.log("Event listener started successfully!");
      console.log("Monitoring for VoltChain events...\n");

    } catch (error) {
      console.error("Failed to start listener:", error);
      this.isListening = false;
      throw error;
    }
  }

  private handleLogs(logs: any, context: any) {
    const timestamp = new Date().toISOString();
    
    console.log(`\n${timestamp}`);
    console.log("=" .repeat(60));
    console.log(`Signature: ${logs.signature}`);
    console.log(`Fee: ${context.fee} lamports`);
    
    if (logs.err) {
      console.log(`Error: ${JSON.stringify(logs.err)}`);
    } else {
      console.log("Transaction successful");
    }

    if (logs.logs && logs.logs.length > 0) {
      console.log("\nProgram Logs:");
      logs.logs.forEach((log: string, index: number) => {
        console.log(`${index + 1}. ${log}`);
        
        // Parse specific VoltChain events
        this.parseVoltChainEvent(log);
      });
    }

    console.log("-".repeat(60));
  }

  private parseVoltChainEvent(log: string) {
    // Parse InitializePool event
    if (log.includes("Instruction: InitializePool")) {
      console.log("Event: Pool Initialized");
    }
    
    // Parse energy generation events
    if (log.includes("EnergyGenerated")) {
      console.log("Event: Energy Generated");
    }
    
    // Parse sale events
    if (log.includes("SaleCompleted")) {
      console.log("Event: Sale Completed");
    }
    
    // Parse settlement events
    if (log.includes("SettlementProcessed")) {
      console.log("Event: Settlement Processed");
    }
  }

  stopListening() {
    if (!this.isListening) {
      console.log("Listener is not running!");
      return;
    }

    console.log("\nStopping Event Listener...");
    
    if (this.subscriptionId !== null) {
      connection.removeOnLogsListener(this.subscriptionId);
      this.subscriptionId = null;
    }
    
    this.isListening = false;
    console.log("Event listener stopped successfully!");
  }

  getStatus() {
    return {
      isListening: this.isListening,
      subscriptionId: this.subscriptionId,
      programId: "718k7JFp8Tf56eMTpTJMqmwNxME738nh48bXCiCm1BrR",
      cluster: cluster
    };
  }
}

async function main() {
  const listener = new EventListener();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    listener.stopListening();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    listener.stopListening();
    process.exit(0);
  });

  try {
    await listener.startListening();
    
    // Keep the process running
    console.log("Listener is running... (Press Ctrl+C to stop)");
    
    // Keep alive
    setInterval(() => {
      // Just keep the process alive
    }, 1000);
    
  } catch (error) {
    console.error("Listener error:", error);
    listener.stopListening();
    process.exit(1);
  }
}

// Run the listener
main().catch(console.error);

export { EventListener };
