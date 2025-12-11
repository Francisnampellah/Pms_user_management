import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// Extended Request with user info
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
  };
  staff?: {
    id: number;
    organizationId: number;
    propertyId: number | null;
    roleId: number;
    role: {
      name: string;
      scope: string;
      permissions: string[];
    };
  };
}

// JWT Payload types
export interface JwtTokenPayload extends JwtPayload {
  userId: number;
  email: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter types
export interface BaseFilter {
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PropertyFilter extends BaseFilter {
  organizationId?: number;
  city?: string;
  country?: string;
}

export interface ItemFilter extends BaseFilter {
  propertyId?: number;
  status?: string;
  itemType?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface StaffFilter extends BaseFilter {
  organizationId?: number;
  propertyId?: number;
  roleId?: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Error types
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error type
export interface ValidationError {
  field: string;
  message: string;
}

// Audit log types
export interface AuditLogData {
  userId?: number;
  action: string;
  entityType: string;
  entityId?: number;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
}

// Permission constants
export enum Permission {
  // System permissions
  SYSTEM_ADMIN = 'system:admin',
  
  // Organization permissions
  ORG_CREATE = 'org:create',
  ORG_READ = 'org:read',
  ORG_UPDATE = 'org:update',
  ORG_DELETE = 'org:delete',
  ORG_MANAGE = 'org:manage',
  
  // Property permissions
  PROPERTY_CREATE = 'property:create',
  PROPERTY_READ = 'property:read',
  PROPERTY_UPDATE = 'property:update',
  PROPERTY_DELETE = 'property:delete',
  PROPERTY_MANAGE = 'property:manage',
  
  // Item permissions
  ITEM_CREATE = 'item:create',
  ITEM_READ = 'item:read',
  ITEM_UPDATE = 'item:update',
  ITEM_DELETE = 'item:delete',
  ITEM_MANAGE = 'item:manage',
  
  // Staff permissions
  STAFF_CREATE = 'staff:create',
  STAFF_READ = 'staff:read',
  STAFF_UPDATE = 'staff:update',
  STAFF_DELETE = 'staff:delete',
  STAFF_MANAGE = 'staff:manage',
  
  // User permissions
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  
  // Role permissions
  ROLE_CREATE = 'role:create',
  ROLE_READ = 'role:read',
  ROLE_UPDATE = 'role:update',
  ROLE_DELETE = 'role:delete',
  
  // Audit permissions
  AUDIT_READ = 'audit:read',
  
  // Settings permissions
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',
}

// Role names
export enum RoleName {
  SYSTEM_ADMIN = 'System Admin',
  ORG_ADMIN = 'Organization Admin',
  PROPERTY_MANAGER = 'Property Manager',
  STAFF = 'Staff',
  GUEST = 'Guest',
}
