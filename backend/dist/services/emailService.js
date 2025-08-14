"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.EmailService = void 0;
const logger_1 = require("../utils/logger");
const environment_1 = require("../config/environment");
class EmailService {
    async sendVerificationEmail(email, name, token) {
        try {
            const verificationUrl = `${environment_1.config.cors.frontendUrl}/auth/verify-email?token=${token}`;
            logger_1.logger.info('Verification email would be sent', {
                to: email,
                name,
                verificationUrl,
                template: 'email_verification',
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to send verification email', { error, email });
            throw error;
        }
    }
    async sendPasswordResetEmail(email, name, token) {
        try {
            const resetUrl = `${environment_1.config.cors.frontendUrl}/auth/reset-password?token=${token}`;
            logger_1.logger.info('Password reset email would be sent', {
                to: email,
                name,
                resetUrl,
                template: 'password_reset',
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to send password reset email', { error, email });
            throw error;
        }
    }
    async sendTestInvitation(email, name, testDetails) {
        try {
            const testUrl = `${environment_1.config.cors.frontendUrl}/tester/test/${testDetails.id}`;
            logger_1.logger.info('Test invitation email would be sent', {
                to: email,
                name,
                testUrl,
                testTitle: testDetails.title,
                payment: testDetails.paymentPerTester,
                template: 'test_invitation',
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to send test invitation email', { error, email });
            throw error;
        }
    }
    async sendTestCompletionNotification(email, name, testDetails) {
        try {
            const resultsUrl = `${environment_1.config.cors.frontendUrl}/dashboard/tests/${testDetails.id}/results`;
            logger_1.logger.info('Test completion email would be sent', {
                to: email,
                name,
                resultsUrl,
                testTitle: testDetails.title,
                completedTesters: testDetails.completedTesters,
                template: 'test_completion',
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to send test completion email', { error, email });
            throw error;
        }
    }
    async sendPaymentNotification(email, name, paymentDetails) {
        try {
            logger_1.logger.info('Payment notification email would be sent', {
                to: email,
                name,
                amount: paymentDetails.amount,
                currency: paymentDetails.currency,
                status: paymentDetails.status,
                template: 'payment_notification',
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to send payment notification email', { error, email });
            throw error;
        }
    }
    async sendWelcomeEmail(email, name, userType) {
        try {
            const dashboardUrl = userType === 'CUSTOMER'
                ? `${environment_1.config.cors.frontendUrl}/dashboard`
                : `${environment_1.config.cors.frontendUrl}/tester/dashboard`;
            logger_1.logger.info('Welcome email would be sent', {
                to: email,
                name,
                userType,
                dashboardUrl,
                template: 'welcome',
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to send welcome email', { error, email });
            throw error;
        }
    }
    async sendEmail(options) {
        logger_1.logger.info('Email would be sent via email service', options);
    }
}
exports.EmailService = EmailService;
exports.emailService = new EmailService();
exports.default = exports.emailService;
//# sourceMappingURL=emailService.js.map