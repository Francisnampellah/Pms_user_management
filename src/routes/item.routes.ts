import { Router } from 'express';
import { itemController } from '../controllers/item.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';
import { createItemSchema, updateItemSchema, updateItemStatusSchema } from '../utils/validators';
import { Permission } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get(
  '/',
  requirePermission(Permission.ITEM_READ, Permission.SYSTEM_ADMIN),
  itemController.getAll.bind(itemController)
);

router.get(
  '/property/:propertyId',
  requirePermission(Permission.ITEM_READ, Permission.SYSTEM_ADMIN),
  itemController.getByPropertyId.bind(itemController)
);

router.post(
  '/',
  requirePermission(Permission.ITEM_CREATE, Permission.SYSTEM_ADMIN),
  validateRequest(createItemSchema),
  auditLog('CREATE', 'item'),
  itemController.create.bind(itemController)
);

router.get(
  '/:id',
  requirePermission(Permission.ITEM_READ, Permission.SYSTEM_ADMIN),
  itemController.getById.bind(itemController)
);

router.put(
  '/:id',
  requirePermission(Permission.ITEM_UPDATE, Permission.SYSTEM_ADMIN),
  validateRequest(updateItemSchema),
  auditLog('UPDATE', 'item'),
  itemController.update.bind(itemController)
);

router.patch(
  '/:id/status',
  requirePermission(Permission.ITEM_UPDATE, Permission.SYSTEM_ADMIN),
  validateRequest(updateItemStatusSchema),
  auditLog('UPDATE_STATUS', 'item'),
  itemController.updateStatus.bind(itemController)
);

router.delete(
  '/:id',
  requirePermission(Permission.ITEM_DELETE, Permission.SYSTEM_ADMIN),
  auditLog('DELETE', 'item'),
  itemController.delete.bind(itemController)
);

export default router;
