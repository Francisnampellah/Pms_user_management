import { Router } from 'express';
import { roleController } from '../controllers/role.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';
import { createRoleSchema, updateRoleSchema } from '../utils/validators';
import { Permission } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get(
  '/',
  requirePermission(Permission.ROLE_READ, Permission.SYSTEM_ADMIN),
  roleController.getAll.bind(roleController)
);

router.post(
  '/',
  requirePermission(Permission.ROLE_CREATE, Permission.SYSTEM_ADMIN),
  validateRequest(createRoleSchema),
  auditLog('CREATE', 'role'),
  roleController.create.bind(roleController)
);

router.get(
  '/:id',
  requirePermission(Permission.ROLE_READ, Permission.SYSTEM_ADMIN),
  roleController.getById.bind(roleController)
);

router.put(
  '/:id',
  requirePermission(Permission.ROLE_UPDATE, Permission.SYSTEM_ADMIN),
  validateRequest(updateRoleSchema),
  auditLog('UPDATE', 'role'),
  roleController.update.bind(roleController)
);

router.delete(
  '/:id',
  requirePermission(Permission.ROLE_DELETE, Permission.SYSTEM_ADMIN),
  auditLog('DELETE', 'role'),
  roleController.delete.bind(roleController)
);

export default router;
