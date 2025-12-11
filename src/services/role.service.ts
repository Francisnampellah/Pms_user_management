import prisma from '../config/database';
import { AppError } from '../types';
import { RoleScope } from '@prisma/client';

class RoleService {
  async create(data: {
    name: string;
    scope: RoleScope;
    description?: string;
    permissions?: string[];
  }) {
    return prisma.role.create({
      data,
    });
  }

  async getAll(filter: {
    search?: string;
    scope?: RoleScope;
    isActive?: boolean;
    page: number;
    limit: number;
  }) {
    const { search, scope, isActive, page, limit } = filter;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (scope) {
      where.scope = scope;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.role.count({ where }),
    ]);

    return { roles, total };
  }

  async getById(id: number) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            staff: true,
          },
        },
      },
    });

    if (!role) {
      throw new AppError('Role not found', 404, 'NOT_FOUND');
    }

    return role;
  }

  async update(id: number, data: {
    name?: string;
    scope?: RoleScope;
    description?: string;
    permissions?: string[];
    isActive?: boolean;
  }) {
    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new AppError('Role not found', 404, 'NOT_FOUND');
    }

    return prisma.role.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            staff: true,
          },
        },
      },
    });

    if (!role) {
      throw new AppError('Role not found', 404, 'NOT_FOUND');
    }

    if (role._count.staff > 0) {
      throw new AppError(
        'Cannot delete role with assigned staff',
        400,
        'HAS_DEPENDENCIES'
      );
    }

    return prisma.role.delete({
      where: { id },
    });
  }
}

export const roleService = new RoleService();
