import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase';
import { sendRecordEnergy, isSolanaConfigured } from '../services/solana';

const router = Router();

/**
 * Flush pending readings to blockchain
 * POST /v1/onchain/flush
 * Requires ADMIN_TOKEN
 */
router.post('/v1/onchain/flush', async (req: Request, res: Response) => {
  try {
    // Check admin token
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken) {
      return res.status(401).json({ error: 'ADMIN_TOKEN not configured' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if Solana is configured
    if (!isSolanaConfigured()) {
      return res.status(200).json({
        message: 'Solana not configured. On-chain features disabled.',
        processed: 0,
        onchain_enabled: false
      });
    }

    // Get up to 50 pending readings
    const { data: pendingReadings, error } = await supabase
      .from('readings')
      .select('*')
      .eq('onchain_status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch pending readings' });
    }

    if (!pendingReadings || pendingReadings.length === 0) {
      return res.status(200).json({
        message: 'No pending readings to process',
        processed: 0,
        onchain_enabled: true
      });
    }

    let processed = 0;
    let failed = 0;

    // Process each reading
    for (const reading of pendingReadings) {
      try {
        const result = await sendRecordEnergy(
          reading.device_id, // Using device_id as devicePubkey for now
          reading.energy_generated_kwh,
          new Date(reading.ts_device).getTime()
        );

        if (result.success) {
          // Update reading with transaction info
          await supabase
            .from('readings')
            .update({
              onchain_status: 'sent',
              onchain_tx: result.txid
            })
            .eq('id', reading.id);

          processed++;
        } else {
          // Mark as failed
          await supabase
            .from('readings')
            .update({
              onchain_status: 'failed'
            })
            .eq('id', reading.id);

          failed++;
        }
      } catch (error) {
        console.error(`Failed to process reading ${reading.id}:`, error);
        
        // Mark as failed
        await supabase
          .from('readings')
          .update({
            onchain_status: 'failed'
          })
          .eq('id', reading.id);

        failed++;
      }
    }

    res.status(200).json({
      message: 'On-chain flush completed',
      processed,
      failed,
      total: pendingReadings.length,
      onchain_enabled: true
    });

  } catch (error) {
    console.error('Error during on-chain flush:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
