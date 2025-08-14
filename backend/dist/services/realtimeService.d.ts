export declare class RealtimeService {
    private socketManager?;
    setSocketManager(socketManager: any): void;
    handleTestStatusChange(testId: string, newStatus: string, userId: string): Promise<void>;
    handleSessionProgress(sessionId: string, progress: any): Promise<void>;
    handleSessionCompletion(sessionId: string): Promise<void>;
    trackUserActivity(userId: string, activity: any): Promise<void>;
    handlePaymentStatusChange(paymentId: string, newStatus: string): Promise<void>;
    broadcastSystemMessage(message: any): Promise<void>;
    handleSystemMaintenance(maintenanceInfo: any): Promise<void>;
    handleEthiopianHoliday(holidayInfo: any): Promise<void>;
    handleRegionalEvent(region: string, eventInfo: any): Promise<void>;
    private handleTestCancellation;
    private handleSessionNearCompletion;
    private checkTestCompletion;
}
export declare const realtimeService: RealtimeService;
export default realtimeService;
//# sourceMappingURL=realtimeService.d.ts.map