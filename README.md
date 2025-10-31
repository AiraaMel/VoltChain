# VoltChain

VoltChain is a decentralized platform that tokenizes surplus solar energy using Solana smart contracts and IoT integration. The platform connects households, cooperatives, and small producers into a transparent energy marketplace where each kilowatt-hour becomes a digital asset.

## Introduction

VoltChain addresses the challenge of unmonetized surplus solar energy by creating a blockchain-based marketplace. IoT devices collect real-time energy production data, which is tokenized on Solana and made available for trading through an intuitive web dashboard. The platform enables real-time monitoring, automated tokenization, and seamless earnings management.

## Architecture Overview

VoltChain follows a layered architecture integrating four primary components:

- **IoT Layer**: ESP32 devices with energy sensors collect and transmit production data
- **Backend Layer**: Node.js Express server on Supabase manages data ingestion and validation
- **Blockchain Layer**: Solana smart contracts (Anchor) handle tokenization and transaction settlement
- **Frontend Layer**: Next.js dashboard provides monitoring, wallet integration, and earnings management

```
ESP32 Device → Backend API → Supabase Database
                                      ↓
Frontend Dashboard ← Solana Blockchain ← Smart Contracts
```

## Tech Stack

### Frontend
- Next.js 16 with TypeScript
- TailwindCSS for styling
- shadcn/ui component library
- Solana Wallet Adapter for Phantom integration

### Backend
- Node.js with Express and TypeScript
- Supabase (PostgreSQL) for data storage
- Pino for structured logging
- HMAC authentication for IoT devices

### Blockchain
- Solana Devnet
- Anchor Framework for smart contracts
- Solana Web3.js for blockchain integration
- Phantom Wallet for transaction signing

### IoT
- ESP32 microcontrollers
- HTTP/HTTPS communication
- HMAC-SHA256 authentication
- Energy sensor integration

## Installation

### Prerequisites
- Node.js 20+
- npm or yarn
- Solana CLI tools
- Supabase account
- Phantom Wallet extension

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

### Frontend Setup

```bash
cd dashboard
npm install
cp .env.example .env.local
# Configure environment variables
npm run dev
```

### Database Migration

```bash
# Using Supabase CLI
supabase db push

# Or manually execute SQL migrations
psql -f backend/db/migrations/001_init.sql
psql -f backend/db/migrations/002_core_entities.sql
psql -f backend/db/migrations/003_c2b_transactions_v2.sql
```

### Blockchain Setup

```bash
# Configure Solana CLI for Devnet
solana config set --url https://api.devnet.solana.com

# Generate keypair (if needed)
solana-keygen new --outfile ~/.config/solana/id.json

# Fund keypair
solana airdrop 2

# Build and deploy Anchor program
cd onchain
anchor build
anchor deploy
```

## Environment Variables

### Backend (.env)
```
PORT=8080
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ONCHAIN_ENABLED=true
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=your_program_id
SOLANA_WALLET_SECRET=[JSON array or base58]
ADMIN_TOKEN=your_admin_token
```

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=your_program_id
```

### On-chain (config.example.env)
```
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
ANCHOR_WALLET=~/.config/solana/id.json
PROGRAM_ID=your_program_id
```

## Running Locally

### Development Mode

**Backend** (runs on port 8080):
```bash
cd backend
npm run dev
```

**Frontend** (runs on port 3000):
```bash
cd dashboard
npm run dev
```

### Production Build

**Backend**:
```bash
cd backend
npm run build
npm start
```

**Frontend**:
```bash
cd dashboard
npm run build
npm start
```

## Folder Structure

```
voltchain-platform/
├── backend/              # REST API (Node.js + Express + Supabase)
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Supabase and Solana integration
│   │   └── utils/       # Utilities (crypto, validation)
│   └── db/
│       └── migrations/  # SQL migration files
├── dashboard/           # Frontend (Next.js + TypeScript)
│   ├── src/
│   │   ├── app/         # Next.js pages and routes
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and configurations
│   └── public/          # Static assets
├── onchain/             # Solana program (Anchor Framework)
│   ├── programs/
│   │   └── voltchain/   # Anchor program source code
│   ├── tests/           # Program integration tests
│   └── migrations/      # Deployment scripts
├── iot/                 # IoT device implementations
│   └── README.md        # IoT documentation
├── scripts/             # Utility scripts
├── docs/                # Project documentation
└── README.md            # This file
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Contributors

- Project Maintainers
- Community Contributors

## Contact

For questions, issues, or contributions:
- Open an issue on GitHub
- Review component-specific documentation in respective README files
- Check the main documentation at `/docs/voltchain-documentation.md`