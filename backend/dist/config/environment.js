"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProductionConfig = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url(),
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('30d'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().transform(Number).default('5000'),
    API_VERSION: zod_1.z.string().default('v1'),
    FRONTEND_URL: zod_1.z.string().url().default('http://localhost:3000'),
    ALLOWED_ORIGINS: zod_1.z.string().default('http://localhost:3000'),
    MAX_FILE_SIZE: zod_1.z.string().transform(Number).default('10485760'),
    UPLOAD_PATH: zod_1.z.string().default('./uploads'),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().transform(Number).optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    FROM_EMAIL: zod_1.z.string().email().optional(),
    CHAPA_SECRET_KEY: zod_1.z.string().optional(),
    TELEBIRR_API_KEY: zod_1.z.string().optional(),
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().transform(Number).default('900000'),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().transform(Number).default('100'),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    LOG_FILE: zod_1.z.string().default('logs/masada.log'),
    BCRYPT_ROUNDS: zod_1.z.string().transform(Number).default('12'),
    SESSION_SECRET: zod_1.z.string().min(32).optional(),
    DEFAULT_TIMEZONE: zod_1.z.string().default('Africa/Addis_Ababa'),
    DEFAULT_CURRENCY: zod_1.z.string().default('ETB'),
    DEFAULT_LANGUAGE: zod_1.z.string().default('en'),
    SUPPORTED_LANGUAGES: zod_1.z.string().default('en,am'),
});
const parseEnv = () => {
    try {
        return envSchema.parse(process.env);
    }
    catch (error) {
        console.error('❌ Invalid environment configuration:');
        if (error instanceof zod_1.z.ZodError) {
            error.errors.forEach((err) => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
        }
        process.exit(1);
    }
};
const env = parseEnv();
exports.config = {
    database: {
        url: env.DATABASE_URL,
    },
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    apiVersion: env.API_VERSION,
    jwt: {
        secret: env.JWT_SECRET,
        expiresIn: env.JWT_EXPIRES_IN,
        refreshSecret: env.JWT_REFRESH_SECRET,
        refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    },
    cors: {
        frontendUrl: env.FRONTEND_URL,
        allowedOrigins: env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()),
    },
    upload: {
        maxFileSize: env.MAX_FILE_SIZE,
        uploadPath: env.UPLOAD_PATH,
        allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/webm',
            'application/pdf',
            'text/plain',
        ],
    },
    email: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
        from: env.FROM_EMAIL,
    },
    payment: {
        chapa: {
            secretKey: env.CHAPA_SECRET_KEY,
        },
        telebirr: {
            apiKey: env.TELEBIRR_API_KEY,
        },
    },
    rateLimit: {
        windowMs: env.RATE_LIMIT_WINDOW_MS,
        maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    },
    logging: {
        level: env.LOG_LEVEL,
        file: env.LOG_FILE,
    },
    security: {
        bcryptRounds: env.BCRYPT_ROUNDS,
        sessionSecret: env.SESSION_SECRET,
    },
    ethiopian: {
        timezone: env.DEFAULT_TIMEZONE,
        currency: env.DEFAULT_CURRENCY,
        defaultLanguage: env.DEFAULT_LANGUAGE,
        supportedLanguages: env.SUPPORTED_LANGUAGES.split(',').map(lang => lang.trim()),
    },
};
const validateProductionConfig = () => {
    if (exports.config.nodeEnv === 'production') {
        const requiredFields = [
            'JWT_SECRET',
            'JWT_REFRESH_SECRET',
            'DATABASE_URL',
        ];
        const missingFields = requiredFields.filter(field => !process.env[field]);
        if (missingFields.length > 0) {
            console.error('❌ Missing required production environment variables:');
            missingFields.forEach(field => console.error(`  - ${field}`));
            process.exit(1);
        }
    }
};
exports.validateProductionConfig = validateProductionConfig;
(0, exports.validateProductionConfig)();
//# sourceMappingURL=environment.js.map