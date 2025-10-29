import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Health check endpoint
 * GET /health
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'VoltChain Backend is running',
    time: new Date().toISOString()
  });
});

/**
 * Health check endpoint (alternative)
 * GET /healthz
 */
router.get('/healthz', (req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    time: new Date().toISOString()
  });
});

export default router;
