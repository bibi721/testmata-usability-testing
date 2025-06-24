/**
 * Masada Backend Server
 * Ethiopian Usability Testing Platform
 * 
 * Main server entry point with comprehensive configuration
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { requestLogger } from '@/middleware/requestLogger';
import { authMiddleware } from '@/middleware/auth';

// Route imports
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import testRoutes from '@/routes/tests';
import sessionRoutes from '@/routes/sessions';
import paymentRoutes from '@/routes/payments';
import analyticsRoutes from '@/routes/analytics';
import uploadRoutes from '@/routes/uploads';

/**
 * Express application setup with Ethiopian market considerations
 */
class MasadaServer {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.port;
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize middleware stack
   */
  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration for Ethiopian development
    this.app.use(cors({
      origin: config.cors.allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Rate limiting - adjusted for Ethiopian internet conditions
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Body parsing middleware
    this.app.use(express.json({ 
      limit: '10mb',
      verify: (req, res, buf) => {
        // Store raw body for webhook verification
        (req as any).rawBody = buf;
      }
    }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(requestLogger);

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        version: config.apiVersion,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      });
    });

    // API documentation endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        name: 'Masada API',
        description: 'Ethiopian Usability Testing Platform API',
        version: config.apiVersion,
        environment: config.nodeEnv,
        documentation: '/api/docs',
        endpoints: {
          auth: '/api/v1/auth',
          users: '/api/v1/users',
          tests: '/api/v1/tests',
          sessions: '/api/v1/sessions',
          payments: '/api/v1/payments',
          analytics: '/api/v1/analytics',
          uploads: '/api/v1/uploads',
        },
      });
    });
  }

  /**
   * Initialize API routes
   */
  private initializeRoutes(): void {
    const apiPrefix = `/api/${config.apiVersion}`;

    // Public routes (no authentication required)
    this.app.use(`${apiPrefix}/auth`, authRoutes);
    this.app.use(`${apiPrefix}/uploads`, uploadRoutes);

    // Protected routes (authentication required)
    this.app.use(`${apiPrefix}/users`, authMiddleware, userRoutes);
    this.app.use(`${apiPrefix}/tests`, authMiddleware, testRoutes);
    this.app.use(`${apiPrefix}/sessions`, authMiddleware, sessionRoutes);
    this.app.use(`${apiPrefix}/payments`, authMiddleware, paymentRoutes);
    this.app.use(`${apiPrefix}/analytics`, authMiddleware, analyticsRoutes);

    // 404 handler for undefined routes
    this.app.use('*', notFoundHandler);
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`🚀 Masada API Server started successfully`);
      logger.info(`📍 Environment: ${config.nodeEnv}`);
      logger.info(`🌐 Server running on port ${this.port}`);
      logger.info(`📊 API Version: ${config.apiVersion}`);
      logger.info(`🇪🇹 Serving Ethiopian Usability Testing Platform`);
      logger.info(`📖 API Documentation: http://localhost:${this.port}/api`);
      logger.info(`❤️  Health Check: http://localhost:${this.port}/health`);
      
      if (config.nodeEnv === 'development') {
        logger.info(`🔧 Development mode - Hot reload enabled`);
        logger.info(`📝 Database Studio: npx prisma studio`);
      }
    });

    // Graceful shutdown handling
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
    process.on('SIGINT', this.gracefulShutdown.bind(this));
  }

  /**
   * Graceful shutdown handler
   */
  private gracefulShutdown(signal: string): void {
    logger.info(`🛑 Received ${signal}. Starting graceful shutdown...`);
    
    // Close server and cleanup resources
    process.exit(0);
  }
}

// Start the server
const server = new MasadaServer();
server.start();

export default server;