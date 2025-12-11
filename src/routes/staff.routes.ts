import { Router } from 'express';
import { staffController } from '../controllers/staff.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';
import { createStaffSchema, updateStaffSchema } from '../utils/validators';
import { Permission } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get(
  '/',
  requirePermission(Permission.STAFF_READ, Permission.SYSTEM_ADMIN),
  staffController.getAll.bind(staffController)
);

router.post(
  '/',
  requirePermission(Permission.STAFF_CREATE, Permission.SYSTEM_ADMIN),
  validateRequest(createStaffSchema),
  auditLog('CREATE', 'staff'),
  staffController.create.bind(staffController)
);

router.get(
  '/:id',
  requirePermission(Permission.STAFF_READ, Permission.SYSTEM_ADMIN),
  staffController.getById.bind(staffController)
);

router.put(
  '/:id',
  requirePermission(Permission.STAFF_UPDATE, Permission.SYSTEM_ADMIN),
  validateRequest(updateStaffSchema),
  auditLog('UPDATE', 'staff'),
  staffController.update.bind(staffController)
);

router.delete(
  '/:id',
  requirePermission(Permission.STAFF_DELETE, Permission.SYSTEM_ADMIN),
  auditLog('DELETE', 'staff'),
  staffController.delete.bind(staffController)
);

export default router;
