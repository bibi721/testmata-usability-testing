/**
 * Logging Utility
 * Comprehensive logging system for the Masada backend
 */

import winston from 'winston';
import { config } from '@/config/environment';
import path from 'path';
import fs from 'fs';

/**
 * Ensure logs directory exists
 */
const ensureLogDirectory = () => {
  const logDir = path.dirname(config.logging.file);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
};

ensureLogDirectory();

/**
 * Custom log format for Ethiopian context
 */
const ethiopianFormat = winston.format.combine(
  winston.format.timestamp({
    format: () => {
      return new Date().toLocaleString('en-US', {
        timeZone: config.ethiopian.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    },
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaString}`;
  })
);

/**
 * Console format for development
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `🇪🇹 [${timestamp}] ${level}: ${message} ${metaString}`;
  })
);

/**
 * Create Winston logger instance
 */
export const logger = winston.createLogger({
  level: config.logging.level,
  format: ethiopianFormat,
  defaultMeta: {
    service: 'masada-api',
    environment: config.nodeEnv,
    timezone: config.ethiopian.timezone,
  },
  transports: [
    // File transport for all logs
    new winston.transports.File({
      filename: config.logging.file,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Separate file for errors
    new winston.transports.File({
      filename: path.join(path.dirname(config.logging.file), 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

/**
 * Add console transport for development
 */
if (config.nodeEnv === 'development') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

/**
 * Request logging helper
 */
export const logRequest = (req: any, res: any, duration: number) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id,
    userType: req.user?.userType,
  };

  if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
};

/**
 * Error logging helper
 */
export const logError = (error: Error, context?: any) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    context,
  });
};

/**
 * Ethiopian-specific logging helpers
 */
export const logEthiopianEvent = (event: string, data: any) => {
  logger.info(`Ethiopian Event: ${event}`, {
    event,
    data,
    timezone: config.ethiopian.timezone,
    currency: config.ethiopian.currency,
  });
};

/**
 * Payment logging (for Ethiopian payment systems)
 */
export const logPayment = (paymentData: any) => {
  logger.info('Payment Event', {
    ...paymentData,
    // Remove sensitive data
    cardNumber: paymentData.cardNumber ? '****' : undefined,
    cvv: undefined,
    password: undefined,
  });
};

/**
 * Test session logging
 */
export const logTestSession = (sessionData: any) => {
  logger.info('Test Session Event', {
    sessionId: sessionData.id,
    testId: sessionData.testId,
    testerId: sessionData.testerId,
    status: sessionData.status,
    duration: sessionData.duration,
    timestamp: new Date().toISOString(),
  });
};

export default logger;