import { Socket } from 'socket.io';
export interface AuthenticatedSocket extends Socket {
    userId?: string;
    userType?: 'CUSTOMER' | 'TESTER' | 'ADMIN';
    user?: {
        id: string;
        email: string;
        name: string;
        userType: string;
        status: string;
    };
}
export declare const authenticateSocket: (socket: AuthenticatedSocket, next: (err?: Error) => void) => Promise<void>;
export declare const rateLimitSocket: (maxEvents: number, windowMs: number) => (socket: AuthenticatedSocket, next: (err?: Error) => void) => void;
export declare const requireSocketRole: (...roles: Array<"CUSTOMER" | "TESTER" | "ADMIN">) => (socket: AuthenticatedSocket, next: (err?: Error) => void) => void;
export declare const validateSocketData: (schema: any) => (data: any, next: (err?: Error) => void) => void;
export declare const logSocketEvent: (eventName: string) => (socket: AuthenticatedSocket, data: any) => void;
export declare const handleSocketError: (socket: AuthenticatedSocket, eventName: string, error: Error) => void;
export declare const cleanupSocketConnection: (socket: AuthenticatedSocket) => void;
declare const _default: {
    authenticateSocket: (socket: AuthenticatedSocket, next: (err?: Error) => void) => Promise<void>;
    rateLimitSocket: (maxEvents: number, windowMs: number) => (socket: AuthenticatedSocket, next: (err?: Error) => void) => void;
    requireSocketRole: (...roles: Array<"CUSTOMER" | "TESTER" | "ADMIN">) => (socket: AuthenticatedSocket, next: (err?: Error) => void) => void;
    validateSocketData: (schema: any) => (data: any, next: (err?: Error) => void) => void;
    logSocketEvent: (eventName: string) => (socket: AuthenticatedSocket, data: any) => void;
    handleSocketError: (socket: AuthenticatedSocket, eventName: string, error: Error) => void;
    cleanupSocketConnection: (socket: AuthenticatedSocket) => void;
};
export default _default;
//# sourceMappingURL=websocket.d.ts.map