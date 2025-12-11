import prisma from '../config/database';
import { AuditLogData } from '../types';

class AuditService {
  async createLog(data: AuditLogData) {
    return prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        changes: data.changes,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async getLogs(filter: {
    userId?: number;
    action?: string;
    entityType?: string;
    page: number;
    limit: number;
  }) {
    const { userId, action, entityType, page, limit } = filter;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }

  async getLogById(id: number) {
    return prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}

export const auditService = new AuditService();
