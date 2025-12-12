import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { itemService } from '../services/item.service';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination';

export class ItemController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await itemService.create(req.body);
      
      const response: ApiResponse = {
        success: true,
        message: 'Item created successfully',
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
      
      const { items, total } = await itemService.getAll({
        search: req.query.search as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        propertyId: req.query.propertyId ? Number(req.query.propertyId) : undefined,
        status: req.query.status as string,
        itemType: req.query.itemType as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        ...pagination,
      });
      
      const response: ApiResponse = {
        success: true,
        data: items,
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
      const result = await itemService.getById(id);
      
      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getByPropertyId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const propertyId = parseInt(req.params.propertyId, 10);
      const { page, limit } = req.query as any;
      const pagination = getPaginationParams(Number(page), Number(limit));
      
      const { items, total } = await itemService.getAll({
        propertyId,
        search: req.query.search as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        status: req.query.status as string,
        itemType: req.query.itemType as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        ...pagination,
      });
      
      const response: ApiResponse = {
        success: true,
        data: items,
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
      const result = await itemService.update(id, req.body);
      
      const response: ApiResponse = {
        success: true,
        message: 'Item updated successfully',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      const result = await itemService.updateStatus(id, status);
      
      const response: ApiResponse = {
        success: true,
        message: 'Item status updated successfully',
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
      await itemService.delete(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Item deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const itemController = new ItemController();
