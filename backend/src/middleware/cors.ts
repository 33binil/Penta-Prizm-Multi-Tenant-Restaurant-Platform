import cors from 'cors';
import { config } from '../config/index.js';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server) with no origin
    if (!origin) return callback(null, true);

    const isExplicitlyAllowed = config.allowedOrigins.some(allowed => 
      origin.toLowerCase() === allowed.toLowerCase()
    );

    // Also support preview and local development origins
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const isVercelPreview = /^https:\/\/[a-z0-9-]+(-[a-z0-9]+)?\.vercel\.app$/.test(origin);
    const isAiStudioPreview = /^https:\/\/ais-(dev|pre)-[a-z0-9-]+\.[a-z0-9-]+\.run\.app$/.test(origin);

    if (isExplicitlyAllowed || isLocalhost || isVercelPreview || isAiStudioPreview) {
      return callback(null, true);
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Domain', 'X-Restaurant-Id']
});
