"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredTokens = exports.sensitiveOperationLimit = exports.requireEmailVerification = exports.optionalAuth = exports.requireRole = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const environment_1 = require("../config/environment");
const logger_1 = require("../utils/logger");
const errors_1 = require("../utils/errors");
const prisma = new client_1.PrismaClient();
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.ApiError(401, 'Access token required');
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, environment_1.config.jwt.secret);
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
            throw new errors_1.ApiError(401, 'User not found');
        }
        if (user.status !== 'ACTIVE') {
            throw new errors_1.ApiError(401, 'Account is not active');
        }
        req.user = {
            id: user.id,
            email: user.email,
            userType: user.userType,
            status: user.status,
        };
        if (shouldUpdateLastLogin(user.lastLoginAt)) {
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
            });
        }
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            logger_1.logger.warn('Invalid JWT token', {
                error: error.message,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
            });
            return next(new errors_1.ApiError(401, 'Invalid access token'));
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            logger_1.logger.info('Expired JWT token', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
            });
            return next(new errors_1.ApiError(401, 'Access token expired'));
        }
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errors_1.ApiError(401, 'Authentication required'));
        }
        if (!roles.includes(req.user.userType)) {
            logger_1.logger.warn('Unauthorized access attempt', {
                userId: req.user.id,
                userType: req.user.userType,
                requiredRoles: roles,
                endpoint: req.originalUrl,
                ip: req.ip,
            });
            return next(new errors_1.ApiError(403, 'Insufficient permissions'));
        }
        next();
    };
};
exports.requireRole = requireRole;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, environment_1.config.jwt.secret);
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
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireEmailVerification = async (req, res, next) => {
    if (!req.user) {
        return next(new errors_1.ApiError(401, 'Authentication required'));
    }
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { emailVerified: true },
    });
    if (!user?.emailVerified) {
        return next(new errors_1.ApiError(403, 'Email verification required'));
    }
    next();
};
exports.requireEmailVerification = requireEmailVerification;
const sensitiveOperationLimit = (maxAttempts, windowMs) => {
    const attempts = new Map();
    return (req, _res, next) => {
        const key = req.user?.id || req.ip || 'anonymous';
        const now = Date.now();
        const current = attempts.get(key);
        if (!current || now > current.resetTime) {
            attempts.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }
        if (current.count >= maxAttempts) {
            logger_1.logger.warn('Rate limit exceeded for sensitive operation', {
                userId: req.user?.id,
                ip: req.ip,
                endpoint: req.originalUrl,
                attempts: current.count,
            });
            return next(new errors_1.ApiError(429, 'Too many attempts. Please try again later.'));
        }
        current.count++;
        next();
    };
};
exports.sensitiveOperationLimit = sensitiveOperationLimit;
function shouldUpdateLastLogin(lastLoginAt) {
    if (!lastLoginAt)
        return true;
    const now = new Date();
    const timeDiff = now.getTime() - lastLoginAt.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    return hoursDiff > 1;
}
const cleanupExpiredTokens = async () => {
    try {
        const result = await prisma.refreshToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        logger_1.logger.info('Cleaned up expired refresh tokens', {
            deletedCount: result.count
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to cleanup expired tokens', { error });
    }
};
exports.cleanupExpiredTokens = cleanupExpiredTokens;
exports.default = exports.authMiddleware;
//# sourceMappingURL=auth.js.map