/**
 * Analytics Routes
 * Data analytics and insights endpoints
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateRequest, commonSchemas } from '@/middleware/validation';
import { requireRole } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { NotFoundError, AuthorizationError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { AuthenticatedRequest } from '@/middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/v1/analytics/dashboard
 * Get dashboard analytics for current user
 */
router.get('/dashboard',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const userType = req.user!.userType;

    let analytics: any = {};

    if (userType === 'CUSTOMER') {
      // Customer analytics
      const [
        testsOverview,
        recentTestsPerformance,
        testerDemographics,
        deviceBreakdown,
        regionBreakdown,
      ] = await Promise.all([
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
    } else if (userType === 'TESTER') {
      // Tester analytics
      const [
        earningsOverview,
        testingActivity,
        performanceMetrics,
        skillsBreakdown,
      ] = await Promise.all([
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
  })
);

/**
 * GET /api/v1/analytics/tests/:id
 * Get detailed analytics for a specific test
 */
router.get('/tests/:id',
  requireRole('CUSTOMER'),
  validateRequest({ params: commonSchemas.id }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify test ownership
    const test = await prisma.test.findUnique({
      where: { id },
      select: { id: true, createdById: true, title: true },
    });

    if (!test) {
      throw new NotFoundError('Test');
    }

    if (test.createdById !== userId) {
      throw new AuthorizationError('You can only view analytics for your own tests');
    }

    const [
      sessionMetrics,
      completionFunnel,
      userFeedback,
      devicePerformance,
      timeAnalysis,
      taskAnalysis,
    ] = await Promise.all([
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
  })
);

/**
 * GET /api/v1/analytics/platform
 * Get platform-wide analytics (admin only)
 */
router.get('/platform',
  requireRole('ADMIN'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const [
      platformOverview,
      userGrowth,
      testingVolume,
      revenueMetrics,
      ethiopianMarketInsights,
    ] = await Promise.all([
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
  })
);

/**
 * POST /api/v1/analytics/events
 * Track custom analytics events
 */
router.post('/events',
  validateRequest({
    body: {
      event: { type: 'string' },
      data: { type: 'object' },
      testId: { type: 'string', optional: true },
    },
  }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
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
  })
);

/**
 * Helper functions for analytics calculations
 */

async function getCustomerTestsOverview(userId: string) {
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

async function getRecentTestsPerformance(userId: string) {
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

async function getTesterDemographics(userId: string) {
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

  // Process demographics data
  const ageGroups = {};
  const educationLevels = {};
  const cities = {};
  const regions = {};

  demographics.forEach(session => {
    const profile = session.tester.testerProfile;
    if (profile) {
      if (profile.age) ageGroups[profile.age] = (ageGroups[profile.age] || 0) + 1;
      if (profile.education) educationLevels[profile.education] = (educationLevels[profile.education] || 0) + 1;
      if (profile.city) cities[profile.city] = (cities[profile.city] || 0) + 1;
      if (profile.region) regions[profile.region] = (regions[profile.region] || 0) + 1;
    }
  });

  return {
    ageGroups,
    educationLevels,
    cities,
    regions,
  };
}

async function getDeviceBreakdown(userId: string) {
  const deviceData = await prisma.analytics.findMany({
    where: {
      event: 'device_info',
      test: { createdById: userId },
    },
    select: { data: true },
  });

  const devices = {};
  deviceData.forEach(record => {
    const deviceType = record.data?.deviceType || 'unknown';
    devices[deviceType] = (devices[deviceType] || 0) + 1;
  });

  return devices;
}

async function getRegionBreakdown(userId: string) {
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

async function getTesterEarningsOverview(userId: string) {
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

async function getTesterActivity(userId: string) {
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

async function getTesterPerformanceMetrics(userId: string) {
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
  const completionRate = sessions.length; // This would need more complex calculation in real scenario

  return {
    averageRating,
    averageDuration,
    completionRate,
    totalCompletedTests: sessions.length,
  };
}

async function getTesterSkillsBreakdown(userId: string) {
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
    const testType = session.test.testType;
    const platform = session.test.platform;

    testTypes[testType] = (testTypes[testType] || 0) + 1;
    platforms[platform] = (platforms[platform] || 0) + 1;
  });

  return {
    testTypes,
    platforms,
  };
}

// Additional helper functions for test-specific analytics
async function getTestSessionMetrics(testId: string) {
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

async function getTestCompletionFunnel(testId: string) {
  const sessions = await prisma.testerSession.findMany({
    where: { testId },
    select: { status: true },
  });

  const statusCounts = sessions.reduce((acc, session) => {
    acc[session.status] = (acc[session.status] || 0) + 1;
    return acc;
  }, {});

  return statusCounts;
}

async function getTestUserFeedback(testId: string) {
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

async function getTestDevicePerformance(testId: string) {
  const deviceData = await prisma.analytics.findMany({
    where: {
      testId,
      event: 'device_info',
    },
    select: { data: true },
  });

  const devices = {};
  deviceData.forEach(record => {
    const deviceType = record.data?.deviceType || 'unknown';
    devices[deviceType] = (devices[deviceType] || 0) + 1;
  });

  return devices;
}

async function getTestTimeAnalysis(testId: string) {
  const sessions = await prisma.testerSession.findMany({
    where: { testId, status: 'COMPLETED' },
    select: {
      duration: true,
      createdAt: true,
    },
  });

  // Group by hour of day
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

async function getTestTaskAnalysis(testId: string) {
  const sessions = await prisma.testerSession.findMany({
    where: { testId, taskResults: { not: null } },
    select: { taskResults: true },
  });

  // This would analyze task completion rates from taskResults JSON
  // Implementation depends on the structure of taskResults
  return {
    taskCompletionRates: {},
    commonFailurePoints: [],
  };
}

// Platform-wide analytics (admin only)
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
  // Implementation for user growth over time
  return {};
}

async function getTestingVolumeMetrics() {
  // Implementation for testing volume trends
  return {};
}

async function getRevenueMetrics() {
  // Implementation for revenue analytics
  return {};
}

async function getEthiopianMarketInsights() {
  // Implementation for Ethiopian market specific insights
  return {};
}

export default router;