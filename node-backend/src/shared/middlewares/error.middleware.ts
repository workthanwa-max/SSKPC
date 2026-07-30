import { Request, Response, NextFunction } from 'express';
import { AppError } from '../exceptions/app-error';
import { logger } from '../../infrastructure/logger/logger';
import fs from 'fs';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.warn({ err, req }, `Operational Error: ${err.message}`);
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Handle unexpected errors (Programming errors, external service crashes)
  logger.error({ err, req }, 'Unexpected Server Error');
  
  return res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
  });
};
