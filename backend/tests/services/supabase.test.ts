import { supabase, Device, Reading } from '../../src/services/supabase';

// Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => {
  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis()
  };

  return {
    createClient: jest.fn(() => mockSupabaseClient)
  };
});

describe('Supabase Service', () => {
  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  });

  describe('Client initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(supabase).toBeDefined();
      expect(supabase.from).toBeDefined();
    });

    it('should throw error when SUPABASE_URL is missing', () => {
      delete process.env.SUPABASE_URL;
      
      // Re-import to trigger initialization
      jest.resetModules();
      expect(() => {
        require('../../src/services/supabase');
      }).toThrow('Missing Supabase configuration');
    });

    it('should throw error when SUPABASE_SERVICE_ROLE_KEY is missing', () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      // Re-import to trigger initialization
      jest.resetModules();
      expect(() => {
        require('../../src/services/supabase');
      }).toThrow('Missing Supabase configuration');
    });
  });

  describe('Device interface', () => {
    it('should have correct Device interface structure', () => {
      const device: Device = {
        id: 'device-123',
        name: 'Test Device',
        device_secret: 'secret-123',
        active: true,
        user_id: 'user-123',
        location: { lat: 40.7128, lng: -74.0060 },
        public_key: 'pubkey-123',
        onchain_enabled: true,
        created_at: '2023-01-01T00:00:00Z',
        last_seen_at: '2023-01-01T12:00:00Z'
      };

      expect(device.id).toBe('device-123');
      expect(device.name).toBe('Test Device');
      expect(device.device_secret).toBe('secret-123');
      expect(device.active).toBe(true);
      expect(device.user_id).toBe('user-123');
      expect(device.location).toEqual({ lat: 40.7128, lng: -74.0060 });
      expect(device.public_key).toBe('pubkey-123');
      expect(device.onchain_enabled).toBe(true);
      expect(device.created_at).toBe('2023-01-01T00:00:00Z');
      expect(device.last_seen_at).toBe('2023-01-01T12:00:00Z');
    });

    it('should allow optional fields to be undefined', () => {
      const device: Device = {
        id: 'device-123',
        name: 'Test Device',
        device_secret: 'secret-123',
        active: true,
        onchain_enabled: false,
        created_at: '2023-01-01T00:00:00Z'
      };

      expect(device.user_id).toBeUndefined();
      expect(device.location).toBeUndefined();
      expect(device.public_key).toBeUndefined();
      expect(device.last_seen_at).toBeUndefined();
    });
  });

  describe('Reading interface', () => {
    it('should have correct Reading interface structure', () => {
      const reading: Reading = {
        id: 'reading-123',
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
        onchain_status: 'pending',
        onchain_tx: 'tx-123',
        created_at: '2023-01-01T12:00:00Z'
      };

      expect(reading.id).toBe('reading-123');
      expect(reading.device_id).toBe('device-123');
      expect(reading.ts_device).toBe('2023-01-01T12:00:00Z');
      expect(reading.energy_generated_kwh).toBe(1.5);
      expect(reading.voltage_v).toBe(220.5);
      expect(reading.current_a).toBe(6.8);
      expect(reading.frequency_hz).toBe(60.0);
      expect(reading.raw_payload).toBeDefined();
      expect(reading.signature).toBe('signature-123');
      expect(reading.onchain_status).toBe('pending');
      expect(reading.onchain_tx).toBe('tx-123');
      expect(reading.created_at).toBe('2023-01-01T12:00:00Z');
    });

    it('should allow optional fields to be undefined', () => {
      const reading: Reading = {
        id: 'reading-123',
        device_id: 'device-123',
        ts_device: '2023-01-01T12:00:00Z',
        energy_generated_kwh: 1.5,
        raw_payload: {},
        signature: 'signature-123',
        onchain_status: 'sent',
        created_at: '2023-01-01T12:00:00Z'
      };

      expect(reading.voltage_v).toBeUndefined();
      expect(reading.current_a).toBeUndefined();
      expect(reading.frequency_hz).toBeUndefined();
      expect(reading.onchain_tx).toBeUndefined();
    });

    it('should support all onchain_status values', () => {
      const pendingReading: Reading = {
        id: 'reading-1',
        device_id: 'device-123',
        ts_device: '2023-01-01T12:00:00Z',
        energy_generated_kwh: 1.5,
        raw_payload: {},
        signature: 'signature-123',
        onchain_status: 'pending',
        created_at: '2023-01-01T12:00:00Z'
      };

      const sentReading: Reading = {
        id: 'reading-2',
        device_id: 'device-123',
        ts_device: '2023-01-01T12:00:00Z',
        energy_generated_kwh: 1.5,
        raw_payload: {},
        signature: 'signature-123',
        onchain_status: 'sent',
        created_at: '2023-01-01T12:00:00Z'
      };

      const failedReading: Reading = {
        id: 'reading-3',
        device_id: 'device-123',
        ts_device: '2023-01-01T12:00:00Z',
        energy_generated_kwh: 1.5,
        raw_payload: {},
        signature: 'signature-123',
        onchain_status: 'failed',
        created_at: '2023-01-01T12:00:00Z'
      };

      expect(pendingReading.onchain_status).toBe('pending');
      expect(sentReading.onchain_status).toBe('sent');
      expect(failedReading.onchain_status).toBe('failed');
    });
  });

  describe('Database operations', () => {
    it('should handle device creation', async () => {
      const mockDevice = {
        id: 'device-123',
        name: 'Test Device',
        device_secret: 'secret-123',
        active: true,
        onchain_enabled: false,
        created_at: '2023-01-01T00:00:00Z'
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockDevice,
        error: null
      });

      const result = await supabase
        .from('devices')
        .insert({
          name: 'Test Device',
          device_secret: 'secret-123',
          active: true,
          onchain_enabled: false
        })
        .select()
        .single();

      expect(result.data).toEqual(mockDevice);
      expect(result.error).toBeNull();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('devices');
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.single).toHaveBeenCalled();
    });

    it('should handle device query with filters', async () => {
      const mockDevice = {
        id: 'device-123',
        name: 'Test Device',
        device_secret: 'secret-123',
        active: true,
        onchain_enabled: false,
        created_at: '2023-01-01T00:00:00Z'
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockDevice,
        error: null
      });

      const result = await supabase
        .from('devices')
        .select('*')
        .eq('id', 'device-123')
        .eq('active', true)
        .single();

      expect(result.data).toEqual(mockDevice);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'device-123');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('active', true);
    });

    it('should handle readings query with ordering and limit', async () => {
      const mockReadings = [
        {
          id: 'reading-1',
          device_id: 'device-123',
          ts_device: '2023-01-01T12:00:00Z',
          energy_generated_kwh: 1.5,
          onchain_status: 'pending',
          created_at: '2023-01-01T12:00:00Z'
        },
        {
          id: 'reading-2',
          device_id: 'device-123',
          ts_device: '2023-01-01T11:00:00Z',
          energy_generated_kwh: 2.0,
          onchain_status: 'sent',
          created_at: '2023-01-01T11:00:00Z'
        }
      ];

      mockSupabaseClient.limit.mockResolvedValue({
        data: mockReadings,
        error: null
      });

      const result = await supabase
        .from('readings')
        .select('*')
        .eq('device_id', 'device-123')
        .order('ts_device', { ascending: false })
        .limit(100);

      expect(result.data).toEqual(mockReadings);
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('ts_device', { ascending: false });
      expect(mockSupabaseClient.limit).toHaveBeenCalledWith(100);
    });

    it('should handle database errors', async () => {
      const mockError = {
        message: 'Database connection failed',
        code: 'DB_ERROR'
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: mockError
      });

      const result = await supabase
        .from('devices')
        .select('*')
        .eq('id', 'device-123')
        .single();

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('Type safety', () => {
    it('should enforce Device type constraints', () => {
      // This test ensures TypeScript compilation works correctly
      const device: Device = {
        id: 'device-123',
        name: 'Test Device',
        device_secret: 'secret-123',
        active: true,
        onchain_enabled: false,
        created_at: '2023-01-01T00:00:00Z'
      };

      // These should compile without errors
      expect(typeof device.id).toBe('string');
      expect(typeof device.name).toBe('string');
      expect(typeof device.device_secret).toBe('string');
      expect(typeof device.active).toBe('boolean');
      expect(typeof device.onchain_enabled).toBe('boolean');
      expect(typeof device.created_at).toBe('string');
    });

    it('should enforce Reading type constraints', () => {
      const reading: Reading = {
        id: 'reading-123',
        device_id: 'device-123',
        ts_device: '2023-01-01T12:00:00Z',
        energy_generated_kwh: 1.5,
        raw_payload: {},
        signature: 'signature-123',
        onchain_status: 'pending',
        created_at: '2023-01-01T12:00:00Z'
      };

      // These should compile without errors
      expect(typeof reading.id).toBe('string');
      expect(typeof reading.device_id).toBe('string');
      expect(typeof reading.ts_device).toBe('string');
      expect(typeof reading.energy_generated_kwh).toBe('number');
      expect(typeof reading.raw_payload).toBe('object');
      expect(typeof reading.signature).toBe('string');
      expect(['pending', 'sent', 'failed']).toContain(reading.onchain_status);
      expect(typeof reading.created_at).toBe('string');
    });
  });
});