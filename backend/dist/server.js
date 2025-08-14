"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const environment_1 = require("./config/environment");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
const auth_1 = require("./middleware/auth");
const auth_2 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const tests_1 = __importDefault(require("./routes/tests"));
const sessions_1 = __importDefault(require("./routes/sessions"));
const payments_1 = __importDefault(require("./routes/payments"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const socketManager_1 = __importDefault(require("./websocket/socketManager"));
const notificationService_1 = require("./services/notificationService");
class MasadaServer {
    app;
    port;
    httpServer;
    socketManager;
    constructor() {
        this.app = (0, express_1.default)();
        this.port = environment_1.config.port;
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
        this.initializeWebsocket();
    }
    initializeMiddleware() {
        this.app.use((0, helmet_1.default)({
            crossOriginEmbedderPolicy: false,
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));
        this.app.use((0, cors_1.default)({
            origin: environment_1.config.cors.allowedOrigins,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        }));
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: environment_1.config.rateLimit.windowMs,
            max: environment_1.config.rateLimit.maxRequests,
            message: {
                error: 'Too many requests from this IP, please try again later.',
                retryAfter: Math.ceil(environment_1.config.rateLimit.windowMs / 1000),
            },
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use('/api/', limiter);
        this.app.use(express_1.default.json({
            limit: '10mb',
            verify: (req, res, buf) => {
                req.rawBody = buf;
            }
        }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use(requestLogger_1.requestLogger);
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                environment: environment_1.config.nodeEnv,
                version: environment_1.config.apiVersion,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
            });
        });
        this.app.get('/api', (req, res) => {
            res.json({
                name: 'Masada API',
                description: 'Ethiopian Usability Testing Platform API',
                version: environment_1.config.apiVersion,
                environment: environment_1.config.nodeEnv,
                documentation: '/api/docs',
                endpoints: {
                    auth: '/api/v1/auth',
                    users: '/api/v1/users',
                    tests: '/api/v1/tests',
                    sessions: '/api/v1/sessions',
                    payments: '/api/v1/payments',
                    analytics: '/api/v1/analytics',
                    uploads: '/api/v1/uploads',
                },
            });
        });
    }
    initializeRoutes() {
        const apiPrefix = `/api/${environment_1.config.apiVersion}`;
        this.app.use(`${apiPrefix}/auth`, auth_2.default);
        this.app.use(`${apiPrefix}/uploads`, uploads_1.default);
        this.app.use(`${apiPrefix}/users`, auth_1.authMiddleware, users_1.default);
        this.app.use(`${apiPrefix}/tests`, auth_1.authMiddleware, tests_1.default);
        this.app.use(`${apiPrefix}/sessions`, auth_1.authMiddleware, sessions_1.default);
        this.app.use(`${apiPrefix}/payments`, auth_1.authMiddleware, payments_1.default);
        this.app.use(`${apiPrefix}/analytics`, auth_1.authMiddleware, analytics_1.default);
        this.app.use('*', errorHandler_1.notFoundHandler);
    }
    initializeErrorHandling() {
        this.app.use(errorHandler_1.errorHandler);
    }
    initializeWebsocket() {
        this.httpServer = (0, http_1.createServer)(this.app);
        try {
            this.socketManager = new socketManager_1.default(this.httpServer);
            notificationService_1.notificationService.setSocketManager(this.socketManager);
        }
        catch (err) {
            logger_1.logger.error('Failed to initialize WebSocket server', { err });
        }
    }
    start() {
        const server = this.httpServer ?? this.app.listen(this.port);
        server.listen?.(this.port, () => {
            logger_1.logger.info(`🚀 Masada API Server started successfully`);
            logger_1.logger.info(`📍 Environment: ${environment_1.config.nodeEnv}`);
            logger_1.logger.info(`🌐 Server running on port ${this.port}`);
            logger_1.logger.info(`📊 API Version: ${environment_1.config.apiVersion}`);
            logger_1.logger.info(`🇪🇹 Serving Ethiopian Usability Testing Platform`);
            logger_1.logger.info(`📖 API Documentation: http://localhost:${this.port}/api`);
            logger_1.logger.info(`❤️  Health Check: http://localhost:${this.port}/health`);
            if (environment_1.config.nodeEnv === 'development') {
                logger_1.logger.info(`🔧 Development mode - Hot reload enabled`);
                logger_1.logger.info(`📝 Database Studio: npx prisma studio`);
            }
        });
        process.on('SIGTERM', this.gracefulShutdown.bind(this));
        process.on('SIGINT', this.gracefulShutdown.bind(this));
    }
    gracefulShutdown(signal) {
        logger_1.logger.info(`🛑 Received ${signal}. Starting graceful shutdown...`);
        process.exit(0);
    }
}
const server = new MasadaServer();
server.start();
exports.default = server;
//# sourceMappingURL=server.js.map