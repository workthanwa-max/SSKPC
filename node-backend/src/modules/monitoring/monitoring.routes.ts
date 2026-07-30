import { Router } from 'express';
import { MonitoringController } from './controllers/monitoring.controller';
import { authenticate, requireRole } from '../../shared/middlewares/auth.middleware';

export const monitoringRouter = Router();
const monitoringController = new MonitoringController();

// Apply strict RBAC for monitoring (Zero-Trust)
monitoringRouter.use(authenticate);
monitoringRouter.use(requireRole(['ADMIN']));

monitoringRouter.get('/audit-logs', monitoringController.getAuditLogs);
