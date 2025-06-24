/**
 * Authentication Middleware
 * JWT-based authentication with refresh token support
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { ApiError } from '@/utils/errors';

const prisma = new PrismaClient();

/**
 * Extended Request interface with user data
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    userType: 'CUSTOMER' | 'TESTER' | 'ADMIN';
    status: string;
  };
}

/**
 * JWT payload interface
 */
interface JWTPayload {
  userId: string;
  email: string;
  userType: 'CUSTOMER' | 'TESTER' | 'ADMIN';
  iat: number;
  exp: number;
}

/**
 * Main authentication middleware
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access token required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    
    // Fetch user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        userType: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new ApiError(401, 'Account is not active');
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      userType: user.userType,
      status: user.status,
    };

    // Update last login time (optional, can be done less frequently)
    if (shouldUpdateLastLogin(user.lastLoginAt)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token', { 
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      return next(new ApiError(401, 'Invalid access token'));
    }

    if (error instanceof jwt.TokenExpiredError) {
      logger.info('Expired JWT token', { 
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      return next(new ApiError(401, 'Access token expired'));
    }

    next(error);
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (...roles: Array<'CUSTOMER' | 'TESTER' | 'ADMIN'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.userType)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.id,
        userType: req.user.userType,
        requiredRoles: roles,
        endpoint: req.originalUrl,
        ip: req.ip,
      });
      return next(new ApiError(403, 'Insufficient permissions'));
    }

    next();
  };
};

/**
 * Optional authentication middleware (for public endpoints that can benefit from user context)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        userType: true,
        status: true,
      },
    });

    if (user && user.status === 'ACTIVE') {
      req.user = {
        id: user.id,
        email: user.email,
        userType: user.userType,
        status: user.status,
      };
    }

    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

/**
 * Email verification requirement middleware
 */
export const requireEmailVerification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { emailVerified: true },
  });

  if (!user?.emailVerified) {
    return next(new ApiError(403, 'Email verification required'));
  }

  next();
};

/**
 * Rate limiting for sensitive operations
 */
export const sensitiveOperationLimit = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const key = req.user?.id || req.ip;
    const now = Date.now();
    const userAttempts = attempts.get(key);

    if (!userAttempts || now > userAttempts.resetTime) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userAttempts.count >= maxAttempts) {
      logger.warn('Rate limit exceeded for sensitive operation', {
        userId: req.user?.id,
        ip: req.ip,
        endpoint: req.originalUrl,
        attempts: userAttempts.count,
      });
      return next(new ApiError(429, 'Too many attempts. Please try again later.'));
    }

    userAttempts.count++;
    next();
  };
};

/**
 * Helper function to determine if last login should be updated
 */
function shouldUpdateLastLogin(lastLoginAt: Date | null): boolean {
  if (!lastLoginAt) return true;
  
  const now = new Date();
  const timeDiff = now.getTime() - lastLoginAt.getTime();
  const hoursDiff = timeDiff / (1000 * 3600);
  
  // Update if last login was more than 1 hour ago
  return hoursDiff > 1;
}

/**
 * Cleanup expired refresh tokens (should be run periodically)
 */
export const cleanupExpiredTokens = async (): Promise<void> => {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    logger.info('Cleaned up expired refresh tokens', { 
      deletedCount: result.count 
    });
  } catch (error) {
    logger.error('Failed to cleanup expired tokens', { error });
  }
};

export default authMiddleware;