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
router.get('/profile', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            userType: true,
            status: true,
            emailVerified: true,
            createdAt: true,
            customerProfile: {
                select: {
                    company: true,
                    website: true,
                    industry: true,
                    companySize: true,
                    plan: true,
                    testsCreated: true,
                    totalSpent: true,
                },
            },
            testerProfile: {
                select: {
                    phone: true,
                    city: true,
                    region: true,
                    age: true,
                    education: true,
                    occupation: true,
                    experience: true,
                    languages: true,
                    devices: true,
                    internetSpeed: true,
                    availability: true,
                    motivation: true,
                    rating: true,
                    completedTests: true,
                    totalEarnings: true,
                    level: true,
                    isVerified: true,
                },
            },
        },
    });
    if (!user) {
        throw new errors_1.NotFoundError('User');
    }
    res.json({
        success: true,
        data: { user },
    });
}));
router.put('/profile', (0, validation_1.validateRequest)({ body: validation_1.userSchemas.updateProfile }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { name, avatar } = req.body;
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            ...(name && { name }),
            ...(avatar && { avatar }),
        },
        select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            userType: true,
            status: true,
            emailVerified: true,
        },
    });
    logger_1.logger.info('User profile updated', {
        userId,
        updatedFields: Object.keys(req.body),
    });
    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
    });
}));
router.put('/customer-profile', (0, auth_1.requireRole)('CUSTOMER'), (0, validation_1.validateRequest)({ body: validation_1.userSchemas.updateCustomerProfile }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const customerProfile = await prisma.customerProfile.update({
        where: { userId },
        data: req.body,
    });
    logger_1.logger.info('Customer profile updated', {
        userId,
        updatedFields: Object.keys(req.body),
    });
    res.json({
        success: true,
        message: 'Customer profile updated successfully',
        data: { customerProfile },
    });
}));
router.put('/tester-profile', (0, auth_1.requireRole)('TESTER'), (0, validation_1.validateRequest)({ body: validation_1.userSchemas.updateTesterProfile }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const testerProfile = await prisma.testerProfile.update({
        where: { userId },
        data: req.body,
    });
    logger_1.logger.info('Tester profile updated', {
        userId,
        updatedFields: Object.keys(req.body),
    });
    res.json({
        success: true,
        message: 'Tester profile updated successfully',
        data: { testerProfile },
    });
}));
router.get('/dashboard-stats', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const userType = req.user.userType;
    let stats = {};
    if (userType === 'CUSTOMER') {
        const [testsCount, totalSpent, activeTests, completedTests] = await Promise.all([
            prisma.test.count({ where: { createdById: userId } }),
            prisma.payment.aggregate({
                where: { customerId: userId, status: 'COMPLETED' },
                _sum: { amount: true },
            }),
            prisma.test.count({
                where: { createdById: userId, status: { in: ['PUBLISHED', 'RUNNING'] } },
            }),
            prisma.test.count({
                where: { createdById: userId, status: 'COMPLETED' },
            }),
        ]);
        stats = {
            totalTests: testsCount,
            activeTests,
            completedTests,
            totalSpent: totalSpent._sum.amount || 0,
        };
    }
    else if (userType === 'TESTER') {
        const [completedTests, totalEarnings, availableTests, thisMonthEarnings] = await Promise.all([
            prisma.testerSession.count({
                where: { testerId: userId, status: 'COMPLETED' },
            }),
            prisma.earning.aggregate({
                where: { testerId: userId, status: 'COMPLETED' },
                _sum: { amount: true },
            }),
            prisma.test.count({
                where: { status: 'PUBLISHED' },
            }),
            prisma.earning.aggregate({
                where: {
                    testerId: userId,
                    status: 'COMPLETED',
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
                _sum: { amount: true },
            }),
        ]);
        stats = {
            completedTests,
            totalEarnings: totalEarnings._sum.amount || 0,
            availableTests,
            thisMonthEarnings: thisMonthEarnings._sum.amount || 0,
        };
    }
    res.json({
        success: true,
        data: { stats },
    });
}));
router.get('/notifications', (0, validation_1.validateRequest)({ query: validation_1.commonSchemas.pagination }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { page, limit } = req.query;
    const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.notification.count({ where: { userId } }),
    ]);
    res.json({
        success: true,
        data: {
            notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        },
    });
}));
router.get('/notifications/unread-count', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const count = await prisma.notification.count({ where: { userId, read: false } });
    res.json({ success: true, data: { count } });
}));
router.post('/notifications/read-all', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const result = await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true, readAt: new Date() },
    });
    logger_1.logger.info('Marked all notifications as read', { userId, updated: result.count });
    res.json({ success: true, message: 'All notifications marked as read', data: { updated: result.count } });
}));
router.get('/activity', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const activity = await prisma.analytics.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 50,
    });
    res.json({ success: true, data: { activity } });
}));
router.put('/notifications/:id/read', (0, validation_1.validateRequest)({ params: validation_1.commonSchemas.id }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const notification = await prisma.notification.updateMany({
        where: { id, userId },
        data: { read: true, readAt: new Date() },
    });
    if (notification.count === 0) {
        throw new errors_1.NotFoundError('Notification');
    }
    res.json({
        success: true,
        message: 'Notification marked as read',
    });
}));
router.delete('/account', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    await prisma.user.update({
        where: { id: userId },
        data: { status: 'INACTIVE' },
    });
    logger_1.logger.info('User account deleted', { userId });
    res.json({
        success: true,
        message: 'Account deleted successfully',
    });
}));
exports.default = router;
//# sourceMappingURL=users.js.map