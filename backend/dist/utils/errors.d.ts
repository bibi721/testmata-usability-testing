export declare class ApiError extends Error {
    statusCode: number;
    details?: any;
    constructor(statusCode: number, message: string, details?: any);
}
export declare class ValidationError extends ApiError {
    constructor(message: string, details?: any);
}
export declare class AuthenticationError extends ApiError {
    constructor(message?: string);
}
export declare class AuthorizationError extends ApiError {
    constructor(message?: string);
}
export declare class NotFoundError extends ApiError {
    constructor(resource?: string);
}
export declare class ConflictError extends ApiError {
    constructor(message: string);
}
export declare class RateLimitError extends ApiError {
    constructor(message?: string);
}
export declare class PaymentError extends ApiError {
    constructor(message: string, provider?: string);
}
export declare class TesterNotAvailableError extends ApiError {
    constructor();
}
export declare class TestCapacityError extends ApiError {
    constructor();
}
export default ApiError;
//# sourceMappingURL=errors.d.ts.map