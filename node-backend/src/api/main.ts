import * as dotenv from 'dotenv';
dotenv.config();

import app from './server';
import { logger } from '../infrastructure/logger/logger';
import { prisma } from '../infrastructure/database/prisma';

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Graceful Shutdown implementation
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  
  server.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Database connection closed.');
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (error) => {
  logger.error(error, 'Uncaught Exception');
  gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  logger.error(reason, 'Unhandled Rejection');
  gracefulShutdown('unhandledRejection');
});
