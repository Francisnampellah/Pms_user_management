import { Router } from 'express';
import { settingController } from '../controllers/setting.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';
import { updateSettingSchema } from '../utils/validators';
import { Permission } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get(
  '/',
  requirePermission(Permission.SETTINGS_READ, Permission.SYSTEM_ADMIN),
  settingController.getAll.bind(settingController)
);

router.put(
  '/:key',
  requirePermission(Permission.SETTINGS_UPDATE, Permission.SYSTEM_ADMIN),
  validateRequest(updateSettingSchema),
  auditLog('UPDATE', 'system_setting'),
  settingController.update.bind(settingController)
);

export default router;
