/**
 * Custom Error Classes
 * Standardized error handling for the Masada API
 */

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error class
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, message, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error class
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(401, message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error class
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error class
 */
export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(404, `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error class
 */
export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, message);
    this.name = 'ConflictError';
  }
}

/**
 * Rate Limit Error class
 */
export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests') {
    super(429, message);
    this.name = 'RateLimitError';
  }
}

/**
 * Ethiopian-specific errors
 */
export class PaymentError extends ApiError {
  constructor(message: string, provider?: string) {
    super(402, message, { provider });
    this.name = 'PaymentError';
  }
}

export class TesterNotAvailableError extends ApiError {
  constructor() {
    super(503, 'No Ethiopian testers available at the moment');
    this.name = 'TesterNotAvailableError';
  }
}

export class TestCapacityError extends ApiError {
  constructor() {
    super(409, 'Test has reached maximum tester capacity');
    this.name = 'TestCapacityError';
  }
}

export default ApiError;