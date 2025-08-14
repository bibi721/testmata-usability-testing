/**
 * User Management Routes
 * User profile and account management endpoints
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateRequest, userSchemas, commonSchemas } from '@/middleware/validation';
import { requireRole, requireEmailVerification } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { ApiError, NotFoundError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { AuthenticatedRequest } from '@/middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/v1/users/profile
 * Get current user's profile
 */
router.get('/profile',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    
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
      throw new NotFoundError('User');
    }

    res.json({
      success: true,
      data: { user },
    });
  })
);

/**
 * PUT /api/v1/users/profile
 * Update user profile
 */
router.put('/profile',
  validateRequest({ body: userSchemas.updateProfile }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
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

    logger.info('User profile updated', {
      userId,
      updatedFields: Object.keys(req.body),
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  })
);

/**
 * PUT /api/v1/users/customer-profile
 * Update customer profile
 */
router.put('/customer-profile',
  requireRole('CUSTOMER'),
  validateRequest({ body: userSchemas.updateCustomerProfile }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;

    const customerProfile = await prisma.customerProfile.update({
      where: { userId },
      data: req.body,
    });

    logger.info('Customer profile updated', {
      userId,
      updatedFields: Object.keys(req.body),
    });

    res.json({
      success: true,
      message: 'Customer profile updated successfully',
      data: { customerProfile },
    });
  })
);

/**
 * PUT /api/v1/users/tester-profile
 * Update tester profile
 */
router.put('/tester-profile',
  requireRole('TESTER'),
  validateRequest({ body: userSchemas.updateTesterProfile }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;

    const testerProfile = await prisma.testerProfile.update({
      where: { userId },
      data: req.body,
    });

    logger.info('Tester profile updated', {
      userId,
      updatedFields: Object.keys(req.body),
    });

    res.json({
      success: true,
      message: 'Tester profile updated successfully',
      data: { testerProfile },
    });
  })
);

/**
 * GET /api/v1/users/dashboard-stats
 * Get dashboard statistics for current user
 */
router.get('/dashboard-stats',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const userType = req.user!.userType;

    let stats: any = {};

    if (userType === 'CUSTOMER') {
      // Customer dashboard stats
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
    } else if (userType === 'TESTER') {
      // Tester dashboard stats
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
  })
);

/**
 * GET /api/v1/users/notifications
 * Get user notifications
 */
router.get('/notifications',
  validateRequest({ query: commonSchemas.pagination }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const { page, limit } = req.query as any;

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
  })
);

/**
 * GET /api/v1/users/notifications/unread-count
 * Get unread notifications count
 */
router.get('/notifications/unread-count',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const count = await prisma.notification.count({ where: { userId, read: false } });
    res.json({ success: true, data: { count } });
  })
);

/**
 * POST /api/v1/users/notifications/read-all
 * Mark all notifications as read for current user
 */
router.post('/notifications/read-all',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    logger.info('Marked all notifications as read', { userId, updated: result.count });
    res.json({ success: true, message: 'All notifications marked as read', data: { updated: result.count } });
  })
);

/**
 * GET /api/v1/users/activity
 * Get recent user activity
 */
router.get('/activity',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const activity = await prisma.analytics.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: { activity } });
  })
);

/**
 * PUT /api/v1/users/notifications/:id/read
 * Mark notification as read
 */
router.put('/notifications/:id/read',
  validateRequest({ params: commonSchemas.id }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const notification = await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true, readAt: new Date() },
    });

    if (notification.count === 0) {
      throw new NotFoundError('Notification');
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  })
);

/**
 * DELETE /api/v1/users/account
 * Delete user account
 */
router.delete('/account',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;

    // Soft delete by updating status
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'INACTIVE' },
    });

    logger.info('User account deleted', { userId });

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  })
);

export default router;