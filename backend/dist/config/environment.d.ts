export declare const config: {
    readonly database: {
        readonly url: string;
    };
    readonly nodeEnv: "development" | "production" | "test";
    readonly port: number;
    readonly apiVersion: string;
    readonly jwt: {
        readonly secret: string;
        readonly expiresIn: string;
        readonly refreshSecret: string;
        readonly refreshExpiresIn: string;
    };
    readonly cors: {
        readonly frontendUrl: string;
        readonly allowedOrigins: string[];
    };
    readonly upload: {
        readonly maxFileSize: number;
        readonly uploadPath: string;
        readonly allowedMimeTypes: readonly ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm", "application/pdf", "text/plain"];
    };
    readonly email: {
        readonly host: string | undefined;
        readonly port: number | undefined;
        readonly user: string | undefined;
        readonly pass: string | undefined;
        readonly from: string | undefined;
    };
    readonly payment: {
        readonly chapa: {
            readonly secretKey: string | undefined;
        };
        readonly telebirr: {
            readonly apiKey: string | undefined;
        };
    };
    readonly rateLimit: {
        readonly windowMs: number;
        readonly maxRequests: number;
    };
    readonly logging: {
        readonly level: "error" | "warn" | "info" | "debug";
        readonly file: string;
    };
    readonly security: {
        readonly bcryptRounds: number;
        readonly sessionSecret: string | undefined;
    };
    readonly ethiopian: {
        readonly timezone: string;
        readonly currency: string;
        readonly defaultLanguage: string;
        readonly supportedLanguages: string[];
    };
};
export declare const validateProductionConfig: () => void;
//# sourceMappingURL=environment.d.ts.map