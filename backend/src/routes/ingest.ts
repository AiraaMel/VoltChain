import { Router, Request, Response } from 'express';
import { supabase, Device, Reading } from '../services/supabase';
import { hmacVerify } from '../utils/crypto';

const router = Router();

interface IngestRequest {
  ts_device: string;
  energy_generated_kwh: number;
  voltage_v?: number;
  current_a?: number;
  frequency_hz?: number;
}

/**
 * Ingest energy reading from device
 * POST /v1/ingest
 * Requires HMAC authentication
 */
router.post('/v1/ingest', async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers['x-device-id'] as string;
    const timestamp = req.headers['x-timestamp'] as string;
    const signature = req.headers['x-signature'] as string;

    if (!deviceId || !timestamp || !signature) {
      return res.status(400).json({ 
        error: 'Missing required headers: x-device-id, x-timestamp, x-signature' 
      });
    }

    // Validate timestamp (30 second window)
    const now = Date.now();
    const requestTime = parseInt(timestamp);
    const timeDiff = Math.abs(now - requestTime);
    
    if (timeDiff > 30000) { // 30 seconds
      return res.status(400).json({ error: 'Request timestamp too old or too far in future' });
    }

    // Get device from database
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('*')
      .eq('id', deviceId)
      .eq('active', true)
      .single();

    if (deviceError || !device) {
      return res.status(404).json({ error: 'Device not found or inactive' });
    }

    const { ts_device, energy_generated_kwh, voltage_v, current_a, frequency_hz }: IngestRequest = req.body;

    if (!ts_device || energy_generated_kwh === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: ts_device, energy_generated_kwh' 
      });
    }

    // Verify HMAC signature
    const message = `${deviceId}.${timestamp}.${ts_device}.${energy_generated_kwh}`;
    const isValidSignature = hmacVerify(device.device_secret, message, signature);

    if (!isValidSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Prepare reading data
    const rawPayload = {
      ts_device,
      energy_generated_kwh,
      voltage_v,
      current_a,
      frequency_hz
    };

    // Check if reading already exists (prevent duplicates)
    const { data: existingReading } = await supabase
      .from('readings')
      .select('id')
      .eq('device_id', deviceId)
      .eq('ts_device', ts_device)
      .single();

    if (existingReading) {
      return res.status(409).json({ error: 'Reading already exists for this timestamp' });
    }

    // Determine onchain status
    const onchainEnabled = process.env.ONCHAIN_ENABLED === 'true' && device.onchain_enabled;
    const onchainStatus = onchainEnabled ? 'pending' : 'sent';

    // Insert reading
    const { data: reading, error: readingError } = await supabase
      .from('readings')
      .insert({
        device_id: deviceId,
        ts_device,
        energy_generated_kwh,
        voltage_v: voltage_v || null,
        current_a: current_a || null,
        frequency_hz: frequency_hz || null,
        raw_payload: rawPayload,
        signature,
        onchain_status: onchainStatus
      })
      .select()
      .single();

    if (readingError) {
      console.error('Database error:', readingError);
      return res.status(500).json({ error: 'Failed to store reading' });
    }

    // Update device last_seen_at
    await supabase
      .from('devices')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', deviceId);

    res.status(200).json({
      stored: true,
      reading_id: reading.id
    });

  } catch (error) {
    console.error('Error ingesting reading:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
