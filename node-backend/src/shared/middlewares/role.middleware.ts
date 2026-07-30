import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../exceptions/app-error';

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return next(new ForbiddenError('Access denied: No role assigned'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Access denied: Insufficient permissions'));
    }

    next();
  };
};
