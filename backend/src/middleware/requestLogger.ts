/**
 * Request Logger Middleware
 * HTTP request logging with Ethiopian context
 */

import { Request, Response, NextFunction } from 'express';
import { logRequest } from '@/utils/logger';

/**
 * Request logging middleware
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any): Response {
    const duration = Date.now() - startTime;
    logRequest(req, res, duration);
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

export default requestLogger;