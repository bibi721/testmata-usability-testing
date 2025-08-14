/**
 * WebSocket Middleware
 * Authentication and validation for WebSocket connections
 */

import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';

const prisma = new PrismaClient();

/**
 * Extended Socket interface with user data
 */
export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userType?: 'CUSTOMER' | 'TESTER' | 'ADMIN';
  user?: {
    id: string;
    email: string;
    name: string;
    userType: string;
    status: string;
  };
}

/**
 * WebSocket authentication middleware
 */
export const authenticateSocket = async (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
): Promise<void> => {
  try {
    // Extract token from auth or headers
    const token = 
      socket.handshake.auth.token || 
      socket.handshake.headers.authorization?.replace('Bearer ', '') ||
      socket.request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    if (!decoded.userId) {
      return next(new Error('Invalid token payload'));
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        status: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return next(new Error('User not found'));
    }

    if (user.status !== 'ACTIVE') {
      return next(new Error('Account is not active'));
    }

    // Attach user data to socket
    socket.userId = user.id;
    socket.userType = user.userType as 'CUSTOMER' | 'TESTER' | 'ADMIN';
    socket.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      status: user.status,
    };

    logger.info('WebSocket authentication successful', {
      userId: user.id,
      userType: user.userType,
      socketId: socket.id,
    });

    next();

  } catch (error) {
    logger.warn('WebSocket authentication failed', {
      error: (error as any)?.message,
      socketId: socket.id,
      ip: socket.request.connection.remoteAddress,
    });

    if (error instanceof jwt.JsonWebTokenError) {
      return next(new Error('Invalid authentication token'));
    }

    if (error instanceof jwt.TokenExpiredError) {
      return next(new Error('Authentication token expired'));
    }

    next(new Error('Authentication failed'));
  }
};

/**
 * Rate limiting middleware for WebSocket events
 */
export const rateLimitSocket = (maxEvents: number, windowMs: number) => {
  const userEventCounts = new Map<string, { count: number; resetTime: number }>();

  return (socket: AuthenticatedSocket, next: (err?: Error) => void): void => {
    const userId = socket.userId || socket.id;
    const now = Date.now();
    const userEvents = userEventCounts.get(userId);

    if (!userEvents || now > userEvents.resetTime) {
      userEventCounts.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userEvents.count >= maxEvents) {
      logger.warn('WebSocket rate limit exceeded', {
        userId: socket.userId,
        socketId: socket.id,
        eventCount: userEvents.count,
      });
      return next(new Error('Rate limit exceeded'));
    }

    userEvents.count++;
    next();
  };
};

/**
 * Role-based access control for WebSocket events
 */
export const requireSocketRole = (...roles: Array<'CUSTOMER' | 'TESTER' | 'ADMIN'>) => {
  return (socket: AuthenticatedSocket, next: (err?: Error) => void): void => {
    if (!socket.userType) {
      return next(new Error('Authentication required'));
    }

    if (!roles.includes(socket.userType)) {
      logger.warn('WebSocket authorization failed', {
        userId: socket.userId,
        userType: socket.userType,
        requiredRoles: roles,
        socketId: socket.id,
      });
      return next(new Error('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Validate WebSocket event data
 */
export const validateSocketData = (schema: any) => {
  return (data: any, next: (err?: Error) => void): void => {
    try {
      schema.parse(data);
      next();
    } catch (error) {
      logger.warn('WebSocket data validation failed', {
        error: (error as any)?.message,
        data,
      });
      next(new Error('Invalid event data'));
    }
  };
};

/**
 * Log WebSocket events
 */
export const logSocketEvent = (eventName: string) => {
  return (socket: AuthenticatedSocket, data: any): void => {
    logger.info('WebSocket event received', {
      event: eventName,
      userId: socket.userId,
      userType: socket.userType,
      socketId: socket.id,
      data: typeof data === 'object' ? Object.keys(data) : data,
    });
  };
};

/**
 * Error handler for WebSocket events
 */
export const handleSocketError = (
  socket: AuthenticatedSocket,
  eventName: string,
  error: Error
): void => {
  logger.error('WebSocket event error', {
    event: eventName,
    error: error.message,
    stack: error.stack,
    userId: socket.userId,
    socketId: socket.id,
  });

  // Send error to client
  socket.emit('error', {
    event: eventName,
    message: error.message,
    timestamp: new Date(),
  });
};

/**
 * Connection cleanup utilities
 */
export const cleanupSocketConnection = (socket: AuthenticatedSocket): void => {
  logger.info('Cleaning up WebSocket connection', {
    userId: socket.userId,
    socketId: socket.id,
  });

  // Remove from any rooms
  socket.rooms.forEach(room => {
    if (room !== socket.id) {
      socket.leave(room);
    }
  });

  // Update user status if needed
  if (socket.userId) {
    prisma.user.update({
      where: { id: socket.userId },
      data: { lastLoginAt: new Date() },
    }).catch(error => {
      logger.error('Failed to update user last login on disconnect', {
        error,
        userId: socket.userId,
      });
    });
  }
};

export default {
  authenticateSocket,
  rateLimitSocket,
  requireSocketRole,
  validateSocketData,
  logSocketEvent,
  handleSocketError,
  cleanupSocketConnection,
};