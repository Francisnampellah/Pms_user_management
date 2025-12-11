import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../utils/validators';

const router = Router();

// Public routes
router.post(
  '/register',
  validateRequest(registerSchema),
  auditLog('REGISTER', 'user'),
  authController.register.bind(authController)
);

router.post(
  '/login',
  validateRequest(loginSchema),
  auditLog('LOGIN', 'user'),
  authController.login.bind(authController)
);

router.post(
  '/forgot-password',
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword.bind(authController)
);

router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  authController.resetPassword.bind(authController)
);

// Protected routes
router.get('/me', authenticate, authController.getMe.bind(authController));

export default router;
