import { Router } from 'express';
import { DashboardController } from './controllers/dashboard.controller';
import { requireAuth, requireRole } from '../../shared/middlewares/auth.middleware';

const router = Router();
const controller = new DashboardController();

// Admin Dashboard Overview
router.get(
  '/admin/overview',
  requireAuth,
  requireRole(['ADMIN']),
  controller.getAdminOverview
);

// Central Dashboard Overview
router.get(
  '/central/overview',
  requireAuth,
  requireRole(['CENTRAL']),
  controller.getCentralOverview
);

// Branch Dashboard Overview
router.get(
  '/branch/overview',
  requireAuth,
  requireRole(['BRANCH']),
  controller.getBranchOverview
);

export const dashboardRouter = router;
