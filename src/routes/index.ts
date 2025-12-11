import { Router } from 'express';
import authRoutes from './auth.routes';
import organizationRoutes from './organization.routes';
import propertyRoutes from './property.routes';
import itemRoutes from './item.routes';
import staffRoutes from './staff.routes';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';
import auditRoutes from './audit.routes';
import settingRoutes from './setting.routes';

const router = Router();

// API v1 routes
router.use('/auth', authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/properties', propertyRoutes);
router.use('/items', itemRoutes);
router.use('/staff', staffRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/settings', settingRoutes);

export default router;
