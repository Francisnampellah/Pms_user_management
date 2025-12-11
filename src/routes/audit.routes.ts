import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { Permission } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get(
  '/',
  requirePermission(Permission.AUDIT_READ, Permission.SYSTEM_ADMIN),
  auditController.getAll.bind(auditController)
);

router.get(
  '/:id',
  requirePermission(Permission.AUDIT_READ, Permission.SYSTEM_ADMIN),
  auditController.getById.bind(auditController)
);

export default router;
