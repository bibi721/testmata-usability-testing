"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentSchemas = exports.sessionSchemas = exports.testSchemas = exports.userSchemas = exports.authSchemas = exports.commonSchemas = exports.validateRequest = void 0;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            if (schema.body) {
                req.body = schema.body.parse(req.body);
            }
            if (schema.query) {
                req.query = schema.query.parse(req.query);
            }
            if (schema.params) {
                req.params = schema.params.parse(req.params);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const validationErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code,
                }));
                logger_1.logger.warn('Request validation failed', {
                    endpoint: req.originalUrl,
                    method: req.method,
                    errors: validationErrors,
                    ip: req.ip,
                });
                return next(new errors_1.ApiError(400, 'Validation failed', validationErrors));
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
exports.commonSchemas = {
    pagination: zod_1.z.object({
        page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).optional().default('1'),
        limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(100)).optional().default('10'),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
    id: zod_1.z.object({
        id: zod_1.z.string().cuid(),
    }),
    email: zod_1.z.string().email().toLowerCase(),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/\d/, 'Password must contain at least one number'),
    ethiopianPhone: zod_1.z.string()
        .regex(/^(\+251|0)[79]\d{8}$/, 'Invalid Ethiopian phone number format'),
    ethiopianRegion: zod_1.z.enum([
        'Addis Ababa',
        'Afar',
        'Amhara',
        'Benishangul-Gumuz',
        'Dire Dawa',
        'Gambela',
        'Harari',
        'Oromia',
        'Sidama',
        'SNNPR',
        'Somali',
        'Tigray',
    ]),
    languageCode: zod_1.z.enum(['en', 'am']),
    currency: zod_1.z.enum(['ETB', 'USD']).default('ETB'),
    fileUpload: zod_1.z.object({
        filename: zod_1.z.string(),
        mimetype: zod_1.z.string(),
        size: zod_1.z.number().max(10 * 1024 * 1024),
    }),
};
exports.authSchemas = {
    register: zod_1.z.object({
        email: exports.commonSchemas.email,
        password: exports.commonSchemas.password,
        name: zod_1.z.string().min(2).max(100),
        userType: zod_1.z.enum(['CUSTOMER', 'TESTER']).default('CUSTOMER'),
    }),
    login: zod_1.z.object({
        email: exports.commonSchemas.email,
        password: zod_1.z.string().min(1),
    }),
    refreshToken: zod_1.z.object({
        refreshToken: zod_1.z.string(),
    }),
    forgotPassword: zod_1.z.object({
        email: exports.commonSchemas.email,
    }),
    resetPassword: zod_1.z.object({
        token: zod_1.z.string(),
        password: exports.commonSchemas.password,
    }),
    changePassword: zod_1.z.object({
        currentPassword: zod_1.z.string(),
        newPassword: exports.commonSchemas.password,
    }),
    verifyEmail: zod_1.z.object({
        token: zod_1.z.string(),
    }),
};
exports.userSchemas = {
    updateProfile: zod_1.z.object({
        name: zod_1.z.string().min(2).max(100).optional(),
        avatar: zod_1.z.string().url().optional(),
    }),
    updateCustomerProfile: zod_1.z.object({
        company: zod_1.z.string().max(200).optional(),
        website: zod_1.z.string().url().optional(),
        industry: zod_1.z.string().max(100).optional(),
        companySize: zod_1.z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional(),
    }),
    updateTesterProfile: zod_1.z.object({
        phone: exports.commonSchemas.ethiopianPhone.optional(),
        city: zod_1.z.string().max(100).optional(),
        region: exports.commonSchemas.ethiopianRegion.optional(),
        age: zod_1.z.enum(['18-24', '25-34', '35-44', '45-54', '55+']).optional(),
        education: zod_1.z.enum([
            'High School',
            'Diploma',
            'Bachelor\'s Degree',
            'Master\'s Degree',
            'PhD',
        ]).optional(),
        occupation: zod_1.z.string().max(100).optional(),
        experience: zod_1.z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional(),
        languages: zod_1.z.array(zod_1.z.string()).optional(),
        devices: zod_1.z.array(zod_1.z.string()).optional(),
        internetSpeed: zod_1.z.enum(['Slow', 'Medium', 'Fast']).optional(),
        availability: zod_1.z.enum(['1-5', '6-10', '11-20', '20+']).optional(),
        motivation: zod_1.z.string().max(500).optional(),
    }),
};
exports.testSchemas = {
    createTest: zod_1.z.object({
        title: zod_1.z.string().min(5).max(200),
        description: zod_1.z.string().min(10).max(1000),
        instructions: zod_1.z.string().max(2000).optional(),
        testType: zod_1.z.enum(['USABILITY', 'FEEDBACK', 'SURVEY', 'INTERVIEW']),
        platform: zod_1.z.enum(['WEB', 'MOBILE_APP', 'DESKTOP']),
        targetUrl: zod_1.z.string().url().optional(),
        maxTesters: zod_1.z.number().min(1).max(100).default(10),
        paymentPerTester: zod_1.z.number().min(5).max(1000),
        estimatedDuration: zod_1.z.number().min(5).max(120),
        requirements: zod_1.z.array(zod_1.z.string()).optional(),
        tasks: zod_1.z.any().optional(),
        demographics: zod_1.z.any().optional(),
    }),
    updateTest: zod_1.z.object({
        title: zod_1.z.string().min(5).max(200).optional(),
        description: zod_1.z.string().min(10).max(1000).optional(),
        instructions: zod_1.z.string().max(2000).optional(),
        maxTesters: zod_1.z.number().min(1).max(100).optional(),
        paymentPerTester: zod_1.z.number().min(5).max(1000).optional(),
        estimatedDuration: zod_1.z.number().min(5).max(120).optional(),
        requirements: zod_1.z.array(zod_1.z.string()).optional(),
        tasks: zod_1.z.any().optional(),
        demographics: zod_1.z.any().optional(),
    }),
    publishTest: zod_1.z.object({
        publishedAt: zod_1.z.string().datetime().optional(),
    }),
};
exports.sessionSchemas = {
    startSession: zod_1.z.object({
        testId: zod_1.z.string().cuid(),
        deviceInfo: zod_1.z.object({
            userAgent: zod_1.z.string(),
            screenResolution: zod_1.z.string().optional(),
            deviceType: zod_1.z.enum(['mobile', 'tablet', 'desktop']).optional(),
        }).optional(),
    }),
    updateSession: zod_1.z.object({
        status: zod_1.z.enum(['IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
        feedback: zod_1.z.string().max(2000).optional(),
        rating: zod_1.z.number().min(1).max(5).optional(),
        taskResults: zod_1.z.any().optional(),
    }),
    submitRecording: zod_1.z.object({
        recordingUrl: zod_1.z.string().url(),
        duration: zod_1.z.number().min(1),
    }),
};
exports.paymentSchemas = {
    createPayment: zod_1.z.object({
        amount: zod_1.z.number().min(1),
        currency: exports.commonSchemas.currency,
        method: zod_1.z.enum(['CREDIT_CARD', 'CHAPA', 'TELEBIRR', 'CBE_BIRR', 'BANK_TRANSFER']),
        description: zod_1.z.string().max(500).optional(),
        metadata: zod_1.z.any().optional(),
    }),
    updatePayment: zod_1.z.object({
        status: zod_1.z.enum(['PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED']),
        transactionId: zod_1.z.string().optional(),
        metadata: zod_1.z.any().optional(),
    }),
};
exports.default = exports.validateRequest;
//# sourceMappingURL=validation.js.map