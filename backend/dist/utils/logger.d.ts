import winston from 'winston';
export declare const logger: winston.Logger;
export declare const logRequest: (req: any, res: any, duration: number) => void;
export declare const logError: (error: Error, context?: any) => void;
export declare const logEthiopianEvent: (event: string, data: any) => void;
export declare const logPayment: (paymentData: any) => void;
export declare const logTestSession: (sessionData: any) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map