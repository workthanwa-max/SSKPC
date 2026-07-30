import { Router, Request, Response } from 'express';
import { prisma } from '../infrastructure/database/prisma';
import { logger } from '../infrastructure/logger/logger';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    // Check Database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'Connected'
    });
  } catch (error: any) {
    logger.error('Health Check Failed: DB Connection Error', error);
    res.status(503).json({
      status: 'Service Unavailable',
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: error.message
    });
  }
});

export default router;
