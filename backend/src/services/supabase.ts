import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

// Create Supabase admin client with service role key
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
