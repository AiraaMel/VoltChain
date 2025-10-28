-- VoltChain/ENX Database Schema
-- Disable RLS for MVP simplicity

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    device_secret TEXT NOT NULL, -- plaintext in MVP
    active BOOLEAN DEFAULT true,
    user_id UUID NULL,
    location JSONB NULL,
    public_key TEXT NULL,
    onchain_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NULL
);

-- Readings table
CREATE TABLE IF NOT EXISTS readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    ts_device TIMESTAMPTZ NOT NULL,
    energy_generated_kwh NUMERIC(18,6) NOT NULL,
    voltage_v NUMERIC(10,3) NULL,
    current_a NUMERIC(10,3) NULL,
    frequency_hz NUMERIC(10,3) NULL,
    raw_payload JSONB NOT NULL,
    signature TEXT NOT NULL,
    onchain_status TEXT DEFAULT 'pending', -- pending | sent | failed
    onchain_tx TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(device_id, ts_device)
);

-- Disable RLS for MVP
ALTER TABLE devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE readings DISABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_devices_active ON devices(active);
CREATE INDEX IF NOT EXISTS idx_readings_device_id ON readings(device_id);
CREATE INDEX IF NOT EXISTS idx_readings_ts_device ON readings(ts_device);
CREATE INDEX IF NOT EXISTS idx_readings_onchain_status ON readings(onchain_status);
