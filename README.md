# VoltChain Energy Platform

A full-stack platform for monitoring and managing renewable energy with blockchain integration.

## Monorepo Architecture

```
voltchain-platform/
├── backend/          # REST API MVP (Node.js + TypeScript)
├── onchain/          # Solana program (Anchor Framework)
├── frontend/         # Web interface (React + Next.js)
└── iot/              # IoT devices (ESP32 + Arduino)
```

## Project Status

| Component  | Status      | Description |
|------------|-------------|-------------|
| Backend    | Implemented | REST API MVP with Express, Supabase and Solana integration |
| Frontend   | Implemented | Next.js dashboard with wallet integration and transactions |
| Transactions| Implemented | C2B sales and claim earnings with real Solana Devnet transactions |
| On-chain   | Planned     | Anchor program for Solana |
| IoT        | Planned     | ESP32/Arduino devices |

## Implemented Features

### Backend MVP
- REST API with Express and TypeScript
- Supabase (PostgreSQL) for data storage
- HMAC authentication for IoT devices
- Optional Solana integration
- Endpoints for devices, readings and blockchain
- Structured logging with Pino

### Frontend MVP (Dashboard)
- Next.js 16 with React 19
- Solana wallet integration (Phantom)
- Energy production monitoring
- Sales & pricing analytics
- **C2B Transactions & Claim Earnings** ✨ NEW!
- IoT device management
- Real-time dashboard

### Available Endpoints
- `GET /healthz` - Health check
- `POST /v1/devices` - Create device (admin)
- `POST /v1/ingest` - Ingest reading (HMAC)
- `GET /v1/devices/:id/readings` - List readings (admin)
- `POST /v1/onchain/flush` - Flush readings to blockchain (admin)

### C2B Transactions API (NEW!)
- `POST /api/transactions` - Record energy sale with Solana transaction
- `GET /api/transactions?wallet=...` - Get sales history
- `GET /api/earnings?wallet=...` - Get wallet balance
- `POST /api/claims` - Claim earnings with Solana transaction
- `GET /api/claims?wallet=...` - Get claims history

## Technologies

### Backend
- Node.js 20+ with TypeScript
- Express for REST API
- Supabase as database
- Solana Web3.js for blockchain integration
- Pino for logging

### Frontend (Implemented)
- Next.js 16 with React 19 and TypeScript
- Solana wallet adapter with Phantom integration
- Tailwind CSS for styling
- Radix UI components
- Real-time data polling
- Supabase client integration

### Planned
- Anchor Framework for Solana program
- ESP32/Arduino for IoT devices
- Enhanced authentication
- WebSocket real-time updates

## Quick Start

### 1. Backend (implemented)

```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables in backend/.env
npm run dev
```

### 2. Database

```bash
# Run migration
supabase db push
# or
psql -f backend/db/migrations/001_init.sql
```

### 3. API Test

```bash
# Health check
curl http://localhost:8080/healthz

# Create device (example)
curl -X POST http://localhost:8080/v1/devices \
  -H "Authorization: Bearer dev-admin-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "Solar Panel 1"}'
```

## Next Steps

### Backend
- Add automated tests
- Add validation (Zod)
- Implement rate limiting
- Improve error handling

### On-chain
- Configure Anchor environment
- Implement Solana program
- Generate IDL for integration
- Deploy to devnet

### Frontend
- Setup Next.js with TypeScript
- Implement main dashboard
- Integrate with backend API
- Add Solana integration

### IoT
- Implement ESP32 code
- Create sensor library
- Implement HMAC protocol
- Develop device configuration interface

## Configuration

### Environment variables (backend)

```env
# Server
PORT=8080

# Supabase (required)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Blockchain (optional)
ONCHAIN_ENABLED=false
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=YourProgramId1111111111111111111111111111111
SOLANA_WALLET_SECRET=[JSON array or base58]

# Admin (optional)
ADMIN_TOKEN=dev-admin-token
```

## Documentation

### Feature Documentation
- **[Transactions README](TRANSACTIONS_README.md)** - C2B sales and claim earnings (⭐ NEW!)
- **[Quick Start Guide](QUICK_START.md)** - Get started in 5 minutes
- **[Environment Setup](ENV_SETUP.md)** - Configure your environment
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Technical overview

### Component Documentation
- [Backend README](backend/README.md) - API and configuration
- [On-chain README](onchain/README.md) - Solana program
- [Frontend README](dashboard/README.md) - Web interface
- [IoT README](iot/README.md) - IoT devices

## Contributing

1. Fork the repository
2. Create a branch for your feature
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

## License

This project is licensed under MIT. See [LICENSE](LICENSE) for details.

## Support

For questions or issues:
- Open an [issue](https://github.com/voltage/energy-platform/issues)
- Check component-specific documentation
- Review backend logs for debugging

---

VoltChain — Renewable energy on the blockchain