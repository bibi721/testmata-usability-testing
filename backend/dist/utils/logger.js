"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logTestSession = exports.logPayment = exports.logEthiopianEvent = exports.logError = exports.logRequest = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const environment_1 = require("../config/environment");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ensureLogDirectory = () => {
    const logDir = path_1.default.dirname(environment_1.config.logging.file);
    if (!fs_1.default.existsSync(logDir)) {
        fs_1.default.mkdirSync(logDir, { recursive: true });
    }
};
ensureLogDirectory();
const ethiopianFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({
    format: () => {
        return new Date().toLocaleString('en-US', {
            timeZone: environment_1.config.ethiopian.timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    },
}), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaString}`;
}));
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({
    format: 'HH:mm:ss',
}), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `🇪🇹 [${timestamp}] ${level}: ${message} ${metaString}`;
}));
exports.logger = winston_1.default.createLogger({
    level: environment_1.config.logging.level,
    format: ethiopianFormat,
    defaultMeta: {
        service: 'masada-api',
        environment: environment_1.config.nodeEnv,
        timezone: environment_1.config.ethiopian.timezone,
    },
    transports: [
        new winston_1.default.transports.File({
            filename: environment_1.config.logging.file,
            maxsize: 5242880,
            maxFiles: 5,
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(path_1.default.dirname(environment_1.config.logging.file), 'error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
});
if (environment_1.config.nodeEnv === 'development') {
    exports.logger.add(new winston_1.default.transports.Console({
        format: consoleFormat,
    }));
}
const logRequest = (req, res, duration) => {
    const logData = {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user?.id,
        userType: req.user?.userType,
    };
    if (res.statusCode >= 400) {
        exports.logger.warn('HTTP Request', logData);
    }
    else {
        exports.logger.info('HTTP Request', logData);
    }
};
exports.logRequest = logRequest;
const logError = (error, context) => {
    exports.logger.error('Application Error', {
        message: error.message,
        stack: error.stack,
        context,
    });
};
exports.logError = logError;
const logEthiopianEvent = (event, data) => {
    exports.logger.info(`Ethiopian Event: ${event}`, {
        event,
        data,
        timezone: environment_1.config.ethiopian.timezone,
        currency: environment_1.config.ethiopian.currency,
    });
};
exports.logEthiopianEvent = logEthiopianEvent;
const logPayment = (paymentData) => {
    exports.logger.info('Payment Event', {
        ...paymentData,
        cardNumber: paymentData.cardNumber ? '****' : undefined,
        cvv: undefined,
        password: undefined,
    });
};
exports.logPayment = logPayment;
const logTestSession = (sessionData) => {
    exports.logger.info('Test Session Event', {
        sessionId: sessionData.id,
        testId: sessionData.testId,
        testerId: sessionData.testerId,
        status: sessionData.status,
        duration: sessionData.duration,
        timestamp: new Date().toISOString(),
    });
};
exports.logTestSession = logTestSession;
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map