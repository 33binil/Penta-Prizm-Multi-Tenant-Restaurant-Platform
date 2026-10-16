import { createServer as createViteServer } from 'vite';
import { app } from './backend/src/app.js';
import { logger } from './backend/src/utils/logger.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    // In production container mode, serve static dist if available
    try {
      const express = (await import('express')).default;
      const path = (await import('path')).default;
      app.use(express.static(path.resolve('./dist')));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve('./dist/index.html'));
      });
    } catch (e) {
      logger.warn('Static dist directory not mounted, running API-only.');
    }
  } else {
    // Mount Vite middlewares in development
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: HOST,
        allowedHosts: true
      },
      appType: 'spa',
      root: '.'
    });

    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, HOST, () => {
    logger.info(`Penta Prizm Full-Stack Server listening on http://${HOST}:${PORT}`);
    logger.info(`Backend Health Check: http://${HOST}:${PORT}/api/health`);
    logger.info(`Frontend Application: http://${HOST}:${PORT}/`);
  });

  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('Server closed. Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
