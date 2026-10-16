import http from 'http';
import { app } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

const server = http.createServer(app);

const PORT = config.port;
const HOST = config.host;

server.listen(PORT, HOST, () => {
  logger.info(`Penta Prizm Backend API running on http://${HOST}:${PORT}`);
  logger.info(`Health check available at http://${HOST}:${PORT}/api/health`);
  logger.info(`Environment: ${config.env}`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down HTTP server gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  // Force exit after 10s if connections linger
  setTimeout(() => {
    logger.error('Forcefully terminating process after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
