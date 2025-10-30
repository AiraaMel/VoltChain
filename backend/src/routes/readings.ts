import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase';

const router = Router();

/**
 * Create a reading (simple, without HMAC) for dashboard/admin forms
 * POST /v1/readings
 * Protected by ADMIN_TOKEN if set
 */
router.post('/v1/readings', async (req: Request, res: Response) => {
  try {
    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken) {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const { device_id, ts_device, energy_generated_kwh, voltage_v, current_a, frequency_hz } = req.body || {};

    if (!device_id || !ts_device || energy_generated_kwh === undefined) {
      return res.status(400).json({ error: 'device_id, ts_device, energy_generated_kwh are required' });
    }

    // Ensure device exists
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id')
      .eq('id', device_id)
      .single();

    if (deviceError || !device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const raw_payload = { ts_device, energy_generated_kwh, voltage_v, current_a, frequency_hz };

    const { data: reading, error: readingError } = await supabase
      .from('readings')
      .insert({
        device_id,
        ts_device,
        energy_generated_kwh,
        voltage_v: voltage_v ?? null,
        current_a: current_a ?? null,
        frequency_hz: frequency_hz ?? null,
        raw_payload,
        signature: 'admin',
        onchain_status: 'pending'
      })
      .select()
      .single();

    if (readingError) {
      console.error('Database error:', readingError);
      return res.status(500).json({ error: 'Failed to store reading' });
    }

    res.status(201).json({ reading_id: reading.id, stored: true });
  } catch (error) {
    console.error('Error creating reading:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get readings for a device
 * GET /v1/devices/:id/readings?limit=100
 * Protected by ADMIN_TOKEN if set
 */
router.get('/v1/devices/:id/readings', async (req: Request, res: Response) => {
  try {
    // Check admin token if configured
    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken) {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const deviceId = req.params.id;
    const limit = parseInt(req.query.limit as string) || 100;

    if (limit > 1000) {
      return res.status(400).json({ error: 'Limit cannot exceed 1000' });
    }

    // Get readings for device
    const { data: readings, error } = await supabase
      .from('readings')
      .select('*')
      .eq('device_id', deviceId)
      .order('ts_device', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch readings' });
    }

    res.status(200).json({
      device_id: deviceId,
      readings: readings || [],
      count: readings?.length || 0
    });

  } catch (error) {
    console.error('Error fetching readings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
