import express from 'express';
import pino from 'pino';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import cors from 'cors';

// Import routes
import healthRouter from './routes/health';
import devicesRouter from './routes/devices';
import ingestRouter from './routes/ingest';
import readingsRouter from './routes/readings';
import onchainRouter from './routes/onchain';
import dashboardRouter from './routes/dashboard';

// Load environment variables
dotenv.config();

// Debug environment variables
console.log('🔍 Environment check:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT || '8080');

// Initialize logger (simplified to avoid pino-pretty dependency)
const logger = pino({
  level: process.env.LOG_LEVEL || 'info'
});

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(pinoHttp({ logger }));

// Routes
app.use('/', healthRouter);
app.use('/', devicesRouter);
app.use('/', ingestRouter);
app.use('/', readingsRouter);
app.use('/', onchainRouter);
app.use('/', dashboardRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`VoltChain Backend MVP running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`On-chain enabled: ${process.env.ONCHAIN_ENABLED === 'true'}`);
  logger.info(`Solana configured: ${process.env.SOLANA_RPC_URL ? 'Yes' : 'No'}`);
});

export default app;
