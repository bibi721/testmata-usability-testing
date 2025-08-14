"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCapacityError = exports.TesterNotAvailableError = exports.PaymentError = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    details;
    constructor(statusCode, message, details) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
class ValidationError extends ApiError {
    constructor(message, details) {
        super(400, message, details);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends ApiError {
    constructor(message = 'Authentication required') {
        super(401, message);
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends ApiError {
    constructor(message = 'Insufficient permissions') {
        super(403, message);
        this.name = 'AuthorizationError';
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends ApiError {
    constructor(resource = 'Resource') {
        super(404, `${resource} not found`);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends ApiError {
    constructor(message) {
        super(409, message);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
class RateLimitError extends ApiError {
    constructor(message = 'Too many requests') {
        super(429, message);
        this.name = 'RateLimitError';
    }
}
exports.RateLimitError = RateLimitError;
class PaymentError extends ApiError {
    constructor(message, provider) {
        super(402, message, { provider });
        this.name = 'PaymentError';
    }
}
exports.PaymentError = PaymentError;
class TesterNotAvailableError extends ApiError {
    constructor() {
        super(503, 'No Ethiopian testers available at the moment');
        this.name = 'TesterNotAvailableError';
    }
}
exports.TesterNotAvailableError = TesterNotAvailableError;
class TestCapacityError extends ApiError {
    constructor() {
        super(409, 'Test has reached maximum tester capacity');
        this.name = 'TestCapacityError';
    }
}
exports.TestCapacityError = TestCapacityError;
exports.default = ApiError;
//# sourceMappingURL=errors.js.map