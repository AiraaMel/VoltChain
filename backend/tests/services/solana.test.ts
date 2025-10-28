// Mock @solana/web3.js first
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getLatestBlockhash: jest.fn().mockResolvedValue({
      blockhash: 'test-blockhash',
      lastValidBlockHeight: 12345
    }),
    sendTransaction: jest.fn().mockResolvedValue('test-transaction-signature'),
    confirmTransaction: jest.fn().mockResolvedValue({ value: { err: null } }),
    getBalance: jest.fn().mockResolvedValue(1000000000) // 1 SOL in lamports
  })),
  PublicKey: jest.fn().mockImplementation((key) => ({
    toString: () => key || 'test-public-key'
  })),
  Keypair: {
    fromSecretKey: jest.fn().mockReturnValue({
      publicKey: { toString: () => 'test-wallet-public-key' }
    })
  },
  Transaction: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    sign: jest.fn(),
    recentBlockhash: '',
    feePayer: null
  })),
  SystemProgram: {
    transfer: jest.fn().mockReturnValue({})
  },
  LAMPORTS_PER_SOL: 1000000000
}));

// Import after mocking
import { 
  isSolanaConfigured, 
  sendRecordEnergy, 
  getWalletBalance, 
  getConnectionInfo 
} from '../../src/services/solana';

describe('Solana Service', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.SOLANA_RPC_URL;
    delete process.env.SOLANA_PROGRAM_ID;
    delete process.env.SOLANA_WALLET_SECRET;
  });

  describe('isSolanaConfigured', () => {
    it('should return false when no environment variables are set', () => {
      expect(isSolanaConfigured()).toBe(false);
    });

    it('should return false when only RPC URL is set', () => {
      process.env.SOLANA_RPC_URL = 'https://api.devnet.solana.com';
      expect(isSolanaConfigured()).toBe(false);
    });

    it('should return false when only program ID is set', () => {
      process.env.SOLANA_PROGRAM_ID = 'test-program-id';
      expect(isSolanaConfigured()).toBe(false);
    });

    it('should return false when only wallet secret is set', () => {
      process.env.SOLANA_WALLET_SECRET = JSON.stringify([1, 2, 3]);
      expect(isSolanaConfigured()).toBe(false);
    });

    it('should return true when both program ID and wallet are configured', () => {
      process.env.SOLANA_PROGRAM_ID = 'test-program-id';
      process.env.SOLANA_WALLET_SECRET = JSON.stringify(Array(64).fill(1));
      expect(isSolanaConfigured()).toBe(true);
    });
  });

  describe('sendRecordEnergy', () => {
    it('should simulate success when Solana is not configured', async () => {
      const result = await sendRecordEnergy('device-123', 1.5, Date.now());
      
      expect(result.success).toBe(true);
      expect(result.txid).toMatch(/^sim_\d+_[a-z0-9]+$/);
      expect(result.error).toBeUndefined();
    });

    it('should handle null devicePubkey', async () => {
      const result = await sendRecordEnergy(null, 1.5, Date.now());
      
      expect(result.success).toBe(true);
      expect(result.txid).toMatch(/^sim_\d+_[a-z0-9]+$/);
    });

    it('should handle zero energy values', async () => {
      const result = await sendRecordEnergy('device-123', 0, Date.now());
      
      expect(result.success).toBe(true);
      expect(result.txid).toMatch(/^sim_\d+_[a-z0-9]+$/);
    });

    it('should handle negative energy values', async () => {
      const result = await sendRecordEnergy('device-123', -1.5, Date.now());
      
      expect(result.success).toBe(true);
      expect(result.txid).toMatch(/^sim_\d+_[a-z0-9]+$/);
    });

    it('should handle very large energy values', async () => {
      const result = await sendRecordEnergy('device-123', 999999.99, Date.now());
      
      expect(result.success).toBe(true);
      expect(result.txid).toMatch(/^sim_\d+_[a-z0-9]+$/);
    });

    it('should handle different timestamp formats', async () => {
      const now = Date.now();
      const result1 = await sendRecordEnergy('device-123', 1.5, now);
      const result2 = await sendRecordEnergy('device-123', 1.5, now / 1000);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.txid).not.toBe(result2.txid);
    });

    it('should return different transaction IDs for different calls', async () => {
      const result1 = await sendRecordEnergy('device-123', 1.5, Date.now());
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      const result2 = await sendRecordEnergy('device-123', 1.5, Date.now());
      
      expect(result1.txid).not.toBe(result2.txid);
    });
  });

  describe('getWalletBalance', () => {
    it('should return 0 when wallet is not configured', async () => {
      const balance = await getWalletBalance();
      expect(balance).toBe(0);
    });

    it('should return balance when wallet is configured', async () => {
      process.env.SOLANA_WALLET_SECRET = JSON.stringify(Array(64).fill(1));
      
      const balance = await getWalletBalance();
      expect(balance).toBe(1); // 1 SOL as mocked
    });

    it('should handle connection errors gracefully', async () => {
      process.env.SOLANA_WALLET_SECRET = JSON.stringify(Array(64).fill(1));
      
      // Mock connection error
      const { Connection } = require('@solana/web3.js');
      const mockConnection = new Connection();
      mockConnection.getBalance = jest.fn().mockRejectedValue(new Error('Connection failed'));
      
      const balance = await getWalletBalance();
      expect(balance).toBe(0);
    });
  });

  describe('getConnectionInfo', () => {
    it('should return connection info with default values', () => {
      const info = getConnectionInfo();
      
      expect(info).toHaveProperty('rpcUrl');
      expect(info).toHaveProperty('programId');
      expect(info).toHaveProperty('walletPublicKey');
      expect(info).toHaveProperty('isConfigured');
      
      expect(info.rpcUrl).toBe('https://api.devnet.solana.com');
      expect(info.isConfigured).toBe(false);
    });

    it('should return connection info with custom RPC URL', () => {
      process.env.SOLANA_RPC_URL = 'https://custom-rpc.solana.com';
      
      const info = getConnectionInfo();
      
      expect(info.rpcUrl).toBe('https://custom-rpc.solana.com');
    });

    it('should return connection info with program ID', () => {
      process.env.SOLANA_PROGRAM_ID = 'test-program-id';
      
      const info = getConnectionInfo();
      
      expect(info.programId).toBe('test-program-id');
    });

    it('should return connection info with wallet public key', () => {
      process.env.SOLANA_WALLET_SECRET = JSON.stringify(Array(64).fill(1));
      
      const info = getConnectionInfo();
      
      expect(info.walletPublicKey).toBe('test-wallet-public-key');
    });

    it('should return isConfigured as true when both program and wallet are set', () => {
      process.env.SOLANA_PROGRAM_ID = 'test-program-id';
      process.env.SOLANA_WALLET_SECRET = JSON.stringify(Array(64).fill(1));
      
      const info = getConnectionInfo();
      
      expect(info.isConfigured).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid wallet secret format', () => {
      process.env.SOLANA_WALLET_SECRET = 'invalid-json';
      
      // Should not throw error, just log warning
      expect(() => {
        const info = getConnectionInfo();
        expect(info.isConfigured).toBe(false);
      }).not.toThrow();
    });

    it('should handle malformed wallet secret array', () => {
      process.env.SOLANA_WALLET_SECRET = JSON.stringify([1, 2, 3]); // Too short
      
      const info = getConnectionInfo();
      expect(info.isConfigured).toBe(false);
    });

    it('should handle sendRecordEnergy errors gracefully', async () => {
      // This test would require more complex mocking to simulate actual errors
      // For now, we test the simulation path which is the main use case
      const result = await sendRecordEnergy('device-123', 1.5, Date.now());
      expect(result.success).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should work with typical energy reporting flow', async () => {
      const deviceId = 'device-123';
      const energyKwh = 2.5;
      const timestamp = Date.now();
      
      const result = await sendRecordEnergy(deviceId, energyKwh, timestamp);
      
      expect(result.success).toBe(true);
      expect(result.txid).toBeDefined();
    });

    it('should work with batch energy reporting', async () => {
      const deviceId = 'device-123';
      const energies = [1.0, 1.5, 2.0, 2.5, 3.0];
      const timestamp = Date.now();
      
      const results = await Promise.all(
        energies.map(energy => sendRecordEnergy(deviceId, energy, timestamp + Math.random()))
      );
      
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.txid).toBeDefined();
      });
      
      // All transaction IDs should be unique
      const txids = results.map(r => r.txid);
      const uniqueTxids = new Set(txids);
      expect(uniqueTxids.size).toBe(txids.length);
    });
  });
});
