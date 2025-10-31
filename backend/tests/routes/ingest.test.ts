import request from 'supertest';
import express from 'express';
import ingestRouter from '../../src/routes/ingest';

// Mock the supabase service
jest.mock('../../src/services/supabase', () => {
  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn()
  };

  return {
    supabase: mockSupabaseClient
  };
});

// Mock the crypto utils
jest.mock('../../src/utils/crypto', () => ({
  hmacVerify: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/', ingestRouter);

describe('Ingest Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ONCHAIN_ENABLED = 'false';
  });

  describe('POST /v1/ingest', () => {
    describe('Header validation', () => {
      it('should require x-device-id header', async () => {
        const response = await request(app)
          .post('/v1/ingest')
          .set('x-timestamp', Date.now().toString())
          .set('x-signature', 'test-signature')
          .send({
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5
          })
          .expect(400);

        expect(response.body).toEqual({
          error: 'Missing required headers: x-device-id, x-timestamp, x-signature'
        });
      });

      it('should require x-timestamp header', async () => {
        const response = await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-signature', 'test-signature')
          .send({
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5
          })
          .expect(400);

        expect(response.body).toEqual({
          error: 'Missing required headers: x-device-id, x-timestamp, x-signature'
        });
      });

      it('should require x-signature header', async () => {
        const response = await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-timestamp', Date.now().toString())
          .send({
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5
          })
          .expect(400);

        expect(response.body).toEqual({
          error: 'Missing required headers: x-device-id, x-timestamp, x-signature'
        });
      });

      it('should require all headers together', async () => {
        const response = await request(app)
          .post('/v1/ingest')
          .send({
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5
          })
          .expect(400);

        expect(response.body).toEqual({
          error: 'Missing required headers: x-device-id, x-timestamp, x-signature'
        });
      });
    });

    describe('Timestamp validation', () => {
      it('should reject timestamps older than 30 seconds', async () => {
        const oldTimestamp = (Date.now() - 35000).toString(); // 35 seconds ago
        
        const response = await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-timestamp', oldTimestamp)
          .set('x-signature', 'test-signature')
          .send({
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5
          })
          .expect(400);

        expect(response.body).toEqual({
          error: 'Request timestamp too old or too far in future'
        });
      });

      it('should reject timestamps in the future', async () => {
        const futureTimestamp = (Date.now() + 35000).toString(); // 35 seconds in future
        
        const response = await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-timestamp', futureTimestamp)
          .set('x-signature', 'test-signature')
          .send({
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5
          })
          .expect(400);

        expect(response.body).toEqual({
          error: 'Request timestamp too old or too far in future'
        });
      });

      it('should accept timestamps within 30 second window', async () => {
        const { hmacVerify } = require('../../src/utils/crypto');
        hmacVerify.mockReturnValue(true);

        const mockDevice = {
          id: 'device-123',
          device_secret: 'device-secret-123',
          active: true,
          onchain_enabled: false
        };

        mockSupabaseClient.single
          .mockResolvedValueOnce({ data: mockDevice, error: null }) // Device lookup
          .mockResolvedValueOnce({ data: null, error: null }); // Duplicate check

        mockSupabaseClient.insert.mockReturnThis();
        mockSupabaseClient.select.mockReturnThis();
        mockSupabaseClient.single.mockResolvedValue({
          data: { id: 'reading-123' },
          error: null
        });

        const validTimestamp = (Date.now() - 15000).toString(); // 15 seconds ago
        
        const response = await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-timestamp', validTimestamp)
          .set('x-signature', 'test-signature')
          .send({
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5
          })
          .expect(200);

        expect(response.body.stored).toBe(true);
      });

      it('should handle invalid timestamp format', async () => {
        const response = await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-timestamp', 'invalid-timestamp')
          .set('x-signature', 'test-signature')
          .send({
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5
          })
          .expect(400);

        expect(response.body).toEqual({
          error: 'Request timestamp too old or too far in future'
        });
      });
    });

    describe('Device validation', () => {
      it('should reject unknown device', async () => {
        mockSupabaseClient.single.mockResolvedValue({
          data: null,
          error: { message: 'Device not found' }
        });

        const response = await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'unknown-device')
          .set('x-timestamp', Date.now().toString())
          .set('x-signature', 'test-signature')
          .send({
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5
          })
          .expect(404);

        expect(response.body).toEqual({
          error: 'Device not found or inactive'
        });
      });

      it('should reject inactive device', async () => {
        const mockDevice = {
          id: 'device-123',
          device_secret: 'device-secret-123',
          active: false,
          onchain_enabled: false
        };

        mockSupabaseClient.single.mockResolvedValue({
          data: mockDevice,
          error: null
        });

        const response = await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-timestamp', Date.now().toString())
          .set('x-signature', 'test-signature')
          .send({
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5
          })
          .expect(404);

        expect(response.body).toEqual({
          error: 'Device not found or inactive'
        });
      });
    });

    describe('Input validation', () => {
      it('should require ts_device field', async () => {
        const { hmacVerify } = require('../../src/utils/crypto');
        hmacVerify.mockReturnValue(true);

        const mockDevice = {
          id: 'device-123',
          device_secret: 'device-secret-123',
          active: true,
          onchain_enabled: false
        };

        mockSupabaseClient.single.mockResolvedValue({
          data: mockDevice,
          error: null
        });

        const response = await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-timestamp', Date.now().toString())
          .set('x-signature', 'test-signature')
          .send({
            energy_generated_kwh: 1.5
          })
          .expect(400);

        expect(response.body).toEqual({
          error: 'Missing required fields: ts_device, energy_generated_kwh'
        });
      });

      it('should require energy_generated_kwh field', async () => {
        const { hmacVerify } = require('../../src/utils/crypto');
        hmacVerify.mockReturnValue(true);

        const mockDevice = {
          id: 'device-123',
          device_secret: 'device-secret-123',
          active: true,
          onchain_enabled: false
        };

        mockSupabaseClient.single.mockResolvedValue({
          data: mockDevice,
          error: null
        });

        const response = await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-timestamp', Date.now().toString())
          .set('x-signature', 'test-signature')
          .send({
            ts_device: '2023-01-01T12:00:00Z'
          })
          .expect(400);

        expect(response.body).toEqual({
          error: 'Missing required fields: ts_device, energy_generated_kwh'
        });
      });

      it('should accept zero energy values', async () => {
        const { hmacVerify } = require('../../src/utils/crypto');
        hmacVerify.mockReturnValue(true);

        const mockDevice = {
          id: 'device-123',
          device_secret: 'device-secret-123',
          active: true,
          onchain_enabled: false
        };

        mockSupabaseClient.single
          .mockResolvedValueOnce({ data: mockDevice, error: null })
          .mockResolvedValueOnce({ data: null, error: null });

        mockSupabaseClient.insert.mockReturnThis();
        mockSupabaseClient.select.mockReturnThis();
        mockSupabaseClient.single.mockResolvedValue({
          data: { id: 'reading-123' },
          error: null
        });

        const response = await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-timestamp', Date.now().toString())
          .set('x-signature', 'test-signature')
          .send({
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 0
          })
          .expect(200);

        expect(response.body.stored).toBe(true);
      });

      it('should accept negative energy values', async () => {
        const { hmacVerify } = require('../../src/utils/crypto');
        hmacVerify.mockReturnValue(true);

        const mockDevice = {
          id: 'device-123',
          device_secret: 'device-secret-123',
          active: true,
          onchain_enabled: false
        };

        mockSupabaseClient.single
          .mockResolvedValueOnce({ data: mockDevice, error: null })
          .mockResolvedValueOnce({ data: null, error: null });

        mockSupabaseClient.insert.mockReturnThis();
        mockSupabaseClient.select.mockReturnThis();
        mockSupabaseClient.single.mockResolvedValue({
          data: { id: 'reading-123' },
          error: null
        });

        const response = await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-timestamp', Date.now().toString())
          .set('x-signature', 'test-signature')
          .send({
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: -1.5
          })
          .expect(200);

        expect(response.body.stored).toBe(true);
      });
    });

    describe('HMAC verification', () => {
      it('should verify HMAC signature', async () => {
        const { hmacVerify } = require('../../src/utils/crypto');
        hmacVerify.mockReturnValue(true);

        const mockDevice = {
          id: 'device-123',
          device_secret: 'device-secret-123',
          active: true,
          onchain_enabled: false
        };

        mockSupabaseClient.single
          .mockResolvedValueOnce({ data: mockDevice, error: null })
          .mockResolvedValueOnce({ data: null, error: null });

        mockSupabaseClient.insert.mockReturnThis();
        mockSupabaseClient.select.mockReturnThis();
        mockSupabaseClient.single.mockResolvedValue({
          data: { id: 'reading-123' },
          error: null
        });

        const response = await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-timestamp', Date.now().toString())
          .set('x-signature', 'test-signature')
          .send({
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5
          })
          .expect(200);

        expect(hmacVerify).toHaveBeenCalledWith(
          'device-secret-123',
          'device-123.1234567890.2023-01-01T12:00:00Z.1.5',
          'test-signature'
        );
        expect(response.body.stored).toBe(true);
      });

      it('should reject invalid HMAC signature', async () => {
        const { hmacVerify } = require('../../src/utils/crypto');
        hmacVerify.mockReturnValue(false);

        const mockDevice = {
          id: 'device-123',
          device_secret: 'device-secret-123',
          active: true,
          onchain_enabled: false
        };

        mockSupabaseClient.single.mockResolvedValue({
          data: mockDevice,
          error: null
        });

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

        expect(response.body).toEqual({
          error: 'Invalid signature'
        });
      });
    });

    describe('Duplicate prevention', () => {
      it('should reject duplicate readings', async () => {
        const { hmacVerify } = require('../../src/utils/crypto');
        hmacVerify.mockReturnValue(true);

        const mockDevice = {
          id: 'device-123',
          device_secret: 'device-secret-123',
          active: true,
          onchain_enabled: false
        };

        mockSupabaseClient.single
          .mockResolvedValueOnce({ data: mockDevice, error: null })
          .mockResolvedValueOnce({ data: { id: 'existing-reading' }, error: null });

        const response = await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-timestamp', Date.now().toString())
          .set('x-signature', 'test-signature')
          .send({
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5
          })
          .expect(409);

        expect(response.body).toEqual({
          error: 'Reading already exists for this timestamp'
        });
      });
    });

    describe('Database operations', () => {
      it('should store reading with correct data', async () => {
        const { hmacVerify } = require('../../src/utils/crypto');
        hmacVerify.mockReturnValue(true);

        const mockDevice = {
          id: 'device-123',
          device_secret: 'device-secret-123',
          active: true,
          onchain_enabled: false
        };

        mockSupabaseClient.single
          .mockResolvedValueOnce({ data: mockDevice, error: null })
          .mockResolvedValueOnce({ data: null, error: null });

        mockSupabaseClient.insert.mockReturnThis();
        mockSupabaseClient.select.mockReturnThis();
        mockSupabaseClient.single.mockResolvedValue({
          data: { id: 'reading-123' },
          error: null
        });

        const readingData = {
          ts_device: '2023-01-01T12:00:00Z',
          energy_generated_kwh: 1.5,
          voltage_v: 220.5,
          current_a: 6.8,
          frequency_hz: 60.0
        };

        const response = await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-timestamp', Date.now().toString())
          .set('x-signature', 'test-signature')
          .send(readingData)
          .expect(200);

        expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
          device_id: 'device-123',
          ts_device: '2023-01-01T12:00:00Z',
          energy_generated_kwh: 1.5,
          voltage_v: 220.5,
          current_a: 6.8,
          frequency_hz: 60.0,
          raw_payload: readingData,
          signature: 'test-signature',
          onchain_status: 'sent'
        });

        expect(response.body).toEqual({
          stored: true,
          reading_id: 'reading-123'
        });
      });

      it('should update device last_seen_at', async () => {
        const { hmacVerify } = require('../../src/utils/crypto');
        hmacVerify.mockReturnValue(true);

        const mockDevice = {
          id: 'device-123',
          device_secret: 'device-secret-123',
          active: true,
          onchain_enabled: false
        };

        mockSupabaseClient.single
          .mockResolvedValueOnce({ data: mockDevice, error: null })
          .mockResolvedValueOnce({ data: null, error: null });

        mockSupabaseClient.insert.mockReturnThis();
        mockSupabaseClient.select.mockReturnThis();
        mockSupabaseClient.single.mockResolvedValue({
          data: { id: 'reading-123' },
          error: null
        });

        await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-timestamp', Date.now().toString())
          .set('x-signature', 'test-signature')
          .send({
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5
          })
          .expect(200);

        expect(mockSupabaseClient.update).toHaveBeenCalledWith({
          last_seen_at: expect.any(String)
        });
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'device-123');
      });

      it('should handle database errors', async () => {
        const { hmacVerify } = require('../../src/utils/crypto');
        hmacVerify.mockReturnValue(true);

        const mockDevice = {
          id: 'device-123',
          device_secret: 'device-secret-123',
          active: true,
          onchain_enabled: false
        };

        mockSupabaseClient.single
          .mockResolvedValueOnce({ data: mockDevice, error: null })
          .mockResolvedValueOnce({ data: null, error: null });

        mockSupabaseClient.insert.mockReturnThis();
        mockSupabaseClient.select.mockReturnThis();
        mockSupabaseClient.single.mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        });

        const response = await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-timestamp', Date.now().toString())
          .set('x-signature', 'test-signature')
          .send({
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5
          })
          .expect(500);

        expect(response.body).toEqual({
          error: 'Failed to store reading'
        });
      });
    });

    describe('Onchain status', () => {
      it('should set onchain_status to sent when onchain disabled', async () => {
        process.env.ONCHAIN_ENABLED = 'false';
        
        const { hmacVerify } = require('../../src/utils/crypto');
        hmacVerify.mockReturnValue(true);

        const mockDevice = {
          id: 'device-123',
          device_secret: 'device-secret-123',
          active: true,
          onchain_enabled: false
        };

        mockSupabaseClient.single
          .mockResolvedValueOnce({ data: mockDevice, error: null })
          .mockResolvedValueOnce({ data: null, error: null });

        mockSupabaseClient.insert.mockReturnThis();
        mockSupabaseClient.select.mockReturnThis();
        mockSupabaseClient.single.mockResolvedValue({
          data: { id: 'reading-123' },
          error: null
        });

        await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-timestamp', Date.now().toString())
          .set('x-signature', 'test-signature')
          .send({
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5
          })
          .expect(200);

        expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
          expect.objectContaining({
            onchain_status: 'sent'
          })
        );
      });

      it('should set onchain_status to pending when onchain enabled', async () => {
        process.env.ONCHAIN_ENABLED = 'true';
        
        const { hmacVerify } = require('../../src/utils/crypto');
        hmacVerify.mockReturnValue(true);

        const mockDevice = {
          id: 'device-123',
          device_secret: 'device-secret-123',
          active: true,
          onchain_enabled: true
        };

        mockSupabaseClient.single
          .mockResolvedValueOnce({ data: mockDevice, error: null })
          .mockResolvedValueOnce({ data: null, error: null });

        mockSupabaseClient.insert.mockReturnThis();
        mockSupabaseClient.select.mockReturnThis();
        mockSupabaseClient.single.mockResolvedValue({
          data: { id: 'reading-123' },
          error: null
        });

        await request(app)
          .post('/v1/ingest')
          .set('x-device-id', 'device-123')
          .set('x-timestamp', Date.now().toString())
          .set('x-signature', 'test-signature')
          .send({
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5
          })
          .expect(200);

        expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
          expect.objectContaining({
            onchain_status: 'pending'
          })
        );
      });
    });
  });
});
