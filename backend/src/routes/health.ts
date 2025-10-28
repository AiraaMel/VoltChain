import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Health check endpoint
 * GET /healthz
 */
router.get('/healthz', (req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    time: new Date().toISOString()
  });
});

export default router;
