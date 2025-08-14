/**
 * Notification Service
 * Centralized notification management for the Masada platform
 */

import { PrismaClient, NotificationType } from '@prisma/client';
import { logger } from '@/utils/logger';
import SocketManager from '@/websocket/socketManager';
import { emailService } from '@/services/emailService';

const prisma = new PrismaClient();

/**
 * Notification data interface
 */
interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  sendEmail?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Notification Service Class
 */
export class NotificationService {
  private socketManager?: SocketManager; // Injected from server at runtime

  /**
   * Set socket manager for real-time notifications
   */
  setSocketManager(socketManager: SocketManager) {
    this.socketManager = socketManager;
  }

  /**
   * Send notification to user
   */
  async sendNotification(notificationData: NotificationData): Promise<void> {
    try {
      // Create notification in database
      const notification = await prisma.notification.create({
        data: {
          userId: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data,
        },
      });

      // Send real-time notification if socket manager is available
      if (this.socketManager) {
        await this.socketManager.sendNotificationToUser(notificationData.userId, {
          id: notification.id,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data,
          createdAt: notification.createdAt,
        });
      }

      // Send email notification if requested
      if (notificationData.sendEmail) {
        await this.sendEmailNotification(notificationData);
      }

      logger.info('Notification sent successfully', {
        userId: notificationData.userId,
        type: notificationData.type,
        notificationId: notification.id,
      });

    } catch (error) {
      logger.error('Failed to send notification', {
        error,
        userId: notificationData.userId,
        type: notificationData.type,
      });
      throw error;
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(notifications: NotificationData[]): Promise<void> {
    try {
      // Create all notifications in database
      const notificationRecords = await prisma.notification.createMany({
        data: notifications.map(n => ({
          userId: n.userId,
          type: n.type,
          title: n.title,
          message: n.message,
          data: n.data,
        })),
      });

      // Send real-time notifications
      if (this.socketManager) {
        for (const notification of notifications) {
          this.socketManager.sendNotificationToUser(notification.userId, {
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            createdAt: new Date(),
          });
        }
      }

      logger.info('Bulk notifications sent', {
        count: notifications.length,
      });

    } catch (error) {
      logger.error('Failed to send bulk notifications', { error });
      throw error;
    }
  }

  /**
   * Test-related notifications
   */
  async notifyTestPublished(testId: string): Promise<void> {
    try {
      const test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
          createdBy: true,
        },
      });

      if (!test) return;

      // Find eligible testers
      const eligibleTesters = await prisma.user.findMany({
        where: {
          userType: 'TESTER',
          status: 'ACTIVE',
          testerProfile: {
            isVerified: true,
          },
        },
        take: 50, // Limit to prevent spam
      });

      // Send notifications to testers
      const notifications = eligibleTesters.map(tester => ({
        userId: tester.id,
        type: 'TEST_INVITATION' as NotificationType,
        title: 'New Test Available',
        message: `New test "${test.title}" is available. Earn ${test.paymentPerTester} ETB!`,
        data: {
          testId: test.id,
          testTitle: test.title,
          payment: test.paymentPerTester,
          estimatedDuration: test.estimatedDuration,
        },
        sendEmail: true,
      }));

      await this.sendBulkNotifications(notifications);

      // Real-time: push 'test:new' to connected testers
      if (this.socketManager) {
        for (const tester of eligibleTesters) {
          this.socketManager.broadcastToUser(tester.id, 'test:new', {
            testId: test.id,
            title: test.title,
            paymentPerTester: test.paymentPerTester,
            estimatedDuration: test.estimatedDuration,
          });
        }
      }

      // Notify test creator
      await this.sendNotification({
        userId: test.createdById,
        type: 'SYSTEM_UPDATE',
        title: 'Test Published Successfully',
        message: `Your test "${test.title}" has been published and is now available to ${eligibleTesters.length} testers.`,
        data: { testId: test.id },
      });

    } catch (error) {
      logger.error('Failed to send test published notifications', { error, testId });
    }
  }

  async notifyTestCompleted(testId: string): Promise<void> {
    try {
      const test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
          createdBy: true,
          testerSessions: {
            where: { status: 'COMPLETED' },
            include: {
              tester: true,
            },
          },
        },
      });

      if (!test) return;

      // Notify test creator
      await this.sendNotification({
        userId: test.createdById,
        type: 'TEST_COMPLETED',
        title: 'Test Completed',
        message: `Your test "${test.title}" has been completed by ${test.testerSessions.length} testers.`,
        data: {
          testId: test.id,
          completedSessions: test.testerSessions.length,
        },
        sendEmail: true,
      });

      // Notify participating testers
      const testerNotifications = test.testerSessions.map(session => ({
        userId: session.testerId,
        type: 'EARNING_AVAILABLE' as NotificationType,
        title: 'Payment Processed',
        message: `You've earned ${test.paymentPerTester} ETB for completing "${test.title}".`,
        data: {
          testId: test.id,
          sessionId: session.id,
          amount: test.paymentPerTester,
        },
      }));

      await this.sendBulkNotifications(testerNotifications);

    } catch (error) {
      logger.error('Failed to send test completed notifications', { error, testId });
    }
  }

  async notifySessionStarted(sessionId: string): Promise<void> {
    try {
      const session = await prisma.testerSession.findUnique({
        where: { id: sessionId },
        include: {
          test: {
            include: { createdBy: true },
          },
          tester: true,
        },
      });

      if (!session) return;

      // Notify test creator
      await this.sendNotification({
        userId: session.test.createdById,
        type: 'SYSTEM_UPDATE',
        title: 'Test Session Started',
        message: `${session.tester.name} started testing "${session.test.title}".`,
        data: {
          testId: session.testId,
          sessionId: session.id,
          testerName: session.tester.name,
        },
      });

    } catch (error) {
      logger.error('Failed to send session started notification', { error, sessionId });
    }
  }

  async notifySessionCompleted(sessionId: string): Promise<void> {
    try {
      const session = await prisma.testerSession.findUnique({
        where: { id: sessionId },
        include: {
          test: {
            include: { createdBy: true },
          },
          tester: true,
        },
      });

      if (!session) return;

      // Notify test creator
      await this.sendNotification({
        userId: session.test.createdById,
        type: 'SYSTEM_UPDATE',
        title: 'Test Session Completed',
        message: `${session.tester.name} completed testing "${session.test.title}". Rating: ${session.rating || 'Not rated'}/5`,
        data: {
          testId: session.testId,
          sessionId: session.id,
          testerName: session.tester.name,
          rating: session.rating,
          feedback: session.feedback,
        },
      });

      // Notify tester about payment
      await this.sendNotification({
        userId: session.testerId,
        type: 'EARNING_AVAILABLE',
        title: 'Test Completed Successfully',
        message: `You've earned ${session.test.paymentPerTester} ETB for completing "${session.test.title}".`,
        data: {
          testId: session.testId,
          sessionId: session.id,
          amount: session.test.paymentPerTester,
        },
      });

      // Real-time: update earnings summary for tester dashboard
      if (this.socketManager) {
        const [totalEarnings, thisMonth, pending] = await Promise.all([
          prisma.earning.aggregate({ where: { testerId: session.testerId, status: 'COMPLETED' }, _sum: { amount: true } }),
          prisma.earning.aggregate({ where: { testerId: session.testerId, status: 'COMPLETED', createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }, _sum: { amount: true } }),
          prisma.earning.aggregate({ where: { testerId: session.testerId, status: 'PENDING' }, _sum: { amount: true } }),
        ]);

        this.socketManager.broadcastToUser(session.testerId, 'earnings:updated', {
          summary: {
            totalEarnings: totalEarnings._sum.amount || 0,
            thisMonthEarnings: thisMonth._sum.amount || 0,
            pendingAmount: pending._sum.amount || 0,
          },
        });
      }

    } catch (error) {
      logger.error('Failed to send session completed notifications', { error, sessionId });
    }
  }

  /**
   * Payment-related notifications
   */
  async notifyPaymentReceived(paymentId: string): Promise<void> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { customer: true },
      });

      if (!payment) return;

      await this.sendNotification({
        userId: payment.customerId,
        type: 'PAYMENT_RECEIVED',
        title: 'Payment Confirmed',
        message: `Your payment of ${payment.amount} ${payment.currency} has been confirmed.`,
        data: {
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
        },
        sendEmail: true,
      });

    } catch (error) {
      logger.error('Failed to send payment notification', { error, paymentId });
    }
  }

  async notifyEarningAvailable(earningId: string): Promise<void> {
    try {
      const earning = await prisma.earning.findUnique({
        where: { id: earningId },
        include: { tester: true },
      });

      if (!earning) return;

      await this.sendNotification({
        userId: earning.testerId,
        type: 'EARNING_AVAILABLE',
        title: 'Earning Available',
        message: `You've earned ${earning.amount} ${earning.currency}. Payment will be processed soon.`,
        data: {
          earningId: earning.id,
          amount: earning.amount,
          currency: earning.currency,
          description: earning.description,
        },
      });

    } catch (error) {
      logger.error('Failed to send earning notification', { error, earningId });
    }
  }

  /**
   * System notifications
   */
  async notifySystemMaintenance(userIds: string[], maintenanceInfo: any): Promise<void> {
    const notifications = userIds.map(userId => ({
      userId,
      type: 'SYSTEM_UPDATE' as NotificationType,
      title: 'Scheduled Maintenance',
      message: `Masada will undergo maintenance on ${maintenanceInfo.date} from ${maintenanceInfo.startTime} to ${maintenanceInfo.endTime}.`,
      data: maintenanceInfo,
      sendEmail: true,
    }));

    await this.sendBulkNotifications(notifications);
  }

  async notifyAccountUpdate(userId: string, updateType: string): Promise<void> {
    const messages = {
      profile_updated: 'Your profile has been updated successfully.',
      password_changed: 'Your password has been changed successfully.',
      email_verified: 'Your email address has been verified.',
      account_suspended: 'Your account has been suspended. Please contact support.',
      account_reactivated: 'Your account has been reactivated.',
    };

    await this.sendNotification({
      userId,
      type: 'ACCOUNT_UPDATE',
      title: 'Account Update',
      message: (messages as any)[updateType] || 'Your account has been updated.',
      data: { updateType },
      sendEmail: ['password_changed', 'account_suspended'].includes(updateType),
    });
  }

  /**
   * Ethiopian market specific notifications
   */
  async notifyEthiopianHoliday(holidayInfo: any): Promise<void> {
    const activeUsers = await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
    });

    const notifications = activeUsers.map(user => ({
      userId: user.id,
      type: 'SYSTEM_UPDATE' as NotificationType,
      title: `Happy ${holidayInfo.name}!`,
      message: `Masada wishes you a wonderful ${holidayInfo.name}. ${holidayInfo.message}`,
      data: holidayInfo,
    }));

    await this.sendBulkNotifications(notifications);
  }

  async notifyRegionalUpdate(region: string, updateInfo: any): Promise<void> {
    const regionalUsers = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        testerProfile: {
          region: region,
        },
      },
      select: { id: true },
    });

    const notifications = regionalUsers.map(user => ({
      userId: user.id,
      type: 'SYSTEM_UPDATE' as NotificationType,
      title: `Update for ${region} Region`,
      message: updateInfo.message,
      data: { region, ...updateInfo },
    }));

    await this.sendBulkNotifications(notifications);
  }

  /**
   * Helper methods
   */
  private async sendEmailNotification(notificationData: NotificationData): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: notificationData.userId },
        select: { email: true, name: true },
      });

      if (!user) return;

      // Send appropriate email based on notification type
      switch (notificationData.type) {
        case 'TEST_INVITATION':
          await emailService.sendTestInvitation(
            user.email,
            user.name,
            notificationData.data
          );
          break;
        case 'TEST_COMPLETED':
          await emailService.sendTestCompletionNotification(
            user.email,
            user.name,
            notificationData.data
          );
          break;
        case 'PAYMENT_RECEIVED':
          await emailService.sendPaymentNotification(
            user.email,
            user.name,
            notificationData.data
          );
          break;
        default:
          // Generic notification email
          logger.info('Generic email notification not implemented', {
            type: notificationData.type,
          });
      }

    } catch (error) {
      logger.error('Failed to send email notification', {
        error,
        userId: notificationData.userId,
        type: notificationData.type,
      });
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserNotificationPreferences(userId: string): Promise<any> {
    // This would fetch user preferences from database
    // For now, return default preferences
    return {
      email: true,
      push: true,
      sms: false,
      types: {
        TEST_INVITATION: true,
        TEST_COMPLETED: true,
        PAYMENT_RECEIVED: true,
        EARNING_AVAILABLE: true,
        SYSTEM_UPDATE: true,
        ACCOUNT_UPDATE: true,
      },
    };
  }

  /**
   * Update user notification preferences
   */
  async updateUserNotificationPreferences(userId: string, preferences: any): Promise<void> {
    // This would update user preferences in database
    logger.info('Notification preferences updated', { userId, preferences });
  }

  /**
   * Clean up old notifications
   */
  async cleanupOldNotifications(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          read: true,
        },
      });

      logger.info('Old notifications cleaned up', {
        deletedCount: result.count,
        cutoffDate,
      });

    } catch (error) {
      logger.error('Failed to cleanup old notifications', { error });
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;