"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = require("../utils/logger");
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const duration = Date.now() - startTime;
        (0, logger_1.logRequest)(req, res, duration);
        return originalEnd.call(this, chunk, encoding);
    };
    next();
};
exports.requestLogger = requestLogger;
exports.default = exports.requestLogger;
//# sourceMappingURL=requestLogger.js.map