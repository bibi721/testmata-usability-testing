/**
 * Request Validation Middleware
 * Zod-based validation for API requests
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ApiError } from '@/utils/errors';
import { logger } from '@/utils/logger';

/**
 * Validation middleware factory
 */
export const validateRequest = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate query parameters
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      // Validate route parameters
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('Request validation failed', {
          endpoint: req.originalUrl,
          method: req.method,
          errors: validationErrors,
          ip: req.ip,
        });

        return next(new ApiError(400, 'Validation failed', validationErrors));
      }

      next(error);
    }
  };
};

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // Pagination
  pagination: z.object({
    page: z.string().transform(Number).pipe(z.number().min(1)).optional().default('1'),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('10'),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),

  // ID parameter
  id: z.object({
    id: z.string().cuid(),
  }),

  // Email validation
  email: z.string().email().toLowerCase(),

  // Password validation (Ethiopian context)
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),

  // Ethiopian phone number validation
  ethiopianPhone: z.string()
    .regex(/^(\+251|0)[79]\d{8}$/, 'Invalid Ethiopian phone number format'),

  // Ethiopian regions
  ethiopianRegion: z.enum([
    'Addis Ababa',
    'Afar',
    'Amhara',
    'Benishangul-Gumuz',
    'Dire Dawa',
    'Gambela',
    'Harari',
    'Oromia',
    'Sidama',
    'SNNPR',
    'Somali',
    'Tigray',
  ]),

  // Language codes
  languageCode: z.enum(['en', 'am']),

  // Currency
  currency: z.enum(['ETB', 'USD']).default('ETB'),

  // File upload validation
  fileUpload: z.object({
    filename: z.string(),
    mimetype: z.string(),
    size: z.number().max(10 * 1024 * 1024), // 10MB max
  }),
};

/**
 * Authentication validation schemas
 */
export const authSchemas = {
  register: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    name: z.string().min(2).max(100),
    userType: z.enum(['CUSTOMER', 'TESTER']).default('CUSTOMER'),
  }),

  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1),
  }),

  refreshToken: z.object({
    refreshToken: z.string(),
  }),

  forgotPassword: z.object({
    email: commonSchemas.email,
  }),

  resetPassword: z.object({
    token: z.string(),
    password: commonSchemas.password,
  }),

  changePassword: z.object({
    currentPassword: z.string(),
    newPassword: commonSchemas.password,
  }),

  verifyEmail: z.object({
    token: z.string(),
  }),
};

/**
 * User validation schemas
 */
export const userSchemas = {
  updateProfile: z.object({
    name: z.string().min(2).max(100).optional(),
    avatar: z.string().url().optional(),
  }),

  updateCustomerProfile: z.object({
    company: z.string().max(200).optional(),
    website: z.string().url().optional(),
    industry: z.string().max(100).optional(),
    companySize: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional(),
  }),

  updateTesterProfile: z.object({
    phone: commonSchemas.ethiopianPhone.optional(),
    city: z.string().max(100).optional(),
    region: commonSchemas.ethiopianRegion.optional(),
    age: z.enum(['18-24', '25-34', '35-44', '45-54', '55+']).optional(),
    education: z.enum([
      'High School',
      'Diploma',
      'Bachelor\'s Degree',
      'Master\'s Degree',
      'PhD',
    ]).optional(),
    occupation: z.string().max(100).optional(),
    experience: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional(),
    languages: z.array(z.string()).optional(),
    devices: z.array(z.string()).optional(),
    internetSpeed: z.enum(['Slow', 'Medium', 'Fast']).optional(),
    availability: z.enum(['1-5', '6-10', '11-20', '20+']).optional(),
    motivation: z.string().max(500).optional(),
  }),
};

/**
 * Test validation schemas
 */
export const testSchemas = {
  createTest: z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(10).max(1000),
    instructions: z.string().max(2000).optional(),
    testType: z.enum(['USABILITY', 'FEEDBACK', 'SURVEY', 'INTERVIEW']),
    platform: z.enum(['WEB', 'MOBILE_APP', 'DESKTOP']),
    targetUrl: z.string().url().optional(),
    maxTesters: z.number().min(1).max(100).default(10),
    paymentPerTester: z.number().min(5).max(1000), // ETB
    estimatedDuration: z.number().min(5).max(120), // minutes
    requirements: z.array(z.string()).optional(),
    tasks: z.any().optional(), // JSON object
    demographics: z.any().optional(), // JSON object
  }),

  updateTest: z.object({
    title: z.string().min(5).max(200).optional(),
    description: z.string().min(10).max(1000).optional(),
    instructions: z.string().max(2000).optional(),
    maxTesters: z.number().min(1).max(100).optional(),
    paymentPerTester: z.number().min(5).max(1000).optional(),
    estimatedDuration: z.number().min(5).max(120).optional(),
    requirements: z.array(z.string()).optional(),
    tasks: z.any().optional(),
    demographics: z.any().optional(),
  }),

  publishTest: z.object({
    publishedAt: z.string().datetime().optional(),
  }),
};

/**
 * Session validation schemas
 */
export const sessionSchemas = {
  startSession: z.object({
    testId: z.string().cuid(),
    deviceInfo: z.object({
      userAgent: z.string(),
      screenResolution: z.string().optional(),
      deviceType: z.enum(['mobile', 'tablet', 'desktop']).optional(),
    }).optional(),
  }),

  updateSession: z.object({
    status: z.enum(['IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
    feedback: z.string().max(2000).optional(),
    rating: z.number().min(1).max(5).optional(),
    taskResults: z.any().optional(),
  }),

  submitRecording: z.object({
    recordingUrl: z.string().url(),
    duration: z.number().min(1),
  }),
};

/**
 * Payment validation schemas
 */
export const paymentSchemas = {
  createPayment: z.object({
    amount: z.number().min(1),
    currency: commonSchemas.currency,
    method: z.enum(['CREDIT_CARD', 'CHAPA', 'TELEBIRR', 'CBE_BIRR', 'BANK_TRANSFER']),
    description: z.string().max(500).optional(),
    metadata: z.any().optional(),
  }),

  updatePayment: z.object({
    status: z.enum(['PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED']),
    transactionId: z.string().optional(),
    metadata: z.any().optional(),
  }),
};

export default validateRequest;