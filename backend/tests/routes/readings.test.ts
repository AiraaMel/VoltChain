import request from 'supertest';
import express from 'express';
import readingsRouter from '../../src/routes/readings';

// Mock the supabase service
jest.mock('../../src/services/supabase', () => {
  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn()
  };

  return {
    supabase: mockSupabaseClient
  };
});

const app = express();
app.use('/', readingsRouter);

describe('Readings Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.ADMIN_TOKEN;
  });

  describe('GET /v1/devices/:id/readings', () => {
    describe('Authentication', () => {
      it('should return readings without admin token when not configured', async () => {
        const mockReadings = [
          {
            id: 'reading-1',
            device_id: 'device-123',
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5,
            onchain_status: 'sent',
            created_at: '2023-01-01T12:00:00Z'
          }
        ];

        mockSupabaseClient.limit.mockResolvedValue({
          data: mockReadings,
          error: null
        });

        const response = await request(app)
          .get('/v1/devices/device-123/readings')
          .expect(200);

        expect(response.body).toEqual({
          device_id: 'device-123',
          readings: mockReadings,
          count: 1
        });
      });

      it('should require admin token when configured', async () => {
        process.env.ADMIN_TOKEN = 'test-admin-token';

        const response = await request(app)
          .get('/v1/devices/device-123/readings')
          .expect(401);

        expect(response.body).toEqual({ error: 'Unauthorized' });
      });

      it('should accept valid admin token', async () => {
        process.env.ADMIN_TOKEN = 'test-admin-token';
        
        const mockReadings = [
          {
            id: 'reading-1',
            device_id: 'device-123',
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5,
            onchain_status: 'sent',
            created_at: '2023-01-01T12:00:00Z'
          }
        ];

        mockSupabaseClient.limit.mockResolvedValue({
          data: mockReadings,
          error: null
        });

        const response = await request(app)
          .get('/v1/devices/device-123/readings')
          .set('Authorization', 'Bearer test-admin-token')
          .expect(200);

        expect(response.body.device_id).toBe('device-123');
        expect(response.body.readings).toEqual(mockReadings);
      });

      it('should reject invalid admin token', async () => {
        process.env.ADMIN_TOKEN = 'test-admin-token';

        const response = await request(app)
          .get('/v1/devices/device-123/readings')
          .set('Authorization', 'Bearer wrong-token')
          .expect(401);

        expect(response.body).toEqual({ error: 'Unauthorized' });
      });

      it('should reject malformed authorization header', async () => {
        process.env.ADMIN_TOKEN = 'test-admin-token';

        const response = await request(app)
          .get('/v1/devices/device-123/readings')
          .set('Authorization', 'InvalidFormat test-admin-token')
          .expect(401);

        expect(response.body).toEqual({ error: 'Unauthorized' });
      });
    });

    describe('Query parameters', () => {
      it('should use default limit of 100', async () => {
        const mockReadings = Array(100).fill(null).map((_, i) => ({
          id: `reading-${i}`,
          device_id: 'device-123',
          ts_device: '2023-01-01T12:00:00Z',
          energy_generated_kwh: 1.5,
          onchain_status: 'sent',
          created_at: '2023-01-01T12:00:00Z'
        }));

        mockSupabaseClient.limit.mockResolvedValue({
          data: mockReadings,
          error: null
        });

        const response = await request(app)
          .get('/v1/devices/device-123/readings')
          .expect(200);

        expect(mockSupabaseClient.limit).toHaveBeenCalledWith(100);
        expect(response.body.count).toBe(100);
      });

      it('should accept custom limit parameter', async () => {
        const mockReadings = Array(50).fill(null).map((_, i) => ({
          id: `reading-${i}`,
          device_id: 'device-123',
          ts_device: '2023-01-01T12:00:00Z',
          energy_generated_kwh: 1.5,
          onchain_status: 'sent',
          created_at: '2023-01-01T12:00:00Z'
        }));

        mockSupabaseClient.limit.mockResolvedValue({
          data: mockReadings,
          error: null
        });

        const response = await request(app)
          .get('/v1/devices/device-123/readings?limit=50')
          .expect(200);

        expect(mockSupabaseClient.limit).toHaveBeenCalledWith(50);
        expect(response.body.count).toBe(50);
      });

      it('should reject limit exceeding 1000', async () => {
        const response = await request(app)
          .get('/v1/devices/device-123/readings?limit=1500')
          .expect(400);

        expect(response.body).toEqual({
          error: 'Limit cannot exceed 1000'
        });
      });

      it('should handle invalid limit parameter', async () => {
        const response = await request(app)
          .get('/v1/devices/device-123/readings?limit=invalid')
          .expect(200);

        // Should default to 100 when limit is invalid
        expect(mockSupabaseClient.limit).toHaveBeenCalledWith(100);
      });

      it('should handle negative limit parameter', async () => {
        const response = await request(app)
          .get('/v1/devices/device-123/readings?limit=-10')
          .expect(200);

        // Should default to 100 when limit is negative
        expect(mockSupabaseClient.limit).toHaveBeenCalledWith(100);
      });

      it('should handle zero limit parameter', async () => {
        const response = await request(app)
          .get('/v1/devices/device-123/readings?limit=0')
          .expect(200);

        // Should default to 100 when limit is zero
        expect(mockSupabaseClient.limit).toHaveBeenCalledWith(100);
      });
    });

    describe('Database operations', () => {
      it('should query readings for correct device', async () => {
        const mockReadings = [
          {
            id: 'reading-1',
            device_id: 'device-123',
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5,
            onchain_status: 'sent',
            created_at: '2023-01-01T12:00:00Z'
          }
        ];

        mockSupabaseClient.limit.mockResolvedValue({
          data: mockReadings,
          error: null
        });

        await request(app)
          .get('/v1/devices/device-123/readings')
          .expect(200);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('readings');
        expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('device_id', 'device-123');
        expect(mockSupabaseClient.order).toHaveBeenCalledWith('ts_device', { ascending: false });
        expect(mockSupabaseClient.limit).toHaveBeenCalledWith(100);
      });

      it('should return readings in descending order by timestamp', async () => {
        const mockReadings = [
          {
            id: 'reading-2',
            device_id: 'device-123',
            ts_device: '2023-01-01T13:00:00Z',
            energy_generated_kwh: 2.0,
            onchain_status: 'sent',
            created_at: '2023-01-01T13:00:00Z'
          },
          {
            id: 'reading-1',
            device_id: 'device-123',
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5,
            onchain_status: 'sent',
            created_at: '2023-01-01T12:00:00Z'
          }
        ];

        mockSupabaseClient.limit.mockResolvedValue({
          data: mockReadings,
          error: null
        });

        const response = await request(app)
          .get('/v1/devices/device-123/readings')
          .expect(200);

        expect(response.body.readings).toEqual(mockReadings);
        expect(mockSupabaseClient.order).toHaveBeenCalledWith('ts_device', { ascending: false });
      });

      it('should handle empty readings list', async () => {
        mockSupabaseClient.limit.mockResolvedValue({
          data: [],
          error: null
        });

        const response = await request(app)
          .get('/v1/devices/device-123/readings')
          .expect(200);

        expect(response.body).toEqual({
          device_id: 'device-123',
          readings: [],
          count: 0
        });
      });

      it('should handle null readings data', async () => {
        mockSupabaseClient.limit.mockResolvedValue({
          data: null,
          error: null
        });

        const response = await request(app)
          .get('/v1/devices/device-123/readings')
          .expect(200);

        expect(response.body).toEqual({
          device_id: 'device-123',
          readings: [],
          count: 0
        });
      });

      it('should handle database errors', async () => {
        mockSupabaseClient.limit.mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' }
        });

        const response = await request(app)
          .get('/v1/devices/device-123/readings')
          .expect(500);

        expect(response.body).toEqual({
          error: 'Failed to fetch readings'
        });
      });

      it('should handle unexpected database errors', async () => {
        mockSupabaseClient.limit.mockRejectedValue(new Error('Unexpected error'));

        const response = await request(app)
          .get('/v1/devices/device-123/readings')
          .expect(500);

        expect(response.body).toEqual({
          error: 'Internal server error'
        });
      });
    });

    describe('Response format', () => {
      it('should return correct response structure', async () => {
        const mockReadings = [
          {
            id: 'reading-1',
            device_id: 'device-123',
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5,
            voltage_v: 220.5,
            current_a: 6.8,
            frequency_hz: 60.0,
            raw_payload: {
              ts_device: '2023-01-01T12:00:00Z',
              energy_generated_kwh: 1.5,
              voltage_v: 220.5,
              current_a: 6.8,
              frequency_hz: 60.0
            },
            signature: 'signature-123',
            onchain_status: 'sent',
            onchain_tx: 'tx-123',
            created_at: '2023-01-01T12:00:00Z'
          }
        ];

        mockSupabaseClient.limit.mockResolvedValue({
          data: mockReadings,
          error: null
        });

        const response = await request(app)
          .get('/v1/devices/device-123/readings')
          .expect(200);

        expect(response.body).toEqual({
          device_id: 'device-123',
          readings: mockReadings,
          count: 1
        });
      });

      it('should include all reading fields', async () => {
        const mockReadings = [
          {
            id: 'reading-1',
            device_id: 'device-123',
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5,
            voltage_v: 220.5,
            current_a: 6.8,
            frequency_hz: 60.0,
            raw_payload: {},
            signature: 'signature-123',
            onchain_status: 'pending',
            onchain_tx: null,
            created_at: '2023-01-01T12:00:00Z'
          }
        ];

        mockSupabaseClient.limit.mockResolvedValue({
          data: mockReadings,
          error: null
        });

        const response = await request(app)
          .get('/v1/devices/device-123/readings')
          .expect(200);

        const reading = response.body.readings[0];
        expect(reading).toHaveProperty('id');
        expect(reading).toHaveProperty('device_id');
        expect(reading).toHaveProperty('ts_device');
        expect(reading).toHaveProperty('energy_generated_kwh');
        expect(reading).toHaveProperty('voltage_v');
        expect(reading).toHaveProperty('current_a');
        expect(reading).toHaveProperty('frequency_hz');
        expect(reading).toHaveProperty('raw_payload');
        expect(reading).toHaveProperty('signature');
        expect(reading).toHaveProperty('onchain_status');
        expect(reading).toHaveProperty('onchain_tx');
        expect(reading).toHaveProperty('created_at');
      });
    });

    describe('Device ID validation', () => {
      it('should handle various device ID formats', async () => {
        const deviceIds = [
          'device-123',
          'device_123',
          'device.123',
          '123',
          'device-with-very-long-name-that-might-cause-issues',
          'device@#$%^&*()'
        ];

        for (const deviceId of deviceIds) {
          mockSupabaseClient.limit.mockResolvedValue({
            data: [],
            error: null
          });

          const response = await request(app)
            .get(`/v1/devices/${deviceId}/readings`)
            .expect(200);

          expect(response.body.device_id).toBe(deviceId);
          expect(mockSupabaseClient.eq).toHaveBeenCalledWith('device_id', deviceId);
        }
      });

      it('should handle URL-encoded device IDs', async () => {
        const deviceId = 'device%20with%20spaces';
        const decodedDeviceId = 'device with spaces';

        mockSupabaseClient.limit.mockResolvedValue({
          data: [],
          error: null
        });

        const response = await request(app)
          .get(`/v1/devices/${deviceId}/readings`)
          .expect(200);

        expect(response.body.device_id).toBe(decodedDeviceId);
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('device_id', decodedDeviceId);
      });
    });

    describe('Performance', () => {
      it('should handle large result sets efficiently', async () => {
        const largeReadings = Array(1000).fill(null).map((_, i) => ({
          id: `reading-${i}`,
          device_id: 'device-123',
          ts_device: '2023-01-01T12:00:00Z',
          energy_generated_kwh: 1.5,
          onchain_status: 'sent',
          created_at: '2023-01-01T12:00:00Z'
        }));

        mockSupabaseClient.limit.mockResolvedValue({
          data: largeReadings,
          error: null
        });

        const startTime = Date.now();
        
        const response = await request(app)
          .get('/v1/devices/device-123/readings?limit=1000')
          .expect(200);

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(response.body.count).toBe(1000);
        expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
      });

      it('should handle concurrent requests', async () => {
        const mockReadings = [
          {
            id: 'reading-1',
            device_id: 'device-123',
            ts_device: '2023-01-01T12:00:00Z',
            energy_generated_kwh: 1.5,
            onchain_status: 'sent',
            created_at: '2023-01-01T12:00:00Z'
          }
        ];

        mockSupabaseClient.limit.mockResolvedValue({
          data: mockReadings,
          error: null
        });

        const requests = Array(10).fill(null).map(() =>
          request(app).get('/v1/devices/device-123/readings')
        );

        const responses = await Promise.all(requests);

        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.body.device_id).toBe('device-123');
        });
      });
    });
  });
});
