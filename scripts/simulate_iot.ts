import "dotenv/config";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Get cluster from environment variable or default to localnet
const cluster = process.env.CLUSTER || "localnet";
console.log("IoT Simulation starting on cluster:", cluster);

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

interface IoTDevice {
  id: string;
  location: string;
  powerGenerated: number; // in watts
  isActive: boolean;
}

class IoTSimulator {
  private devices: IoTDevice[] = [];
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDevices();
  }

  private initializeDevices() {
    const locations = [
      "Solar Farm Alpha", "Wind Turbine Beta", "Hydro Plant Gamma",
      "Solar Rooftop Delta", "Wind Farm Epsilon", "Geothermal Zeta"
    ];

    for (let i = 0; i < 6; i++) {
      this.devices.push({
        id: `device_${i + 1}`,
        location: locations[i],
        powerGenerated: Math.random() * 5000 + 1000, // 1-6 kW
        isActive: Math.random() > 0.1 // 90% active
      });
    }
  }

  private async saveReading(reading: any) {
    if (!supabase) {
      console.warn('[SIM] Supabase not configured. Skipping DB insert:', reading);
      return;
    }
    const { error } = await supabase.from('readings').insert(reading);
    if (error) {
      console.error('[SIM][DB ERROR]', error);
    }
  }

  async startSimulation() {
    if (this.isRunning) {
      console.log("Simulation is already running!");
      return;
    }

    console.log("Starting IoT Energy Simulation...");
    console.log(`Monitoring ${this.devices.length} devices`);
    console.log("Press Ctrl+C to stop\n");

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.simulateEnergyGeneration();
    }, 5000); // Update every 5 seconds
  }

  private async simulateEnergyGeneration() {
    const timestamp = new Date().toISOString();
    let totalPower = 0;
    let activeDevices = 0;

    console.log(`\n${timestamp}`);
    console.log("=" .repeat(50));

    for (const device of this.devices) {
      // Simulate device status changes (5% chance)
      if (Math.random() < 0.05) {
        device.isActive = !device.isActive;
        console.log(`${device.location}: ${device.isActive ? 'ONLINE' : 'OFFLINE'}`);
      }

      if (device.isActive) {
        // Simulate power generation variation (±10%)
        const variation = (Math.random() - 0.5) * 0.2;
        const currentPower = device.powerGenerated * (1 + variation);
        
        totalPower += currentPower;
        activeDevices++;
        
        const voltage_v = 210 + Math.random() * 20;
        const current_a = 5 + Math.random();
        const frequency_hz = 59 + Math.random() * 2;
        const reading = {
          device_id: device.id,
          ts_device: timestamp,
          energy_generated_kwh: parseFloat((currentPower * 5 / 1000 / 60).toFixed(3)),
          voltage_v: parseFloat(voltage_v.toFixed(1)),
          current_a: parseFloat(current_a.toFixed(2)),
          frequency_hz: parseFloat(frequency_hz.toFixed(2)),
          raw_payload: {
            location: device.location,
            base_power_profile: device.powerGenerated,
            currentPower,
          },
          signature: 'simulated',
          onchain_status: 'pending'
        };
        this.saveReading(reading); // Salva na tabela readings
        console.log(`${device.location}: ${currentPower.toFixed(1)}W`);
      } else {
        console.log(`${device.location}: OFFLINE`);
      }
    }

    console.log("-".repeat(50));
    console.log(`Total Power: ${totalPower.toFixed(1)}W (${(totalPower/1000).toFixed(2)}kW)`);
    console.log(`Active Devices: ${activeDevices}/${this.devices.length}`);
    console.log(`Energy Generated: ${(totalPower * 5 / 1000 / 60).toFixed(3)} kWh (last 5s)`);
  }

  stopSimulation() {
    if (!this.isRunning) {
      console.log("Simulation is not running!");
      return;
    }

    console.log("\nStopping IoT Simulation...");
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log("Simulation stopped successfully!");
  }

  getStatus() {
    const activeDevices = this.devices.filter(d => d.isActive).length;
    const totalPower = this.devices
      .filter(d => d.isActive)
      .reduce((sum, d) => sum + d.powerGenerated, 0);
    
    return {
      totalDevices: this.devices.length,
      activeDevices,
      totalPower,
      isRunning: this.isRunning
    };
  }
}

async function main() {
  const simulator = new IoTSimulator();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    simulator.stopSimulation();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    simulator.stopSimulation();
    process.exit(0);
  });

  try {
    await simulator.startSimulation();
  } catch (error) {
    console.error("Simulation error:", error);
    simulator.stopSimulation();
    process.exit(1);
  }
}

// Run the simulation
main().catch(console.error);

export { IoTSimulator };
