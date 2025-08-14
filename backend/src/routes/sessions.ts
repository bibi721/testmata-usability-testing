/**
 * Test Session Routes
 * Tester session management and execution endpoints
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateRequest, sessionSchemas, commonSchemas } from '@/middleware/validation';
import { requireRole } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { ApiError, NotFoundError, AuthorizationError } from '@/utils/errors';
import { logger, logTestSession } from '@/utils/logger';
import { AuthenticatedRequest } from '@/middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/v1/sessions
 * Get user's test sessions
 */
router.get('/',
  validateRequest({ query: commonSchemas.pagination }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const userType = req.user!.userType;
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as any;

    let whereClause: any = {};

    if (userType === 'TESTER') {
      whereClause.testerId = userId;
    } else if (userType === 'CUSTOMER') {
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
  })
);

/**
 * POST /api/v1/sessions/start
 * Start a new test session
 */
router.post('/start',
  requireRole('TESTER'),
  validateRequest({ body: sessionSchemas.startSession }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const { testId, deviceInfo } = req.body;

    // Check if test exists and is available
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
      throw new NotFoundError('Test');
    }

    if (test.status !== 'PUBLISHED') {
      throw new ApiError(400, 'Test is not available for testing');
    }

    if (test.currentTesters >= test.maxTesters) {
      throw new ApiError(409, 'Test has reached maximum capacity');
    }

    // Check if user already has an active session for this test
    const existingSession = await prisma.testerSession.findFirst({
      where: {
        testId,
        testerId: userId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
    });

    if (existingSession) {
      throw new ApiError(409, 'You already have an active session for this test');
    }

    // Create test session and tester session in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create or get test session
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

      // Create tester session
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

      // Update test current testers count
      await tx.test.update({
        where: { id: testId },
        data: { currentTesters: { increment: 1 } },
      });

      return testerSession;
    });

    // Log session start
    logTestSession({
      id: result.id,
      testId,
      testerId: userId,
      status: 'IN_PROGRESS',
      action: 'session_started',
    });

    logger.info('Test session started', {
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
  })
);

/**
 * PUT /api/v1/sessions/:id
 * Update test session
 */
router.put('/:id',
  requireRole('TESTER'),
  validateRequest({
    params: commonSchemas.id,
    body: sessionSchemas.updateSession,
  }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const { status, feedback, rating, taskResults } = req.body;

    // Check if session exists and belongs to user
    const existingSession = await prisma.testerSession.findUnique({
      where: { id },
      include: {
        test: {
          select: { id: true, title: true, paymentPerTester: true },
        },
      },
    });

    if (!existingSession) {
      throw new NotFoundError('Session');
    }

    if (existingSession.testerId !== userId) {
      throw new AuthorizationError('You can only update your own sessions');
    }

    if (existingSession.status === 'COMPLETED') {
      throw new ApiError(400, 'Cannot update a completed session');
    }

    // Calculate duration if completing
    let duration: number | undefined;
    let completedAt: Date | undefined;

    if (status === 'COMPLETED' && existingSession.startedAt) {
      completedAt = new Date();
      duration = Math.floor((completedAt.getTime() - existingSession.startedAt.getTime()) / 1000);
    }

    // Update session
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

    // If session is completed, create earning record
    if (status === 'COMPLETED') {
      await prisma.earning.create({
        data: {
          testerId: userId,
          testerSessionId: id,
          amount: existingSession.test.paymentPerTester,
          description: `Payment for completing test: ${existingSession.test.title}`,
        },
      });

      // Update tester profile stats
      const updatedProfile = await prisma.testerProfile.update({
        where: { userId },
        data: {
          completedTests: { increment: 1 },
          totalEarnings: { increment: existingSession.test.paymentPerTester },
        },
      });

      // Recalculate dynamic tester rating (weighted average of session ratings)
      const ratingAgg = await prisma.testerSession.aggregate({
        where: { testerId: userId, status: 'COMPLETED', rating: { not: null } },
        _avg: { rating: true },
      });

      const newRating = ratingAgg._avg.rating || 0;
      await prisma.testerProfile.update({
        where: { userId },
        data: { rating: newRating },
      });

      // Log completion
      logTestSession({
        id: session.id,
        testId: session.testId,
        testerId: userId,
        status: 'COMPLETED',
        duration,
        action: 'session_completed',
      });
    }

    logger.info('Test session updated', {
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
  })
);

/**
 * POST /api/v1/sessions/:id/recording
 * Submit screen recording for session
 */
router.post('/:id/recording',
  requireRole('TESTER'),
  validateRequest({
    params: commonSchemas.id,
    body: sessionSchemas.submitRecording,
  }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const { recordingUrl, duration } = req.body;

    // Check if session exists and belongs to user
    const session = await prisma.testerSession.findUnique({
      where: { id },
      select: { id: true, testerId: true, status: true },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    if (session.testerId !== userId) {
      throw new AuthorizationError('You can only submit recordings for your own sessions');
    }

    if (session.status !== 'IN_PROGRESS') {
      throw new ApiError(400, 'Can only submit recordings for active sessions');
    }

    // Update session with recording
    const updatedSession = await prisma.testerSession.update({
      where: { id },
      data: {
        screenRecording: recordingUrl,
        duration,
      },
    });

    logger.info('Screen recording submitted', {
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
  })
);

/**
 * GET /api/v1/sessions/:id
 * Get session details
 */
router.get('/:id',
  validateRequest({ params: commonSchemas.id }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userType = req.user!.userType;

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
      throw new NotFoundError('Session');
    }

    // Authorization check
    if (userType === 'TESTER' && session.testerId !== userId) {
      throw new AuthorizationError('You can only view your own sessions');
    }

    if (userType === 'CUSTOMER' && session.test.createdById !== userId) {
      throw new AuthorizationError('You can only view sessions for your own tests');
    }

    res.json({
      success: true,
      data: { session },
    });
  })
);

/**
 * DELETE /api/v1/sessions/:id
 * Cancel/delete session
 */
router.delete('/:id',
  requireRole('TESTER'),
  validateRequest({ params: commonSchemas.id }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const session = await prisma.testerSession.findUnique({
      where: { id },
      select: { id: true, testerId: true, status: true, testId: true },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    if (session.testerId !== userId) {
      throw new AuthorizationError('You can only cancel your own sessions');
    }

    if (session.status === 'COMPLETED') {
      throw new ApiError(400, 'Cannot cancel a completed session');
    }

    // Update session status and decrement test counter
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

    logger.info('Test session cancelled', {
      sessionId: id,
      userId,
      testId: session.testId,
    });

    res.json({
      success: true,
      message: 'Session cancelled successfully',
    });
  })
);

export default router;