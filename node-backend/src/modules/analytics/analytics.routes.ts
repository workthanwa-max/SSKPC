import { Router } from 'express';
import { AnalyticsController } from './controllers/analytics.controller';
import { requireAuth, requireRole } from '../../shared/middlewares/auth.middleware';

const router = Router();

// BRANCH Analytics
router.get(
  '/survival/branch/me',
  requireAuth,
  requireRole(['BRANCH']),
  AnalyticsController.getBranchSurvival
);

// CENTRAL Analytics
router.get(
  '/survival/central/overview',
  requireAuth,
  requireRole(['CENTRAL', 'ADMIN']),
  AnalyticsController.getCentralSurvival
);

router.get(
  '/central/stock-report',
  requireAuth,
  requireRole(['CENTRAL', 'ADMIN']),
  AnalyticsController.getCentralStockReport
);

router.get(
  '/central/network-stats',
  requireAuth,
  requireRole(['CENTRAL', 'ADMIN']),
  AnalyticsController.getCentralNetworkStats
);

router.get(
  '/branch/stock-report',
  requireAuth,
  requireRole(['BRANCH']),
  AnalyticsController.getBranchStockReport
);

router.get(
  '/branch/evacuee-stats',
  requireAuth,
  requireRole(['BRANCH']),
  AnalyticsController.getBranchEvacueeStats
);

export const analyticsRouter = router;
