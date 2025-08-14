"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.realtimeService = exports.RealtimeService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const notificationService_1 = require("../services/notificationService");
const prisma = new client_1.PrismaClient();
class RealtimeService {
    socketManager;
    setSocketManager(socketManager) {
        this.socketManager = socketManager;
        notificationService_1.notificationService.setSocketManager(socketManager);
    }
    async handleTestStatusChange(testId, newStatus, userId) {
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
            if (!test)
                return;
            if (this.socketManager) {
                this.socketManager.broadcastToTest(testId, 'test:status_changed', {
                    testId,
                    status: newStatus,
                    updatedBy: userId,
                    timestamp: new Date(),
                });
            }
            switch (newStatus) {
                case 'PUBLISHED':
                    await notificationService_1.notificationService.notifyTestPublished(testId);
                    break;
                case 'COMPLETED':
                    await notificationService_1.notificationService.notifyTestCompleted(testId);
                    break;
                case 'CANCELLED':
                    await this.handleTestCancellation(testId);
                    break;
            }
            logger_1.logger.info('Test status change handled', {
                testId,
                newStatus,
                userId,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to handle test status change', {
                error,
                testId,
                newStatus,
            });
        }
    }
    async handleSessionProgress(sessionId, progress) {
        try {
            const session = await prisma.testerSession.findUnique({
                where: { id: sessionId },
                include: {
                    test: true,
                    tester: true,
                },
            });
            if (!session)
                return;
            if (this.socketManager) {
                this.socketManager.broadcastToTest(session.testId, 'session:progress', {
                    sessionId,
                    testerId: session.testerId,
                    testerName: session.tester.name,
                    progress,
                    timestamp: new Date(),
                });
            }
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
            if (progress.percentage > 80) {
                await this.handleSessionNearCompletion(sessionId);
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to handle session progress', {
                error,
                sessionId,
            });
        }
    }
    async handleSessionCompletion(sessionId) {
        try {
            const session = await prisma.testerSession.findUnique({
                where: { id: sessionId },
                include: {
                    test: true,
                    tester: true,
                },
            });
            if (!session)
                return;
            await prisma.testerSession.update({
                where: { id: sessionId },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                },
            });
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
            await prisma.testerProfile.update({
                where: { userId: session.testerId },
                data: {
                    completedTests: { increment: 1 },
                    totalEarnings: { increment: session.test.paymentPerTester },
                },
            });
            if (this.socketManager) {
                this.socketManager.broadcastToTest(session.testId, 'session:completed', {
                    sessionId,
                    testerId: session.testerId,
                    testerName: session.tester.name,
                    timestamp: new Date(),
                });
            }
            await notificationService_1.notificationService.notifySessionCompleted(sessionId);
            await this.checkTestCompletion(session.testId);
            logger_1.logger.info('Session completion handled', {
                sessionId,
                testId: session.testId,
                testerId: session.testerId,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to handle session completion', {
                error,
                sessionId,
            });
        }
    }
    async trackUserActivity(userId, activity) {
        try {
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
            await prisma.user.update({
                where: { id: userId },
                data: { lastLoginAt: new Date() },
            });
            if (this.socketManager && activity.type === 'status_change') {
                this.socketManager.broadcastToUser(userId, 'user:activity', {
                    activity,
                    timestamp: new Date(),
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to track user activity', {
                error,
                userId,
                activity,
            });
        }
    }
    async handlePaymentStatusChange(paymentId, newStatus) {
        try {
            const payment = await prisma.payment.findUnique({
                where: { id: paymentId },
                include: { customer: true },
            });
            if (!payment)
                return;
            await prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: newStatus,
                    ...(newStatus === 'COMPLETED' && { paidAt: new Date() }),
                },
            });
            if (this.socketManager) {
                this.socketManager.broadcastToUser(payment.customerId, 'payment:status_changed', {
                    paymentId,
                    status: newStatus,
                    timestamp: new Date(),
                });
            }
            if (newStatus === 'COMPLETED') {
                await notificationService_1.notificationService.notifyPaymentReceived(paymentId);
            }
            logger_1.logger.info('Payment status change handled', {
                paymentId,
                newStatus,
                customerId: payment.customerId,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to handle payment status change', {
                error,
                paymentId,
                newStatus,
            });
        }
    }
    async broadcastSystemMessage(message) {
        try {
            if (this.socketManager) {
                this.socketManager.io.emit('system:message', {
                    ...message,
                    timestamp: new Date(),
                });
            }
            await prisma.analytics.create({
                data: {
                    event: 'system_message',
                    data: message,
                },
            });
            logger_1.logger.info('System message broadcasted', { message });
        }
        catch (error) {
            logger_1.logger.error('Failed to broadcast system message', { error, message });
        }
    }
    async handleSystemMaintenance(maintenanceInfo) {
        try {
            const activeUsers = await prisma.user.findMany({
                where: { status: 'ACTIVE' },
                select: { id: true },
            });
            await notificationService_1.notificationService.notifySystemMaintenance(activeUsers.map(u => u.id), maintenanceInfo);
            await this.broadcastSystemMessage({
                type: 'maintenance',
                title: 'Scheduled Maintenance',
                message: `System maintenance scheduled for ${maintenanceInfo.date}`,
                data: maintenanceInfo,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to handle system maintenance', { error });
        }
    }
    async handleEthiopianHoliday(holidayInfo) {
        try {
            await notificationService_1.notificationService.notifyEthiopianHoliday(holidayInfo);
            await this.broadcastSystemMessage({
                type: 'holiday',
                title: `Happy ${holidayInfo.name}!`,
                message: holidayInfo.message,
                data: holidayInfo,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to handle Ethiopian holiday', { error });
        }
    }
    async handleRegionalEvent(region, eventInfo) {
        try {
            await notificationService_1.notificationService.notifyRegionalUpdate(region, eventInfo);
            if (this.socketManager) {
                this.socketManager.io.emit('regional:event', {
                    region,
                    ...eventInfo,
                    timestamp: new Date(),
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to handle regional event', { error });
        }
    }
    async handleTestCancellation(testId) {
        try {
            const activeSessions = await prisma.testerSession.findMany({
                where: {
                    testId,
                    status: { in: ['PENDING', 'IN_PROGRESS'] },
                },
                include: { tester: true },
            });
            await prisma.testerSession.updateMany({
                where: {
                    testId,
                    status: { in: ['PENDING', 'IN_PROGRESS'] },
                },
                data: { status: 'CANCELLED' },
            });
            for (const session of activeSessions) {
                await notificationService_1.notificationService.sendNotification({
                    userId: session.testerId,
                    type: 'SYSTEM_UPDATE',
                    title: 'Test Cancelled',
                    message: 'A test you were participating in has been cancelled.',
                    data: { testId, sessionId: session.id },
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to handle test cancellation', { error, testId });
        }
    }
    async handleSessionNearCompletion(sessionId) {
        try {
            const session = await prisma.testerSession.findUnique({
                where: { id: sessionId },
                include: { test: true },
            });
            if (!session)
                return;
            await notificationService_1.notificationService.sendNotification({
                userId: session.test.createdById,
                type: 'SYSTEM_UPDATE',
                title: 'Test Session Nearly Complete',
                message: 'A tester is nearly finished with your test.',
                data: { testId: session.testId, sessionId },
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to handle session near completion', { error, sessionId });
        }
    }
    async checkTestCompletion(testId) {
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
            if (!test)
                return;
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
        }
        catch (error) {
            logger_1.logger.error('Failed to check test completion', { error, testId });
        }
    }
}
exports.RealtimeService = RealtimeService;
exports.realtimeService = new RealtimeService();
exports.default = exports.realtimeService;
//# sourceMappingURL=realtimeService.js.map