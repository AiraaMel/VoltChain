import "dotenv/config";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Try to load env from current dir, then fallback to backend/.env
(function loadEnv() {
  // First attempt: default .env from CWD
  dotenv.config();

  const hasSupabaseVars = () => process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!hasSupabaseVars()) {
    const cwd = process.cwd();
    const candidates = [
      path.resolve(cwd, '.env'),
      path.resolve(cwd, 'backend/.env'),
      path.resolve(cwd, 'scripts/.env')
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        dotenv.config({ path: candidate });
        if (hasSupabaseVars()) break;
      }
    }
  }

  const dbgUrl = process.env.SUPABASE_URL ? 'SET' : 'NOT SET';
  const dbgKey = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET';
  console.log(`🔍 Supabase ENV -> URL: ${dbgUrl} | SERVICE_ROLE_KEY: ${dbgKey}`);
})();

const supabaseUrl = process.env.SUPABASE_URL as string | undefined;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

interface IoTDevice {
  id: string; // UUID from DB
  location: string;
  powerGenerated: number; // in watts
  isActive: boolean;
  name?: string;
}

async function ensureDevices(count: number): Promise<IoTDevice[]> {
  const fallbackLocations = [
    'Solar Farm Alpha', 'Wind Turbine Beta', 'Hydro Plant Gamma',
    'Solar Rooftop Delta', 'Wind Farm Epsilon', 'Geothermal Zeta'
  ];

  if (!supabase) {
    // No DB: generate transient devices with fake UUIDs just to simulate logs
    return Array.from({ length: count }).map((_, i) => ({
      id: `device_${i + 1}`,
      location: fallbackLocations[i % fallbackLocations.length],
      powerGenerated: Math.random() * 5000 + 1000,
      isActive: Math.random() > 0.1,
    }));
  }

  // Try fetch existing devices
  const { data: existing, error } = await supabase
    .from('devices')
    .select('id,name,location,active')
    .limit(count);

  if (error) {
    console.warn('[SIM] Failed to fetch devices, will try to create demo devices:', error);
  }

  let devices: IoTDevice[] = (existing || []).map((d: any, idx: number) => ({
    id: d.id,
    name: d.name,
    location: d.location?.place || d.location?.site || d.location || fallbackLocations[idx % fallbackLocations.length],
    powerGenerated: Math.random() * 5000 + 1000,
    isActive: d.active ?? Math.random() > 0.1
  }));

  if (devices.length >= count) return devices.slice(0, count);

  // Create demo devices to reach desired count
  const toCreate = count - devices.length;
  const newRows = Array.from({ length: toCreate }).map((_, i) => ({
    name: `Demo Device ${devices.length + i + 1}`,
    device_secret: `secret_${Math.random().toString(36).slice(2, 10)}`,
    active: true,
    onchain_enabled: false,
    location: { place: fallbackLocations[(devices.length + i) % fallbackLocations.length] }
  }));

  const { data: created, error: createErr } = await supabase
    .from('devices')
    .insert(newRows)
    .select('id,name,location,active');

  if (createErr) {
    console.error('[SIM] Failed to create demo devices:', createErr);
  }

  const createdDevices: IoTDevice[] = (created || []).map((d: any, idx: number) => ({
    id: d.id,
    name: d.name,
    location: d.location?.place || d.location?.site || d.location || fallbackLocations[idx % fallbackLocations.length],
    powerGenerated: Math.random() * 5000 + 1000,
    isActive: d.active ?? true
  }));

  devices = devices.concat(createdDevices);
  return devices.slice(0, count);
}

class IoTSimulator {
  private devices: IoTDevice[] = [];
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    // initializeDevices is async now; defer to startSimulation
  }

  private async initializeDevices() {
    const desired = 6;
    this.devices = await ensureDevices(desired);
  }

  async startSimulation() {
    if (this.isRunning) {
      console.log("Simulation is already running!");
      return;
    }

    if (this.devices.length === 0) {
      await this.initializeDevices();
    }

    console.log("Starting IoT Energy Simulation...");
    console.log(`Monitoring ${this.devices.length} devices`);
    console.log("Press Ctrl+C to stop\n");

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.simulateEnergyGeneration();
    }, 5000); // Update every 5 seconds
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

  private async simulateEnergyGeneration() {
    const timestamp = new Date().toISOString();
    let totalPower = 0;
    let activeDevices = 0;

    console.log(`\n${timestamp}`);
    console.log("=".repeat(50));

    for (const device of this.devices) {
      // Simulate device status changes (5% chance)
      if (Math.random() < 0.05) {
        device.isActive = !device.isActive;
        console.log(`${device.location}: ${device.isActive ? 'ONLINE' : 'OFFLINE'}`);
      }

      if (device.isActive) {
        const variation = (Math.random() - 0.5) * 0.2;
        const currentPower = device.powerGenerated * (1 + variation);

        totalPower += currentPower;
        activeDevices++;

        const voltage_v = 210 + Math.random() * 20;
        const current_a = 5 + Math.random();
        const frequency_hz = 59 + Math.random() * 2;
        const reading = {
          device_id: device.id, // UUID from DB
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
        this.saveReading(reading); // Save to readings
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
