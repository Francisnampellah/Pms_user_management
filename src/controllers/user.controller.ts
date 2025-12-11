import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { userService } from '../services/user.service';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination';

export class UserController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query as any;
      const pagination = getPaginationParams(Number(page), Number(limit));
      
      const { users, total } = await userService.getAll({
        search: req.query.search as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        ...pagination,
      });
      
      const response: ApiResponse = {
        success: true,
        data: users,
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
      const result = await userService.getById(id);
      
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
      const result = await userService.update(id, req.body);
      
      const response: ApiResponse = {
        success: true,
        message: 'User updated successfully',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
