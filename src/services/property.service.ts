import prisma from '../config/database';
import { AppError, PropertyFilter } from '../types';

class PropertyService {
  async create(data: {
    organizationId: number;
    name: string;
    code?: string;
    address: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
    phone?: string;
    email?: string;
    capacity?: number;
    timezone?: string;
    latitude?: number;
    longitude?: number;
    checkInTime?: string;
    checkOutTime?: string;
  }) {
    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: data.organizationId },
    });

    if (!organization) {
      throw new AppError('Organization not found', 404, 'NOT_FOUND');
    }

    return prisma.property.create({
      data,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async getAll(filter: PropertyFilter & { page: number; limit: number }) {
    const { search, isActive, organizationId, city, country, page, limit } = filter;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (isActive !== undefined) where.isActive = isActive;
    if (organizationId) where.organizationId = organizationId;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (country) where.country = { contains: country, mode: 'insensitive' };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              items: true,
              staff: true,
            },
          },
        },
      }),
      prisma.property.count({ where }),
    ]);

    return { properties, total };
  }

  async getById(id: number) {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        items: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
            itemType: true,
            price: true,
          },
        },
        _count: {
          select: {
            items: true,
            staff: true,
          },
        },
      },
    });

    if (!property) {
      throw new AppError('Property not found', 404, 'NOT_FOUND');
    }

    return property;
  }

  async update(id: number, data: {
    name?: string;
    code?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
    capacity?: number;
    timezone?: string;
    latitude?: number;
    longitude?: number;
    checkInTime?: string;
    checkOutTime?: string;
    isActive?: boolean;
  }) {
    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new AppError('Property not found', 404, 'NOT_FOUND');
    }

    return prisma.property.update({
      where: { id },
      data,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async delete(id: number) {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            items: true,
            staff: true,
          },
        },
      },
    });

    if (!property) {
      throw new AppError('Property not found', 404, 'NOT_FOUND');
    }

    if (property._count.items > 0 || property._count.staff > 0) {
      throw new AppError(
        'Cannot delete property with existing items or staff',
        400,
        'HAS_DEPENDENCIES'
      );
    }

    return prisma.property.delete({
      where: { id },
    });
  }
}

export const propertyService = new PropertyService();
