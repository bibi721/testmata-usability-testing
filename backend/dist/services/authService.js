"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const environment_1 = require("../config/environment");
const logger_1 = require("../utils/logger");
const errors_1 = require("../utils/errors");
const emailService_1 = require("../services/emailService");
const prisma = new client_1.PrismaClient();
class AuthService {
    async register(data) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email.toLowerCase() },
            });
            if (existingUser) {
                throw new errors_1.ConflictError('User with this email already exists');
            }
            const hashedPassword = await bcryptjs_1.default.hash(data.password, environment_1.config.security.bcryptRounds);
            const result = await prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        email: data.email.toLowerCase(),
                        password: hashedPassword,
                        name: data.name,
                        userType: data.userType,
                        status: 'PENDING_VERIFICATION',
                    },
                });
                if (data.userType === 'CUSTOMER') {
                    await tx.customerProfile.create({
                        data: {
                            userId: user.id,
                            company: `${data.name}'s Company`,
                        },
                    });
                }
                else if (data.userType === 'TESTER') {
                    const testerData = data;
                    await tx.testerProfile.create({
                        data: {
                            userId: user.id,
                            phone: testerData.phone ?? null,
                            city: testerData.city ?? null,
                            region: testerData.region ?? null,
                            age: testerData.age ?? null,
                            education: testerData.education ?? null,
                            occupation: testerData.occupation ?? null,
                            experience: testerData.experience ?? null,
                            languages: testerData.languages || [],
                            devices: testerData.devices || [],
                            internetSpeed: testerData.internetSpeed ?? null,
                            availability: testerData.availability ?? null,
                            motivation: testerData.motivation ?? null,
                        },
                    });
                }
                return user;
            });
            const { accessToken, refreshToken } = await this.generateTokens(result);
            await this.sendVerificationEmail(result);
            logger_1.logger.info('User registered successfully', {
                userId: result.id,
                email: result.email,
                userType: result.userType,
            });
            return {
                user: {
                    id: result.id,
                    email: result.email,
                    name: result.name,
                    userType: result.userType,
                    status: result.status,
                    emailVerified: result.emailVerified,
                },
                accessToken,
                refreshToken,
            };
        }
        catch (error) {
            logger_1.logger.error('Registration failed', { error, email: data.email });
            throw error;
        }
    }
    async login(email, password) {
        try {
            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() },
                include: {
                    customerProfile: true,
                    testerProfile: true,
                },
            });
            if (!user) {
                throw new errors_1.AuthenticationError('Invalid email or password');
            }
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                throw new errors_1.AuthenticationError('Invalid email or password');
            }
            if (user.status === 'SUSPENDED') {
                throw new errors_1.AuthenticationError('Account is suspended. Please contact support.');
            }
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
            });
            const { accessToken, refreshToken } = await this.generateTokens(user);
            logger_1.logger.info('User logged in successfully', {
                userId: user.id,
                email: user.email,
                userType: user.userType,
            });
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    userType: user.userType,
                    status: user.status,
                    emailVerified: user.emailVerified,
                },
                accessToken,
                refreshToken,
            };
        }
        catch (error) {
            logger_1.logger.error('Login failed', { error, email });
            throw error;
        }
    }
    async refreshToken(refreshTokenString) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshTokenString, environment_1.config.jwt.refreshSecret);
            const refreshToken = await prisma.refreshToken.findUnique({
                where: { token: refreshTokenString },
                include: { user: true },
            });
            if (!refreshToken || refreshToken.expiresAt < new Date()) {
                throw new errors_1.AuthenticationError('Invalid or expired refresh token');
            }
            if (refreshToken.user.status !== 'ACTIVE') {
                throw new errors_1.AuthenticationError('Account is not active');
            }
            const tokens = await this.generateTokens(refreshToken.user);
            await prisma.refreshToken.delete({
                where: { id: refreshToken.id },
            });
            logger_1.logger.info('Token refreshed successfully', {
                userId: refreshToken.user.id,
            });
            return tokens;
        }
        catch (error) {
            logger_1.logger.error('Token refresh failed', { error });
            throw error;
        }
    }
    async logout(refreshTokenString) {
        try {
            await prisma.refreshToken.deleteMany({
                where: { token: refreshTokenString },
            });
            logger_1.logger.info('User logged out successfully');
        }
        catch (error) {
            logger_1.logger.error('Logout failed', { error });
            throw error;
        }
    }
    async verifyEmail(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, environment_1.config.jwt.secret);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
            });
            if (!user) {
                throw new errors_1.NotFoundError('User');
            }
            if (user.emailVerified) {
                throw new errors_1.ValidationError('Email is already verified');
            }
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: true,
                    emailVerifiedAt: new Date(),
                    status: 'ACTIVE',
                },
            });
            logger_1.logger.info('Email verified successfully', {
                userId: user.id,
                email: user.email,
            });
        }
        catch (error) {
            logger_1.logger.error('Email verification failed', { error });
            throw error;
        }
    }
    async forgotPassword(email) {
        try {
            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() },
            });
            if (!user) {
                logger_1.logger.warn('Password reset requested for non-existent email', { email });
                return;
            }
            const resetToken = jsonwebtoken_1.default.sign({ userId: user.id, type: 'password_reset' }, environment_1.config.jwt.secret, { expiresIn: '1h' });
            await emailService_1.emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
            logger_1.logger.info('Password reset email sent', {
                userId: user.id,
                email: user.email,
            });
        }
        catch (error) {
            logger_1.logger.error('Password reset failed', { error, email });
            throw error;
        }
    }
    async resetPassword(token, newPassword) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, environment_1.config.jwt.secret);
            if (decoded.type !== 'password_reset') {
                throw new errors_1.ValidationError('Invalid reset token');
            }
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
            });
            if (!user) {
                throw new errors_1.NotFoundError('User');
            }
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, environment_1.config.security.bcryptRounds);
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: user.id },
                    data: { password: hashedPassword },
                }),
                prisma.refreshToken.deleteMany({
                    where: { userId: user.id },
                }),
            ]);
            logger_1.logger.info('Password reset successfully', {
                userId: user.id,
                email: user.email,
            });
        }
        catch (error) {
            logger_1.logger.error('Password reset failed', { error });
            throw error;
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new errors_1.NotFoundError('User');
            }
            const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new errors_1.AuthenticationError('Current password is incorrect');
            }
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, environment_1.config.security.bcryptRounds);
            await prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword },
            });
            logger_1.logger.info('Password changed successfully', {
                userId: user.id,
                email: user.email,
            });
        }
        catch (error) {
            logger_1.logger.error('Password change failed', { error, userId });
            throw error;
        }
    }
    async generateTokens(user) {
        const accessToken = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            userType: user.userType,
        }, environment_1.config.jwt.secret, { expiresIn: environment_1.config.jwt.expiresIn });
        const refreshTokenString = jsonwebtoken_1.default.sign({ userId: user.id }, environment_1.config.jwt.refreshSecret, { expiresIn: environment_1.config.jwt.refreshExpiresIn });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await prisma.refreshToken.create({
            data: {
                token: refreshTokenString,
                userId: user.id,
                expiresAt,
            },
        });
        return { accessToken, refreshToken: refreshTokenString };
    }
    async sendVerificationEmail(user) {
        const verificationToken = jsonwebtoken_1.default.sign({ userId: user.id, type: 'email_verification' }, environment_1.config.jwt.secret, { expiresIn: '24h' });
        await emailService_1.emailService.sendVerificationEmail(user.email, user.name, verificationToken);
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
exports.default = exports.authService;
//# sourceMappingURL=authService.js.map