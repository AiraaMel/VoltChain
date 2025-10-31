# Quick Start Guide - VoltChain Transactions

Get the C2B transactions and claim earnings system running in 5 minutes!

## 🚀 Prerequisites

Before starting, ensure you have:
- Node.js 20+ installed
- A Supabase account (free tier works)
- Phantom Wallet installed in your browser

## 📝 Step-by-Step Setup

### 1. Clone and Install (if not already done)

```bash
cd VoltChain/dashboard
npm install
```

### 2. Set Up Supabase

1. **Create a Supabase Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Choose a database password (save it!)
   - Wait for provisioning

2. **Run Database Migration**
   - Go to SQL Editor in your Supabase project
   - Click "New query"
   - Open `backend/db/migrations/003_c2b_transactions.sql`
   - Copy and paste the entire file
   - Click "Run" (or Cmd/Ctrl + Enter)

3. **Get Your Credentials**
   - Go to Settings → API
   - Copy:
     - Project URL
     - anon public key
     - service_role key

### 3. Configure Environment

Create `.env.local` in the `dashboard/` directory:

```bash
cd dashboard
touch .env.local
```

Paste and fill in:

```env
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_NETWORK=devnet

NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

PRICE_PER_KWH_USD=0.38
```

### 4. Start the Application

```bash
npm run dev
```

Open http://localhost:3000/transactions

### 5. Get Devnet SOL

1. Open Phantom Wallet
2. Switch to Devnet (Settings → Developer Mode → Change Network)
3. Copy your wallet address
4. Request airdrop:

```bash
solana airdrop 2 YOUR_WALLET_ADDRESS --url https://api.devnet.solana.com
```

Or visit: https://faucet.solana.com

## 🧪 Test the System

### Test 1: Sell Energy
1. Navigate to http://localhost:3000/transactions
2. Connect Phantom Wallet (top right)
3. Enter "10" in kWh field
4. Click "Send Sale"
5. Approve in Phantom
6. Wait for confirmation (~5 seconds)
7. ✅ You should see:
   - "Available to Claim" increased to $3.80
   - Transaction in Sales History

### Test 2: Claim Earnings
1. Click "Claim Earnings"
2. Approve in Phantom
3. Wait for confirmation
4. ✅ You should see:
   - "Available to Claim" reset to $0.00
   - Transaction in Claims History

### Verify On-Chain
1. Copy any transaction signature
2. Visit: https://explorer.solana.com/?cluster=devnet
3. Paste the signature
4. ✅ View transaction details and memo

## ✅ Success Checklist

- [ ] Application starts without errors
- [ ] Phantom Wallet connects successfully
- [ ] Sale transaction creates Solana signature
- [ ] Balance updates in real-time
- [ ] Claim transaction works
- [ ] History displays correctly
- [ ] No console errors

## 🐛 Troubleshooting

### "Wallet not connected"
- Click "Select Wallet" in top right
- Choose Phantom
- Approve connection

### "Insufficient balance"
- Request more Devnet SOL
- Check Phantom is on Devnet

### "Failed to record transaction"
- Check `.env.local` has correct Supabase credentials
- Verify database migration ran successfully
- Check browser console for errors

### Environment variables not working
- Restart dev server after changing `.env.local`
- Verify file is in `dashboard/` directory
- Check for typos in variable names

## 📚 Next Steps

- Read `TRANSACTIONS_README.md` for detailed documentation
- Read `ENV_SETUP.md` for environment configuration
- Explore the codebase in `dashboard/src/app/transactions/`

## 🎉 You're Done!

You now have a fully functional energy transaction system running on Solana Devnet!

**Happy transacting!** ⚡



