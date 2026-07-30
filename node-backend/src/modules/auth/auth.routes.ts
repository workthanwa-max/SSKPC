import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.getMe);

export default router;
