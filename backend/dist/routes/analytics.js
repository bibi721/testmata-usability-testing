"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const errors_1 = require("../utils/errors");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/dashboard', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const userType = req.user.userType;
    let analytics = {};
    if (userType === 'CUSTOMER') {
        const [testsOverview, recentTestsPerformance, testerDemographics, deviceBreakdown, regionBreakdown,] = await Promise.all([
            getCustomerTestsOverview(userId),
            getRecentTestsPerformance(userId),
            getTesterDemographics(userId),
            getDeviceBreakdown(userId),
            getRegionBreakdown(userId),
        ]);
        analytics = {
            testsOverview,
            recentTestsPerformance,
            testerDemographics,
            deviceBreakdown,
            regionBreakdown,
        };
    }
    else if (userType === 'TESTER') {
        const [earningsOverview, testingActivity, performanceMetrics, skillsBreakdown,] = await Promise.all([
            getTesterEarningsOverview(userId),
            getTesterActivity(userId),
            getTesterPerformanceMetrics(userId),
            getTesterSkillsBreakdown(userId),
        ]);
        analytics = {
            earningsOverview,
            testingActivity,
            performanceMetrics,
            skillsBreakdown,
        };
    }
    res.json({
        success: true,
        data: { analytics },
    });
}));
router.get('/tests/:id', (0, auth_1.requireRole)('CUSTOMER'), (0, validation_1.validateRequest)({ params: validation_1.commonSchemas.id }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const test = await prisma.test.findUnique({
        where: { id },
        select: { id: true, createdById: true, title: true },
    });
    if (!test) {
        throw new errors_1.NotFoundError('Test');
    }
    if (test.createdById !== userId) {
        throw new errors_1.AuthorizationError('You can only view analytics for your own tests');
    }
    const [sessionMetrics, completionFunnel, userFeedback, devicePerformance, timeAnalysis, taskAnalysis,] = await Promise.all([
        getTestSessionMetrics(id),
        getTestCompletionFunnel(id),
        getTestUserFeedback(id),
        getTestDevicePerformance(id),
        getTestTimeAnalysis(id),
        getTestTaskAnalysis(id),
    ]);
    const analytics = {
        testInfo: test,
        sessionMetrics,
        completionFunnel,
        userFeedback,
        devicePerformance,
        timeAnalysis,
        taskAnalysis,
    };
    res.json({
        success: true,
        data: { analytics },
    });
}));
router.get('/platform', (0, auth_1.requireRole)('ADMIN'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const [platformOverview, userGrowth, testingVolume, revenueMetrics, ethiopianMarketInsights,] = await Promise.all([
        getPlatformOverview(),
        getUserGrowthMetrics(),
        getTestingVolumeMetrics(),
        getRevenueMetrics(),
        getEthiopianMarketInsights(),
    ]);
    const analytics = {
        platformOverview,
        userGrowth,
        testingVolume,
        revenueMetrics,
        ethiopianMarketInsights,
    };
    res.json({
        success: true,
        data: { analytics },
    });
}));
router.post('/events', (0, validation_1.validateRequest)({
    body: zod_1.z.object({
        event: zod_1.z.string(),
        data: zod_1.z.any(),
        testId: zod_1.z.string().optional(),
    }),
}), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { event, data, testId } = req.body;
    await prisma.analytics.create({
        data: {
            event,
            data,
            testId,
            userId,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
        },
    });
    res.json({
        success: true,
        message: 'Event tracked successfully',
    });
}));
async function getCustomerTestsOverview(userId) {
    const [totalTests, activeTests, completedTests, totalSpent] = await Promise.all([
        prisma.test.count({ where: { createdById: userId } }),
        prisma.test.count({
            where: { createdById: userId, status: { in: ['PUBLISHED', 'RUNNING'] } },
        }),
        prisma.test.count({
            where: { createdById: userId, status: 'COMPLETED' },
        }),
        prisma.payment.aggregate({
            where: { customerId: userId, status: 'COMPLETED' },
            _sum: { amount: true },
        }),
    ]);
    return {
        totalTests,
        activeTests,
        completedTests,
        totalSpent: totalSpent._sum.amount || 0,
    };
}
async function getRecentTestsPerformance(userId) {
    const recentTests = await prisma.test.findMany({
        where: { createdById: userId },
        include: {
            testerSessions: {
                select: {
                    status: true,
                    rating: true,
                    duration: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
    });
    return recentTests.map(test => ({
        id: test.id,
        title: test.title,
        status: test.status,
        totalSessions: test.testerSessions.length,
        completedSessions: test.testerSessions.filter(s => s.status === 'COMPLETED').length,
        averageRating: test.testerSessions.reduce((acc, s) => acc + (s.rating || 0), 0) / test.testerSessions.length || 0,
        averageDuration: test.testerSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / test.testerSessions.length || 0,
    }));
}
async function getTesterDemographics(userId) {
    const demographics = await prisma.testerSession.findMany({
        where: {
            test: { createdById: userId },
            status: 'COMPLETED',
        },
        include: {
            tester: {
                include: {
                    testerProfile: {
                        select: {
                            age: true,
                            education: true,
                            city: true,
                            region: true,
                        },
                    },
                },
            },
        },
    });
    const ageGroups = {};
    const educationLevels = {};
    const cities = {};
    const regions = {};
    demographics.forEach(session => {
        const profile = session.tester.testerProfile;
        if (profile) {
            if (profile.age)
                ageGroups[profile.age] = (ageGroups[profile.age] || 0) + 1;
            if (profile.education)
                educationLevels[profile.education] = (educationLevels[profile.education] || 0) + 1;
            if (profile.city)
                cities[profile.city] = (cities[profile.city] || 0) + 1;
            if (profile.region)
                regions[profile.region] = (regions[profile.region] || 0) + 1;
        }
    });
    return {
        ageGroups,
        educationLevels,
        cities,
        regions,
    };
}
async function getDeviceBreakdown(userId) {
    const deviceData = await prisma.analytics.findMany({
        where: {
            event: 'device_info',
        },
        select: { data: true },
    });
    const devices = {};
    deviceData.forEach(record => {
        const json = record.data;
        const deviceType = json?.deviceType || 'unknown';
        devices[deviceType] = (devices[deviceType] || 0) + 1;
    });
    return devices;
}
async function getRegionBreakdown(userId) {
    const regionData = await prisma.testerSession.findMany({
        where: {
            test: { createdById: userId },
            status: 'COMPLETED',
        },
        include: {
            tester: {
                include: {
                    testerProfile: {
                        select: { region: true },
                    },
                },
            },
        },
    });
    const regions = {};
    regionData.forEach(session => {
        const region = session.tester.testerProfile?.region || 'Unknown';
        regions[region] = (regions[region] || 0) + 1;
    });
    return regions;
}
async function getTesterEarningsOverview(userId) {
    const [totalEarnings, thisMonth, thisWeek, pendingEarnings] = await Promise.all([
        prisma.earning.aggregate({
            where: { testerId: userId, status: 'COMPLETED' },
            _sum: { amount: true },
            _count: { _all: true },
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
        prisma.earning.aggregate({
            where: {
                testerId: userId,
                status: 'COMPLETED',
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            },
            _sum: { amount: true },
        }),
        prisma.earning.aggregate({
            where: { testerId: userId, status: 'PENDING' },
            _sum: { amount: true },
        }),
    ]);
    return {
        totalEarnings: totalEarnings._sum.amount || 0,
        totalTests: totalEarnings._count,
        thisMonthEarnings: thisMonth._sum.amount || 0,
        thisWeekEarnings: thisWeek._sum.amount || 0,
        pendingEarnings: pendingEarnings._sum.amount || 0,
    };
}
async function getTesterActivity(userId) {
    const activity = await prisma.testerSession.findMany({
        where: { testerId: userId },
        include: {
            test: {
                select: { title: true, paymentPerTester: true },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
    });
    return activity.map(session => ({
        date: session.createdAt,
        testTitle: session.test.title,
        status: session.status,
        duration: session.duration,
        rating: session.rating,
        earnings: session.status === 'COMPLETED' ? session.test.paymentPerTester : 0,
    }));
}
async function getTesterPerformanceMetrics(userId) {
    const sessions = await prisma.testerSession.findMany({
        where: { testerId: userId, status: 'COMPLETED' },
        select: {
            rating: true,
            duration: true,
            createdAt: true,
        },
    });
    const averageRating = sessions.reduce((acc, s) => acc + (s.rating || 0), 0) / sessions.length || 0;
    const averageDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / sessions.length || 0;
    const completionRate = sessions.length;
    return {
        averageRating,
        averageDuration,
        completionRate,
        totalCompletedTests: sessions.length,
    };
}
async function getTesterSkillsBreakdown(userId) {
    const sessions = await prisma.testerSession.findMany({
        where: { testerId: userId, status: 'COMPLETED' },
        include: {
            test: {
                select: { testType: true, platform: true },
            },
        },
    });
    const testTypes = {};
    const platforms = {};
    sessions.forEach(session => {
        const testType = String(session.test.testType);
        const platform = String(session.test.platform);
        testTypes[testType] = (testTypes[testType] || 0) + 1;
        platforms[platform] = (platforms[platform] || 0) + 1;
    });
    return {
        testTypes,
        platforms,
    };
}
async function getTestSessionMetrics(testId) {
    const sessions = await prisma.testerSession.findMany({
        where: { testId },
        select: {
            status: true,
            duration: true,
            rating: true,
            createdAt: true,
        },
    });
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
    const averageRating = sessions.reduce((acc, s) => acc + (s.rating || 0), 0) / sessions.length || 0;
    const averageDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / sessions.length || 0;
    return {
        totalSessions,
        completedSessions,
        completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
        averageRating,
        averageDuration,
    };
}
async function getTestCompletionFunnel(testId) {
    const sessions = await prisma.testerSession.findMany({
        where: { testId },
        select: { status: true },
    });
    const statusCounts = sessions.reduce((acc, session) => {
        const key = String(session.status);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
    return statusCounts;
}
async function getTestUserFeedback(testId) {
    const feedback = await prisma.testerSession.findMany({
        where: { testId, feedback: { not: null } },
        select: {
            feedback: true,
            rating: true,
            tester: {
                select: { name: true },
            },
        },
    });
    return feedback;
}
async function getTestDevicePerformance(testId) {
    const deviceData = await prisma.analytics.findMany({
        where: {
            testId: testId,
            event: 'device_info',
        },
        select: { data: true },
    });
    const devices = {};
    deviceData.forEach(record => {
        const json = record.data;
        const deviceType = (json && json.deviceType) ? String(json.deviceType) : 'unknown';
        devices[deviceType] = (devices[deviceType] || 0) + 1;
    });
    return devices;
}
async function getTestTimeAnalysis(testId) {
    const sessions = await prisma.testerSession.findMany({
        where: { testId, status: 'COMPLETED' },
        select: {
            duration: true,
            createdAt: true,
        },
    });
    const hourlyData = {};
    sessions.forEach(session => {
        const hour = new Date(session.createdAt).getHours();
        hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });
    return {
        hourlyDistribution: hourlyData,
        averageDuration: sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / sessions.length || 0,
    };
}
async function getTestTaskAnalysis(testId) {
    const sessions = await prisma.testerSession.findMany({
        where: { testId, taskResults: { not: null } },
        select: { taskResults: true },
    });
    return {
        taskCompletionRates: {},
        commonFailurePoints: [],
    };
}
async function getPlatformOverview() {
    const [totalUsers, totalTests, totalEarnings, activeTesters] = await Promise.all([
        prisma.user.count(),
        prisma.test.count(),
        prisma.earning.aggregate({
            where: { status: 'COMPLETED' },
            _sum: { amount: true },
        }),
        prisma.user.count({
            where: {
                userType: 'TESTER',
                status: 'ACTIVE',
                testerProfile: { isVerified: true },
            },
        }),
    ]);
    return {
        totalUsers,
        totalTests,
        totalEarnings: totalEarnings._sum.amount || 0,
        activeTesters,
    };
}
async function getUserGrowthMetrics() {
    return {};
}
async function getTestingVolumeMetrics() {
    return {};
}
async function getRevenueMetrics() {
    return {};
}
async function getEthiopianMarketInsights() {
    return {};
}
exports.default = router;
//# sourceMappingURL=analytics.js.map