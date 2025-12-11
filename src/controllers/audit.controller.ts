import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { auditService } from '../services/audit.service';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination';

export class AuditController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query as any;
      const pagination = getPaginationParams(Number(page), Number(limit));
      
      const { logs, total } = await auditService.getLogs({
        userId: req.query.userId ? Number(req.query.userId) : undefined,
        action: req.query.action as string,
        entityType: req.query.entityType as string,
        ...pagination,
      });
      
      const response: ApiResponse = {
        success: true,
        data: logs,
        ...{ pagination: getPaginationMeta(pagination.page, pagination.limit, total) },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await auditService.getLogById(id);
      
      if (!result) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Audit log not found',
          },
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();
