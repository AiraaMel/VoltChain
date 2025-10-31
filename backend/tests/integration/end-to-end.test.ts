import request from 'supertest';
import express from 'express';

// Mock pino to avoid pino-pretty dependency issues
jest.mock('pino', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  };
  return jest.fn(() => mockLogger);
});

jest.mock('pino-http', () => {
  return jest.fn(() => (req, res, next) => next());
});

// Create a test app instead of importing the full server
const app = express();
app.use(express.json());

// Import routes
import healthRouter from '../../src/routes/health';
import devicesRouter from '../../src/routes/devices';
import ingestRouter from '../../src/routes/ingest';
import readingsRouter from '../../src/routes/readings';
import onchainRouter from '../../src/routes/onchain';

app.use('/', healthRouter);
app.use('/', devicesRouter);
app.use('/', ingestRouter);
app.use('/', readingsRouter);
app.use('/', onchainRouter);

// Mock external services
jest.mock('../../src/services/supabase', () => {
  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn()
  };

  return {
    supabase: mockSupabaseClient
  };
});

jest.mock('../../src/services/solana', () => ({
  isSolanaConfigured: jest.fn(() => false),
  sendRecordEnergy: jest.fn(),
  getWalletBalance: jest.fn(),
  getConnectionInfo: jest.fn()
}));

jest.mock('../../src/utils/crypto', () => ({
  generateDeviceSecret: jest.fn(() => 'mock-device-secret-123'),
  hmacSign: jest.fn((secret, message) => `mock-signature-${message}`),
  hmacVerify: jest.fn(() => true)
}));

describe('End-to-End Integration Tests', () => {
  const { supabase } = require('../../src/services/supabase');
  const { hmacVerify } = require('../../src/utils/crypto');

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.ADMIN_TOKEN;
    process.env.ONCHAIN_ENABLED = 'false';
  });

  describe('Complete Device Lifecycle', () => {
    it('should handle complete device registration and energy reporting flow', async () => {
      // Step 1: Health check
      const healthResponse = await request(app)
        .get('/healthz')
        .expect(200);

      expect(healthResponse.body.ok).toBe(true);
      expect(healthResponse.body.time).toBeDefined();

      // Step 2: Create device
      const mockDevice = {
        id: 'device-123',
        name: 'Test Solar Panel',
        device_secret: 'mock-device-secret-123',
        created_at: '2023-01-01T00:00:00Z'
      };

      supabase.single.mockResolvedValue({
        data: mockDevice,
        error: null
      });

      const deviceResponse = await request(app)
        .post('/v1/devices')
        .send({
          name: 'Test Solar Panel',
          user_id: 'user-123',
          location: { lat: 40.7128, lng: -74.0060 }
        })
        .expect(201);

      expect(deviceResponse.body).toEqual({
        device_id: 'device-123',
        device_secret: 'mock-device-secret-123',
        name: 'Test Solar Panel',
        created_at: '2023-01-01T00:00:00Z'
      });

      // Step 3: Ingest energy reading
      const mockReading = {
        id: 'reading-123',
        device_id: 'device-123',
        ts_device: '2023-01-01T12:00:00Z',
        energy_generated_kwh: 2.5,
        onchain_status: 'sent',
        created_at: '2023-01-01T12:00:00Z'
      };

      supabase.single
        .mockResolvedValueOnce({ data: mockDevice, error: null }) // Device lookup
        .mockResolvedValueOnce({ data: null, error: null }); // Duplicate check

      supabase.insert.mockReturnThis();
      supabase.select.mockReturnThis();
      supabase.single.mockResolvedValue({
        data: mockReading,
        error: null
      });

      const ingestResponse = await request(app)
        .post('/v1/ingest')
        .set('x-device-id', 'device-123')
        .set('x-timestamp', Date.now().toString())
        .set('x-signature', 'mock-signature')
        .send({
          ts_device: '2023-01-01T12:00:00Z',
          energy_generated_kwh: 2.5,
          voltage_v: 220.5,
          current_a: 11.3,
          frequency_hz: 60.0
        })
        .expect(200);

      expect(ingestResponse.body.stored).toBe(true);
      expect(ingestResponse.body.reading_id).toBe('reading-123');

      // Step 4: Retrieve readings
      const mockReadings = [mockReading];
      supabase.limit.mockResolvedValue({
        data: mockReadings,
        error: null
      });

      const readingsResponse = await request(app)
        .get('/v1/devices/device-123/readings')
        .expect(200);

      expect(readingsResponse.body).toEqual({
        device_id: 'device-123',
        readings: mockReadings,
        count: 1
      });
    });

    it('should handle device creation with admin authentication', async () => {
      process.env.ADMIN_TOKEN = 'test-admin-token';

      const mockDevice = {
        id: 'device-456',
        name: 'Admin Created Device',
        device_secret: 'mock-device-secret-456',
        created_at: '2023-01-01T00:00:00Z'
      };

      supabase.single.mockResolvedValue({
        data: mockDevice,
        error: null
      });

      const response = await request(app)
        .post('/v1/devices')
        .set('Authorization', 'Bearer test-admin-token')
        .send({
          name: 'Admin Created Device'
        })
        .expect(201);

      expect(response.body.device_id).toBe('device-456');
    });

    it('should handle multiple energy readings for same device', async () => {
      const mockDevice = {
        id: 'device-123',
        device_secret: 'mock-device-secret-123',
        active: true,
        onchain_enabled: false
      };

      // Mock device lookup for each request
      supabase.single.mockResolvedValue({
        data: mockDevice,
        error: null
      });

      // Mock duplicate check (no duplicates)
      supabase.single.mockResolvedValue({
        data: null,
        error: null
      });

      // Mock reading creation
      supabase.insert.mockReturnThis();
      supabase.select.mockReturnThis();
      supabase.single.mockResolvedValue({
        data: { id: 'reading-123' },
        error: null
      });

      const readings = [
        { energy: 1.5, timestamp: '2023-01-01T12:00:00Z' },
        { energy: 2.0, timestamp: '2023-01-01T13:00:00Z' },
        { energy: 1.8, timestamp: '2023-01-01T14:00:00Z' }
      ];

      for (const reading of readings) {
        const response = await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-timestamp', Date.now().toString())
          .set('x-signature', 'mock-signature')
          .send({
            ts_device: reading.timestamp,
            energy_generated_kwh: reading.energy
          })
          .expect(200);

        expect(response.body.stored).toBe(true);
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid device authentication', async () => {
      const mockDevice = {
        id: 'device-123',
        device_secret: 'mock-device-secret-123',
        active: true,
        onchain_enabled: false
      };

      supabase.single.mockResolvedValue({
        data: mockDevice,
        error: null
      });

      // Mock invalid signature
      hmacVerify.mockReturnValue(false);

      const response = await request(app)
        .post('/v1/ingest')
        .set('x-device-id', 'device-123')
        .set('x-timestamp', Date.now().toString())
        .set('x-signature', 'invalid-signature')
        .send({
          ts_device: '2023-01-01T12:00:00Z',
          energy_generated_kwh: 1.5
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid signature');
    });

    it('should handle device not found', async () => {
      supabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Device not found' }
      });

      const response = await request(app)
        .post('/v1/ingest')
        .set('x-device-id', 'unknown-device')
        .set('x-timestamp', Date.now().toString())
        .set('x-signature', 'mock-signature')
        .send({
          ts_device: '2023-01-01T12:00:00Z',
          energy_generated_kwh: 1.5
        })
        .expect(404);

      expect(response.body.error).toBe('Device not found or inactive');
    });

    it('should handle duplicate readings', async () => {
      const mockDevice = {
        id: 'device-123',
        device_secret: 'mock-device-secret-123',
        active: true,
        onchain_enabled: false
      };

      supabase.single
        .mockResolvedValueOnce({ data: mockDevice, error: null }) // Device lookup
        .mockResolvedValueOnce({ data: { id: 'existing-reading' }, error: null }); // Duplicate check

      const response = await request(app)
        .post('/v1/ingest')
        .set('x-device-id', 'device-123')
        .set('x-timestamp', Date.now().toString())
        .set('x-signature', 'mock-signature')
        .send({
          ts_device: '2023-01-01T12:00:00Z',
          energy_generated_kwh: 1.5
        })
        .expect(409);

      expect(response.body.error).toBe('Reading already exists for this timestamp');
    });

    it('should handle database errors gracefully', async () => {
      supabase.single.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/v1/ingest')
        .set('x-device-id', 'device-123')
        .set('x-timestamp', Date.now().toString())
        .set('x-signature', 'mock-signature')
        .send({
          ts_device: '2023-01-01T12:00:00Z',
          energy_generated_kwh: 1.5
        })
        .expect(500);

      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('Onchain Integration', () => {
    it('should handle onchain flush with pending readings', async () => {
      process.env.ADMIN_TOKEN = 'test-admin-token';
      process.env.ONCHAIN_ENABLED = 'true';

      const { isSolanaConfigured, sendRecordEnergy } = require('../../src/services/solana');
      isSolanaConfigured.mockReturnValue(true);

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

      supabase.limit.mockResolvedValue({
        data: mockReadings,
        error: null
      });

      sendRecordEnergy
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

      expect(sendRecordEnergy).toHaveBeenCalledTimes(2);
    });

    it('should handle onchain flush with no pending readings', async () => {
      process.env.ADMIN_TOKEN = 'test-admin-token';
      process.env.ONCHAIN_ENABLED = 'true';

      const { isSolanaConfigured } = require('../../src/services/solana');
      isSolanaConfigured.mockReturnValue(true);

      supabase.limit.mockResolvedValue({
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
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle concurrent requests efficiently', async () => {
      const mockDevice = {
        id: 'device-123',
        device_secret: 'mock-device-secret-123',
        active: true,
        onchain_enabled: false
      };

      supabase.single.mockResolvedValue({
        data: mockDevice,
        error: null
      });

      supabase.insert.mockReturnThis();
      supabase.select.mockReturnThis();
      supabase.single.mockResolvedValue({
        data: { id: 'reading-123' },
        error: null
      });

      const requests = Array(10).fill(null).map((_, i) =>
        request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-timestamp', Date.now().toString())
          .set('x-signature', 'mock-signature')
          .send({
            ts_device: `2023-01-01T${12 + i}:00:00Z`,
            energy_generated_kwh: 1.5 + i
          })
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.stored).toBe(true);
      });

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should handle large payloads', async () => {
      const mockDevice = {
        id: 'device-123',
        device_secret: 'mock-device-secret-123',
        active: true,
        onchain_enabled: false
      };

      supabase.single
        .mockResolvedValueOnce({ data: mockDevice, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      supabase.insert.mockReturnThis();
      supabase.select.mockReturnThis();
      supabase.single.mockResolvedValue({
        data: { id: 'reading-123' },
        error: null
      });

      const largeLocation = {
        lat: 40.7128,
        lng: -74.0060,
        address: 'A'.repeat(10000), // Large address
        metadata: {
          data: 'x'.repeat(50000) // Large metadata
        }
      };

      const response = await request(app)
        .post('/v1/ingest')
        .set('x-device-id', 'device-123')
        .set('x-timestamp', Date.now().toString())
        .set('x-signature', 'mock-signature')
        .send({
          ts_device: '2023-01-01T12:00:00Z',
          energy_generated_kwh: 1.5,
          location: largeLocation
        })
        .expect(200);

      expect(response.body.stored).toBe(true);
    });
  });

  describe('API Consistency', () => {
    it('should maintain consistent response formats across all endpoints', async () => {
      // Health endpoint
      const healthResponse = await request(app).get('/healthz');
      expect(healthResponse.body).toHaveProperty('ok');
      expect(healthResponse.body).toHaveProperty('time');

      // Device creation
      const mockDevice = {
        id: 'device-123',
        name: 'Test Device',
        device_secret: 'mock-device-secret-123',
        created_at: '2023-01-01T00:00:00Z'
      };

      supabase.single.mockResolvedValue({
        data: mockDevice,
        error: null
      });

      const deviceResponse = await request(app)
        .post('/v1/devices')
        .send({ name: 'Test Device' });

      expect(deviceResponse.body).toHaveProperty('device_id');
      expect(deviceResponse.body).toHaveProperty('device_secret');
      expect(deviceResponse.body).toHaveProperty('name');
      expect(deviceResponse.body).toHaveProperty('created_at');

      // Error responses should have consistent format
      const errorResponse = await request(app)
        .post('/v1/devices')
        .send({}); // Missing name

      expect(errorResponse.body).toHaveProperty('error');
    });

    it('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toEqual({ error: 'Not found' });
    });
  });
});
