// Jest setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: 'test.env' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests
process.env.ADMIN_TOKEN = 'test-admin-token';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.SOLANA_RPC_URL = 'https://api.devnet.solana.com';
process.env.ONCHAIN_ENABLED = 'false';

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test timeout
jest.setTimeout(30000);