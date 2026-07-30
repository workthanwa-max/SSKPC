import { Router } from 'express';
import { EvacueesController } from './controllers/evacuees.controller';
import { requireAuth, requireRole } from '../../shared/middlewares/auth.middleware';

const router = Router();

// ==========================================
// BRANCH ROUTES
// ==========================================
// Middleware to ensure only BRANCH can access
router.use('/branch', requireAuth, requireRole(['BRANCH']));

router.get('/branch/dashboard', EvacueesController.getBranchDashboard);
router.patch('/branch/location/capacity', EvacueesController.updateCapacity);
router.post('/branch/check-in', EvacueesController.checkIn);
router.post('/branch/check-out', EvacueesController.checkOut);
router.get('/branch/in-shelter', EvacueesController.getBranchInShelter);
router.get('/branch/history', EvacueesController.getBranchHistory);

// ==========================================
// CENTRAL ROUTES
// ==========================================
// Middleware to ensure only CENTRAL can access
router.use('/central', requireAuth, requireRole(['CENTRAL', 'ADMIN'])); // Admin can also view

router.get('/central/dashboard', EvacueesController.getCentralDashboard);
router.get('/central/branches', EvacueesController.getCentralBranches);
router.get('/central/branches/:branchId/people', EvacueesController.getCentralBranchPeople);

export const evacueesRouter = router;
