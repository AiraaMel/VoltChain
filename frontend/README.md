# VoltChain Frontend

Web interface for the VoltChain platform.

## Status

Under development — this folder will be implemented in the future.

## Planned Technologies

### Core Stack
- React 18+ with TypeScript
- Next.js for SSR/SSG
- Tailwind CSS for styling
- Shadcn/ui for components

### Integrations
- @solana/wallet-adapter for wallets
- @supabase/supabase-js for data
- Chart.js or Recharts for charts
- React Query for data caching

## Planned Features

### Main Dashboard
- Overview: energy generation statistics
- Charts: consumption and generation over time
- Map: device locations
- Status: connected device state

### Device Management
- Register: add new devices
- Configuration: parameters and location
- Monitoring: real-time status
- History: readings and events

### Blockchain Integration
- Wallet: connect Solana wallet
- Transactions: view on-chain transactions
- Rewards: tokens earned by generation
- Governance: participate in votes

### User Profile
- Settings: preferences and notifications
- Reports: export data
- API Keys: manage access keys
- History: activity and transactions

## Planned Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/           # Application pages
│   ├── hooks/           # Custom hooks
│   ├── services/        # API and integrations
│   ├── utils/           # Utilities
│   └── styles/          # Global styles
├── public/              # Static assets
├── next.config.js       # Next.js config
├── tailwind.config.js   # Tailwind config
└── package.json
```

## Design System

### Colors
- Primary: Energy green (#10B981)
- Secondary: Tech blue (#3B82F6)
- Neutrals: Gray scale (#F9FAFB → #111827)

### Components
- Statistic cards
- Interactive charts
- Data tables
- Responsive forms
- Modals and notifications

## Backend Integration

### API Endpoints
- `GET /healthz` - System status
- `POST /v1/devices` - Manage devices
- `GET /v1/devices/:id/readings` - Readings
- `POST /v1/onchain/flush` - Sync to blockchain

### Authentication
- Admin Token for administrative operations
- HMAC for IoT devices
- Wallet for blockchain operations

## Next Steps

1. Configure Next.js with TypeScript
2. Implement design system
3. Create base components
4. Integrate with backend API
5. Implement main dashboard
6. Add Solana integration
7. Implement responsiveness
8. Add tests
9. Setup CI/CD and deployment
