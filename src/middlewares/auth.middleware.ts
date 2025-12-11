import { Response, NextFunction } from 'express';
import { AuthRequest, AppError } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../config/database';

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7);

    const decoded = verifyAccessToken(token);

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 401, 'UNAUTHORIZED');
    }

    if (!user.isActive) {
      throw new AppError('User account is inactive', 403, 'FORBIDDEN');
    }

    // Attach user to request
    req.user = user;

    // Fetch staff assignment (if any)
    const staff = await prisma.staff.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
      include: {
        role: {
          select: {
            name: true,
            scope: true,
            permissions: true,
          },
        },
      },
    });

    if (staff) {
      req.staff = {
        id: staff.id,
        organizationId: staff.organizationId,
        propertyId: staff.propertyId,
        roleId: staff.roleId,
        role: staff.role,
      };
    }

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token', 401, 'UNAUTHORIZED'));
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError('Token expired', 401, 'TOKEN_EXPIRED'));
    } else {
      next(error);
    }
  }
};

export const requirePermission = (...requiredPermissions: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.staff) {
        throw new AppError('Staff assignment required', 403, 'FORBIDDEN');
      }

      const userPermissions = req.staff.role.permissions;

      // System admin has all permissions
      if (userPermissions.includes('system:admin')) {
        return next();
      }

      // Check if user has at least one of the required permissions
      const hasPermission = requiredPermissions.some((permission) =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        throw new AppError(
          'Insufficient permissions',
          403,
          'FORBIDDEN'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireRole = (...roleNames: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.staff) {
        throw new AppError('Staff assignment required', 403, 'FORBIDDEN');
      }

      if (!roleNames.includes(req.staff.role.name)) {
        throw new AppError(
          `Required role: ${roleNames.join(' or ')}`,
          403,
          'FORBIDDEN'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};
