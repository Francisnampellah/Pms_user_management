import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { roleService } from '../services/role.service';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination';

export class RoleController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await roleService.create(req.body);
      
      const response: ApiResponse = {
        success: true,
        message: 'Role created successfully',
        data: result,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query as any;
      const pagination = getPaginationParams(Number(page), Number(limit));
      
      const { roles, total } = await roleService.getAll({
        search: req.query.search as string,
        scope: req.query.scope as any,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        ...pagination,
      });
      
      const response: ApiResponse = {
        success: true,
        data: roles,
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
      const result = await roleService.getById(id);
      
      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await roleService.update(id, req.body);
      
      const response: ApiResponse = {
        success: true,
        message: 'Role updated successfully',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      await roleService.delete(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Role deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const roleController = new RoleController();
