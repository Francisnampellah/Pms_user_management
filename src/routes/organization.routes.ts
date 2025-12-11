import { Router } from 'express';
import { organizationController } from '../controllers/organization.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';
import { createOrganizationSchema, updateOrganizationSchema } from '../utils/validators';
import { Permission } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get(
  '/',
  requirePermission(Permission.ORG_READ, Permission.SYSTEM_ADMIN),
  organizationController.getAll.bind(organizationController)
);

router.post(
  '/',
  requirePermission(Permission.ORG_CREATE, Permission.SYSTEM_ADMIN),
  validateRequest(createOrganizationSchema),
  auditLog('CREATE', 'organization'),
  organizationController.create.bind(organizationController)
);

router.get(
  '/:id',
  requirePermission(Permission.ORG_READ, Permission.SYSTEM_ADMIN),
  organizationController.getById.bind(organizationController)
);

router.put(
  '/:id',
  requirePermission(Permission.ORG_UPDATE, Permission.SYSTEM_ADMIN),
  validateRequest(updateOrganizationSchema),
  auditLog('UPDATE', 'organization'),
  organizationController.update.bind(organizationController)
);

router.delete(
  '/:id',
  requirePermission(Permission.ORG_DELETE, Permission.SYSTEM_ADMIN),
  auditLog('DELETE', 'organization'),
  organizationController.delete.bind(organizationController)
);

export default router;
