import { Server as HTTPServer } from 'http';
export declare class SocketManager {
    private io;
    private connectedUsers;
    private testRooms;
    constructor(server: HTTPServer);
    private setupMiddleware;
    private setupEventHandlers;
    private setupUserEvents;
    private setupTestEvents;
    private setupSessionEvents;
    private setupNotificationEvents;
    private handleDisconnection;
    sendNotificationToUser(userId: string, notification: any): Promise<void>;
    broadcastToTest(testId: string, event: string, data: any): void;
    broadcastToUser(userId: string, event: string, data: any): void;
    getConnectedUsersCount(): number;
    getTestRoomParticipants(testId: string): number;
    private verifyTestAccess;
    private getTestStatus;
}
export default SocketManager;
//# sourceMappingURL=socketManager.d.ts.map