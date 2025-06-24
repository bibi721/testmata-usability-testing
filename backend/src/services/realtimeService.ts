/**
 * Real-time Service
 * Handles real-time events and data synchronization
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';
import { notificationService } from '@/services/notificationService';

const prisma = new PrismaClient();

/**
 * Real-time Service Class
 */
export class RealtimeService {
  private socketManager?: any;

  /**
   * Set socket manager
   */
  setSocketManager(socketManager: any) {
    this.socketManager = socketManager;
    notificationService.setSocketManager(socketManager);
  }

  /**
   * Test-related real-time events
   */
  async handleTestStatusChange(testId: string, newStatus: string, userId: string): Promise<void> {
    try {
      const test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
          createdBy: true,
          testerSessions: {
            include: {
              tester: true,
            },
          },
        },
      });

      if (!test) return;

      // Broadcast to test room
      if (this.socketManager) {
        this.socketManager.broadcastToTest(testId, 'test:status_changed', {
          testId,
          status: newStatus,
          updatedBy: userId,
          timestamp: new Date(),
        });
      }

      // Handle specific status changes
      switch (newStatus) {
        case 'PUBLISHED':
          await notificationService.notifyTestPublished(testId);
          break;
        case 'COMPLETED':
          await notificationService.notifyTestCompleted(testId);
          break;
        case 'CANCELLED':
          await this.handleTestCancellation(testId);
          break;
      }

      logger.info('Test status change handled', {
        testId,
        newStatus,
        userId,
      });

    } catch (error) {
      logger.error('Failed to handle test status change', {
        error,
        testId,
        newStatus,
      });
    }
  }

  async handleSessionProgress(sessionId: string, progress: any): Promise<void> {
    try {
      const session = await prisma.testerSession.findUnique({
        where: { id: sessionId },
        include: {
          test: true,
          tester: true,
        },
      });

      if (!session) return;

      // Broadcast progress to test room
      if (this.socketManager) {
        this.socketManager.broadcastToTest(session.testId, 'session:progress', {
          sessionId,
          testerId: session.testerId,
          testerName: session.tester.name,
          progress,
          timestamp: new Date(),
        });
      }

      // Store progress analytics
      await prisma.analytics.create({
        data: {
          testId: session.testId,
          userId: session.testerId,
          event: 'session_progress',
          data: {
            sessionId,
            progress,
            timestamp: new Date(),
          },
        },
      });

      // Check if session is near completion
      if (progress.percentage > 80) {
        await this.handleSessionNearCompletion(sessionId);
      }

    } catch (error) {
      logger.error('Failed to handle session progress', {
        error,
        sessionId,
      });
    }
  }

  async handleSessionCompletion(sessionId: string): Promise<void> {
    try {
      const session = await prisma.testerSession.findUnique({
        where: { id: sessionId },
        include: {
          test: true,
          tester: true,
        },
      });

      if (!session) return;

      // Update session status
      await prisma.testerSession.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // Create earning record
      await prisma.earning.create({
        data: {
          testerId: session.testerId,
          testerSessionId: sessionId,
          amount: session.test.paymentPerTester,
          currency: 'ETB',
          description: `Payment for completing test: ${session.test.title}`,
          status: 'PENDING',
        },
      });

      // Update tester profile
      await prisma.testerProfile.update({
        where: { userId: session.testerId },
        data: {
          completedTests: { increment: 1 },
          totalEarnings: { increment: session.test.paymentPerTester },
        },
      });

      // Broadcast completion
      if (this.socketManager) {
        this.socketManager.broadcastToTest(session.testId, 'session:completed', {
          sessionId,
          testerId: session.testerId,
          testerName: session.tester.name,
          timestamp: new Date(),
        });
      }

      // Send notifications
      await notificationService.notifySessionCompleted(sessionId);

      // Check if test should be marked as completed
      await this.checkTestCompletion(session.testId);

      logger.info('Session completion handled', {
        sessionId,
        testId: session.testId,
        testerId: session.testerId,
      });

    } catch (error) {
      logger.error('Failed to handle session completion', {
        error,
        sessionId,
      });
    }
  }

  /**
   * User activity tracking
   */
  async trackUserActivity(userId: string, activity: any): Promise<void> {
    try {
      // Store activity in analytics
      await prisma.analytics.create({
        data: {
          userId,
          event: 'user_activity',
          data: {
            activity,
            timestamp: new Date(),
          },
        },
      });

      // Update user last activity
      await prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() },
      });

      // Broadcast user status if needed
      if (this.socketManager && activity.type === 'status_change') {
        this.socketManager.broadcastToUser(userId, 'user:activity', {
          activity,
          timestamp: new Date(),
        });
      }

    } catch (error) {
      logger.error('Failed to track user activity', {
        error,
        userId,
        activity,
      });
    }
  }

  /**
   * Payment processing events
   */
  async handlePaymentStatusChange(paymentId: string, newStatus: string): Promise<void> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { customer: true },
      });

      if (!payment) return;

      // Update payment status
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: newStatus,
          ...(newStatus === 'COMPLETED' && { paidAt: new Date() }),
        },
      });

      // Broadcast to user
      if (this.socketManager) {
        this.socketManager.broadcastToUser(payment.customerId, 'payment:status_changed', {
          paymentId,
          status: newStatus,
          timestamp: new Date(),
        });
      }

      // Send notifications
      if (newStatus === 'COMPLETED') {
        await notificationService.notifyPaymentReceived(paymentId);
      }

      logger.info('Payment status change handled', {
        paymentId,
        newStatus,
        customerId: payment.customerId,
      });

    } catch (error) {
      logger.error('Failed to handle payment status change', {
        error,
        paymentId,
        newStatus,
      });
    }
  }

  /**
   * System-wide events
   */
  async broadcastSystemMessage(message: any): Promise<void> {
    try {
      if (this.socketManager) {
        this.socketManager.io.emit('system:message', {
          ...message,
          timestamp: new Date(),
        });
      }

      // Store system message
      await prisma.analytics.create({
        data: {
          event: 'system_message',
          data: message,
        },
      });

      logger.info('System message broadcasted', { message });

    } catch (error) {
      logger.error('Failed to broadcast system message', { error, message });
    }
  }

  async handleSystemMaintenance(maintenanceInfo: any): Promise<void> {
    try {
      // Get all active users
      const activeUsers = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
      });

      // Send maintenance notifications
      await notificationService.notifySystemMaintenance(
        activeUsers.map(u => u.id),
        maintenanceInfo
      );

      // Broadcast maintenance message
      await this.broadcastSystemMessage({
        type: 'maintenance',
        title: 'Scheduled Maintenance',
        message: `System maintenance scheduled for ${maintenanceInfo.date}`,
        data: maintenanceInfo,
      });

    } catch (error) {
      logger.error('Failed to handle system maintenance', { error });
    }
  }

  /**
   * Ethiopian market specific events
   */
  async handleEthiopianHoliday(holidayInfo: any): Promise<void> {
    try {
      // Send holiday notifications
      await notificationService.notifyEthiopianHoliday(holidayInfo);

      // Broadcast holiday message
      await this.broadcastSystemMessage({
        type: 'holiday',
        title: `Happy ${holidayInfo.name}!`,
        message: holidayInfo.message,
        data: holidayInfo,
      });

    } catch (error) {
      logger.error('Failed to handle Ethiopian holiday', { error });
    }
  }

  async handleRegionalEvent(region: string, eventInfo: any): Promise<void> {
    try {
      // Send regional notifications
      await notificationService.notifyRegionalUpdate(region, eventInfo);

      // Broadcast to regional users
      if (this.socketManager) {
        this.socketManager.io.emit('regional:event', {
          region,
          ...eventInfo,
          timestamp: new Date(),
        });
      }

    } catch (error) {
      logger.error('Failed to handle regional event', { error });
    }
  }

  /**
   * Helper methods
   */
  private async handleTestCancellation(testId: string): Promise<void> {
    try {
      // Get active sessions
      const activeSessions = await prisma.testerSession.findMany({
        where: {
          testId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
        include: { tester: true },
      });

      // Cancel active sessions
      await prisma.testerSession.updateMany({
        where: {
          testId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
        data: { status: 'CANCELLED' },
      });

      // Notify affected testers
      for (const session of activeSessions) {
        await notificationService.sendNotification({
          userId: session.testerId,
          type: 'SYSTEM_UPDATE',
          title: 'Test Cancelled',
          message: 'A test you were participating in has been cancelled.',
          data: { testId, sessionId: session.id },
        });
      }

    } catch (error) {
      logger.error('Failed to handle test cancellation', { error, testId });
    }
  }

  private async handleSessionNearCompletion(sessionId: string): Promise<void> {
    try {
      const session = await prisma.testerSession.findUnique({
        where: { id: sessionId },
        include: { test: true },
      });

      if (!session) return;

      // Notify test creator
      await notificationService.sendNotification({
        userId: session.test.createdById,
        type: 'SYSTEM_UPDATE',
        title: 'Test Session Nearly Complete',
        message: 'A tester is nearly finished with your test.',
        data: { testId: session.testId, sessionId },
      });

    } catch (error) {
      logger.error('Failed to handle session near completion', { error, sessionId });
    }
  }

  private async checkTestCompletion(testId: string): Promise<void> {
    try {
      const test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
          _count: {
            select: {
              testerSessions: {
                where: { status: 'COMPLETED' },
              },
            },
          },
        },
      });

      if (!test) return;

      // Check if test should be marked as completed
      if (test._count.testerSessions >= test.maxTesters) {
        await prisma.test.update({
          where: { id: testId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        await this.handleTestStatusChange(testId, 'COMPLETED', 'system');
      }

    } catch (error) {
      logger.error('Failed to check test completion', { error, testId });
    }
  }
}

export const realtimeService = new RealtimeService();
export default realtimeService;