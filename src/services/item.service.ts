import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/database';
import { AppError, ItemFilter } from '../types';
import { ItemStatus } from '@prisma/client';

class ItemService {
  async create(data: {
    propertyId: number;
    name: string;
    code?: string;
    description?: string;
    status?: ItemStatus;
    itemType?: string;
    floor?: number;
    maxOccupancy?: number;
    price?: number;
  }) {
    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
    });

    if (!property) {
      throw new AppError('Property not found', 404, 'NOT_FOUND');
    }

    // Convert price to Decimal if provided
    const itemData: any = { ...data };
    if (data.price !== undefined) {
      itemData.price = new Decimal(data.price);
    }

    return prisma.item.create({
      data: itemData,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            code: true,
            organizationId: true,
          },
        },
      },
    });
  }

  async getAll(filter: ItemFilter & { page: number; limit: number }) {
    const { search, isActive, propertyId, status, itemType, minPrice, maxPrice, page, limit } = filter;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (isActive !== undefined) where.isActive = isActive;
    if (propertyId) where.propertyId = propertyId;
    if (status) where.status = status;
    if (itemType) where.itemType = itemType;
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = new Decimal(minPrice);
      if (maxPrice !== undefined) where.price.lte = new Decimal(maxPrice);
    }

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            select: {
              id: true,
              name: true,
              code: true,
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.item.count({ where }),
    ]);

    return { items, total };
  }

  async getById(id: number) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
            city: true,
            organization: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      throw new AppError('Item not found', 404, 'NOT_FOUND');
    }

    return item;
  }

  async update(id: number, data: {
    name?: string;
    code?: string;
    description?: string;
    status?: ItemStatus;
    itemType?: string;
    floor?: number;
    maxOccupancy?: number;
    price?: number;
    isActive?: boolean;
  }) {
    const item = await prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      throw new AppError('Item not found', 404, 'NOT_FOUND');
    }

    // Convert price to Decimal if provided
    const updateData: any = { ...data };
    if (data.price !== undefined) {
      updateData.price = new Decimal(data.price);
    }

    return prisma.item.update({
      where: { id },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async updateStatus(id: number, status: ItemStatus) {
    const item = await prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      throw new AppError('Item not found', 404, 'NOT_FOUND');
    }

    return prisma.item.update({
      where: { id },
      data: { status },
      include: {
        property: {
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
    const item = await prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      throw new AppError('Item not found', 404, 'NOT_FOUND');
    }

    return prisma.item.delete({
      where: { id },
    });
  }
}

export const itemService = new ItemService();
