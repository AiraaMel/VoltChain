import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase';

const router = Router();

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
