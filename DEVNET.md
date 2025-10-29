# VoltChain Devnet Setup

Minimal instructions to run VoltChain on a local Solana validator.

## Prerequisites

1. **Solana CLI** (v1.18.4+)
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"
   ```

2. **Anchor Framework**
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install latest
   avm use latest
   ```

3. **Node.js** (v16+)
   ```bash
   # Install via your preferred method
   ```

## Quick Start

1. **Install dependencies**
   ```bash
   yarn install
   ```

2. **Run devnet setup**
   ```bash
   ./setup-devnet.sh
   ```

The script will:
- Create a wallet (if needed)
- Start local Solana validator
- Build Anchor program
- Deploy to localnet
- Run migration

## Output

After successful setup, you'll get:
- **RPC URL**: `http://localhost:8899`
- **Wallet Path**: `~/.config/solana/id.json`
- **Wallet Address**: Your generated address

## Commands

- **Stop validator**: `kill <PID>` (PID shown in output)
- **Check balance**: `solana balance`
- **View logs**: `solana logs`
- **Run tests**: `yarn test`
- **Run simulation**: `yarn run:simulate`

## Troubleshooting

- If validator fails to start, check port 8899 is available
- If deployment fails, ensure wallet has SOL (script provides 1M SOL)
- If build fails, check Anchor installation

## Manual Steps (if script fails)

1. Start validator: `solana-test-validator --reset --ledger ./test-ledger`
2. Build program: `cd onchain && anchor build`
3. Deploy program: `anchor deploy`
4. Run migration: `yarn run:run:migrate`
