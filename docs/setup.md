# VoltChain Setup Guide

This guide provides step-by-step instructions for setting up VoltChain in a local development environment.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js 20+** - [Download](https://nodejs.org/)
- **npm or yarn** - Comes with Node.js
- **Solana CLI tools** - [Installation Guide](https://docs.solana.com/cli/install-solana-cli-tools)
- **Supabase account** - [Sign up](https://supabase.com/)
- **Phantom Wallet** - [Browser Extension](https://phantom.app/)
- **Git** - For cloning the repository

### Optional Prerequisites

- **Supabase CLI** - For database migrations
- **Anchor Framework** - For smart contract development (if modifying contracts)
- **Rust** - Required for Anchor development

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/VoltChain.git
cd VoltChain
```

### 2. Supabase Setup

#### Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Choose your organization
4. Set project name (e.g., "voltchain-dev")
5. Set database password (save this securely)
6. Select a region close to you
7. Wait for project provisioning (usually 1-2 minutes)

#### Retrieve API Credentials

1. Navigate to Settings > API
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (for frontend)
   - **service_role key** (for backend - keep secret!)

#### Run Database Migrations

**Option A: Using Supabase CLI**

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
cd backend
supabase db push
```

**Option B: Using SQL Editor**

1. Go to Supabase Dashboard > SQL Editor
2. Execute each migration file in order:
   - `backend/db/migrations/001_init.sql`
   - `backend/db/migrations/002_core_entities.sql`
   - `backend/db/migrations/003_c2b_transactions_v2.sql` (if exists)

### 3. Solana Devnet Configuration

#### Install Solana CLI

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

After installation, add Solana to your PATH:
```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

#### Configure for Devnet

```bash
solana config set --url https://api.devnet.solana.com
```

#### Generate Keypair

```bash
solana-keygen new --outfile ~/.config/solana/id.json
```

This will generate a keypair and ask for an optional passphrase. Save the keypair location for later use.

#### Fund Your Wallet

Request Devnet SOL (free test tokens):

```bash
solana airdrop 2
```

Verify your balance:
```bash
solana balance
```

### 4. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=8080

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Blockchain Configuration
ONCHAIN_ENABLED=true
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=your-program-id-will-be-set-after-deployment
SOLANA_WALLET_SECRET=[1,2,3,...] # JSON array from keypair, or base58 string

# Admin Token (generate a secure random string)
ADMIN_TOKEN=your-secure-admin-token
```

**Important Notes:**
- `SOLANA_PROGRAM_ID` will be set after deploying smart contracts
- `SOLANA_WALLET_SECRET` should be your keypair in JSON array format or base58 string
- Generate a strong `ADMIN_TOKEN` using a password generator

#### Start Backend Server

```bash
npm run dev
```

The backend should now be running on `http://localhost:8080`. Verify with:

```bash
curl http://localhost:8080/healthz
```

### 5. Smart Contract Setup (On-chain)

#### Install Anchor Framework

```bash
# Install Rust if not already installed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

#### Build and Deploy

```bash
cd onchain
anchor build
anchor deploy
```

After deployment, you'll receive a Program ID. Copy this and update:
1. `SOLANA_PROGRAM_ID` in `backend/.env`
2. `NEXT_PUBLIC_PROGRAM_ID` in `dashboard/.env.local`

#### Verify Deployment

```bash
solana program show <PROGRAM_ID>
```

### 6. Frontend Setup

#### Install Dependencies

```bash
cd dashboard
npm install
```

#### Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=your-program-id-from-deployment
```

#### Start Development Server

```bash
npm run dev
```

The frontend should now be running on `http://localhost:3000`.

### 7. Connect Phantom Wallet

1. Install the [Phantom Wallet extension](https://phantom.app/)
2. Create a new wallet or import an existing one
3. Switch to Devnet:
   - Click the network selector in Phantom
   - Select "Devnet"
4. In the VoltChain dashboard, click "Connect Wallet"
5. Approve the connection request

**Note**: You may need Devnet SOL in your Phantom wallet. Request it from:
- Solana Faucet: https://faucet.solana.com/
- Or transfer from your CLI wallet

## Verification

### Test Backend API

```bash
# Health check
curl http://localhost:8080/healthz

# Create a test device (requires ADMIN_TOKEN)
curl -X POST http://localhost:8080/v1/devices \
  -H "Authorization: Bearer your-admin-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Device", "location": {"lat": 0, "lng": 0}}'
```

### Test Frontend

1. Open `http://localhost:3000`
2. Verify dashboard loads without errors
3. Connect Phantom wallet
4. Check that wallet address displays correctly

### Test Blockchain Connection

1. In the dashboard, navigate to "Wallet & Earnings"
2. Connect your Phantom wallet
3. Verify connection status shows as connected

## Troubleshooting

### Backend Issues

**Problem**: Backend fails to start
- Check that all environment variables are set correctly
- Verify Supabase credentials are correct
- Ensure port 8080 is not in use

**Problem**: Database connection errors
- Verify Supabase project is active
- Check that migrations have been run
- Confirm service role key has correct permissions

### Frontend Issues

**Problem**: Frontend fails to build
- Run `npm install` again
- Delete `node_modules` and `.next` folders, then reinstall
- Check Node.js version is 20+

**Problem**: Wallet connection fails
- Ensure Phantom is set to Devnet
- Check browser console for errors
- Verify `NEXT_PUBLIC_SOLANA_RPC_URL` is correct

### Blockchain Issues

**Problem**: Smart contract deployment fails
- Verify Solana CLI is configured for Devnet
- Check wallet has sufficient SOL (run `solana airdrop 2`)
- Ensure Anchor is installed correctly (`anchor --version`)

**Problem**: Transactions fail
- Verify program ID matches in all configuration files
- Check RPC endpoint is accessible
- Ensure wallet has sufficient balance for transaction fees

## Development Workflow

### Running All Services

For a complete development setup, you'll need three terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd dashboard
npm run dev
```

**Terminal 3 - Optional (Local Validator):**
```bash
solana-test-validator
# Then deploy to localnet instead of devnet
cd onchain
anchor deploy --provider.cluster localnet
```

### Database Migrations

When schema changes are made:

```bash
cd backend
# Create new migration file
# Then apply it
supabase db push
# Or manually in SQL Editor
```

### Smart Contract Updates

When modifying smart contracts:

```bash
cd onchain
anchor build
anchor deploy
# Update PROGRAM_ID in all .env files
# Restart backend and frontend servers
```

## Next Steps

After completing setup:

1. **Create Test Devices**: Use the backend API to register IoT devices
2. **Send Test Readings**: Simulate IoT device data ingestion
3. **Test Tokenization**: Verify energy readings are processed on-chain
4. **Explore Dashboard**: Familiarize yourself with all features
5. **Read Documentation**: Review [Architecture](./architecture.md) for deeper understanding

## Production Deployment

This setup guide is for local development. For production deployment:

- Use mainnet Solana configuration (with proper security audits)
- Set up production Supabase project with RLS policies
- Use secure secret management (not .env files)
- Configure proper monitoring and logging
- Set up CI/CD pipelines
- Enable HTTPS for all endpoints

See the [Architecture Documentation](./architecture.md) for production considerations.

