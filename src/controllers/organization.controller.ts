import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { organizationService } from '../services/organization.service';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination';

export class OrganizationController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.create(req.body);
      
      const response: ApiResponse = {
        success: true,
        message: 'Organization created successfully',
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
      
      const { organizations, total } = await organizationService.getAll({
        search: req.query.search as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        ...pagination,
      });
      
      const response: ApiResponse = {
        success: true,
        data: organizations,
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
      const result = await organizationService.getById(id);
      
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
      const result = await organizationService.update(id, req.body);
      
      const response: ApiResponse = {
        success: true,
        message: 'Organization updated successfully',
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
      await organizationService.delete(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Organization deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const organizationController = new OrganizationController();
