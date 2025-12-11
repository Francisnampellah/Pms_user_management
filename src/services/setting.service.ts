import prisma from '../config/database';
import { AppError } from '../types';

class SettingService {
  async getAll(isPublic?: boolean) {
    const where: any = {};
    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    return prisma.systemSetting.findMany({
      where,
      orderBy: { key: 'asc' },
    });
  }

  async getByKey(key: string) {
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new AppError('Setting not found', 404, 'NOT_FOUND');
    }

    return setting;
  }

  async update(key: string, data: {
    value: string;
    description?: string;
    isPublic?: boolean;
  }) {
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new AppError('Setting not found', 404, 'NOT_FOUND');
    }

    return prisma.systemSetting.update({
      where: { key },
      data,
    });
  }

  async create(data: {
    key: string;
    value: string;
    description?: string;
    isPublic?: boolean;
  }) {
    return prisma.systemSetting.create({
      data,
    });
  }
}

export const settingService = new SettingService();
