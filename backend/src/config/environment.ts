/**
 * Environment Configuration
 * Centralized configuration management for the Masada backend
 */

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

/**
 * Environment validation schema
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  API_VERSION: z.string().default('v1'),
  
  // CORS Configuration
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'),
  UPLOAD_PATH: z.string().default('./uploads'),
  
  // Email Configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  
  // Payment Configuration
  CHAPA_SECRET_KEY: z.string().optional(),
  TELEBIRR_API_KEY: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('logs/masada.log'),
  
  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  SESSION_SECRET: z.string().min(32).optional(),
  
  // Ethiopian Specific
  DEFAULT_TIMEZONE: z.string().default('Africa/Addis_Ababa'),
  DEFAULT_CURRENCY: z.string().default('ETB'),
  DEFAULT_LANGUAGE: z.string().default('en'),
  SUPPORTED_LANGUAGES: z.string().default('en,am'),
});

/**
 * Validate and parse environment variables
 */
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment configuration:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
};

const env = parseEnv();

/**
 * Application configuration object
 */
export const config = {
  // Database
  database: {
    url: env.DATABASE_URL,
  },
  
  // Server
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  apiVersion: env.API_VERSION,
  
  // JWT
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  
  // CORS
  cors: {
    frontendUrl: env.FRONTEND_URL,
    allowedOrigins: env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()),
  },
  
  // File Upload
  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    uploadPath: env.UPLOAD_PATH,
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'application/pdf',
      'text/plain',
    ],
  },
  
  // Email
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.FROM_EMAIL,
  },
  
  // Payment
  payment: {
    chapa: {
      secretKey: env.CHAPA_SECRET_KEY,
    },
    telebirr: {
      apiKey: env.TELEBIRR_API_KEY,
    },
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  
  // Logging
  logging: {
    level: env.LOG_LEVEL,
    file: env.LOG_FILE,
  },
  
  // Security
  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
    sessionSecret: env.SESSION_SECRET,
  },
  
  // Ethiopian Specific
  ethiopian: {
    timezone: env.DEFAULT_TIMEZONE,
    currency: env.DEFAULT_CURRENCY,
    defaultLanguage: env.DEFAULT_LANGUAGE,
    supportedLanguages: env.SUPPORTED_LANGUAGES.split(',').map(lang => lang.trim()),
  },
} as const;

/**
 * Validate required configuration for production
 */
export const validateProductionConfig = () => {
  if (config.nodeEnv === 'production') {
    const requiredFields = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'DATABASE_URL',
    ];
    
    const missingFields = requiredFields.filter(field => !process.env[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required production environment variables:');
      missingFields.forEach(field => console.error(`  - ${field}`));
      process.exit(1);
    }
  }
};

// Validate production config on import
validateProductionConfig();