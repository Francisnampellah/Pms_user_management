import prisma from '../config/database';
import { AppError, StaffFilter } from '../types';

class StaffService {
  async create(data: {
    userId: number;
    organizationId: number;
    propertyId?: number;
    roleId: number;
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    department?: string;
  }) {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: data.organizationId },
    });

    if (!organization) {
      throw new AppError('Organization not found', 404, 'ORG_NOT_FOUND');
    }

    // Verify property exists if provided
    if (data.propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: data.propertyId },
      });

      if (!property) {
        throw new AppError('Property not found', 404, 'PROPERTY_NOT_FOUND');
      }

      // Verify property belongs to organization
      if (property.organizationId !== data.organizationId) {
        throw new AppError(
          'Property does not belong to the organization',
          400,
          'INVALID_PROPERTY'
        );
      }
    }

    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: data.roleId },
    });

    if (!role) {
      throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');
    }

    // Check for existing assignment
    const existingStaff = await prisma.staff.findFirst({
      where: {
        userId: data.userId,
        organizationId: data.organizationId,
        propertyId: data.propertyId || null,
      },
    });

    if (existingStaff) {
      throw new AppError(
        'Staff assignment already exists',
        409,
        'DUPLICATE_ASSIGNMENT'
      );
    }

    // Parse dates
    const staffData: any = { ...data };
    if (data.startDate) staffData.startDate = new Date(data.startDate);
    if (data.endDate) staffData.endDate = new Date(data.endDate);

    return prisma.staff.create({
      data: staffData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            scope: true,
            permissions: true,
          },
        },
      },
    });
  }

  async getAll(filter: StaffFilter & { page: number; limit: number }) {
    const { search, isActive, organizationId, propertyId, roleId, page, limit } = filter;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }
    
    if (isActive !== undefined) where.isActive = isActive;
    if (organizationId) where.organizationId = organizationId;
    if (propertyId) where.propertyId = propertyId;
    if (roleId) where.roleId = roleId;

    const [staff, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          property: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          role: {
            select: {
              id: true,
              name: true,
              scope: true,
            },
          },
        },
      }),
      prisma.staff.count({ where }),
    ]);

    return { staff, total };
  }

  async getById(id: number) {
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            scope: true,
            permissions: true,
          },
        },
      },
    });

    if (!staff) {
      throw new AppError('Staff assignment not found', 404, 'NOT_FOUND');
    }

    return staff;
  }

  async update(id: number, data: {
    roleId?: number;
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    department?: string;
    isActive?: boolean;
  }) {
    const staff = await prisma.staff.findUnique({
      where: { id },
    });

    if (!staff) {
      throw new AppError('Staff assignment not found', 404, 'NOT_FOUND');
    }

    // Parse dates
    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    return prisma.staff.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            scope: true,
            permissions: true,
          },
        },
      },
    });
  }

  async delete(id: number) {
    const staff = await prisma.staff.findUnique({
      where: { id },
    });

    if (!staff) {
      throw new AppError('Staff assignment not found', 404, 'NOT_FOUND');
    }

    return prisma.staff.delete({
      where: { id },
    });
  }
}

export const staffService = new StaffService();
