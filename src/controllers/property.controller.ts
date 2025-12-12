import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { propertyService } from '../services/property.service';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination';

export class PropertyController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await propertyService.create(req.body);
      
      const response: ApiResponse = {
        success: true,
        message: 'Property created successfully',
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
      
      const { properties, total } = await propertyService.getAll({
        search: req.query.search as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        organizationId: req.query.organizationId ? Number(req.query.organizationId) : undefined,
        city: req.query.city as string,
        country: req.query.country as string,
        ...pagination,
      });
      
      const response: ApiResponse = {
        success: true,
        data: properties,
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
      const result = await propertyService.getById(id);
      
      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getByOrganizationId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const organizationId = parseInt(req.params.organizationId, 10);
      const { page, limit } = req.query as any;
      const pagination = getPaginationParams(Number(page), Number(limit));
      
      const { properties, total } = await propertyService.getAll({
        organizationId,
        search: req.query.search as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        city: req.query.city as string,
        country: req.query.country as string,
        ...pagination,
      });
      
      const response: ApiResponse = {
        success: true,
        data: properties,
        ...{ pagination: getPaginationMeta(pagination.page, pagination.limit, total) },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await propertyService.update(id, req.body);
      
      const response: ApiResponse = {
        success: true,
        message: 'Property updated successfully',
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
      await propertyService.delete(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Property deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const propertyController = new PropertyController();
