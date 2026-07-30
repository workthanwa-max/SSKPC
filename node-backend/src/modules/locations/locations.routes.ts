import { Router } from 'express';
import { LocationsController } from './controllers/locations.controller';
import { LocationsService } from './services/locations.service';
import { LocationsRepository } from './repositories/locations.repository';
import { prisma } from '../../infrastructure/database/prisma';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { requireRole } from '../../shared/middlewares/role.middleware';

const router = Router();

const repository = new LocationsRepository(prisma);
const service = new LocationsService(repository);
const controller = new LocationsController(service);

router.use(authenticate);

// BRANCH routes
router.post('/', requireRole(['BRANCH']), controller.createLocation);
router.put('/me', requireRole(['BRANCH']), controller.updateLocation);
router.patch('/me/status', requireRole(['BRANCH']), controller.updateMyStatus);
router.get('/me', requireRole(['BRANCH']), controller.getMyLocation);

// CENTRAL / ADMIN routes
router.get('/', requireRole(['CENTRAL', 'ADMIN']), controller.getAllLocations);

export { router as locationsRouter };
