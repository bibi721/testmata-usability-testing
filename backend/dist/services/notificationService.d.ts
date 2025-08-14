import { NotificationType } from '@prisma/client';
import SocketManager from '../websocket/socketManager';
interface NotificationData {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    sendEmail?: boolean;
    priority?: 'low' | 'medium' | 'high';
}
export declare class NotificationService {
    private socketManager?;
    setSocketManager(socketManager: SocketManager): void;
    sendNotification(notificationData: NotificationData): Promise<void>;
    sendBulkNotifications(notifications: NotificationData[]): Promise<void>;
    notifyTestPublished(testId: string): Promise<void>;
    notifyTestCompleted(testId: string): Promise<void>;
    notifySessionStarted(sessionId: string): Promise<void>;
    notifySessionCompleted(sessionId: string): Promise<void>;
    notifyPaymentReceived(paymentId: string): Promise<void>;
    notifyEarningAvailable(earningId: string): Promise<void>;
    notifySystemMaintenance(userIds: string[], maintenanceInfo: any): Promise<void>;
    notifyAccountUpdate(userId: string, updateType: string): Promise<void>;
    notifyEthiopianHoliday(holidayInfo: any): Promise<void>;
    notifyRegionalUpdate(region: string, updateInfo: any): Promise<void>;
    private sendEmailNotification;
    getUserNotificationPreferences(userId: string): Promise<any>;
    updateUserNotificationPreferences(userId: string, preferences: any): Promise<void>;
    cleanupOldNotifications(daysOld?: number): Promise<void>;
}
export declare const notificationService: NotificationService;
export default notificationService;
//# sourceMappingURL=notificationService.d.ts.map