import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';
import { updateUserSchema, createUserSchema } from '../utils/validators';
import { Permission } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get(
  '/',
  requirePermission(Permission.USER_READ, Permission.SYSTEM_ADMIN),
  userController.getAll.bind(userController)
);

router.post(
  '/',
  requirePermission(Permission.USER_CREATE, Permission.SYSTEM_ADMIN),
  validateRequest(createUserSchema),
  auditLog('CREATE', 'user'),
  userController.create.bind(userController)
);

router.get(
  '/:id',
  requirePermission(Permission.USER_READ, Permission.SYSTEM_ADMIN),
  userController.getById.bind(userController)
);

router.put(
  '/:id',
  requirePermission(Permission.USER_UPDATE, Permission.SYSTEM_ADMIN),
  validateRequest(updateUserSchema),
  auditLog('UPDATE', 'user'),
  userController.update.bind(userController)
);

export default router;
