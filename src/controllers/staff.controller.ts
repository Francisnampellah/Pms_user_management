import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { staffService } from '../services/staff.service';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination';

export class StaffController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await staffService.create(req.body);
      
      const response: ApiResponse = {
        success: true,
        message: 'Staff created successfully',
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
      
      const { staff, total } = await staffService.getAll({
        search: req.query.search as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        organizationId: req.query.organizationId ? Number(req.query.organizationId) : undefined,
        propertyId: req.query.propertyId ? Number(req.query.propertyId) : undefined,
        roleId: req.query.roleId ? Number(req.query.roleId) : undefined,
        ...pagination,
      });
      
      const response: ApiResponse = {
        success: true,
        data: staff,
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
      const result = await staffService.getById(id);
      
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
      const result = await staffService.update(id, req.body);
      
      const response: ApiResponse = {
        success: true,
        message: 'Staff updated successfully',
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
      await staffService.delete(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Staff deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const staffController = new StaffController();
