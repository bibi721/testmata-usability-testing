"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authService_1 = require("../services/authService");
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.post('/register', (0, validation_1.validateRequest)({ body: validation_1.authSchemas.register }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await authService_1.authService.register(req.body);
    res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: result,
    });
}));
router.post('/register/tester', (0, validation_1.validateRequest)({
    body: validation_1.authSchemas.register.extend({
        phone: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        region: zod_1.z.string().optional(),
        age: zod_1.z.string().optional(),
        education: zod_1.z.string().optional(),
        occupation: zod_1.z.string().optional(),
        experience: zod_1.z.string().optional(),
        languages: zod_1.z.array(zod_1.z.string()).optional(),
        devices: zod_1.z.array(zod_1.z.string()).optional(),
        internetSpeed: zod_1.z.string().optional(),
        availability: zod_1.z.string().optional(),
        motivation: zod_1.z.string().optional(),
    })
}), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const testerData = { ...req.body, userType: 'TESTER' };
    const result = await authService_1.authService.register(testerData);
    res.status(201).json({
        success: true,
        message: 'Tester registration successful. Please check your email to verify your account.',
        data: result,
    });
}));
router.post('/login', (0, validation_1.validateRequest)({ body: validation_1.authSchemas.login }), (0, auth_1.sensitiveOperationLimit)(5, 15 * 60 * 1000), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService_1.authService.login(email, password);
    res.json({
        success: true,
        message: 'Login successful',
        data: result,
    });
}));
router.post('/refresh', (0, validation_1.validateRequest)({ body: validation_1.authSchemas.refreshToken }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService_1.authService.refreshToken(refreshToken);
    res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
    });
}));
router.post('/logout', (0, validation_1.validateRequest)({ body: validation_1.authSchemas.refreshToken }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    await authService_1.authService.logout(refreshToken);
    res.json({
        success: true,
        message: 'Logout successful',
    });
}));
router.post('/verify-email', (0, validation_1.validateRequest)({ body: validation_1.authSchemas.verifyEmail }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { token } = req.body;
    await authService_1.authService.verifyEmail(token);
    res.json({
        success: true,
        message: 'Email verified successfully',
    });
}));
router.post('/forgot-password', (0, validation_1.validateRequest)({ body: validation_1.authSchemas.forgotPassword }), (0, auth_1.sensitiveOperationLimit)(3, 60 * 60 * 1000), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    await authService_1.authService.forgotPassword(email);
    res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
    });
}));
router.post('/reset-password', (0, validation_1.validateRequest)({ body: validation_1.authSchemas.resetPassword }), (0, auth_1.sensitiveOperationLimit)(3, 60 * 60 * 1000), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { token, password } = req.body;
    await authService_1.authService.resetPassword(token, password);
    res.json({
        success: true,
        message: 'Password reset successfully',
    });
}));
router.post('/change-password', (0, validation_1.validateRequest)({ body: validation_1.authSchemas.changePassword }), (0, auth_1.sensitiveOperationLimit)(5, 60 * 60 * 1000), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;
    await authService_1.authService.changePassword(userId, currentPassword, newPassword);
    res.json({
        success: true,
        message: 'Password changed successfully',
    });
}));
router.get('/me', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    res.json({
        success: true,
        data: {
            user,
        },
    });
}));
exports.default = router;
//# sourceMappingURL=auth.js.map