import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { settingService } from '../services/setting.service';

export class SettingController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Non-admins can only see public settings
      const isAdmin = req.staff?.role.permissions.includes('system:admin');
      const settings = await settingService.getAll(isAdmin ? undefined : true);
      
      const response: ApiResponse = {
        success: true,
        data: settings,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;
      const result = await settingService.update(key, req.body);
      
      const response: ApiResponse = {
        success: true,
        message: 'Setting updated successfully',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const settingController = new SettingController();
