"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketManager = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const environment_1 = require("../config/environment");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
class SocketManager {
    io;
    connectedUsers = new Map();
    testRooms = new Map();
    constructor(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: environment_1.config.cors.allowedOrigins,
                methods: ['GET', 'POST'],
                credentials: true,
            },
            transports: ['websocket', 'polling'],
        });
        this.setupMiddleware();
        this.setupEventHandlers();
        logger_1.logger.info('🔌 WebSocket server initialized');
    }
    setupMiddleware() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
                if (!token) {
                    return next(new Error('Authentication token required'));
                }
                const decoded = jsonwebtoken_1.default.verify(token, environment_1.config.jwt.secret);
                const user = await prisma.user.findUnique({
                    where: { id: decoded.userId },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        userType: true,
                        status: true,
                    },
                });
                if (!user || user.status !== 'ACTIVE') {
                    return next(new Error('Invalid or inactive user'));
                }
                socket.userId = user.id;
                socket.userType = user.userType;
                socket.user = user;
                next();
            }
            catch (error) {
                logger_1.logger.warn('WebSocket authentication failed', { error: error?.message });
                next(new Error('Authentication failed'));
            }
        });
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            logger_1.logger.info('User connected via WebSocket', {
                userId: socket.userId,
                userType: socket.userType,
                socketId: socket.id,
            });
            if (socket.userId) {
                this.connectedUsers.set(socket.userId, socket.id);
            }
            this.setupUserEvents(socket);
            this.setupTestEvents(socket);
            this.setupSessionEvents(socket);
            this.setupNotificationEvents(socket);
            socket.on('disconnect', () => {
                this.handleDisconnection(socket);
            });
        });
    }
    setupUserEvents(socket) {
        socket.on('user:status', (data) => {
            logger_1.logger.info('User status update', {
                userId: socket.userId,
                status: data.status,
            });
            this.broadcastToUser(socket.userId, 'user:status_updated', {
                status: data.status,
                timestamp: new Date(),
            });
        });
        socket.on('user:typing', (data) => {
            socket.to(data.room).emit('user:typing', {
                userId: socket.userId,
                userName: socket.user?.name,
                isTyping: data.isTyping,
            });
        });
    }
    setupTestEvents(socket) {
        socket.on('test:join', async (data) => {
            const { testId } = data;
            try {
                const hasAccess = await this.verifyTestAccess(socket.userId, testId, socket.userType);
                if (!hasAccess) {
                    socket.emit('error', { message: 'Access denied to test' });
                    return;
                }
                socket.join(`test:${testId}`);
                if (!this.testRooms.has(testId)) {
                    this.testRooms.set(testId, new Set());
                }
                this.testRooms.get(testId).add(socket.id);
                logger_1.logger.info('User joined test room', {
                    userId: socket.userId,
                    testId,
                    userType: socket.userType,
                });
                const testStatus = await this.getTestStatus(testId);
                socket.emit('test:status', testStatus);
            }
            catch (error) {
                logger_1.logger.error('Failed to join test room', { error, userId: socket.userId, testId });
                socket.emit('error', { message: 'Failed to join test room' });
            }
        });
        socket.on('test:leave', (data) => {
            const { testId } = data;
            socket.leave(`test:${testId}`);
            if (this.testRooms.has(testId)) {
                this.testRooms.get(testId).delete(socket.id);
            }
            logger_1.logger.info('User left test room', {
                userId: socket.userId,
                testId,
            });
        });
        socket.on('test:update_status', async (data) => {
            if (socket.userType !== 'CUSTOMER') {
                socket.emit('error', { message: 'Only customers can update test status' });
                return;
            }
            const { testId, status } = data;
            try {
                const test = await prisma.test.findFirst({
                    where: { id: testId, createdById: socket.userId },
                });
                if (!test) {
                    socket.emit('error', { message: 'Test not found or access denied' });
                    return;
                }
                await prisma.test.update({
                    where: { id: testId },
                    data: { status },
                });
                this.io.to(`test:${testId}`).emit('test:status_updated', {
                    testId,
                    status,
                    updatedBy: socket.user?.name,
                    timestamp: new Date(),
                });
                logger_1.logger.info('Test status updated via WebSocket', {
                    testId,
                    status,
                    updatedBy: socket.userId,
                });
            }
            catch (error) {
                logger_1.logger.error('Failed to update test status', { error, testId, userId: socket.userId });
                socket.emit('error', { message: 'Failed to update test status' });
            }
        });
    }
    setupSessionEvents(socket) {
        socket.on('session:progress', async (data) => {
            if (socket.userType !== 'TESTER') {
                socket.emit('error', { message: 'Only testers can update session progress' });
                return;
            }
            const { sessionId, progress, currentTask } = data;
            try {
                const session = await prisma.testerSession.findFirst({
                    where: { id: sessionId, testerId: socket.userId },
                    include: { test: true },
                });
                if (!session) {
                    socket.emit('error', { message: 'Session not found or access denied' });
                    return;
                }
                this.io.to(`test:${session.testId}`).emit('session:progress_updated', {
                    sessionId,
                    testerId: socket.userId,
                    testerName: socket.user?.name,
                    progress,
                    currentTask,
                    timestamp: new Date(),
                });
                await prisma.analytics.create({
                    data: {
                        testId: session.testId,
                        userId: socket.userId,
                        event: 'session_progress',
                        data: { sessionId, progress, currentTask },
                    },
                });
                logger_1.logger.info('Session progress updated', {
                    sessionId,
                    testerId: socket.userId,
                    progress,
                });
            }
            catch (error) {
                logger_1.logger.error('Failed to update session progress', { error, sessionId });
                socket.emit('error', { message: 'Failed to update progress' });
            }
        });
        socket.on('session:screen_event', async (data) => {
            if (socket.userType !== 'TESTER')
                return;
            const { sessionId, eventType, eventData } = data;
            try {
                const session = await prisma.testerSession.findFirst({
                    where: { id: sessionId, testerId: socket.userId },
                });
                if (!session)
                    return;
                this.io.to(`test:${session.testId}`).emit('session:screen_event', {
                    sessionId,
                    testerId: socket.userId,
                    eventType,
                    eventData,
                    timestamp: new Date(),
                });
                if (['click', 'scroll', 'navigation'].includes(eventType)) {
                    await prisma.analytics.create({
                        data: {
                            testId: session.testId,
                            userId: socket.userId,
                            event: `screen_${eventType}`,
                            data: { sessionId, ...eventData },
                        },
                    });
                }
            }
            catch (error) {
                logger_1.logger.error('Failed to process screen event', { error, sessionId });
            }
        });
        socket.on('session:completed', async (data) => {
            if (socket.userType !== 'TESTER')
                return;
            const { sessionId, feedback, rating } = data;
            try {
                const session = await prisma.testerSession.findFirst({
                    where: { id: sessionId, testerId: socket.userId },
                    include: { test: true },
                });
                if (!session)
                    return;
                await prisma.testerSession.update({
                    where: { id: sessionId },
                    data: {
                        status: 'COMPLETED',
                        completedAt: new Date(),
                        feedback,
                        rating,
                    },
                });
                this.io.to(`test:${session.testId}`).emit('session:completed', {
                    sessionId,
                    testerId: socket.userId,
                    testerName: socket.user?.name,
                    feedback,
                    rating,
                    timestamp: new Date(),
                });
                const customer = await prisma.user.findUnique({
                    where: { id: session.test.createdById },
                });
                if (customer) {
                    this.sendNotificationToUser(customer.id, {
                        type: 'session_completed',
                        title: 'Test Session Completed',
                        message: `${socket.user?.name} completed testing "${session.test.title}"`,
                        data: { sessionId, testId: session.testId },
                    });
                }
                logger_1.logger.info('Session completed via WebSocket', {
                    sessionId,
                    testerId: socket.userId,
                    rating,
                });
            }
            catch (error) {
                logger_1.logger.error('Failed to complete session', { error, sessionId });
            }
        });
    }
    setupNotificationEvents(socket) {
        socket.on('notification:read', async (data) => {
            const { notificationId } = data;
            try {
                await prisma.notification.updateMany({
                    where: { id: notificationId, userId: socket.userId },
                    data: { read: true, readAt: new Date() },
                });
                socket.emit('notification:read_confirmed', { notificationId });
            }
            catch (error) {
                logger_1.logger.error('Failed to mark notification as read', { error, notificationId });
            }
        });
        socket.on('notification:get_count', async () => {
            try {
                const count = await prisma.notification.count({
                    where: { userId: socket.userId, read: false },
                });
                socket.emit('notification:count', { count });
            }
            catch (error) {
                logger_1.logger.error('Failed to get notification count', { error, userId: socket.userId });
            }
        });
    }
    handleDisconnection(socket) {
        logger_1.logger.info('User disconnected from WebSocket', {
            userId: socket.userId,
            socketId: socket.id,
        });
        if (socket.userId) {
            this.connectedUsers.delete(socket.userId);
        }
        this.testRooms.forEach((sockets, testId) => {
            if (sockets.has(socket.id)) {
                sockets.delete(socket.id);
                socket.to(`test:${testId}`).emit('user:left', {
                    userId: socket.userId,
                    userName: socket.user?.name,
                    timestamp: new Date(),
                });
            }
        });
    }
    async sendNotificationToUser(userId, notification) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.io.to(socketId).emit('notification:new', notification);
        }
        await prisma.notification.create({
            data: {
                userId,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                data: notification.data,
            },
        });
        logger_1.logger.info('Notification sent to user', { userId, type: notification.type });
    }
    broadcastToTest(testId, event, data) {
        this.io.to(`test:${testId}`).emit(event, data);
        logger_1.logger.info('Broadcast to test room', { testId, event });
    }
    broadcastToUser(userId, event, data) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.io.to(socketId).emit(event, data);
        }
    }
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }
    getTestRoomParticipants(testId) {
        return this.testRooms.get(testId)?.size || 0;
    }
    async verifyTestAccess(userId, testId, userType) {
        if (userType === 'CUSTOMER') {
            const test = await prisma.test.findFirst({
                where: { id: testId, createdById: userId },
            });
            return !!test;
        }
        if (userType === 'TESTER') {
            const test = await prisma.test.findFirst({
                where: { id: testId, status: { in: ['PUBLISHED', 'RUNNING'] } },
            });
            return !!test;
        }
        return userType === 'ADMIN';
    }
    async getTestStatus(testId) {
        const test = await prisma.test.findUnique({
            where: { id: testId },
            include: {
                testerSessions: {
                    select: {
                        id: true,
                        status: true,
                        tester: {
                            select: { id: true, name: true },
                        },
                    },
                },
                _count: {
                    select: { testerSessions: true },
                },
            },
        });
        return {
            id: test?.id,
            title: test?.title,
            status: test?.status,
            currentTesters: test?.currentTesters,
            maxTesters: test?.maxTesters,
            activeSessions: test?.testerSessions.filter(s => s.status === 'IN_PROGRESS').length,
            completedSessions: test?.testerSessions.filter(s => s.status === 'COMPLETED').length,
            participants: test?.testerSessions.map(s => ({
                id: s.tester.id,
                name: s.tester.name,
                status: s.status,
            })),
        };
    }
}
exports.SocketManager = SocketManager;
exports.default = SocketManager;
//# sourceMappingURL=socketManager.js.map