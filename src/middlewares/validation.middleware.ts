import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError, ValidationError } from '../types';

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        const errorMessage = validationErrors
          .map((err) => `${err.field}: ${err.message}`)
          .join(', ');

        next(new AppError(errorMessage, 400, 'VALIDATION_ERROR'));
      } else {
        next(error);
      }
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Parse numeric query params
      const query: Record<string, unknown> = { ...req.query };
      if (query.page) query.page = parseInt(query.page as string, 10);
      if (query.limit) query.limit = parseInt(query.limit as string, 10);

      schema.parse(query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        const errorMessage = validationErrors
          .map((err) => `${err.field}: ${err.message}`)
          .join(', ');

        next(new AppError(errorMessage, 400, 'VALIDATION_ERROR'));
      } else {
        next(error);
      }
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Parse numeric params
      const params: Record<string, unknown> = { ...req.params };
      if (params.id) params.id = parseInt(params.id as string, 10);

      schema.parse(params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        const errorMessage = validationErrors
          .map((err) => `${err.field}: ${err.message}`)
          .join(', ');

        next(new AppError(errorMessage, 400, 'VALIDATION_ERROR'));
      } else {
        next(error);
      }
    }
  };
};
