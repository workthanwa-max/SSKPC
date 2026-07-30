import { Router } from 'express';
import { UsersController } from './controllers/users.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { requireRole } from '../../shared/middlewares/role.middleware';

const router = Router();
const controller = new UsersController();

// All routes require Authentication and ADMIN role
router.use(authenticate, requireRole(['ADMIN']));

router.get('/', controller.getAllUsers);
router.post('/', controller.createUser);
router.patch('/:id/status', controller.updateUserStatus);
router.post('/:id/reset-password', controller.resetPassword);

export default router;
