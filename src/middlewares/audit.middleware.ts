import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { auditService } from '../services/audit.service';

export const auditLog = (action: string, entityType: string) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const originalSend = res.json.bind(res);

      res.json = function (body: any): Response {
        // Only log successful operations (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const entityId = body?.data?.id || req.params?.id;
          
          auditService.createLog({
            userId: req.user?.id,
            action,
            entityType,
            entityId: entityId ? parseInt(entityId, 10) : undefined,
            changes: {
              body: req.body,
              params: req.params,
            },
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.get('user-agent'),
          }).catch((error) => {
            // Log error but don't fail the request
            console.error('Audit log error:', error);
          });
        }

        return originalSend(body);
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};
