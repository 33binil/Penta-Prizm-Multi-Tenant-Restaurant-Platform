import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(`Unhandled error during ${req.method} ${req.path}:`, err?.message || err);

  const status = err.status || err.statusCode || 500;
  const isProd = config.env === 'production';

  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(isProd ? {} : { stack: err.stack })
  });
}
