/**
 * Test Management Routes
 * Test creation, management, and execution endpoints
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateRequest, testSchemas, commonSchemas } from '@/middleware/validation';
import { requireRole, requireEmailVerification } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { ApiError, NotFoundError, AuthorizationError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { AuthenticatedRequest } from '@/middleware/auth';
import { emailService } from '@/services/emailService';

const router = Router();
const customerRouter = Router();
const testerRouter = Router();
const prisma = new PrismaClient();

/**
 * GET /api/v1/tests
 * Get tests (filtered by user role)
 */
router.get('/',
  validateRequest({ query: commonSchemas.pagination }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const userType = req.user!.userType;
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as any;

    let whereClause: any = {};

    if (userType === 'CUSTOMER') {
      // Customers see only their own tests
      whereClause.createdById = userId;
    } else if (userType === 'TESTER') {
      // Testers see only published tests
      whereClause.status = 'PUBLISHED';
      // Ensure testers see only tests created by customers
      whereClause.createdBy = { userType: 'CUSTOMER' } as any;
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
  })
);

/**
 * POST /api/v1/tests/:id/duplicate
 * Duplicate a test (customer only)
 */
customerRouter.post('/:id/duplicate',
  requireRole('CUSTOMER'),
  validateRequest({ params: commonSchemas.id }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const test = await prisma.test.findUnique({ where: { id } });
    if (!test) throw new NotFoundError('Test');
    if (test.createdById !== userId) throw new AuthorizationError('You can only duplicate your own tests');

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
        // Preserve JSON fields safely
        tasks: (test as any).tasks ?? undefined,
        demographics: (test as any).demographics ?? undefined,
        createdById: userId,
        status: 'DRAFT',
      },
    });

    logger.info('Test duplicated', { sourceId: id, newId: copy.id, userId });

    res.status(201).json({ success: true, message: 'Test duplicated', data: { test: copy } });
  })
);

/**
 * POST /api/v1/tests/:id/invite-testers
 * Invite a list of tester emails (customer only)
 */
customerRouter.post('/:id/invite-testers',
  requireRole('CUSTOMER'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params as any;
    const userId = req.user!.id;
    const { emails } = (req.body as { emails?: string[] }) || {};

    const test = await prisma.test.findUnique({ where: { id }, select: { id: true, title: true, createdById: true, paymentPerTester: true } });
    if (!test) throw new NotFoundError('Test');
    if (test.createdById !== userId) throw new AuthorizationError('You can only invite for your own tests');

    const safeEmails = Array.isArray(emails) ? emails.filter(Boolean) : [];
    await Promise.all(
      safeEmails.map(email =>
        emailService.sendTestInvitation(email, email.split('@')[0], {
          id: test.id,
          title: test.title,
          paymentPerTester: test.paymentPerTester,
        })
      )
    );

    logger.info('Invited testers to test', { testId: id, count: (emails || []).length, userId });
    res.json({ success: true, message: 'Invitations sent' });
  })
);

/**
 * GET /api/v1/tests/available
 * Tester available tests with filters (tester only)
 */
testerRouter.get('/available',
  requireRole('TESTER'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { platform, minPay, maxDuration } = req.query as any;

    const where: any = { status: 'PUBLISHED', createdBy: { userType: 'CUSTOMER' } };
    if (platform) where.platform = platform;
    if (minPay) where.paymentPerTester = { gte: Number(minPay) };
    if (maxDuration) where.estimatedDuration = { lte: Number(maxDuration) };

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
  })
);

/**
 * POST /api/v1/tests
 * Create a new test
 */
customerRouter.post('/',
  requireRole('CUSTOMER'),
  requireEmailVerification,
  validateRequest({ body: testSchemas.createTest }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;

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

    logger.info('Test created', {
      testId: test.id,
      userId,
      title: test.title,
    });

    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: { test },
    });
  })
);

/**
 * GET /api/v1/tests/:id
 * Get test details
 */
router.get('/:id',
  validateRequest({ params: commonSchemas.id }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userType = req.user!.userType;

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
      throw new NotFoundError('Test');
    }

    // Authorization check
    if (userType === 'CUSTOMER' && test.createdById !== userId) {
      throw new AuthorizationError('You can only view your own tests');
    }

    if (userType === 'TESTER' && test.status !== 'PUBLISHED') {
      throw new AuthorizationError('Test is not available for testing');
    }

    if (userType === 'TESTER' && (test as any).createdBy?.userType !== 'CUSTOMER') {
      throw new AuthorizationError('Test is not available');
    }

    res.json({
      success: true,
      data: { test },
    });
  })
);

/**
 * PUT /api/v1/tests/:id
 * Update test
 */
customerRouter.put('/:id',
  requireRole('CUSTOMER'),
  validateRequest({ 
    params: commonSchemas.id,
    body: testSchemas.updateTest,
  }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if test exists and user owns it
    const existingTest = await prisma.test.findUnique({
      where: { id },
      select: { id: true, createdById: true, status: true },
    });

    if (!existingTest) {
      throw new NotFoundError('Test');
    }

    if (existingTest.createdById !== userId) {
      throw new AuthorizationError('You can only update your own tests');
    }

    if (existingTest.status === 'RUNNING') {
      throw new ApiError(400, 'Cannot update a running test');
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

    logger.info('Test updated', {
      testId: id,
      userId,
      updatedFields: Object.keys(req.body),
    });

    res.json({
      success: true,
      message: 'Test updated successfully',
      data: { test },
    });
  })
);

/**
 * POST /api/v1/tests/:id/publish
 * Publish test to make it available for testers
 */
customerRouter.post('/:id/publish',
  requireRole('CUSTOMER'),
  validateRequest({ params: commonSchemas.id }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if test exists and user owns it
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
      throw new NotFoundError('Test');
    }

    if (existingTest.createdById !== userId) {
      throw new AuthorizationError('You can only publish your own tests');
    }

    if (existingTest.status !== 'DRAFT') {
      throw new ApiError(400, 'Only draft tests can be published');
    }

    const test = await prisma.test.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    // Find eligible testers and send invitations
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
      take: existingTest.maxTesters * 2, // Invite more than needed
    });

    // Send test invitations (async)
    Promise.all(
      eligibleTesters.map(tester =>
        emailService.sendTestInvitation(tester.email, tester.name, {
          id: test.id,
          title: test.title,
          paymentPerTester: test.paymentPerTester,
        })
      )
    ).catch(error => {
      logger.error('Failed to send test invitations', { error, testId: id });
    });

    logger.info('Test published', {
      testId: id,
      userId,
      invitedTesters: eligibleTesters.length,
    });

    res.json({
      success: true,
      message: 'Test published successfully',
      data: { test },
    });
  })
);

/**
 * POST /api/v1/tests/:id/pause
 * Pause a running test
 */
customerRouter.post('/:id/pause',
  requireRole('CUSTOMER'),
  validateRequest({ params: commonSchemas.id }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const test = await prisma.test.findUnique({
      where: { id },
      select: { id: true, createdById: true, status: true },
    });

    if (!test) {
      throw new NotFoundError('Test');
    }

    if (test.createdById !== userId) {
      throw new AuthorizationError('You can only pause your own tests');
    }

    if (test.status !== 'RUNNING') {
      throw new ApiError(400, 'Only running tests can be paused');
    }

    const updatedTest = await prisma.test.update({
      where: { id },
      data: { status: 'PAUSED' },
    });

    logger.info('Test paused', { testId: id, userId });

    res.json({
      success: true,
      message: 'Test paused successfully',
      data: { test: updatedTest },
    });
  })
);

/**
 * POST /api/v1/tests/:id/complete
 * Mark test as completed
 */
customerRouter.post('/:id/complete',
  requireRole('CUSTOMER'),
  validateRequest({ params: commonSchemas.id }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

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
      throw new NotFoundError('Test');
    }

    if (test.createdById !== userId) {
      throw new AuthorizationError('You can only complete your own tests');
    }

    if (test.status === 'COMPLETED') {
      throw new ApiError(400, 'Test is already completed');
    }

    const updatedTest = await prisma.test.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Send completion notification
    if (test.createdBy) {
      emailService.sendTestCompletionNotification(
        (test as any).createdBy.email,
        (test as any).createdBy.name,
      {
        id: test.id,
        title: test.title,
        completedTesters: (test as any).testerSessions.length,
      }
      ).catch(error => {
        logger.error('Failed to send test completion notification', { error, testId: id });
      });
    }

    logger.info('Test completed', {
      testId: id,
      userId,
      completedTesters: (test as any).testerSessions?.length || 0,
    });

    res.json({
      success: true,
      message: 'Test completed successfully',
      data: { test: updatedTest },
    });
  })
);

/**
 * DELETE /api/v1/tests/:id
 * Delete test (only if not started)
 */
customerRouter.delete('/:id',
  requireRole('CUSTOMER'),
  validateRequest({ params: commonSchemas.id }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

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
      throw new NotFoundError('Test');
    }

    if (test.createdById !== userId) {
      throw new AuthorizationError('You can only delete your own tests');
    }

    if (test.status === 'RUNNING' || test._count.testerSessions > 0) {
      throw new ApiError(400, 'Cannot delete a test that has started or has tester sessions');
    }

    await prisma.test.delete({ where: { id } });

    logger.info('Test deleted', { testId: id, userId });

    res.json({
      success: true,
      message: 'Test deleted successfully',
    });
  })
);

/**
 * GET /api/v1/tests/:id/analytics
 * Get test analytics
 */
customerRouter.get('/:id/analytics',
  requireRole('CUSTOMER'),
  validateRequest({ params: commonSchemas.id }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const test = await prisma.test.findUnique({
      where: { id },
      select: { id: true, createdById: true },
    });

    if (!test) {
      throw new NotFoundError('Test');
    }

    if (test.createdById !== userId) {
      throw new AuthorizationError('You can only view analytics for your own tests');
    }

    // Get analytics data
    const [
      testerSessions,
      completionRate,
      averageRating,
      deviceBreakdown,
      regionBreakdown,
    ] = await Promise.all([
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
  })
);

// mount sub-routers under role paths
router.use('/customer', customerRouter);
router.use('/tester', testerRouter);

export default router;