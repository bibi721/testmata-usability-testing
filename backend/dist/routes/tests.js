"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const emailService_1 = require("../services/emailService");
const router = (0, express_1.Router)();
const customerRouter = (0, express_1.Router)();
const testerRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/', (0, validation_1.validateRequest)({ query: validation_1.commonSchemas.pagination }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const userType = req.user.userType;
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    let whereClause = {};
    if (userType === 'CUSTOMER') {
        whereClause.createdById = userId;
    }
    else if (userType === 'TESTER') {
        whereClause.status = 'PUBLISHED';
        whereClause.createdBy = { userType: 'CUSTOMER' };
    }
    const [tests, total] = await Promise.all([
        prisma.test.findMany({
            where: whereClause,
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                _count: {
                    select: {
                        testerSessions: true,
                        testSessions: true,
                    },
                },
            },
            orderBy: { [sortBy]: sortOrder },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.test.count({ where: whereClause }),
    ]);
    res.json({
        success: true,
        data: {
            tests,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        },
    });
}));
customerRouter.post('/:id/duplicate', (0, auth_1.requireRole)('CUSTOMER'), (0, validation_1.validateRequest)({ params: validation_1.commonSchemas.id }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const test = await prisma.test.findUnique({ where: { id } });
    if (!test)
        throw new errors_1.NotFoundError('Test');
    if (test.createdById !== userId)
        throw new errors_1.AuthorizationError('You can only duplicate your own tests');
    const copy = await prisma.test.create({
        data: {
            title: `${test.title} (Copy)`,
            description: test.description,
            instructions: test.instructions,
            testType: test.testType,
            platform: test.platform,
            targetUrl: test.targetUrl,
            maxTesters: test.maxTesters,
            paymentPerTester: test.paymentPerTester,
            estimatedDuration: test.estimatedDuration,
            requirements: test.requirements,
            tasks: test.tasks ?? undefined,
            demographics: test.demographics ?? undefined,
            createdById: userId,
            status: 'DRAFT',
        },
    });
    logger_1.logger.info('Test duplicated', { sourceId: id, newId: copy.id, userId });
    res.status(201).json({ success: true, message: 'Test duplicated', data: { test: copy } });
}));
customerRouter.post('/:id/invite-testers', (0, auth_1.requireRole)('CUSTOMER'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { emails } = req.body || {};
    const test = await prisma.test.findUnique({ where: { id }, select: { id: true, title: true, createdById: true, paymentPerTester: true } });
    if (!test)
        throw new errors_1.NotFoundError('Test');
    if (test.createdById !== userId)
        throw new errors_1.AuthorizationError('You can only invite for your own tests');
    const safeEmails = Array.isArray(emails) ? emails.filter(Boolean) : [];
    await Promise.all(safeEmails.map(email => emailService_1.emailService.sendTestInvitation(email, email.split('@')[0], {
        id: test.id,
        title: test.title,
        paymentPerTester: test.paymentPerTester,
    })));
    logger_1.logger.info('Invited testers to test', { testId: id, count: (emails || []).length, userId });
    res.json({ success: true, message: 'Invitations sent' });
}));
testerRouter.get('/available', (0, auth_1.requireRole)('TESTER'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { platform, minPay, maxDuration } = req.query;
    const where = { status: 'PUBLISHED', createdBy: { userType: 'CUSTOMER' } };
    if (platform)
        where.platform = platform;
    if (minPay)
        where.paymentPerTester = { gte: Number(minPay) };
    if (maxDuration)
        where.estimatedDuration = { lte: Number(maxDuration) };
    const tests = await prisma.test.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
            id: true,
            title: true,
            description: true,
            platform: true,
            paymentPerTester: true,
            estimatedDuration: true,
            requirements: true,
        },
    });
    res.json({ success: true, data: { tests } });
}));
customerRouter.post('/', (0, auth_1.requireRole)('CUSTOMER'), auth_1.requireEmailVerification, (0, validation_1.validateRequest)({ body: validation_1.testSchemas.createTest }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const test = await prisma.test.create({
        data: {
            ...req.body,
            createdById: userId,
        },
        include: {
            createdBy: {
                select: { id: true, name: true, email: true },
            },
        },
    });
    logger_1.logger.info('Test created', {
        testId: test.id,
        userId,
        title: test.title,
    });
    res.status(201).json({
        success: true,
        message: 'Test created successfully',
        data: { test },
    });
}));
router.get('/:id', (0, validation_1.validateRequest)({ params: validation_1.commonSchemas.id }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.userType;
    const test = await prisma.test.findUnique({
        where: { id },
        include: {
            createdBy: { select: { id: true, name: true, email: true, userType: true } },
            testAssets: true,
            testSessions: {
                include: {
                    testerSessions: {
                        include: {
                            tester: {
                                select: { id: true, name: true },
                            },
                        },
                    },
                },
            },
            _count: {
                select: {
                    testerSessions: true,
                    testSessions: true,
                },
            },
        },
    });
    if (!test) {
        throw new errors_1.NotFoundError('Test');
    }
    if (userType === 'CUSTOMER' && test.createdById !== userId) {
        throw new errors_1.AuthorizationError('You can only view your own tests');
    }
    if (userType === 'TESTER' && test.status !== 'PUBLISHED') {
        throw new errors_1.AuthorizationError('Test is not available for testing');
    }
    if (userType === 'TESTER' && test.createdBy?.userType !== 'CUSTOMER') {
        throw new errors_1.AuthorizationError('Test is not available');
    }
    res.json({
        success: true,
        data: { test },
    });
}));
customerRouter.put('/:id', (0, auth_1.requireRole)('CUSTOMER'), (0, validation_1.validateRequest)({
    params: validation_1.commonSchemas.id,
    body: validation_1.testSchemas.updateTest,
}), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const existingTest = await prisma.test.findUnique({
        where: { id },
        select: { id: true, createdById: true, status: true },
    });
    if (!existingTest) {
        throw new errors_1.NotFoundError('Test');
    }
    if (existingTest.createdById !== userId) {
        throw new errors_1.AuthorizationError('You can only update your own tests');
    }
    if (existingTest.status === 'RUNNING') {
        throw new errors_1.ApiError(400, 'Cannot update a running test');
    }
    const test = await prisma.test.update({
        where: { id },
        data: req.body,
        include: {
            createdBy: {
                select: { id: true, name: true, email: true },
            },
        },
    });
    logger_1.logger.info('Test updated', {
        testId: id,
        userId,
        updatedFields: Object.keys(req.body),
    });
    res.json({
        success: true,
        message: 'Test updated successfully',
        data: { test },
    });
}));
customerRouter.post('/:id/publish', (0, auth_1.requireRole)('CUSTOMER'), (0, validation_1.validateRequest)({ params: validation_1.commonSchemas.id }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const existingTest = await prisma.test.findUnique({
        where: { id },
        select: {
            id: true,
            createdById: true,
            status: true,
            title: true,
            paymentPerTester: true,
            maxTesters: true,
        },
    });
    if (!existingTest) {
        throw new errors_1.NotFoundError('Test');
    }
    if (existingTest.createdById !== userId) {
        throw new errors_1.AuthorizationError('You can only publish your own tests');
    }
    if (existingTest.status !== 'DRAFT') {
        throw new errors_1.ApiError(400, 'Only draft tests can be published');
    }
    const test = await prisma.test.update({
        where: { id },
        data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
        },
    });
    const eligibleTesters = await prisma.user.findMany({
        where: {
            userType: 'TESTER',
            status: 'ACTIVE',
            testerProfile: {
                isVerified: true,
            },
        },
        include: {
            testerProfile: true,
        },
        take: existingTest.maxTesters * 2,
    });
    Promise.all(eligibleTesters.map(tester => emailService_1.emailService.sendTestInvitation(tester.email, tester.name, {
        id: test.id,
        title: test.title,
        paymentPerTester: test.paymentPerTester,
    }))).catch(error => {
        logger_1.logger.error('Failed to send test invitations', { error, testId: id });
    });
    logger_1.logger.info('Test published', {
        testId: id,
        userId,
        invitedTesters: eligibleTesters.length,
    });
    res.json({
        success: true,
        message: 'Test published successfully',
        data: { test },
    });
}));
customerRouter.post('/:id/pause', (0, auth_1.requireRole)('CUSTOMER'), (0, validation_1.validateRequest)({ params: validation_1.commonSchemas.id }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const test = await prisma.test.findUnique({
        where: { id },
        select: { id: true, createdById: true, status: true },
    });
    if (!test) {
        throw new errors_1.NotFoundError('Test');
    }
    if (test.createdById !== userId) {
        throw new errors_1.AuthorizationError('You can only pause your own tests');
    }
    if (test.status !== 'RUNNING') {
        throw new errors_1.ApiError(400, 'Only running tests can be paused');
    }
    const updatedTest = await prisma.test.update({
        where: { id },
        data: { status: 'PAUSED' },
    });
    logger_1.logger.info('Test paused', { testId: id, userId });
    res.json({
        success: true,
        message: 'Test paused successfully',
        data: { test: updatedTest },
    });
}));
customerRouter.post('/:id/complete', (0, auth_1.requireRole)('CUSTOMER'), (0, validation_1.validateRequest)({ params: validation_1.commonSchemas.id }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const test = await prisma.test.findUnique({
        where: { id },
        include: {
            createdBy: true,
            testerSessions: {
                where: { status: 'COMPLETED' },
            },
        },
    });
    if (!test) {
        throw new errors_1.NotFoundError('Test');
    }
    if (test.createdById !== userId) {
        throw new errors_1.AuthorizationError('You can only complete your own tests');
    }
    if (test.status === 'COMPLETED') {
        throw new errors_1.ApiError(400, 'Test is already completed');
    }
    const updatedTest = await prisma.test.update({
        where: { id },
        data: {
            status: 'COMPLETED',
            completedAt: new Date(),
        },
    });
    if (test.createdBy) {
        emailService_1.emailService.sendTestCompletionNotification(test.createdBy.email, test.createdBy.name, {
            id: test.id,
            title: test.title,
            completedTesters: test.testerSessions.length,
        }).catch(error => {
            logger_1.logger.error('Failed to send test completion notification', { error, testId: id });
        });
    }
    logger_1.logger.info('Test completed', {
        testId: id,
        userId,
        completedTesters: test.testerSessions?.length || 0,
    });
    res.json({
        success: true,
        message: 'Test completed successfully',
        data: { test: updatedTest },
    });
}));
customerRouter.delete('/:id', (0, auth_1.requireRole)('CUSTOMER'), (0, validation_1.validateRequest)({ params: validation_1.commonSchemas.id }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const test = await prisma.test.findUnique({
        where: { id },
        select: {
            id: true,
            createdById: true,
            status: true,
            _count: {
                select: { testerSessions: true },
            },
        },
    });
    if (!test) {
        throw new errors_1.NotFoundError('Test');
    }
    if (test.createdById !== userId) {
        throw new errors_1.AuthorizationError('You can only delete your own tests');
    }
    if (test.status === 'RUNNING' || test._count.testerSessions > 0) {
        throw new errors_1.ApiError(400, 'Cannot delete a test that has started or has tester sessions');
    }
    await prisma.test.delete({ where: { id } });
    logger_1.logger.info('Test deleted', { testId: id, userId });
    res.json({
        success: true,
        message: 'Test deleted successfully',
    });
}));
customerRouter.get('/:id/analytics', (0, auth_1.requireRole)('CUSTOMER'), (0, validation_1.validateRequest)({ params: validation_1.commonSchemas.id }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const test = await prisma.test.findUnique({
        where: { id },
        select: { id: true, createdById: true },
    });
    if (!test) {
        throw new errors_1.NotFoundError('Test');
    }
    if (test.createdById !== userId) {
        throw new errors_1.AuthorizationError('You can only view analytics for your own tests');
    }
    const [testerSessions, completionRate, averageRating, deviceBreakdown, regionBreakdown,] = await Promise.all([
        prisma.testerSession.findMany({
            where: { testId: id },
            include: {
                tester: {
                    include: {
                        testerProfile: {
                            select: { city: true, region: true },
                        },
                    },
                },
            },
        }),
        prisma.testerSession.aggregate({
            where: { testId: id },
            _avg: { duration: true },
            _count: { _all: true },
        }),
        prisma.testerSession.aggregate({
            where: { testId: id, status: 'COMPLETED' },
            _avg: { rating: true },
        }),
        prisma.analytics.groupBy({
            by: ['data'],
            where: {
                testId: id,
                event: 'device_info',
            },
            _count: { _all: true },
        }),
        prisma.analytics.groupBy({
            by: ['data'],
            where: {
                testId: id,
                event: 'location_info',
            },
            _count: { _all: true },
        }),
    ]);
    const analytics = {
        totalSessions: testerSessions.length,
        completedSessions: testerSessions.filter(s => s.status === 'COMPLETED').length,
        averageRating: averageRating._avg.rating || 0,
        averageDuration: completionRate._avg.duration || 0,
        deviceBreakdown,
        regionBreakdown,
        testerSessions: testerSessions.map(session => ({
            id: session.id,
            status: session.status,
            duration: session.duration,
            rating: session.rating,
            feedback: session.feedback,
            tester: {
                name: session.tester.name,
                city: session.tester.testerProfile?.city,
                region: session.tester.testerProfile?.region,
            },
            createdAt: session.createdAt,
            completedAt: session.completedAt,
        })),
    };
    res.json({
        success: true,
        data: { analytics },
    });
}));
router.use('/customer', customerRouter);
router.use('/tester', testerRouter);
exports.default = router;
//# sourceMappingURL=tests.js.map