// Jest setup file for ENX Energy Platform tests
import { Connection, PublicKey } from "@solana/web3.js";

// Global test configuration
beforeAll(async () => {
  // Setup global test configuration if needed
});

afterAll(async () => {
  // Cleanup after all tests
});

// Helper functions for tests
export const getTestConnection = () => {
  return new Connection("http://127.0.0.1:8899", "confirmed");
};

export const getDevnetConnection = () => {
  return new Connection("https://api.devnet.solana.com", "confirmed");
};
