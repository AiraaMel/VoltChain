-- C2B (Customer-to-Business) Energy Transaction Tables
-- For VoltChain energy sales and earnings system
-- Safe migration: DROP and CREATE

-- Drop tables if they exist (allows re-running this migration)
DROP TABLE IF EXISTS energy_transactions CASCADE;
DROP TABLE IF EXISTS wallet_earnings CASCADE;
DROP TABLE IF EXISTS claims CASCADE;

-- Energy Transactions (Sales) Table
CREATE TABLE energy_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  kwh NUMERIC(12,4) NOT NULL,
  price_per_kwh NUMERIC(18,6) NOT NULL,
  total_usd NUMERIC(18,6) NOT NULL,
  tx_signature TEXT,
  tx_status TEXT DEFAULT 'pending' CHECK (tx_status IN ('pending', 'confirmed', 'failed')),
  onchain_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Wallet Earnings (Accumulated Earnings)
CREATE TABLE wallet_earnings (
  wallet_address TEXT PRIMARY KEY,
  available_to_claim NUMERIC(18,6) DEFAULT 0,
  total_earned NUMERIC(18,6) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Claims History Table
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  amount NUMERIC(18,6) NOT NULL,
  claim_tx_signature TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_energy_transactions_wallet ON energy_transactions(wallet_address);
CREATE INDEX idx_energy_transactions_status ON energy_transactions(tx_status);
CREATE INDEX idx_energy_transactions_created ON energy_transactions(created_at DESC);

CREATE INDEX idx_claims_wallet ON claims(wallet_address);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_requested ON claims(requested_at DESC);

-- Disable RLS for MVP simplicity
ALTER TABLE energy_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_earnings DISABLE ROW LEVEL SECURITY;
ALTER TABLE claims DISABLE ROW LEVEL SECURITY;



