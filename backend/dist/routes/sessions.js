"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/', (0, validation_1.validateRequest)({ query: validation_1.commonSchemas.pagination }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const userType = req.user.userType;
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    let whereClause = {};
    if (userType === 'TESTER') {
        whereClause.testerId = userId;
    }
    else if (userType === 'CUSTOMER') {
        whereClause.test = { createdById: userId };
    }
    const [sessions, total] = await Promise.all([
        prisma.testerSession.findMany({
            where: whereClause,
            include: {
                test: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        paymentPerTester: true,
                        estimatedDuration: true,
                        createdBy: {
                            select: { id: true, name: true },
                        },
                    },
                },
                tester: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { [sortBy]: sortOrder },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.testerSession.count({ where: whereClause }),
    ]);
    res.json({
        success: true,
        data: {
            sessions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        },
    });
}));
router.post('/start', (0, auth_1.requireRole)('TESTER'), (0, validation_1.validateRequest)({ body: validation_1.sessionSchemas.startSession }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { testId, deviceInfo } = req.body;
    const test = await prisma.test.findUnique({
        where: { id: testId },
        select: {
            id: true,
            status: true,
            maxTesters: true,
            currentTesters: true,
            title: true,
            paymentPerTester: true,
            createdById: true,
        },
    });
    if (!test) {
        throw new errors_1.NotFoundError('Test');
    }
    if (test.status !== 'PUBLISHED') {
        throw new errors_1.ApiError(400, 'Test is not available for testing');
    }
    if (test.currentTesters >= test.maxTesters) {
        throw new errors_1.ApiError(409, 'Test has reached maximum capacity');
    }
    const existingSession = await prisma.testerSession.findFirst({
        where: {
            testId,
            testerId: userId,
            status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
    });
    if (existingSession) {
        throw new errors_1.ApiError(409, 'You already have an active session for this test');
    }
    const result = await prisma.$transaction(async (tx) => {
        let testSession = await tx.testSession.findFirst({
            where: { testId, status: { in: ['PENDING', 'IN_PROGRESS'] } },
        });
        if (!testSession) {
            testSession = await tx.testSession.create({
                data: {
                    testId,
                    customerId: test.createdById,
                    status: 'IN_PROGRESS',
                    startedAt: new Date(),
                },
            });
        }
        const testerSession = await tx.testerSession.create({
            data: {
                testSessionId: testSession.id,
                testId,
                testerId: userId,
                status: 'IN_PROGRESS',
                startedAt: new Date(),
                deviceInfo,
            },
            include: {
                test: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        instructions: true,
                        tasks: true,
                        paymentPerTester: true,
                        estimatedDuration: true,
                    },
                },
            },
        });
        await tx.test.update({
            where: { id: testId },
            data: { currentTesters: { increment: 1 } },
        });
        return testerSession;
    });
    (0, logger_1.logTestSession)({
        id: result.id,
        testId,
        testerId: userId,
        status: 'IN_PROGRESS',
        action: 'session_started',
    });
    logger_1.logger.info('Test session started', {
        sessionId: result.id,
        testId,
        testerId: userId,
        testTitle: test.title,
    });
    res.status(201).json({
        success: true,
        message: 'Test session started successfully',
        data: { session: result },
    });
}));
router.put('/:id', (0, auth_1.requireRole)('TESTER'), (0, validation_1.validateRequest)({
    params: validation_1.commonSchemas.id,
    body: validation_1.sessionSchemas.updateSession,
}), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, feedback, rating, taskResults } = req.body;
    const existingSession = await prisma.testerSession.findUnique({
        where: { id },
        include: {
            test: {
                select: { id: true, title: true, paymentPerTester: true },
            },
        },
    });
    if (!existingSession) {
        throw new errors_1.NotFoundError('Session');
    }
    if (existingSession.testerId !== userId) {
        throw new errors_1.AuthorizationError('You can only update your own sessions');
    }
    if (existingSession.status === 'COMPLETED') {
        throw new errors_1.ApiError(400, 'Cannot update a completed session');
    }
    let duration;
    let completedAt;
    if (status === 'COMPLETED' && existingSession.startedAt) {
        completedAt = new Date();
        duration = Math.floor((completedAt.getTime() - existingSession.startedAt.getTime()) / 1000);
    }
    const session = await prisma.testerSession.update({
        where: { id },
        data: {
            ...(status && { status }),
            ...(feedback && { feedback }),
            ...(rating && { rating }),
            ...(taskResults && { taskResults }),
            ...(duration && { duration }),
            ...(completedAt && { completedAt }),
        },
        include: {
            test: {
                select: {
                    id: true,
                    title: true,
                    paymentPerTester: true,
                },
            },
        },
    });
    if (status === 'COMPLETED') {
        await prisma.earning.create({
            data: {
                testerId: userId,
                testerSessionId: id,
                amount: existingSession.test.paymentPerTester,
                description: `Payment for completing test: ${existingSession.test.title}`,
            },
        });
        const updatedProfile = await prisma.testerProfile.update({
            where: { userId },
            data: {
                completedTests: { increment: 1 },
                totalEarnings: { increment: existingSession.test.paymentPerTester },
            },
        });
        const ratingAgg = await prisma.testerSession.aggregate({
            where: { testerId: userId, status: 'COMPLETED', rating: { not: null } },
            _avg: { rating: true },
        });
        const newRating = ratingAgg._avg.rating || 0;
        await prisma.testerProfile.update({
            where: { userId },
            data: { rating: newRating },
        });
        (0, logger_1.logTestSession)({
            id: session.id,
            testId: session.testId,
            testerId: userId,
            status: 'COMPLETED',
            duration,
            action: 'session_completed',
        });
    }
    logger_1.logger.info('Test session updated', {
        sessionId: id,
        userId,
        updatedFields: Object.keys(req.body),
        status: session.status,
    });
    res.json({
        success: true,
        message: 'Session updated successfully',
        data: { session },
    });
}));
router.post('/:id/recording', (0, auth_1.requireRole)('TESTER'), (0, validation_1.validateRequest)({
    params: validation_1.commonSchemas.id,
    body: validation_1.sessionSchemas.submitRecording,
}), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { recordingUrl, duration } = req.body;
    const session = await prisma.testerSession.findUnique({
        where: { id },
        select: { id: true, testerId: true, status: true },
    });
    if (!session) {
        throw new errors_1.NotFoundError('Session');
    }
    if (session.testerId !== userId) {
        throw new errors_1.AuthorizationError('You can only submit recordings for your own sessions');
    }
    if (session.status !== 'IN_PROGRESS') {
        throw new errors_1.ApiError(400, 'Can only submit recordings for active sessions');
    }
    const updatedSession = await prisma.testerSession.update({
        where: { id },
        data: {
            screenRecording: recordingUrl,
            duration,
        },
    });
    logger_1.logger.info('Screen recording submitted', {
        sessionId: id,
        userId,
        recordingUrl,
        duration,
    });
    res.json({
        success: true,
        message: 'Recording submitted successfully',
        data: { session: updatedSession },
    });
}));
router.get('/:id', (0, validation_1.validateRequest)({ params: validation_1.commonSchemas.id }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.userType;
    const session = await prisma.testerSession.findUnique({
        where: { id },
        include: {
            test: {
                include: {
                    createdBy: {
                        select: { id: true, name: true, email: true },
                    },
                },
            },
            tester: {
                select: { id: true, name: true, email: true },
            },
            testSession: true,
        },
    });
    if (!session) {
        throw new errors_1.NotFoundError('Session');
    }
    if (userType === 'TESTER' && session.testerId !== userId) {
        throw new errors_1.AuthorizationError('You can only view your own sessions');
    }
    if (userType === 'CUSTOMER' && session.test.createdById !== userId) {
        throw new errors_1.AuthorizationError('You can only view sessions for your own tests');
    }
    res.json({
        success: true,
        data: { session },
    });
}));
router.delete('/:id', (0, auth_1.requireRole)('TESTER'), (0, validation_1.validateRequest)({ params: validation_1.commonSchemas.id }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const session = await prisma.testerSession.findUnique({
        where: { id },
        select: { id: true, testerId: true, status: true, testId: true },
    });
    if (!session) {
        throw new errors_1.NotFoundError('Session');
    }
    if (session.testerId !== userId) {
        throw new errors_1.AuthorizationError('You can only cancel your own sessions');
    }
    if (session.status === 'COMPLETED') {
        throw new errors_1.ApiError(400, 'Cannot cancel a completed session');
    }
    await prisma.$transaction([
        prisma.testerSession.update({
            where: { id },
            data: { status: 'CANCELLED' },
        }),
        prisma.test.update({
            where: { id: session.testId },
            data: { currentTesters: { decrement: 1 } },
        }),
    ]);
    logger_1.logger.info('Test session cancelled', {
        sessionId: id,
        userId,
        testId: session.testId,
    });
    res.json({
        success: true,
        message: 'Session cancelled successfully',
    });
}));
exports.default = router;
//# sourceMappingURL=sessions.js.map