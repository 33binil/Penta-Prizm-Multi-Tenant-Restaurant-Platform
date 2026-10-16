import express, { Express, Request, Response } from 'express';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.js';
import { publicRouter } from './routes/public.js';
import { authRouter } from './routes/auth.js';
import { adminRouter } from './routes/admin.js';
import { kitchenRouter } from './routes/kitchen.js';
import { superAdminRouter } from './routes/superAdmin.js';

export const app: Express = express();

// Security & Parsing
app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// API Route Mounts
app.use('/api/health', healthRouter);
app.use('/api/public', publicRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/kitchen', kitchenRouter);
app.use('/api/super-admin', superAdminRouter);

// 404 Handler for undefined API routes
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Centralized safe error handler
app.use(errorHandler);
