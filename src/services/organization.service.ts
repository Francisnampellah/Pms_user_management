import prisma from '../config/database';
import { AppError } from '../types';

class OrganizationService {
  async create(data: {
    name: string;
    code?: string;
    description?: string;
    timezone?: string;
  }) {
    return prisma.organization.create({
      data,
    });
  }

  async getAll(filter: {
    search?: string;
    isActive?: boolean;
    page: number;
    limit: number;
  }) {
    const { search, isActive, page, limit } = filter;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              properties: true,
              staff: true,
            },
          },
        },
      }),
      prisma.organization.count({ where }),
    ]);

    return { organizations, total };
  }

  async getById(id: number) {
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        properties: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            code: true,
            city: true,
            country: true,
          },
        },
        _count: {
          select: {
            properties: true,
            staff: true,
          },
        },
      },
    });

    if (!organization) {
      throw new AppError('Organization not found', 404, 'NOT_FOUND');
    }

    return organization;
  }

  async update(id: number, data: {
    name?: string;
    code?: string;
    description?: string;
    timezone?: string;
    isActive?: boolean;
  }) {
    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new AppError('Organization not found', 404, 'NOT_FOUND');
    }

    return prisma.organization.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            properties: true,
            staff: true,
          },
        },
      },
    });

    if (!organization) {
      throw new AppError('Organization not found', 404, 'NOT_FOUND');
    }

    if (organization._count.properties > 0 || organization._count.staff > 0) {
      throw new AppError(
        'Cannot delete organization with existing properties or staff',
        400,
        'HAS_DEPENDENCIES'
      );
    }

    return prisma.organization.delete({
      where: { id },
    });
  }
}

export const organizationService = new OrganizationService();
