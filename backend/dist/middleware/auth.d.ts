import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        userType: 'CUSTOMER' | 'TESTER' | 'ADMIN';
        status: string;
    };
}
export declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (...roles: Array<"CUSTOMER" | "TESTER" | "ADMIN">) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireEmailVerification: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const sensitiveOperationLimit: (maxAttempts: number, windowMs: number) => (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
export declare const cleanupExpiredTokens: () => Promise<void>;
export default authMiddleware;
//# sourceMappingURL=auth.d.ts.map