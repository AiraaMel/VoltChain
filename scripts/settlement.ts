import "dotenv/config";
import { clusterApiUrl, Connection } from "@solana/web3.js";

// Get cluster from environment variable or default to localnet
const cluster = process.env.CLUSTER || "localnet";
console.log("Settlement Processor starting on cluster:", cluster);

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

interface EnergySale {
  id: string;
  seller: string;
  buyer: string;
  energyAmount: number; // in kWh
  pricePerKwh: number; // in SOL
  totalPrice: number; // in SOL
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

class SettlementProcessor {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private pendingSales: EnergySale[] = [];

  constructor() {
    this.initializePendingSales();
  }

  private initializePendingSales() {
    // Simulate some pending sales for demo purposes
    const sellers = [
      "Solar Farm Alpha", "Wind Turbine Beta", "Hydro Plant Gamma"
    ];
    
    const buyers = [
      "Residential Complex A", "Industrial Zone B", "Commercial District C"
    ];

    for (let i = 0; i < 3; i++) {
      const energyAmount = Math.random() * 100 + 50; // 50-150 kWh
      const pricePerKwh = 0.001 + Math.random() * 0.002; // 0.001-0.003 SOL/kWh
      
      this.pendingSales.push({
        id: `sale_${i + 1}`,
        seller: sellers[i % sellers.length],
        buyer: buyers[i % buyers.length],
        energyAmount: energyAmount,
        pricePerKwh: pricePerKwh,
        totalPrice: energyAmount * pricePerKwh,
        timestamp: new Date(),
        status: 'pending'
      });
    }
  }

  async startProcessing() {
    if (this.isRunning) {
      console.log("Settlement processor is already running!");
      return;
    }

    console.log("Starting Settlement Processing...");
    console.log(`Processing ${this.pendingSales.length} pending sales`);
    console.log("Press Ctrl+C to stop\n");

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.processSettlements();
    }, 10000); // Process every 10 seconds
  }

  private async processSettlements() {
    const timestamp = new Date().toISOString();
    console.log(`\n${timestamp}`);
    console.log("=" .repeat(60));
    console.log("Processing Energy Settlements...");

    const pendingCount = this.pendingSales.filter(s => s.status === 'pending').length;
    console.log(`Pending Sales: ${pendingCount}`);

    if (pendingCount === 0) {
      console.log("No pending settlements to process");
      return;
    }

    // Process each pending sale
    for (const sale of this.pendingSales) {
      if (sale.status !== 'pending') continue;

      try {
        console.log(`\nProcessing Sale: ${sale.id}`);
        console.log(`Seller: ${sale.seller}`);
        console.log(`Buyer: ${sale.buyer}`);
        console.log(`Energy: ${sale.energyAmount.toFixed(2)} kWh`);
        console.log(`Price: ${sale.pricePerKwh.toFixed(6)} SOL/kWh`);
        console.log(`Total: ${sale.totalPrice.toFixed(6)} SOL`);

        // Simulate settlement processing (90% success rate)
        const success = Math.random() > 0.1;
        
        if (success) {
          await this.processSale(sale);
          sale.status = 'completed';
          console.log(`Settlement completed successfully!`);
        } else {
          sale.status = 'failed';
          console.log(`Settlement failed (simulated error)`);
        }

      } catch (error) {
        console.error(`Error processing sale ${sale.id}:`, error);
        sale.status = 'failed';
      }
    }

    // Generate summary
    const completed = this.pendingSales.filter(s => s.status === 'completed').length;
    const failed = this.pendingSales.filter(s => s.status === 'failed').length;
    const pending = this.pendingSales.filter(s => s.status === 'pending').length;
    
    const totalValue = this.pendingSales
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + s.totalPrice, 0);

    console.log("\nSettlement Summary:");
    console.log(`Completed: ${completed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Pending: ${pending}`);
    console.log(`Total Value: ${totalValue.toFixed(6)} SOL`);
    console.log("-".repeat(60));
  }

  private async processSale(sale: EnergySale): Promise<void> {
    // Simulate blockchain transaction processing
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // In a real implementation, this would:
    // 1. Create the settlement transaction
    // 2. Transfer energy tokens from seller to buyer
    // 3. Transfer SOL from buyer to seller
    // 4. Update the pool state
    // 5. Emit settlement events
  }

  stopProcessing() {
    if (!this.isRunning) {
      console.log("Settlement processor is not running!");
      return;
    }

    console.log("\nStopping Settlement Processing...");
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log("Settlement processor stopped successfully!");
  }

  getStatus() {
    const pending = this.pendingSales.filter(s => s.status === 'pending').length;
    const completed = this.pendingSales.filter(s => s.status === 'completed').length;
    const failed = this.pendingSales.filter(s => s.status === 'failed').length;
    
    return {
      isRunning: this.isRunning,
      totalSales: this.pendingSales.length,
      pending,
      completed,
      failed,
      cluster: cluster
    };
  }

  addSale(sale: Omit<EnergySale, 'id' | 'timestamp' | 'status'>) {
    const newSale: EnergySale = {
      ...sale,
      id: `sale_${Date.now()}`,
      timestamp: new Date(),
      status: 'pending'
    };
    
    this.pendingSales.push(newSale);
    console.log(`Added new sale: ${newSale.id}`);
  }
}

async function main() {
  const processor = new SettlementProcessor();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    processor.stopProcessing();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    processor.stopProcessing();
    process.exit(0);
  });

  try {
    await processor.startProcessing();
  } catch (error) {
    console.error("Settlement processor error:", error);
    processor.stopProcessing();
    process.exit(1);
  }
}

// Run the settlement processor
main().catch(console.error);

export { SettlementProcessor };
