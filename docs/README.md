# VoltChain Documentation

Welcome to the VoltChain documentation. This guide provides comprehensive information about the VoltChain decentralized energy platform, including setup instructions, architecture details, and usage guidelines.

## Project Summary

VoltChain is an open-source blockchain platform that tokenizes surplus solar energy using IoT devices and Solana smart contracts. The platform enables residential producers, cooperatives, and small aggregators to monetize their excess energy generation through a transparent, decentralized marketplace.

## Target Users

VoltChain serves three primary user groups:

### Solar Producers
Residential and small-scale solar energy producers who generate surplus electricity and seek to monetize their excess production. VoltChain provides them with a transparent platform to track, tokenize, and sell their energy.

### Cooperatives
Energy cooperatives that aggregate production from multiple members. The platform enables collective energy sales with transparent distribution of earnings based on individual contributions.

### Small Aggregators
Small businesses that aggregate energy from multiple producers and facilitate C2B (Customer-to-Business) transactions. VoltChain provides the infrastructure for transparent accounting and automated settlement.

## Core Proposition

### Energy Tokenization
Each kilowatt-hour of solar energy becomes a digital token on the Solana blockchain. These tokens represent verifiable energy production that can be tracked, traded, and settled transparently.

### IoT Validation
ESP32 devices with energy sensors collect real-time production data and transmit it securely to the platform. HMAC authentication ensures data integrity and prevents tampering.

### Transparency
All energy transactions, sales, and earnings are recorded immutably on the Solana blockchain. Users can verify all operations through public blockchain explorers.

## Architecture Overview

VoltChain follows a layered architecture that integrates IoT devices, backend services, blockchain infrastructure, and frontend applications:

```
┌─────────────┐
│   ESP32     │ ──HTTP/HMAC──> ┌──────────────┐
│  IoT Device │                │   Backend    │
└─────────────┘                │  (Supabase)  │
                               └──────┬───────┘
                                      │
                                      │ API Calls
                                      │
┌─────────────┐                ┌──────▼───────┐
│   Frontend  │ <───HTTP────── │  Solana RPC  │
│  (Next.js)  │                │   (Devnet)   │
└─────────────┘                └──────────────┘
```

For detailed architecture information, see [Architecture Documentation](./architecture.md).

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16, TypeScript, TailwindCSS, shadcn/ui | User interface and wallet integration |
| Backend | Node.js, Express, TypeScript, Supabase | Data ingestion, validation, API delivery |
| Blockchain | Solana Devnet, Anchor Framework, Solana Web3.js | Tokenization and transaction settlement |
| IoT | ESP32, HTTP/HTTPS, HMAC-SHA256 | Energy data collection and transmission |
| Database | PostgreSQL (via Supabase) | Persistent data storage |
| Wallet | Phantom Wallet | Transaction signing and account management |

## Setup and Local Development

### Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- Solana CLI tools installed
- Supabase account with a project created
- Phantom Wallet browser extension

### Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/your-org/VoltChain.git
cd VoltChain
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials and Solana configuration
```

3. **Install frontend dependencies:**
```bash
cd ../dashboard
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Set up the database:**
```bash
# Using Supabase CLI
supabase db push

# Or manually execute migrations
cd ../backend
psql -h your-db-host -U postgres -d postgres -f db/migrations/001_init.sql
```

5. **Configure Solana Devnet:**
```bash
solana config set --url https://api.devnet.solana.com
solana-keygen new --outfile ~/.config/solana/id.json
solana airdrop 2
```

6. **Deploy smart contracts:**
```bash
cd ../onchain
anchor build
anchor deploy
# Copy the PROGRAM_ID to your .env files
```

7. **Run the development servers:**
```bash
# Terminal 1: Backend (port 8080)
cd backend
npm run dev

# Terminal 2: Frontend (port 3000)
cd dashboard
npm run dev
```

For detailed setup instructions, see [Setup Guide](./setup.md).

## Project Features

### Real-time Energy Monitoring
Track solar energy production from IoT devices with live updates displayed in the dashboard. View production metrics, historical trends, and device status.

### Blockchain Tokenization
Convert verified energy production into digital tokens on Solana. Each token represents a verified kilowatt-hour that can be tracked and traded.

### Transparent Transactions
All energy sales and earnings are recorded on-chain, providing complete transparency. Users can verify all operations through blockchain explorers.

### Wallet Integration
Seamless connection with Phantom Wallet for secure transaction signing. Users maintain full control of their private keys.

### Earnings Management
View accumulated earnings from energy sales and claim them directly to connected wallets. Earnings are calculated transparently based on energy contributions.

### Device Management
Register and monitor multiple IoT devices from a single dashboard. Configure device settings, view status, and manage authentication credentials.

## Security and Privacy Guidelines

### Wallet Safety
- Private keys are never transmitted or stored by the application
- All transaction signing happens locally in the Phantom Wallet extension
- Users should never share wallet seed phrases
- Verify transaction details before signing

### API Key Protection
- All secrets stored in environment variables (never committed to version control)
- Service role keys should only be used server-side
- Frontend uses anon keys with restricted permissions
- Rotate admin tokens regularly

### Data Encryption
- All communications use HTTPS/TLS
- IoT devices use HMAC signatures for authentication
- Database connections use encrypted channels

For detailed security information, see [Architecture Documentation - Security Considerations](./architecture.md#security-considerations).

## Roadmap

### Phase 1: MVP (Current)
- Core tokenization functionality
- IoT data ingestion
- Basic dashboard interface
- Devnet deployment

### Phase 2: API & SDK
- Public REST API release
- JavaScript/TypeScript SDK
- Python SDK
- Comprehensive API documentation

### Phase 3: Marketplace
- Decentralized token marketplace
- Peer-to-peer trading
- Automated market makers (AMMs)
- Integration with DeFi protocols

### Phase 4: Smart Meter Integration
- Certified smart meter integration
- Utility company partnerships
- Regulatory compliance features
- Industry-standard protocols (DLMS/COSEM, Modbus)

### Phase 5: Mainnet
- Security audit completion
- Mainnet deployment
- Insurance coverage
- Community governance

## Contributors

- **@AiraaMel** - Project Lead & Frontend Development
- **@sarafarencena** - Blockchain & Backend Integration

## License

VoltChain is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.

## Resources and Links

### Official Documentation
- [Architecture Documentation](./architecture.md) - Detailed technical architecture
- [Setup Guide](./setup.md) - Complete setup instructions

### External Resources
- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Phantom Wallet](https://phantom.app/)

### Community
- GitHub Issues - Report bugs and request features
- GitHub Discussions - Ask questions and share ideas

## Conclusion

VoltChain provides the infrastructure for decentralized energy markets, enabling transparent tokenization and trading of renewable energy. By combining IoT sensors, blockchain technology, and user-friendly interfaces, the platform creates new economic opportunities for solar energy producers while promoting sustainable energy practices.

The platform is actively developed and open to contributions. We welcome feedback, bug reports, and feature suggestions from the community.

