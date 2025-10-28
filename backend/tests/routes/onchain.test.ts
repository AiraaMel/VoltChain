import request from 'supertest';
import express from 'express';
import onchainRouter from '../../src/routes/onchain';

// Mock the supabase service
jest.mock('../../src/services/supabase', () => {
  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn(),
    update: jest.fn().mockReturnThis()
  };

  return {
    supabase: mockSupabaseClient
  };
});

// Mock the solana service
const mockSolanaService = {
  isSolanaConfigured: jest.fn(),
  sendRecordEnergy: jest.fn()
};

jest.mock('../../src/services/solana', () => mockSolanaService);

const app = express();
app.use(express.json());
app.use('/', onchainRouter);

describe('Onchain Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.ADMIN_TOKEN;
    process.env.ONCHAIN_ENABLED = 'false';
  });

  describe('POST /v1/onchain/flush', () => {
    describe('Authentication', () => {
      it('should require ADMIN_TOKEN when not configured', async () => {
        const response = await request(app)
          .post('/v1/onchain/flush')
          .expect(401);

        expect(response.body).toEqual({
          error: 'ADMIN_TOKEN not configured'
        });
      });

      it('should require valid admin token', async () => {
        process.env.ADMIN_TOKEN = 'test-admin-token';

        const response = await request(app)
          .post('/v1/onchain/flush')
          .set('Authorization', 'Bearer wrong-token')
          .expect(401);

        expect(response.body).toEqual({
          error: 'Unauthorized'
        });
      });

      it('should accept valid admin token', async () => {
        process.env.ADMIN_TOKEN = 'test-admin-token';
        mockSolanaService.isSolanaConfigured.mockReturnValue(false);

        const response = await request(app)
          .post('/v1/onchain/flush')
          .set('Authorization', 'Bearer test-admin-token')
          .expect(200);

        expect(response.body).toEqual({
          message: 'Solana not configured. On-chain features disabled.',
          processed: 0,
          onchain_enabled: false
        });
      });

      it('should reject malformed authorization header', async () => {
        process.env.ADMIN_TOKEN = 'test-admin-token';

        const response = await request(app)
          .post('/v1/onchain/flush')
          .set('Authorization', 'InvalidFormat test-admin-token')
          .expect(401);

        expect(response.body).toEqual({
          error: 'Unauthorized'
        });
      });
    });

    describe('Solana configuration check', () => {
      it('should return early when Solana not configured', async () => {
        process.env.ADMIN_TOKEN = 'test-admin-token';
        mockSolanaService.isSolanaConfigured.mockReturnValue(false);

        const response = await request(app)
          .post('/v1/onchain/flush')
          .set('Authorization', 'Bearer test-admin-token')
          .expect(200);

        expect(response.body).toEqual({
          message: 'Solana not configured. On-chain features disabled.',
          processed: 0,
          onchain_enabled: false
        });

        // Should not query database when Solana not configured
        expect(mockSupabaseClient.from).not.toHaveBeenCalled();
      });

      it('should proceed when Solana is configured', async () => {
        process.env.ADMIN_TOKEN = 'test-admin-token';
        mockSolanaService.isSolanaConfigured.mockReturnValue(true);

        mockSupabaseClient.limit.mockResolvedValue({
          data: [],
          error: null
        });

        const response = await request(app)
          .post('/v1/onchain/flush')
          .set('Authorization', 'Bearer test-admin-token')
          .expect(200);

        expect(response.body).toEqual({
          message: 'No pending readings to process',
          processed: 0,
          onchain_enabled: true
        });

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('readings');
      });
    });

    describe('Pending readings processing', () => {
      beforeEach(() => {
        process.env.ADMIN_TOKEN = 'test-admin-token';
        mockSolanaService.isSolanaConfigured.mockReturnValue(true);
      });

      it('should handle no pending readings', async () => {
        mockSupabaseClient.limit.mockResolvedValue({
          data: [],
          error: null
        });

        const response = await request(app)
          .post('/v1/onchain/flush')
          .set('Authorization', 'Bearer test-admin-token')
          .expect(200);

        expect(response.body).toEqual({
          message: 'No pending readings to process',
          processed: 0,
          onchain_enabled: true
        });

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('readings');
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('onchain_status', 'pending');
        expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: true });
        expect(mockSupabaseClient.limit).toHaveBeenCalledWith(50);
      });

      it('should process pending readings successfully', async () => {
        const mockReadings = [
          {
            id: 'reading-1',
            device_id: 'device-123',
            energy_generated_kwh: 1.5,
            ts_device: '2023-01-01T12:00:00Z'
          },
          {
            id: 'reading-2',
            device_id: 'device-456',
            energy_generated_kwh: 2.0,
            ts_device: '2023-01-01T13:00:00Z'
          }
        ];

        mockSupabaseClient.limit.mockResolvedValue({
          data: mockReadings,
          error: null
        });

        mockSolanaService.sendRecordEnergy
          .mockResolvedValueOnce({ success: true, txid: 'tx-1' })
          .mockResolvedValueOnce({ success: true, txid: 'tx-2' });

        const response = await request(app)
          .post('/v1/onchain/flush')
          .set('Authorization', 'Bearer test-admin-token')
          .expect(200);

        expect(response.body).toEqual({
          message: 'On-chain flush completed',
          processed: 2,
          failed: 0,
          total: 2,
          onchain_enabled: true
        });

        expect(mockSolanaService.sendRecordEnergy).toHaveBeenCalledTimes(2);
        expect(mockSolanaService.sendRecordEnergy).toHaveBeenCalledWith(
          'device-123',
          1.5,
          new Date('2023-01-01T12:00:00Z').getTime()
        );
        expect(mockSolanaService.sendRecordEnergy).toHaveBeenCalledWith(
          'device-456',
          2.0,
          new Date('2023-01-01T13:00:00Z').getTime()
        );
      });

      it('should handle mixed success and failure results', async () => {
        const mockReadings = [
          {
            id: 'reading-1',
            device_id: 'device-123',
            energy_generated_kwh: 1.5,
            ts_device: '2023-01-01T12:00:00Z'
          },
          {
            id: 'reading-2',
            device_id: 'device-456',
            energy_generated_kwh: 2.0,
            ts_device: '2023-01-01T13:00:00Z'
          }
        ];

        mockSupabaseClient.limit.mockResolvedValue({
          data: mockReadings,
          error: null
        });

        mockSolanaService.sendRecordEnergy
          .mockResolvedValueOnce({ success: true, txid: 'tx-1' })
          .mockResolvedValueOnce({ success: false, error: 'Transaction failed' });

        const response = await request(app)
          .post('/v1/onchain/flush')
          .set('Authorization', 'Bearer test-admin-token')
          .expect(200);

        expect(response.body).toEqual({
          message: 'On-chain flush completed',
          processed: 1,
          failed: 1,
          total: 2,
          onchain_enabled: true
        });
      });

      it('should handle all failures', async () => {
        const mockReadings = [
          {
            id: 'reading-1',
            device_id: 'device-123',
            energy_generated_kwh: 1.5,
            ts_device: '2023-01-01T12:00:00Z'
          }
        ];

        mockSupabaseClient.limit.mockResolvedValue({
          data: mockReadings,
          error: null
        });

        mockSolanaService.sendRecordEnergy.mockResolvedValue({
          success: false,
          error: 'Network error'
        });

        const response = await request(app)
          .post('/v1/onchain/flush')
          .set('Authorization', 'Bearer test-admin-token')
          .expect(200);

        expect(response.body).toEqual({
          message: 'On-chain flush completed',
          processed: 0,
          failed: 1,
          total: 1,
          onchain_enabled: true
        });
      });

      it('should handle exceptions during processing', async () => {
        const mockReadings = [
          {
            id: 'reading-1',
            device_id: 'device-123',
            energy_generated_kwh: 1.5,
            ts_device: '2023-01-01T12:00:00Z'
          }
        ];

        mockSupabaseClient.limit.mockResolvedValue({
          data: mockReadings,
          error: null
        });

        mockSolanaService.sendRecordEnergy.mockRejectedValue(
          new Error('Unexpected error')
        );

        const response = await request(app)
          .post('/v1/onchain/flush')
          .set('Authorization', 'Bearer test-admin-token')
          .expect(200);

        expect(response.body).toEqual({
          message: 'On-chain flush completed',
          processed: 0,
          failed: 1,
          total: 1,
          onchain_enabled: true
        });
      });
    });

    describe('Database updates', () => {
      beforeEach(() => {
        process.env.ADMIN_TOKEN = 'test-admin-token';
        mockSolanaService.isSolanaConfigured.mockReturnValue(true);
      });

      it('should update successful readings with transaction ID', async () => {
        const mockReadings = [
          {
            id: 'reading-1',
            device_id: 'device-123',
            energy_generated_kwh: 1.5,
            ts_device: '2023-01-01T12:00:00Z'
          }
        ];

        mockSupabaseClient.limit.mockResolvedValue({
          data: mockReadings,
          error: null
        });

        mockSolanaService.sendRecordEnergy.mockResolvedValue({
          success: true,
          txid: 'tx-123'
        });

        await request(app)
          .post('/v1/onchain/flush')
          .set('Authorization', 'Bearer test-admin-token')
          .expect(200);

        expect(mockSupabaseClient.update).toHaveBeenCalledWith({
          onchain_status: 'sent',
          onchain_tx: 'tx-123'
        });
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'reading-1');
      });

      it('should update failed readings with failed status', async () => {
        const mockReadings = [
          {
            id: 'reading-1',
            device_id: 'device-123',
            energy_generated_kwh: 1.5,
            ts_device: '2023-01-01T12:00:00Z'
          }
        ];

        mockSupabaseClient.limit.mockResolvedValue({
          data: mockReadings,
          error: null
        });

        mockSolanaService.sendRecordEnergy.mockResolvedValue({
          success: false,
          error: 'Transaction failed'
        });

        await request(app)
          .post('/v1/onchain/flush')
          .set('Authorization', 'Bearer test-admin-token')
          .expect(200);

        expect(mockSupabaseClient.update).toHaveBeenCalledWith({
          onchain_status: 'failed'
        });
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'reading-1');
      });

      it('should handle database errors during updates', async () => {
        const mockReadings = [
          {
            id: 'reading-1',
            device_id: 'device-123',
            energy_generated_kwh: 1.5,
            ts_device: '2023-01-01T12:00:00Z'
          }
        ];

        mockSupabaseClient.limit.mockResolvedValue({
          data: mockReadings,
          error: null
        });

        mockSolanaService.sendRecordEnergy.mockResolvedValue({
          success: true,
          txid: 'tx-123'
        });

        // Mock database update error
        mockSupabaseClient.update.mockRejectedValue(new Error('Update failed'));

        const response = await request(app)
          .post('/v1/onchain/flush')
          .set('Authorization', 'Bearer test-admin-token')
          .expect(200);

        // Should still complete the flush process
        expect(response.body.processed).toBe(0);
        expect(response.body.failed).toBe(1);
      });
    });

    describe('Error handling', () => {
      it('should handle database errors when fetching pending readings', async () => {
        process.env.ADMIN_TOKEN = 'test-admin-token';
        mockSolanaService.isSolanaConfigured.mockReturnValue(true);

        mockSupabaseClient.limit.mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' }
        });

        const response = await request(app)
          .post('/v1/onchain/flush')
          .set('Authorization', 'Bearer test-admin-token')
          .expect(500);

        expect(response.body).toEqual({
          error: 'Failed to fetch pending readings'
        });
      });

      it('should handle unexpected errors', async () => {
        process.env.ADMIN_TOKEN = 'test-admin-token';
        mockSolanaService.isSolanaConfigured.mockReturnValue(true);

        mockSupabaseClient.limit.mockRejectedValue(new Error('Unexpected error'));

        const response = await request(app)
          .post('/v1/onchain/flush')
          .set('Authorization', 'Bearer test-admin-token')
          .expect(500);

        expect(response.body).toEqual({
          error: 'Internal server error'
        });
      });
    });

    describe('Performance and limits', () => {
      beforeEach(() => {
        process.env.ADMIN_TOKEN = 'test-admin-token';
        mockSolanaService.isSolanaConfigured.mockReturnValue(true);
      });

      it('should limit processing to 50 readings', async () => {
        const mockReadings = Array(50).fill(null).map((_, i) => ({
          id: `reading-${i}`,
          device_id: `device-${i}`,
          energy_generated_kwh: 1.5,
          ts_device: '2023-01-01T12:00:00Z'
        }));

        mockSupabaseClient.limit.mockResolvedValue({
          data: mockReadings,
          error: null
        });

        mockSolanaService.sendRecordEnergy.mockResolvedValue({
          success: true,
          txid: 'tx-123'
        });

        const response = await request(app)
          .post('/v1/onchain/flush')
          .set('Authorization', 'Bearer test-admin-token')
          .expect(200);

        expect(response.body.processed).toBe(50);
        expect(mockSupabaseClient.limit).toHaveBeenCalledWith(50);
      });

      it('should handle large batches efficiently', async () => {
        const mockReadings = Array(50).fill(null).map((_, i) => ({
          id: `reading-${i}`,
          device_id: `device-${i}`,
          energy_generated_kwh: 1.5,
          ts_device: '2023-01-01T12:00:00Z'
        }));

        mockSupabaseClient.limit.mockResolvedValue({
          data: mockReadings,
          error: null
        });

        mockSolanaService.sendRecordEnergy.mockResolvedValue({
          success: true,
          txid: 'tx-123'
        });

        const startTime = Date.now();
        
        const response = await request(app)
          .post('/v1/onchain/flush')
          .set('Authorization', 'Bearer test-admin-token')
          .expect(200);

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(response.body.processed).toBe(50);
        expect(responseTime).toBeLessThan(5000); // Should complete within 5 seconds
      });
    });

    describe('Concurrent processing', () => {
      it('should handle concurrent flush requests', async () => {
        process.env.ADMIN_TOKEN = 'test-admin-token';
        mockSolanaService.isSolanaConfigured.mockReturnValue(true);

        mockSupabaseClient.limit.mockResolvedValue({
          data: [],
          error: null
        });

        const requests = Array(5).fill(null).map(() =>
          request(app)
            .post('/v1/onchain/flush')
            .set('Authorization', 'Bearer test-admin-token')
        );

        const responses = await Promise.all(requests);

        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.body.onchain_enabled).toBe(true);
        });
      });
    });
  });
});
