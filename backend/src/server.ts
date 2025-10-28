import express from 'express';
import pino from 'pino';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';

// Import routes
import healthRouter from './routes/health';
import devicesRouter from './routes/devices';
import ingestRouter from './routes/ingest';
import readingsRouter from './routes/readings';
import onchainRouter from './routes/onchain';

// Load environment variables
dotenv.config();

// Initialize logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
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
  logger.info(`VoltChain/ENX Backend MVP running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`On-chain enabled: ${process.env.ONCHAIN_ENABLED === 'true'}`);
  logger.info(`Solana configured: ${process.env.SOLANA_RPC_URL ? 'Yes' : 'No'}`);
});

export default app;
