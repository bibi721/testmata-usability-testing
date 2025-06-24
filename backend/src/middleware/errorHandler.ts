/**
 * Global Error Handler Middleware
 * Centralized error handling for the Masada API
 */

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ZodError } from 'zod';
import { logger } from '@/utils/logger';
import { ApiError } from '@/utils/errors';
import { config } from '@/config/environment';

/**
 * Error response interface
 */
interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  details?: any;
  stack?: string;
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;

  // Log the error
  logger.error('API Error', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
  });

  // Handle different error types
  if (error instanceof ApiError) {
    // Custom API errors
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Prisma database errors
    ({ statusCode, message, details } = handlePrismaError(error));
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    // Prisma validation errors
    statusCode = 400;
    message = 'Invalid data provided';
    details = { type: 'validation_error' };
  } else if (error instanceof ZodError) {
    // Zod validation errors
    statusCode = 400;
    message = 'Validation failed';
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
  } else if (error instanceof JsonWebTokenError) {
    // JWT errors
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (error instanceof TokenExpiredError) {
    // JWT expiration errors
    statusCode = 401;
    message = 'Authentication token expired';
  } else if (error.name === 'MulterError') {
    // File upload errors
    ({ statusCode, message } = handleMulterError(error as any));
  } else if (error.name === 'ValidationError') {
    // General validation errors
    statusCode = 400;
    message = error.message;
  }

  // Prepare error response
  const errorResponse: ErrorResponse = {
    error: getErrorType(statusCode),
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };

  // Add details in development or for client errors
  if (config.nodeEnv === 'development' || statusCode < 500) {
    errorResponse.details = details;
  }

  // Add stack trace in development
  if (config.nodeEnv === 'development') {
    errorResponse.stack = error.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Handle Prisma database errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
  statusCode: number;
  message: string;
  details?: any;
} {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = (error.meta?.target as string[])?.join(', ') || 'field';
      return {
        statusCode: 409,
        message: `${field} already exists`,
        details: { field, type: 'unique_constraint' },
      };

    case 'P2025':
      // Record not found
      return {
        statusCode: 404,
        message: 'Record not found',
        details: { type: 'not_found' },
      };

    case 'P2003':
      // Foreign key constraint violation
      return {
        statusCode: 400,
        message: 'Invalid reference to related record',
        details: { type: 'foreign_key_constraint' },
      };

    case 'P2014':
      // Required relation violation
      return {
        statusCode: 400,
        message: 'Required relation is missing',
        details: { type: 'required_relation' },
      };

    case 'P2021':
      // Table does not exist
      return {
        statusCode: 500,
        message: 'Database configuration error',
        details: { type: 'table_not_found' },
      };

    case 'P2022':
      // Column does not exist
      return {
        statusCode: 500,
        message: 'Database schema error',
        details: { type: 'column_not_found' },
      };

    default:
      return {
        statusCode: 500,
        message: 'Database operation failed',
        details: { code: error.code, type: 'database_error' },
      };
  }
}

/**
 * Handle Multer file upload errors
 */
function handleMulterError(error: any): {
  statusCode: number;
  message: string;
} {
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return {
        statusCode: 413,
        message: 'File size too large',
      };

    case 'LIMIT_FILE_COUNT':
      return {
        statusCode: 400,
        message: 'Too many files uploaded',
      };

    case 'LIMIT_UNEXPECTED_FILE':
      return {
        statusCode: 400,
        message: 'Unexpected file field',
      };

    default:
      return {
        statusCode: 400,
        message: 'File upload error',
      };
  }
}

/**
 * Get error type based on status code
 */
function getErrorType(statusCode: number): string {
  if (statusCode >= 400 && statusCode < 500) {
    return 'Client Error';
  } else if (statusCode >= 500) {
    return 'Server Error';
  }
  return 'Error';
}

/**
 * Handle 404 errors for undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default errorHandler;