import { Router } from 'express';
import { PublicController } from './controllers/public.controller';
import { publicLimiter } from '../../shared/middlewares/rate-limit.middleware';

const router = Router();

router.post('/shelters/nearby', publicLimiter, PublicController.getNearbyShelters);

export { router as publicRouter };
