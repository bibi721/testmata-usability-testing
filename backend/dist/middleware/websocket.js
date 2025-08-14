"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupSocketConnection = exports.handleSocketError = exports.logSocketEvent = exports.validateSocketData = exports.requireSocketRole = exports.rateLimitSocket = exports.authenticateSocket = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const environment_1 = require("../config/environment");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token ||
            socket.handshake.headers.authorization?.replace('Bearer ', '') ||
            socket.request.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return next(new Error('Authentication token required'));
        }
        const decoded = jsonwebtoken_1.default.verify(token, environment_1.config.jwt.secret);
        if (!decoded.userId) {
            return next(new Error('Invalid token payload'));
        }
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
        socket.userId = user.id;
        socket.userType = user.userType;
        socket.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            userType: user.userType,
            status: user.status,
        };
        logger_1.logger.info('WebSocket authentication successful', {
            userId: user.id,
            userType: user.userType,
            socketId: socket.id,
        });
        next();
    }
    catch (error) {
        logger_1.logger.warn('WebSocket authentication failed', {
            error: error?.message,
            socketId: socket.id,
            ip: socket.request.connection.remoteAddress,
        });
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new Error('Invalid authentication token'));
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new Error('Authentication token expired'));
        }
        next(new Error('Authentication failed'));
    }
};
exports.authenticateSocket = authenticateSocket;
const rateLimitSocket = (maxEvents, windowMs) => {
    const userEventCounts = new Map();
    return (socket, next) => {
        const userId = socket.userId || socket.id;
        const now = Date.now();
        const userEvents = userEventCounts.get(userId);
        if (!userEvents || now > userEvents.resetTime) {
            userEventCounts.set(userId, { count: 1, resetTime: now + windowMs });
            return next();
        }
        if (userEvents.count >= maxEvents) {
            logger_1.logger.warn('WebSocket rate limit exceeded', {
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
exports.rateLimitSocket = rateLimitSocket;
const requireSocketRole = (...roles) => {
    return (socket, next) => {
        if (!socket.userType) {
            return next(new Error('Authentication required'));
        }
        if (!roles.includes(socket.userType)) {
            logger_1.logger.warn('WebSocket authorization failed', {
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
exports.requireSocketRole = requireSocketRole;
const validateSocketData = (schema) => {
    return (data, next) => {
        try {
            schema.parse(data);
            next();
        }
        catch (error) {
            logger_1.logger.warn('WebSocket data validation failed', {
                error: error?.message,
                data,
            });
            next(new Error('Invalid event data'));
        }
    };
};
exports.validateSocketData = validateSocketData;
const logSocketEvent = (eventName) => {
    return (socket, data) => {
        logger_1.logger.info('WebSocket event received', {
            event: eventName,
            userId: socket.userId,
            userType: socket.userType,
            socketId: socket.id,
            data: typeof data === 'object' ? Object.keys(data) : data,
        });
    };
};
exports.logSocketEvent = logSocketEvent;
const handleSocketError = (socket, eventName, error) => {
    logger_1.logger.error('WebSocket event error', {
        event: eventName,
        error: error.message,
        stack: error.stack,
        userId: socket.userId,
        socketId: socket.id,
    });
    socket.emit('error', {
        event: eventName,
        message: error.message,
        timestamp: new Date(),
    });
};
exports.handleSocketError = handleSocketError;
const cleanupSocketConnection = (socket) => {
    logger_1.logger.info('Cleaning up WebSocket connection', {
        userId: socket.userId,
        socketId: socket.id,
    });
    socket.rooms.forEach(room => {
        if (room !== socket.id) {
            socket.leave(room);
        }
    });
    if (socket.userId) {
        prisma.user.update({
            where: { id: socket.userId },
            data: { lastLoginAt: new Date() },
        }).catch(error => {
            logger_1.logger.error('Failed to update user last login on disconnect', {
                error,
                userId: socket.userId,
            });
        });
    }
};
exports.cleanupSocketConnection = cleanupSocketConnection;
exports.default = {
    authenticateSocket: exports.authenticateSocket,
    rateLimitSocket: exports.rateLimitSocket,
    requireSocketRole: exports.requireSocketRole,
    validateSocketData: exports.validateSocketData,
    logSocketEvent: exports.logSocketEvent,
    handleSocketError: exports.handleSocketError,
    cleanupSocketConnection: exports.cleanupSocketConnection,
};
//# sourceMappingURL=websocket.js.map