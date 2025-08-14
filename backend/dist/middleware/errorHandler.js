"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = require("jsonwebtoken");
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
const errors_1 = require("../utils/errors");
const environment_1 = require("../config/environment");
const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal server error';
    let details = undefined;
    logger_1.logger.error('API Error', {
        error: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
    });
    if (error instanceof errors_1.ApiError) {
        statusCode = error.statusCode;
        message = error.message;
        details = error.details;
    }
    else if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        ({ statusCode, message, details } = handlePrismaError(error));
    }
    else if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = 'Invalid data provided';
        details = { type: 'validation_error' };
    }
    else if (error instanceof zod_1.ZodError) {
        statusCode = 400;
        message = 'Validation failed';
        details = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
        }));
    }
    else if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
        statusCode = 401;
        message = 'Invalid authentication token';
    }
    else if (error instanceof jsonwebtoken_1.TokenExpiredError) {
        statusCode = 401;
        message = 'Authentication token expired';
    }
    else if (error.name === 'MulterError') {
        ({ statusCode, message } = handleMulterError(error));
    }
    else if (error.name === 'ValidationError') {
        statusCode = 400;
        message = error.message;
    }
    const errorResponse = {
        error: getErrorType(statusCode),
        message,
        statusCode,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
    };
    if (environment_1.config.nodeEnv === 'development' || statusCode < 500) {
        errorResponse.details = details;
    }
    if (environment_1.config.nodeEnv === 'development') {
        errorResponse.stack = error.stack;
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
function handlePrismaError(error) {
    switch (error.code) {
        case 'P2002':
            const field = error.meta?.target?.join(', ') || 'field';
            return {
                statusCode: 409,
                message: `${field} already exists`,
                details: { field, type: 'unique_constraint' },
            };
        case 'P2025':
            return {
                statusCode: 404,
                message: 'Record not found',
                details: { type: 'not_found' },
            };
        case 'P2003':
            return {
                statusCode: 400,
                message: 'Invalid reference to related record',
                details: { type: 'foreign_key_constraint' },
            };
        case 'P2014':
            return {
                statusCode: 400,
                message: 'Required relation is missing',
                details: { type: 'required_relation' },
            };
        case 'P2021':
            return {
                statusCode: 500,
                message: 'Database configuration error',
                details: { type: 'table_not_found' },
            };
        case 'P2022':
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
function handleMulterError(error) {
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
function getErrorType(statusCode) {
    if (statusCode >= 400 && statusCode < 500) {
        return 'Client Error';
    }
    else if (statusCode >= 500) {
        return 'Server Error';
    }
    return 'Error';
}
const notFoundHandler = (req, res, next) => {
    const error = new errors_1.ApiError(404, `Route ${req.originalUrl} not found`);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
exports.default = exports.errorHandler;
//# sourceMappingURL=errorHandler.js.map