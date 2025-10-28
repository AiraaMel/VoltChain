import request from 'supertest';
import express from 'express';
import devicesRouter from '../../src/routes/devices';

// Mock the supabase service
jest.mock('../../src/services/supabase', () => {
  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn()
  };

  return {
    supabase: mockSupabaseClient
  };
});

// Mock the crypto utils
jest.mock('../../src/utils/crypto', () => ({
  generateDeviceSecret: jest.fn(() => 'mock-device-secret-123')
}));

const app = express();
app.use(express.json());
app.use('/', devicesRouter);

describe('Devices Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.ADMIN_TOKEN;
  });

  describe('POST /v1/devices', () => {
    describe('Authentication', () => {
      it('should create device without admin token when not configured', async () => {
        const mockDevice = {
          id: 'device-123',
          name: 'Test Device',
          device_secret: 'mock-device-secret-123',
          created_at: '2023-01-01T00:00:00Z'
        };

        mockSupabaseClient.single.mockResolvedValue({
          data: mockDevice,
          error: null
        });

        const response = await request(app)
          .post('/v1/devices')
          .send({
            name: 'Test Device'
          })
          .expect(201);

        expect(response.body).toEqual({
          device_id: 'device-123',
          device_secret: 'mock-device-secret-123',
          name: 'Test Device',
          created_at: '2023-01-01T00:00:00Z'
        });
      });

      it('should require admin token when configured', async () => {
        process.env.ADMIN_TOKEN = 'test-admin-token';

        const response = await request(app)
          .post('/v1/devices')
          .send({
            name: 'Test Device'
          })
          .expect(401);

        expect(response.body).toEqual({ error: 'Unauthorized' });
      });

      it('should accept valid admin token', async () => {
        process.env.ADMIN_TOKEN = 'test-admin-token';
        
        const mockDevice = {
          id: 'device-123',
          name: 'Test Device',
          device_secret: 'mock-device-secret-123',
          created_at: '2023-01-01T00:00:00Z'
        };

        mockSupabaseClient.single.mockResolvedValue({
          data: mockDevice,
          error: null
        });

        const response = await request(app)
          .post('/v1/devices')
          .set('Authorization', 'Bearer test-admin-token')
          .send({
            name: 'Test Device'
          })
          .expect(201);

        expect(response.body.device_id).toBe('device-123');
      });

      it('should reject invalid admin token', async () => {
        process.env.ADMIN_TOKEN = 'test-admin-token';

        const response = await request(app)
          .post('/v1/devices')
          .set('Authorization', 'Bearer wrong-token')
          .send({
            name: 'Test Device'
          })
          .expect(401);

        expect(response.body).toEqual({ error: 'Unauthorized' });
      });

      it('should reject malformed authorization header', async () => {
        process.env.ADMIN_TOKEN = 'test-admin-token';

        const response = await request(app)
          .post('/v1/devices')
          .set('Authorization', 'InvalidFormat test-admin-token')
          .send({
            name: 'Test Device'
          })
          .expect(401);

        expect(response.body).toEqual({ error: 'Unauthorized' });
      });
    });

    describe('Input validation', () => {
      it('should require device name', async () => {
        const response = await request(app)
          .post('/v1/devices')
          .send({})
          .expect(400);

        expect(response.body).toEqual({ error: 'Device name is required' });
      });

      it('should require non-empty device name', async () => {
        const response = await request(app)
          .post('/v1/devices')
          .send({ name: '' })
          .expect(400);

        expect(response.body).toEqual({ error: 'Device name is required' });
      });

      it('should accept device name with special characters', async () => {
        const mockDevice = {
          id: 'device-123',
          name: 'Device-Name_123!@#',
          device_secret: 'mock-device-secret-123',
          created_at: '2023-01-01T00:00:00Z'
        };

        mockSupabaseClient.single.mockResolvedValue({
          data: mockDevice,
          error: null
        });

        const response = await request(app)
          .post('/v1/devices')
          .send({ name: 'Device-Name_123!@#' })
          .expect(201);

        expect(response.body.name).toBe('Device-Name_123!@#');
      });

      it('should accept very long device names', async () => {
        const longName = 'A'.repeat(1000);
        const mockDevice = {
          id: 'device-123',
          name: longName,
          device_secret: 'mock-device-secret-123',
          created_at: '2023-01-01T00:00:00Z'
        };

        mockSupabaseClient.single.mockResolvedValue({
          data: mockDevice,
          error: null
        });

        const response = await request(app)
          .post('/v1/devices')
          .send({ name: longName })
          .expect(201);

        expect(response.body.name).toBe(longName);
      });
    });

    describe('Optional fields', () => {
      it('should accept user_id', async () => {
        const mockDevice = {
          id: 'device-123',
          name: 'Test Device',
          device_secret: 'mock-device-secret-123',
          user_id: 'user-123',
          created_at: '2023-01-01T00:00:00Z'
        };

        mockSupabaseClient.single.mockResolvedValue({
          data: mockDevice,
          error: null
        });

        const response = await request(app)
          .post('/v1/devices')
          .send({
            name: 'Test Device',
            user_id: 'user-123'
          })
          .expect(201);

        expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Device',
            user_id: 'user-123',
            location: null,
            active: true,
            onchain_enabled: false
          })
        );
      });

      it('should accept location data', async () => {
        const location = { lat: 40.7128, lng: -74.0060, address: 'New York, NY' };
        const mockDevice = {
          id: 'device-123',
          name: 'Test Device',
          device_secret: 'mock-device-secret-123',
          location,
          created_at: '2023-01-01T00:00:00Z'
        };

        mockSupabaseClient.single.mockResolvedValue({
          data: mockDevice,
          error: null
        });

        const response = await request(app)
          .post('/v1/devices')
          .send({
            name: 'Test Device',
            location
          })
          .expect(201);

        expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Device',
            user_id: null,
            location,
            active: true,
            onchain_enabled: false
          })
        );
      });

      it('should handle both user_id and location', async () => {
        const location = { lat: 40.7128, lng: -74.0060 };
        const mockDevice = {
          id: 'device-123',
          name: 'Test Device',
          device_secret: 'mock-device-secret-123',
          user_id: 'user-123',
          location,
          created_at: '2023-01-01T00:00:00Z'
        };

        mockSupabaseClient.single.mockResolvedValue({
          data: mockDevice,
          error: null
        });

        const response = await request(app)
          .post('/v1/devices')
          .send({
            name: 'Test Device',
            user_id: 'user-123',
            location
          })
          .expect(201);

        expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Device',
            user_id: 'user-123',
            location,
            active: true,
            onchain_enabled: false
          })
        );
      });
    });

    describe('Database operations', () => {
      it('should call supabase with correct parameters', async () => {
        const mockDevice = {
          id: 'device-123',
          name: 'Test Device',
          device_secret: 'mock-device-secret-123',
          created_at: '2023-01-01T00:00:00Z'
        };

        mockSupabaseClient.single.mockResolvedValue({
          data: mockDevice,
          error: null
        });

        await request(app)
          .post('/v1/devices')
          .send({ name: 'Test Device' })
          .expect(201);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('devices');
        expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
          name: 'Test Device',
          device_secret: 'mock-device-secret-123',
          user_id: null,
          location: null,
          active: true,
          onchain_enabled: false
        });
        expect(mockSupabaseClient.select).toHaveBeenCalled();
        expect(mockSupabaseClient.single).toHaveBeenCalled();
      });

      it('should handle database errors', async () => {
        mockSupabaseClient.single.mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' }
        });

        const response = await request(app)
          .post('/v1/devices')
          .send({ name: 'Test Device' })
          .expect(500);

        expect(response.body).toEqual({ error: 'Failed to create device' });
      });

      it('should handle unexpected database errors', async () => {
        mockSupabaseClient.single.mockRejectedValue(new Error('Unexpected error'));

        const response = await request(app)
          .post('/v1/devices')
          .send({ name: 'Test Device' })
          .expect(500);

        expect(response.body).toEqual({ error: 'Internal server error' });
      });
    });

    describe('Response format', () => {
      it('should return device info with secret only once', async () => {
        const mockDevice = {
          id: 'device-123',
          name: 'Test Device',
          device_secret: 'mock-device-secret-123',
          created_at: '2023-01-01T00:00:00Z'
        };

        mockSupabaseClient.single.mockResolvedValue({
          data: mockDevice,
          error: null
        });

        const response = await request(app)
          .post('/v1/devices')
          .send({ name: 'Test Device' })
          .expect(201);

        expect(response.body).toEqual({
          device_id: 'device-123',
          device_secret: 'mock-device-secret-123',
          name: 'Test Device',
          created_at: '2023-01-01T00:00:00Z'
        });

        // Should not include internal fields
        expect(response.body).not.toHaveProperty('id');
        expect(response.body).not.toHaveProperty('active');
        expect(response.body).not.toHaveProperty('onchain_enabled');
      });
    });

    describe('Error handling', () => {
      it('should handle malformed JSON', async () => {
        const response = await request(app)
          .post('/v1/devices')
          .set('Content-Type', 'application/json')
          .send('{"name": "Test Device"') // Missing closing brace
          .expect(400);
      });

      it('should handle very large payloads', async () => {
        const largeLocation = { data: 'x'.repeat(100000) };
        
        const response = await request(app)
          .post('/v1/devices')
          .send({
            name: 'Test Device',
            location: largeLocation
          })
          .expect(201); // Should still work with large payloads
      });

      it('should handle concurrent requests', async () => {
        const mockDevice = {
          id: 'device-123',
          name: 'Test Device',
          device_secret: 'mock-device-secret-123',
          created_at: '2023-01-01T00:00:00Z'
        };

        mockSupabaseClient.single.mockResolvedValue({
          data: mockDevice,
          error: null
        });

        const requests = Array(10).fill(null).map(() =>
          request(app)
            .post('/v1/devices')
            .send({ name: 'Test Device' })
        );

        const responses = await Promise.all(requests);

        responses.forEach(response => {
          expect(response.status).toBe(201);
          expect(response.body.device_id).toBe('device-123');
        });
      });
    });
  });
});
