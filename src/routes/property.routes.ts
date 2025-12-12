import { Router } from 'express';
import { propertyController } from '../controllers/property.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';
import { createPropertySchema, updatePropertySchema } from '../utils/validators';
import { Permission } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get(
  '/',
  requirePermission(Permission.PROPERTY_READ, Permission.SYSTEM_ADMIN),
  propertyController.getAll.bind(propertyController)
);

router.get(
  '/organization/:organizationId',
  requirePermission(Permission.PROPERTY_READ, Permission.SYSTEM_ADMIN),
  propertyController.getByOrganizationId.bind(propertyController)
);

router.post(
  '/',
  requirePermission(Permission.PROPERTY_CREATE, Permission.SYSTEM_ADMIN),
  validateRequest(createPropertySchema),
  auditLog('CREATE', 'property'),
  propertyController.create.bind(propertyController)
);

router.get(
  '/:id',
  requirePermission(Permission.PROPERTY_READ, Permission.SYSTEM_ADMIN),
  propertyController.getById.bind(propertyController)
);

router.put(
  '/:id',
  requirePermission(Permission.PROPERTY_UPDATE, Permission.SYSTEM_ADMIN),
  validateRequest(updatePropertySchema),
  auditLog('UPDATE', 'property'),
  propertyController.update.bind(propertyController)
);

router.delete(
  '/:id',
  requirePermission(Permission.PROPERTY_DELETE, Permission.SYSTEM_ADMIN),
  auditLog('DELETE', 'property'),
  propertyController.delete.bind(propertyController)
);

export default router;
