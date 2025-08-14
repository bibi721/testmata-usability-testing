"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const emailService_1 = require("../services/emailService");
const prisma = new client_1.PrismaClient();
class NotificationService {
    socketManager;
    setSocketManager(socketManager) {
        this.socketManager = socketManager;
    }
    async sendNotification(notificationData) {
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId: notificationData.userId,
                    type: notificationData.type,
                    title: notificationData.title,
                    message: notificationData.message,
                    data: notificationData.data,
                },
            });
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
            if (notificationData.sendEmail) {
                await this.sendEmailNotification(notificationData);
            }
            logger_1.logger.info('Notification sent successfully', {
                userId: notificationData.userId,
                type: notificationData.type,
                notificationId: notification.id,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to send notification', {
                error,
                userId: notificationData.userId,
                type: notificationData.type,
            });
            throw error;
        }
    }
    async sendBulkNotifications(notifications) {
        try {
            const notificationRecords = await prisma.notification.createMany({
                data: notifications.map(n => ({
                    userId: n.userId,
                    type: n.type,
                    title: n.title,
                    message: n.message,
                    data: n.data,
                })),
            });
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
            logger_1.logger.info('Bulk notifications sent', {
                count: notifications.length,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to send bulk notifications', { error });
            throw error;
        }
    }
    async notifyTestPublished(testId) {
        try {
            const test = await prisma.test.findUnique({
                where: { id: testId },
                include: {
                    createdBy: true,
                },
            });
            if (!test)
                return;
            const eligibleTesters = await prisma.user.findMany({
                where: {
                    userType: 'TESTER',
                    status: 'ACTIVE',
                    testerProfile: {
                        isVerified: true,
                    },
                },
                take: 50,
            });
            const notifications = eligibleTesters.map(tester => ({
                userId: tester.id,
                type: 'TEST_INVITATION',
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
            await this.sendNotification({
                userId: test.createdById,
                type: 'SYSTEM_UPDATE',
                title: 'Test Published Successfully',
                message: `Your test "${test.title}" has been published and is now available to ${eligibleTesters.length} testers.`,
                data: { testId: test.id },
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to send test published notifications', { error, testId });
        }
    }
    async notifyTestCompleted(testId) {
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
            if (!test)
                return;
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
            const testerNotifications = test.testerSessions.map(session => ({
                userId: session.testerId,
                type: 'EARNING_AVAILABLE',
                title: 'Payment Processed',
                message: `You've earned ${test.paymentPerTester} ETB for completing "${test.title}".`,
                data: {
                    testId: test.id,
                    sessionId: session.id,
                    amount: test.paymentPerTester,
                },
            }));
            await this.sendBulkNotifications(testerNotifications);
        }
        catch (error) {
            logger_1.logger.error('Failed to send test completed notifications', { error, testId });
        }
    }
    async notifySessionStarted(sessionId) {
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
            if (!session)
                return;
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
        }
        catch (error) {
            logger_1.logger.error('Failed to send session started notification', { error, sessionId });
        }
    }
    async notifySessionCompleted(sessionId) {
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
            if (!session)
                return;
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
        }
        catch (error) {
            logger_1.logger.error('Failed to send session completed notifications', { error, sessionId });
        }
    }
    async notifyPaymentReceived(paymentId) {
        try {
            const payment = await prisma.payment.findUnique({
                where: { id: paymentId },
                include: { customer: true },
            });
            if (!payment)
                return;
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
        }
        catch (error) {
            logger_1.logger.error('Failed to send payment notification', { error, paymentId });
        }
    }
    async notifyEarningAvailable(earningId) {
        try {
            const earning = await prisma.earning.findUnique({
                where: { id: earningId },
                include: { tester: true },
            });
            if (!earning)
                return;
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
        }
        catch (error) {
            logger_1.logger.error('Failed to send earning notification', { error, earningId });
        }
    }
    async notifySystemMaintenance(userIds, maintenanceInfo) {
        const notifications = userIds.map(userId => ({
            userId,
            type: 'SYSTEM_UPDATE',
            title: 'Scheduled Maintenance',
            message: `Masada will undergo maintenance on ${maintenanceInfo.date} from ${maintenanceInfo.startTime} to ${maintenanceInfo.endTime}.`,
            data: maintenanceInfo,
            sendEmail: true,
        }));
        await this.sendBulkNotifications(notifications);
    }
    async notifyAccountUpdate(userId, updateType) {
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
            message: messages[updateType] || 'Your account has been updated.',
            data: { updateType },
            sendEmail: ['password_changed', 'account_suspended'].includes(updateType),
        });
    }
    async notifyEthiopianHoliday(holidayInfo) {
        const activeUsers = await prisma.user.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true },
        });
        const notifications = activeUsers.map(user => ({
            userId: user.id,
            type: 'SYSTEM_UPDATE',
            title: `Happy ${holidayInfo.name}!`,
            message: `Masada wishes you a wonderful ${holidayInfo.name}. ${holidayInfo.message}`,
            data: holidayInfo,
        }));
        await this.sendBulkNotifications(notifications);
    }
    async notifyRegionalUpdate(region, updateInfo) {
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
            type: 'SYSTEM_UPDATE',
            title: `Update for ${region} Region`,
            message: updateInfo.message,
            data: { region, ...updateInfo },
        }));
        await this.sendBulkNotifications(notifications);
    }
    async sendEmailNotification(notificationData) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: notificationData.userId },
                select: { email: true, name: true },
            });
            if (!user)
                return;
            switch (notificationData.type) {
                case 'TEST_INVITATION':
                    await emailService_1.emailService.sendTestInvitation(user.email, user.name, notificationData.data);
                    break;
                case 'TEST_COMPLETED':
                    await emailService_1.emailService.sendTestCompletionNotification(user.email, user.name, notificationData.data);
                    break;
                case 'PAYMENT_RECEIVED':
                    await emailService_1.emailService.sendPaymentNotification(user.email, user.name, notificationData.data);
                    break;
                default:
                    logger_1.logger.info('Generic email notification not implemented', {
                        type: notificationData.type,
                    });
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to send email notification', {
                error,
                userId: notificationData.userId,
                type: notificationData.type,
            });
        }
    }
    async getUserNotificationPreferences(userId) {
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
    async updateUserNotificationPreferences(userId, preferences) {
        logger_1.logger.info('Notification preferences updated', { userId, preferences });
    }
    async cleanupOldNotifications(daysOld = 30) {
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
            logger_1.logger.info('Old notifications cleaned up', {
                deletedCount: result.count,
                cutoffDate,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to cleanup old notifications', { error });
        }
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
exports.default = exports.notificationService;
//# sourceMappingURL=notificationService.js.map