# VoltChain C2B Transactions & Claim Earnings

Complete implementation of energy sales (C2B) and earnings withdrawal on Solana Devnet with Phantom Wallet and Supabase.

## 📋 Overview

This implementation provides a full-stack energy transaction system where:
- **Producers** can record energy sales (C2B transactions) with real on-chain Solana transactions
- **Earnings** accumulate in a Supabase database
- **Claims** allow withdrawal of accumulated earnings with on-chain verification
- All transactions are **real**, signed via **Phantom Wallet**, and recorded on **Solana Devnet**

## 🏗️ Architecture

### Frontend (Next.js Dashboard)
- **Page**: `/transactions` - Complete UI for sales and claims
- **Components**: Reactive forms, transaction history, real-time balance updates
- **Wallet Integration**: Phantom Wallet via `@solana/wallet-adapter-react`

### Backend (Next.js API Routes)
- **`/api/transactions`** - POST/GET energy sales
- **`/api/earnings`** - GET wallet balance
- **`/api/claims`** - POST/GET withdrawal claims

### Database (Supabase PostgreSQL)
- **`energy_transactions`** - Sale history
- **`wallet_earnings`** - Per-wallet balance tracking
- **`claims`** - Withdrawal history

### Blockchain (Solana Devnet)
- **Transaction Type**: Memo-only transactions with `createMemoInstruction`
- **Verification**: On-chain transaction validation via `connection.getTransaction()`

## 🚀 Setup Instructions

### 1. Database Setup

Run the SQL migration in your Supabase project:

```bash
cd backend
# Either apply via Supabase dashboard, or:
# psql -f db/migrations/003_c2b_transactions.sql
```

Or copy/paste the contents of `backend/db/migrations/003_c2b_transactions.sql` into your Supabase SQL editor.

### 2. Environment Variables

Create a `.env.local` file in the `dashboard/` directory:

```env
# Solana Devnet Configuration
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_NETWORK=devnet

# Market Wallet (optional, for future use)
NEXT_PUBLIC_MARKET_PUBKEY=YOUR_DEVNET_WALLET_ADDRESS

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Key (for server-side API routes)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Energy Pricing
PRICE_PER_KWH_USD=0.38
```

### 3. Install Dependencies

All required dependencies are already installed in the dashboard:
- `@solana/web3.js` - Solana blockchain interaction
- `@solana/spl-memo` - Memo instruction support
- `@solana/wallet-adapter-react` - Wallet integration
- `@solana/wallet-adapter-react-ui` - Wallet UI components
- `@supabase/supabase-js` - Supabase client

### 4. Run the Application

```bash
cd dashboard
npm run dev
```

The transactions page will be available at: `http://localhost:3000/transactions`

## 🧪 Testing the Complete Flow

### Prerequisites

1. **Install Phantom Wallet** (if not already installed)
   - Download from https://phantom.app/
   - Set network to **Devnet** in settings

2. **Get Devnet SOL** for transaction fees
   ```bash
   # Using Solana CLI
   solana airdrop 2 YOUR_WALLET_ADDRESS --url https://api.devnet.solana.com
   ```

### Test Flow: Sell Energy & Claim Earnings

#### Step 1: Connect Wallet
1. Navigate to `http://localhost:3000/transactions`
2. Click "Select Wallet" → "Phantom"
3. Approve the connection
4. Ensure you're on **Devnet** network

#### Step 2: Send a Sale Transaction
1. Enter an energy amount (e.g., `10` kWh)
2. Review the total price shown (e.g., `$3.80` for 10 kWh at $0.38/kWh)
3. Click "Send Sale"
4. **Phantom will pop up** asking for signature (for the memo transaction)
5. Approve the transaction
6. Wait for confirmation (~3-5 seconds)

**Note:** The transaction is a memo-only transaction with your data - no SOL is transferred.

**Expected Result:**
- ✅ Status shows "Pending → Confirmed → Recorded"
- ✅ Available to Claim increases by $3.80
- ✅ Transaction appears in Sales History

#### Step 3: Claim Your Earnings
1. Click "Claim Earnings" button
2. **Phantom will pop up** again for signature
3. Approve the transaction
4. Wait for confirmation

**Expected Result:**
- ✅ Status shows "Pending → Confirmed → Recorded"
- ✅ Available to Claim decreases to $0.00 (or remaining balance)
- ✅ Total Earned remains unchanged
- ✅ Claim appears in Claims History

#### Step 4: Repeat & Verify
1. Send multiple sales with different kWh values
2. Watch the balance accumulate
3. Claim partial amounts if desired
4. Verify on-chain signatures in Solana Explorer:
   - Visit https://explorer.solana.com/?cluster=devnet
   - Paste any transaction signature
   - View transaction details and memo data

## 🔍 Transaction Verification

### On-Chain Verification

The backend verifies all transactions on-chain before committing to the database:

```typescript
const tx = await connection.getTransaction(signature, {
  commitment: 'confirmed'
});

if (tx && tx.meta && tx.meta.err === null) {
  // Transaction confirmed successfully
  txStatus = 'confirmed';
}
```

### Memo Data Structure

Each transaction includes a JSON memo with metadata:

**Sale Transaction:**
```json
{
  "type": "sale",
  "kwh": 10,
  "pricePerKwh": 0.38,
  "total_usd": 3.80
}
```

**Claim Transaction:**
```json
{
  "type": "claim",
  "amount": 3.80
}
```

## 📊 Database Schema

### energy_transactions
```sql
- id (UUID)
- wallet_address (TEXT)
- kwh (NUMERIC)
- price_per_kwh (NUMERIC)
- total_usd (NUMERIC)
- tx_signature (TEXT)
- tx_status (pending/confirmed/failed)
- onchain_payload (JSONB)
- created_at, confirmed_at (TIMESTAMPTZ)
```

### wallet_earnings
```sql
- wallet_address (TEXT, PRIMARY KEY)
- available_to_claim (NUMERIC) -- Current withdrawable balance
- total_earned (NUMERIC) -- Lifetime earnings
- updated_at (TIMESTAMPTZ)
```

### claims
```sql
- id (UUID)
- wallet_address (TEXT)
- amount (NUMERIC)
- claim_tx_signature (TEXT)
- status (pending/confirmed/failed)
- requested_at, completed_at (TIMESTAMPTZ)
```

## 🔄 Real-Time Updates

The transactions page automatically:
- Fetches balance on mount
- Refreshes after each transaction
- Shows real-time status updates
- Provides manual "Refresh" button

## 🛠️ Troubleshooting

### Issue: "Wallet not connected"
**Solution:** Click "Select Wallet" in the top right and connect Phantom

### Issue: "Insufficient balance"
**Solution:** Get Devnet SOL via airdrop:
```bash
solana airdrop 2 YOUR_ADDRESS --url https://api.devnet.solana.com
```

### Issue: "Failed to record transaction"
**Solution:** Check:
1. Supabase environment variables are set correctly
2. Database tables exist (run migration)
3. Service role key has proper permissions
4. Network tab for API errors

### Issue: Phantom signature popup not appearing
**Solution:** Ensure:
1. Phantom is installed
2. You're on Devnet network in Phantom
3. No pop-up blockers are active
4. Browser permissions allow popups

### Issue: Transactions stuck in "pending"
**Solution:** 
1. Check Solana Devnet status
2. Verify you have SOL for fees
3. Try clicking "Refresh" button
4. Check browser console for errors

## 🎯 Success Criteria

✅ User connects Phantom Wallet (Devnet)  
✅ Send Sale creates and confirms real Devnet transaction  
✅ Available to Claim balance increases after sale  
✅ Claim Earnings creates and confirms real Devnet transaction  
✅ Balance decreases after claim  
✅ Sales and Claims history updated in real-time  
✅ All transactions visible on Solana Explorer  
✅ No console errors or linter warnings  
✅ Database properly synchronized  

## 🔐 Security Notes

- **Service Role Key**: Must be kept secret (server-side only)
- **RLS Disabled**: For MVP simplicity; enable in production
- **No Input Validation**: Add Zod/Yup validation in production
- **Rate Limiting**: Not implemented; add in production
- **Transaction Amount**: Currently limited by available balance

## 🚧 Future Enhancements

- [ ] Add authentication (Supabase Auth)
- [ ] Implement rate limiting
- [ ] Add transaction pagination
- [ ] Real-time WebSocket updates
- [ ] Email notifications
- [ ] Multiple wallet support
- [ ] CSV export of transactions
- [ ] Analytics dashboard
- [ ] Gas fee optimization
- [ ] Batch transactions

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**VoltChain** — Renewable energy on the blockchain ⚡

