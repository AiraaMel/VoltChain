# VoltChain Architecture

This document provides an in-depth technical explanation of VoltChain's architecture, system components, and integration patterns.

## Introduction

VoltChain is a decentralized energy platform that enables tokenization of surplus solar energy through a C2B (Customer-to-Business) energy model. The system integrates IoT devices, backend services, blockchain infrastructure, and frontend applications to create a transparent marketplace for renewable energy trading.

The platform addresses the challenge of unmonetized surplus solar energy by creating verifiable, tradeable digital assets from real-world energy production. Each component plays a specific role in ensuring data integrity, transaction transparency, and user experience.

## System Architecture Overview

VoltChain follows a layered architecture that separates concerns while maintaining secure communication channels throughout the system. Data flows from physical energy sensors through backend validation to blockchain tokenization, and finally to user-facing dashboards.

### Data Flow Diagram

```
[ IoT Device (ESP32) ]
       │
       │ HTTP POST + HMAC Signature
       ▼
[ Supabase Backend API ]
       │
       │ Validation & Storage
       ▼
[ PostgreSQL Database ]
       │
       │ Batch Processing
       ▼
[ Solana Smart Contract (Anchor) ]
       │
       │ Transaction Confirmation
       ▼
[ Next.js Dashboard + Phantom Wallet ]
```

### Component Responsibilities

**IoT Layer**: Collects real-time energy production data from solar panels and transmits it securely to the backend.

**Backend Layer**: Validates incoming data, stores it in the database, and coordinates blockchain transactions. Acts as the orchestration layer between IoT devices and blockchain.

**Blockchain Layer**: Provides immutable record-keeping of energy production, tokenization, and sales. Ensures transparency and trust without requiring intermediaries.

**Frontend Layer**: Provides user interface for monitoring, wallet connection, and transaction management. Displays real-time data and enables user interactions with the blockchain.

## Backend (Supabase)

The Supabase backend serves as the central data orchestration layer, managing device authentication, data storage, API delivery, and coordination between IoT devices and blockchain transactions.

### Database Schema

The VoltChain database consists of several core tables:

#### Devices Table
Stores IoT device registrations with authentication credentials and configuration:

```sql
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    device_secret TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    user_id UUID NULL,
    location JSONB NULL,
    onchain_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Readings Table
Contains all energy sensor readings from IoT devices:

```sql
CREATE TABLE readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id),
    ts_device TIMESTAMPTZ NOT NULL,
    energy_generated_kwh NUMERIC(18,6) NOT NULL,
    voltage_v NUMERIC(10,3) NULL,
    current_a NUMERIC(10,3) NULL,
    frequency_hz NUMERIC(10,3) NULL,
    raw_payload JSONB NOT NULL,
    signature TEXT NOT NULL,
    onchain_status TEXT DEFAULT 'pending',
    onchain_tx TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(device_id, ts_device)
);
```

#### Energy Transactions Table
Records energy sales with pricing and blockchain transaction information:

```sql
CREATE TABLE energy_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL,
    kwh NUMERIC(12,4) NOT NULL,
    price_per_kwh NUMERIC(18,6) NOT NULL,
    total_usd NUMERIC(18,6) NOT NULL,
    tx_signature TEXT,
    tx_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Wallet Earnings Table
Tracks accumulated earnings per wallet address:

```sql
CREATE TABLE wallet_earnings (
    wallet_address TEXT PRIMARY KEY,
    available_to_claim NUMERIC(18,6) DEFAULT 0,
    total_earned NUMERIC(18,6) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Claims Table
Stores claim transaction history:

```sql
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL,
    amount NUMERIC(18,6) NOT NULL,
    claim_tx_signature TEXT,
    status TEXT DEFAULT 'pending',
    requested_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

The backend exposes RESTful endpoints for platform operations:

**Device Management:**
- `POST /v1/devices` - Create new device (admin only)
- `GET /v1/devices/:id/readings` - Retrieve device readings (admin only)

**Data Ingestion:**
- `POST /v1/ingest` - Receive energy readings from IoT devices (HMAC authenticated)

**Blockchain Operations:**
- `POST /v1/onchain/flush` - Process pending readings to blockchain (admin only)

**Health Check:**
- `GET /healthz` - Application status and connectivity

### Authentication and Security

IoT devices authenticate using HMAC-SHA256 signatures. Each request includes:
- `x-device-id`: Device UUID
- `x-timestamp`: Request timestamp in milliseconds
- `x-signature`: HMAC-SHA256 signature in base64url format

The signature is calculated as:
```
message = `${deviceId}.${timestamp}.${tsDevice}.${energyKwh}`
signature = base64url(HMAC_SHA256(deviceSecret, message))
```

The backend validates signatures, checks timestamp windows (30-second tolerance), and verifies device existence before storing readings.

## Blockchain (Solana + Anchor)

The blockchain layer forms the core trust mechanism of VoltChain, ensuring transparent, immutable recording of energy production and tokenization.

### Anchor Framework Integration

VoltChain smart contracts are written in Rust using the Anchor framework. Anchor provides:
- Automatic account validation
- Type-safe instruction handlers
- IDL (Interface Definition Language) generation for TypeScript clients
- Simplified error handling

### Program Instructions

The Anchor program includes several key instructions:

**initialize_pool**: Creates the global energy pool account that tracks total energy production and token supply.

**register_user**: Establishes user position accounts for tracking individual energy contributions and earnings.

**energy_report**: Records energy generation from IoT devices. Updates user position accounts and mints tokens representing the energy.

**record_sale**: Logs energy sales with revenue data. Records kWh sold, price per kWh, and calculates fees.

**burn_and_mark**: Burns tokens when energy is sold. Ensures token supply matches available energy.

**finalize_sale**: Distributes earnings to users based on their contributions. Calculates proportional payouts and updates wallet earnings.

### Token Minting Process

When energy is generated and reported through IoT devices:

1. IoT devices report energy readings to the backend
2. Backend batches readings for efficiency (reduces transaction costs)
3. Smart contract instruction `energy_report` is called with aggregated kWh values
4. Values are converted to microkWh for precision (1 kWh = 1,000,000 microkWh)
5. Contract updates user position accounts tracking total energy generated
6. Tokens are minted to user-associated token accounts

The token standard follows SPL Token specifications, ensuring compatibility with Solana wallets and DeFi protocols.

### Wallet Integration via Phantom

The frontend integrates Phantom Wallet using the Solana Wallet Adapter, which provides a standardized interface for wallet connections and transaction signing.

Integration flow:
1. User clicks "Connect Wallet" in the dashboard
2. Phantom extension prompts for connection approval
3. Frontend receives public key and connection status
4. Transactions are built using Anchor-generated TypeScript clients
5. User approves transactions through Phantom's UI
6. Frontend monitors transaction confirmation via Solana RPC

Phantom handles all key management internally, ensuring private keys never leave the browser extension's secure storage.

### Transaction Example

A typical energy sale transaction involves multiple steps:

1. **Transaction Construction**: Frontend builds transaction specifying `record_sale` instruction with parameters (kWh sold, revenue amount, fee basis points)

2. **User Approval**: Phantom Wallet displays transaction details including fees and recipient addresses

3. **Transaction Signing**: Phantom signs using user's private key (never exposed to application)

4. **Network Submission**: Signed transaction broadcast to Solana Devnet via RPC

5. **Confirmation**: Frontend polls RPC for confirmation (typically completes within 400ms)

6. **Database Update**: Backend updates `energy_transactions` table with transaction signature and status

### Benefits of Solana

Solana's architecture provides several advantages:
- **Low Transaction Costs**: Average fees around $0.00025, making micro-transactions economically viable
- **Fast Confirmation**: Block times of 400 milliseconds enable near-instantaneous confirmations
- **High Throughput**: 65,000+ transactions per second supports IoT-scale data ingestion
- **Proof-of-History**: Transparent, verifiable transaction ordering

## Frontend (Next.js)

The VoltChain dashboard provides a comprehensive interface for monitoring energy production, managing earnings, and interacting with the blockchain platform.

### Pages and Routes

**Dashboard (`/`)**: Main overview page displaying key metrics:
- Total Energy Produced (cumulative kWh with percentage change)
- Average Price (current market rates per kWh)
- Total Earnings (accumulated revenue from energy sales)
- Active Devices (number of connected IoT sensors)
- Interactive line chart showing monthly energy production trends

**IoT Devices (`/iot`)**: Device management interface:
- List all registered devices with status indicators
- View device metadata (location, energy generation summaries)
- Configure device settings and blockchain integration
- Filter and sort capabilities for large device fleets

**Wallet & Earnings (`/wallet`)**: Financial management hub:
- Connect Phantom wallets to view balances
- Display available earnings ready for claiming
- Show total historical earnings
- Initiate claim transactions
- Transaction history with timestamps and blockchain confirmation status

**Sales & Pricing (`/sales`)**: Analytics and marketplace functionality:
- Historical sales data (kWh sold, revenue generated)
- Average prices achieved over time
- Interactive charts showing pricing trends
- Transaction history with detailed records
- Filter and export capabilities

### Real-time Updates

The frontend uses Supabase real-time subscriptions to receive instant updates when:
- New energy readings arrive from IoT devices
- Blockchain transactions are confirmed
- Device status changes
- Earnings are updated

This ensures users always see current information without manual page refreshes.

### Wallet Connection Logic

The wallet integration uses the Solana Wallet Adapter pattern:

```typescript
// Simplified example
const { publicKey, sendTransaction } = useWallet();

const handleTransaction = async () => {
  if (!publicKey) return;
  
  const transaction = await buildTransaction(publicKey);
  const signature = await sendTransaction(transaction, connection);
  await confirmTransaction(signature);
};
```

The adapter handles connection state, transaction signing, and error handling automatically.

## IoT Integration

IoT devices form the foundation of VoltChain's data collection infrastructure. ESP32 microcontrollers equipped with energy sensors continuously monitor solar panel output.

### Device Architecture

ESP32 devices:
- Connect to home WiFi networks
- Establish HTTP connections with the VoltChain backend API
- Are registered with unique device IDs and secret keys
- Maintain local storage for configuration (WiFi credentials, endpoint URL, secrets)

### Data Payload Format

A typical IoT payload transmitted to the backend:

```json
{
  "ts_device": "2024-01-15T14:30:00Z",
  "energy_generated_kwh": 2.345,
  "voltage_v": 220.5,
  "current_a": 10.63,
  "frequency_hz": 60.0
}
```

### HTTP Headers

Required headers for authentication:

```
x-device-id: 550e8400-e29b-41d4-a716-446655440000
x-timestamp: 1705327800000
x-signature: dGVzdF9zaWduYXR1cmVfaGVyZQ
Content-Type: application/json
```

### Validation Process

Upon receiving a reading, the backend performs:

1. **Timestamp Validation**: Ensures requests are within a 30-second window (prevents replay attacks)
2. **HMAC Verification**: Confirms request authenticity using device secret
3. **Device Lookup**: Validates device exists and is active
4. **Duplicate Detection**: Prevents redundant data using unique constraints

After validation, readings are stored with metadata including raw payload, signature, and on-chain status. If blockchain integration is enabled, readings are marked as 'pending' for later batch processing.

## Deployment & Environment Setup

### Environment Variables

**Backend (.env):**
```env
PORT=8080
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ONCHAIN_ENABLED=true
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=your-program-id
SOLANA_WALLET_SECRET=[JSON array or base58 string]
ADMIN_TOKEN=your-secure-admin-token
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=your-program-id
```

### Local Development

1. **Supabase Setup**: Create project, retrieve URL and keys
2. **Database Migration**: Run SQL migrations to create tables
3. **Solana Devnet**: Configure CLI, generate keypair, fund with airdrop
4. **Anchor Deployment**: Build and deploy smart contracts
5. **Environment Configuration**: Set all required variables
6. **Start Servers**: Run backend and frontend in development mode

### Devnet Configuration

For local development with Solana:

```bash
solana config set --url https://api.devnet.solana.com
solana-keygen new --outfile ~/.config/solana/id.json
solana airdrop 2
```

## Security Considerations

### API Key Protection

All API keys and secrets are stored in environment variables excluded from version control via `.gitignore`. The `.gitignore` file includes patterns for:
- `.env*` files
- `node_modules/`
- Build artifacts
- Solana keypairs

Service role keys from Supabase have elevated permissions and should only be used in server-side code. Frontend applications use anon keys with restricted permissions.

### Wallet Safety

Private keys are never transmitted or stored by the application. Phantom Wallet handles all key management within the browser extension's secure storage. Users should:
- Never share wallet seed phrases
- Verify transaction details before signing
- Use hardware wallets for large holdings
- Enable two-factor authentication where applicable

### Data Encryption

All communications use HTTPS/TLS to encrypt data in transit. Supabase connections use TLS 1.3 for database connections. IoT device communications should use HTTPS endpoints to prevent man-in-the-middle attacks, though HMAC signatures provide authenticity verification even over HTTP.

### Row Level Security

Supabase Row Level Security (RLS) policies can restrict data access based on user authentication status, device ownership, or custom business logic. While RLS may be disabled in MVP for simplicity, production deployments should implement comprehensive policies.

### .gitignore Configuration

The `.gitignore` file protects sensitive information by excluding:
- Environment variable files (`.env*`)
- Build artifacts and dependencies (`node_modules/`, `dist/`, `target/`)
- Log files and temporary data
- Editor and IDE configurations
- Solana keypairs and test ledgers

This ensures that sensitive credentials, private keys, and local development artifacts are never accidentally committed to version control.

## Conclusion

VoltChain's architecture enables decentralized energy monetization by integrating real-world IoT sensors with blockchain tokenization. The layered design separates concerns while maintaining secure communication channels throughout the system. Each component plays a specific role in ensuring data integrity, transaction transparency, and user experience.

The combination of IoT validation, blockchain transparency, and smart contract automation creates a robust system for tokenizing renewable energy assets. This architecture provides a sustainable foundation for growth, supporting increasing user and device counts while maintaining security and scalability.

