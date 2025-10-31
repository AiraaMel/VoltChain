# Environment Setup for VoltChain Transactions

This guide will help you set up the environment variables needed to run the C2B transactions and claim earnings features.

## 📋 Required Environment Variables

### Dashboard `.env.local`

Create a file named `.env.local` in the `dashboard/` directory:

```bash
cd dashboard
touch .env.local
```

Then add the following content:

```env
# Solana Devnet Configuration
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_NETWORK=devnet

# Market Wallet (optional - used as transaction recipient)
# If not set, transactions will use sender's own wallet as recipient
NEXT_PUBLIC_MARKET_PUBKEY=YourDevnetWalletAddressHere

# Supabase Configuration (Public Keys - Safe for client-side)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Configuration (Server-side - Keep Secret!)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Energy Pricing
PRICE_PER_KWH_USD=0.38

# Backend API (optional, if using separate backend)
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 🔐 Getting Supabase Credentials

1. **Create a Supabase Project** (if you don't have one):
   - Visit https://supabase.com
   - Click "New Project"
   - Fill in project details
   - Wait for provisioning (~2 minutes)

2. **Get Your Credentials**:
   - Go to Settings → API
   - Copy the following:
     - **URL**: `https://your-project-id.supabase.co`
     - **anon/public key**: Client-side key (safe to expose)
     - **service_role key**: Server-side key (KEEP SECRET!)

3. **Important**: The service_role key has admin privileges. Never commit it to version control!

## 🗄️ Database Setup

After getting your Supabase credentials, set up the database tables:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project
2. Click "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy the contents of `backend/db/migrations/003_c2b_transactions.sql`
5. Paste into the editor
6. Click "Run" (or press Cmd/Ctrl + Enter)

### Option 2: Using psql CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Run the migration
supabase db push
```

Or manually with psql:

```bash
psql -h db.your-project.supabase.co -U postgres -d postgres -f backend/db/migrations/003_c2b_transactions.sql
```

## ✅ Verify Setup

After setting up the environment variables and database:

1. **Start the development server**:
   ```bash
   cd dashboard
   npm run dev
   ```

2. **Check the console** for any errors about missing environment variables

3. **Test the connection**:
   - Navigate to `http://localhost:3000/transactions`
   - Connect your Phantom wallet
   - The page should load without errors

## 🧪 Testing Environment Variables

You can verify your environment setup by checking the browser console:

```javascript
// Open browser console on transactions page
console.log('SOLANA_RPC:', process.env.NEXT_PUBLIC_SOLANA_RPC)
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
```

**Note**: Server-side variables (like `SUPABASE_SERVICE_KEY`) won't appear in the browser console for security reasons.

## 🔒 Security Best Practices

### ⚠️ NEVER Commit These Files:
- `.env.local`
- `.env`
- Any file containing `SUPABASE_SERVICE_KEY`

### ✅ Safe to Commit:
- `.env.example`
- `.env.local.example`

### Gitignore Check

Verify your `.gitignore` includes:

```gitignore
# Environment variables
.env
.env.local
.env*.local
```

## 🐛 Troubleshooting

### "Environment variables not set" error

1. **Verify file location**: Ensure `.env.local` is in the `dashboard/` directory
2. **Restart dev server**: Environment variables are loaded at startup
3. **Check for typos**: Variable names are case-sensitive
4. **Remove quotes**: Don't wrap values in quotes unless necessary

### Supabase connection errors

1. **Check credentials**: Verify URL and keys match your project
2. **Verify network**: Ensure you can reach Supabase
3. **Check API permissions**: Service role key needs admin privileges
4. **Review Supabase logs**: Go to Logs → API in Supabase dashboard

### Solana connection errors

1. **Verify RPC URL**: Should be `https://api.devnet.solana.com` for Devnet
2. **Check network**: Ensure Phantom is on Devnet
3. **Try public RPC**: If issues persist, try a public RPC endpoint:
   ```
   https://api.devnet.solana.com
   https://rpc.ankr.com/solana_devnet
   ```

## 📝 Example .env.local

Here's a complete example with placeholder values:

```env
# Solana Devnet Configuration
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_MARKET_PUBKEY=11111111111111111111111111111111

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDE3MjE3MjAsImV4cCI6MTk1NzI5NzcyMH0.placeholder

SUPABASE_URL=https://abcdefghijk.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0MTcyMTcyMCwiZXhwIjoxOTU3Mjk3NzIwfQ.placeholder

# Energy Pricing
PRICE_PER_KWH_USD=0.38

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Solana Devnet Documentation](https://docs.solana.com/clusters#devnet)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Phantom Wallet Setup](https://phantom.app/download)

## 🆘 Need Help?

If you encounter issues:

1. Check the error message carefully
2. Review this guide again
3. Check VoltChain's main README
4. Open an issue on GitHub

---

**Ready to start transacting!** ⚡

