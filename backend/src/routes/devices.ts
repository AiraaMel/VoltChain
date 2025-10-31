import { Router, Request, Response } from 'express';
import { supabase, Device } from '../services/supabase';
import { generateDeviceSecret } from '../utils/crypto';

const router = Router();

/**
 * List devices (simple list for dashboard)
 * GET /v1/devices
 * Protected by ADMIN_TOKEN if set
 */
router.get('/v1/devices', async (req: Request, res: Response) => {
  try {
    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken) {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const { data: devices, error } = await supabase
      .from('devices')
      .select('id, name, active, location, created_at, last_seen_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch devices' });
    }

    res.status(200).json({ devices: devices || [] });
  } catch (error) {
    console.error('Error listing devices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

interface CreateDeviceRequest {
  name: string;
  user_id?: string;
  location?: any;
}

/**
 * Create a new device
 * POST /v1/devices
 * Requires ADMIN_TOKEN if set
 */
router.post('/v1/devices', async (req: Request, res: Response) => {
  try {
    // Check admin token if configured
    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken) {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const { name, user_id, location }: CreateDeviceRequest = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Device name is required' });
    }

    // Generate device secret
    const deviceSecret = generateDeviceSecret();

    // Create device in database
    const { data: device, error } = await supabase
      .from('devices')
      .insert({
        name,
        device_secret: deviceSecret,
        user_id: user_id || null,
        location: location || null,
        active: true,
        onchain_enabled: false
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to create device' });
    }

    // Return device info with secret (only time it's returned)
    res.status(201).json({
      device_id: device.id,
      device_secret: device.device_secret,
      name: device.name,
      created_at: device.created_at
    });

  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
