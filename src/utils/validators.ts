import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

// Organization validation schemas
export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().max(50).optional(),
  description: z.string().optional(),
  timezone: z.string().max(50).optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  code: z.string().max(50).optional(),
  description: z.string().optional(),
  timezone: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
});

// Property validation schemas
export const createPropertySchema = z.object({
  organizationId: z.number().int().positive(),
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().max(50).optional(),
  address: z.string().min(1, 'Address is required').max(500),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().max(100).optional(),
  country: z.string().min(1, 'Country is required').max(100),
  postalCode: z.string().max(20).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional(),
  capacity: z.number().int().min(0).optional(),
  timezone: z.string().max(50).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  checkInTime: z.string().max(10).optional(),
  checkOutTime: z.string().max(10).optional(),
});

export const updatePropertySchema = createPropertySchema.partial().omit({ organizationId: true });

// Item validation schemas
export const createItemSchema = z.object({
  propertyId: z.number().int().positive(),
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().max(50).optional(),
  description: z.string().optional(),
  status: z.enum(['available', 'occupied', 'maintenance', 'reserved', 'cleaning', 'outOfService']).optional(),
  itemType: z.string().max(50).optional(),
  floor: z.number().int().optional(),
  maxOccupancy: z.number().int().min(0).optional(),
  price: z.number().min(0).optional(),
});

export const updateItemSchema = createItemSchema.partial().omit({ propertyId: true });

export const updateItemStatusSchema = z.object({
  status: z.enum(['available', 'occupied', 'maintenance', 'reserved', 'cleaning', 'outOfService']),
});

// Staff validation schemas
export const createStaffSchema = z.object({
  userId: z.number().int().positive(),
  organizationId: z.number().int().positive(),
  propertyId: z.number().int().positive().optional(),
  roleId: z.number().int().positive(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  employeeId: z.string().max(50).optional(),
  department: z.string().max(100).optional(),
});

export const updateStaffSchema = createStaffSchema.partial();

// Role validation schemas
export const createRoleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  scope: z.enum(['system', 'organization', 'property']),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export const updateRoleSchema = createRoleSchema.partial();

// User update schema
export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
});

// User create schema
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().max(50).optional(),
});

// System setting schema
export const updateSettingSchema = z.object({
  value: z.string().min(1, 'Value is required'),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
});

// Helper function to validate data
export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};
