# VoltChain - On-chain Module

## Overview

This directory will contain the Solana on-chain components for the VoltChain energy platform.

## Future Implementation

### Anchor Framework
- **Anchor Program**: Smart contract written in Rust using the Anchor framework
- **IDL (Interface Definition Language)**: TypeScript interfaces generated from the Rust program
- **Program Instructions**: Energy data recording, device management, and verification functions

### Planned Features
- Device registration and management on-chain
- Energy generation data recording with cryptographic verification
- Token rewards for energy generation
- Decentralized energy trading mechanisms
- Cross-chain compatibility

## Current Status

Currently, on-chain functionality is handled through the backend service (`backend/src/services/solana.ts`) which:
- Connects to Solana RPC
- Sends energy records as transactions
- Manages wallet operations
- Provides no-op mode when not configured

## Development Roadmap

1. **Phase 1**: Basic Anchor program for energy data recording
2. **Phase 2**: Device management and verification
3. **Phase 3**: Token economics and rewards
4. **Phase 4**: Advanced trading and cross-chain features

## Dependencies

- [Anchor Framework](https://www.anchor-lang.com/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Rust](https://rust-lang.org/)

## Getting Started

Once implemented, this module will provide:
- `programs/` - Anchor program source code
- `target/` - Compiled program artifacts
- `tests/` - Program integration tests
- `migrations/` - Program deployment scripts

For now, refer to the backend service for on-chain integration.
