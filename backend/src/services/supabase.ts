import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug to check if variables are being loaded
console.log('Debug - SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
console.log('Debug - SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'NOT SET');

// Mock mode if not configured
let supabaseInstance: any;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('Running in MOCK MODE - No Supabase required');
  
  supabaseInstance = {
    from: (table: string) => ({
      insert: (data: any) => ({
        select: () => ({
          single: () => Promise.resolve({
            data: { 
              id: `mock-${Date.now()}`, 
              ...data, 
              created_at: new Date().toISOString() 
            },
            error: null
          })
        })
      }),
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null })
        }),
        order: () => Promise.resolve({ data: [], error: null })
      }),
      update: () => ({
        eq: () => ({
          select: () => Promise.resolve({ data: [], error: null })
        })
      })
    })
  };
} else {
  // Real mode with Supabase
  console.log('Using real Supabase connection');
  supabaseInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export const supabase = supabaseInstance;

export interface Device {
  id: string;
  name: string;
  device_secret: string;
  active: boolean;
  user_id?: string;
  location?: any;
  public_key?: string;
  onchain_enabled: boolean;
  created_at: string;
  last_seen_at?: string;
}

export interface Reading {
  id: string;
  device_id: string;
  ts_device: string;
  energy_generated_kwh: number;
  voltage_v?: number;
  current_a?: number;
  frequency_hz?: number;
  raw_payload: any;
  signature: string;
  onchain_status: 'pending' | 'sent' | 'failed';
  onchain_tx?: string;
  created_at: string;
}
