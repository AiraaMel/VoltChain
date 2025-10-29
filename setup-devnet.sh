#!/bin/bash

# VoltChain Minimal Devnet Setup
# This script sets up a local Solana validator and deploys the VoltChain program

set -e

echo "=== VoltChain Devnet Setup ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Solana CLI is installed
check_solana_cli() {
    if ! command -v solana &> /dev/null; then
        print_error "Solana CLI not found. Please install it first:"
        echo "sh -c \"\$(curl -sSfL https://release.solana.com/v1.18.4/install)\""
        exit 1
    fi
    print_status "Solana CLI found: $(solana --version)"
}

# Check if Anchor is installed
check_anchor() {
    if ! command -v anchor &> /dev/null; then
        print_error "Anchor CLI not found. Please install it first:"
        echo "cargo install --git https://github.com/coral-xyz/anchor avm --locked --force"
        echo "avm install latest"
        echo "avm use latest"
        exit 1
    fi
    print_status "Anchor CLI found: $(anchor --version)"
}

# Create wallet if it doesn't exist
create_wallet() {
    WALLET_PATH="$HOME/.config/solana/id.json"
    
    if [ ! -f "$WALLET_PATH" ]; then
        print_status "Creating new wallet..."
        mkdir -p "$HOME/.config/solana"
        solana-keygen new --outfile "$WALLET_PATH" --no-bip39-passphrase
        print_status "Wallet created at: $WALLET_PATH"
    else
        print_status "Wallet already exists at: $WALLET_PATH"
    fi
    
    # Get wallet address
    WALLET_ADDRESS=$(solana-keygen pubkey "$WALLET_PATH")
    print_status "Wallet address: $WALLET_ADDRESS"
}

# Configure Solana CLI for localnet
configure_solana() {
    print_status "Configuring Solana CLI for localnet..."
    solana config set --url localhost
    solana config set --keypair "$HOME/.config/solana/id.json"
    print_status "Solana CLI configured for localnet"
}

# Start local validator
start_validator() {
    print_status "Starting local Solana validator..."
    
    # Kill any existing validator
    pkill -f "solana-test-validator" || true
    sleep 2
    
    # Start validator in background
    solana-test-validator \
        --reset \
        --quiet \
        --ledger ./test-ledger \
        --rpc-port 8899 \
        --faucet-sol 1000000 \
        --faucet-port 9900 &
    
    VALIDATOR_PID=$!
    echo $VALIDATOR_PID > .validator.pid
    
    # Wait for validator to start
    print_status "Waiting for validator to start..."
    sleep 10
    
    # Check if validator is running
    if ! kill -0 $VALIDATOR_PID 2>/dev/null; then
        print_error "Failed to start validator"
        exit 1
    fi
    
    print_status "Validator started (PID: $VALIDATOR_PID)"
}

# Build Anchor program
build_program() {
    print_status "Building Anchor program..."
    cd onchain
    anchor build
    cd ..
    print_status "Program built successfully"
}

# Deploy program
deploy_program() {
    print_status "Deploying program to localnet..."
    cd onchain
    anchor deploy
    cd ..
    print_status "Program deployed successfully"
}

# Run migration
run_migration() {
    print_status "Running migration..."
    yarn run:migrate
    print_status "Migration completed"
}

# Get RPC URL and wallet info
show_info() {
    echo ""
    echo "=== Devnet Ready ==="
    echo ""
    print_status "RPC URL: http://localhost:8899"
    print_status "Wallet Path: $HOME/.config/solana/id.json"
    print_status "Wallet Address: $WALLET_ADDRESS"
    print_status "Validator PID: $VALIDATOR_PID"
    echo ""
    echo "=== Available Commands ==="
    echo "Stop validator: kill $VALIDATOR_PID"
    echo "View logs: solana logs"
    echo "Check balance: solana balance"
    echo "Run tests: yarn test"
    echo "Run simulation: yarn run:simulate"
    echo ""
}

# Cleanup function
cleanup() {
    if [ -f .validator.pid ]; then
        VALIDATOR_PID=$(cat .validator.pid)
        if kill -0 $VALIDATOR_PID 2>/dev/null; then
            print_status "Stopping validator..."
            kill $VALIDATOR_PID
            rm .validator.pid
        fi
    fi
}

# Set trap for cleanup on exit
trap cleanup EXIT

# Main execution
main() {
    print_status "Starting VoltChain devnet setup..."
    
    check_solana_cli
    check_anchor
    create_wallet
    configure_solana
    start_validator
    build_program
    deploy_program
    run_migration
    show_info
    
    print_status "Devnet setup complete!"
    print_warning "Press Ctrl+C to stop the validator"
    
    # Keep script running
    while true; do
        sleep 1
    done
}

# Run main function
main "$@"
