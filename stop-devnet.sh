#!/bin/bash

# VoltChain Devnet Stop Script

echo "=== Stopping VoltChain Devnet ==="

# Stop validator if running
if [ -f .validator.pid ]; then
    VALIDATOR_PID=$(cat .validator.pid)
    if kill -0 $VALIDATOR_PID 2>/dev/null; then
        echo "Stopping validator (PID: $VALIDATOR_PID)..."
        kill $VALIDATOR_PID
        rm .validator.pid
        echo "Validator stopped"
    else
        echo "Validator not running"
        rm .validator.pid
    fi
else
    echo "No validator PID file found"
fi

# Kill any remaining solana-test-validator processes
pkill -f "solana-test-validator" || true

echo "Devnet stopped"
