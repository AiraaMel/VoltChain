# VoltChain

VoltChain is an open-source decentralized energy platform built to tokenize surplus solar energy using IoT devices, Supabase backend, and Solana smart contracts. The system enables residential producers, cooperatives, and small aggregators to monetize their excess generation transparently through the C2B (Customer-to-Business) energy model.

## Overview

VoltChain addresses the challenge of unmonetized surplus solar energy by creating a blockchain-based marketplace. IoT devices collect real-time energy production data, which is tokenized on Solana and made available for trading through an intuitive web dashboard. The platform enables real-time monitoring, automated tokenization, and seamless earnings management.

Each kilowatt-hour of solar energy becomes a digital asset that can be tracked, verified, and traded transparently on the blockchain. The platform reduces barriers to entry for small-scale energy producers and creates new economic opportunities in the renewable energy sector.

## Architecture

VoltChain follows a layered architecture integrating four primary components:

- **IoT Layer**: ESP32 devices with energy sensors collect and transmit production data using HMAC authentication
- **Backend Layer**: Node.js Express server on Supabase manages data ingestion, validation, and orchestration
- **Blockchain Layer**: Solana smart contracts (Anchor) handle tokenization and transaction settlement
- **Frontend Layer**: Next.js dashboard provides monitoring, wallet integration, and earnings management

```
[ IoT Device (ESP32) ]
       │
       ▼
[ Supabase Backend ]
       │
       ▼
[ Solana Smart Contract (Anchor) ]
       │
       ▼
[ Next.js Dashboard + Phantom Wallet ]
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

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Solana CLI tools
- Supabase account and project
- Phantom Wallet extension

### Installation

**Backend Setup:**

```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables in .env
npm run dev
```

**Frontend Setup:**

```bash
cd dashboard
npm install
cp .env.example .env.local
# Configure environment variables in .env.local
npm run dev
```

**Blockchain Setup:**

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

### Environment Variables

**Backend (.env):**

```env
PORT=8080
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ONCHAIN_ENABLED=true
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=your_program_id
SOLANA_WALLET_SECRET=[JSON array or base58]
ADMIN_TOKEN=your_admin_token
```

**Frontend (.env.local):**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=your_program_id
```

## Features

- **Real-time Energy Monitoring**: Track solar energy production from IoT devices with live updates
- **Blockchain Tokenization**: Convert energy production into digital tokens on Solana
- **Transparent Transactions**: All energy sales and earnings recorded immutably on-chain
- **Wallet Integration**: Seamless connection with Phantom Wallet for transaction signing
- **Earnings Management**: View and claim accumulated earnings from energy sales
- **Device Management**: Register and monitor multiple IoT devices from a single dashboard
- **C2B Energy Model**: Enable direct sales from customers to businesses

## Project Structure

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

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- [Main Documentation](./docs/README.md) - Overview, features, and getting started guide
- [Architecture](./docs/architecture.md) - Detailed technical architecture and system design
- [Setup Guide](./docs/setup.md) - Complete setup and configuration instructions

## Roadmap

- **Phase 1 (MVP)**: Core tokenization and dashboard functionality
- **Phase 2**: Public API and SDK release for third-party integrations
- **Phase 3**: Decentralized token marketplace for peer-to-peer trading
- **Phase 4**: Integration with certified smart meters and utility companies
- **Phase 5**: Mainnet deployment with comprehensive security audit

## Contributing

VoltChain is an open-source project. Contributions are welcome! Please read our contributing guidelines and code of conduct before submitting pull requests.

## Contributors

- **@AiraaMel** 
- **@sarafarencena** 

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Resources

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## Conclusion

VoltChain demonstrates that decentralized energy markets are technically feasible and economically viable. By combining IoT sensors, blockchain technology, and user-friendly interfaces, the platform reduces barriers to entry for small-scale energy producers and creates new revenue streams from previously unmonetized surplus energy.

The future of energy markets is decentralized, transparent, and accessible. VoltChain provides the infrastructure to make that future a reality.
