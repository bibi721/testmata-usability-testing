"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const emailService_1 = require("../services/emailService");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/', (0, validation_1.validateRequest)({ query: validation_1.commonSchemas.pagination }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const userType = req.user.userType;
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    let payments = [];
    let total = 0;
    if (userType === 'CUSTOMER') {
        [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where: { customerId: userId },
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.payment.count({ where: { customerId: userId } }),
        ]);
    }
    else if (userType === 'TESTER') {
        [payments, total] = await Promise.all([
            prisma.earning.findMany({
                where: { testerId: userId },
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.earning.count({ where: { testerId: userId } }),
        ]);
    }
    res.json({ success: true, data: { payments, pagination: { page, limit, total, pages: Math.ceil((total || 0) / (limit || 1)) } } });
}));
router.post('/', (0, auth_1.requireRole)('CUSTOMER'), (0, validation_1.validateRequest)({ body: validation_1.paymentSchemas.createPayment }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { amount, currency, method, description, metadata } = req.body;
    const payment = await prisma.payment.create({
        data: {
            customerId: userId,
            amount,
            currency,
            method,
            description,
            metadata,
            status: 'PENDING',
        },
    });
    let paymentResult;
    try {
        switch (method) {
            case 'CHAPA':
                paymentResult = await processEthiopianPayment('chapa', payment);
                break;
            case 'TELEBIRR':
                paymentResult = await processEthiopianPayment('telebirr', payment);
                break;
            case 'CBE_BIRR':
                paymentResult = await processEthiopianPayment('cbe_birr', payment);
                break;
            case 'CREDIT_CARD':
                paymentResult = await processInternationalPayment(payment);
                break;
            default:
                throw new errors_1.PaymentError('Unsupported payment method');
        }
        const updatedPayment = await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: paymentResult.status,
                transactionId: paymentResult.transactionId,
                metadata: payment.metadata || paymentResult.metadata,
            },
        });
        (0, logger_1.logPayment)({
            paymentId: payment.id,
            customerId: userId,
            amount,
            currency,
            method,
            status: paymentResult.status,
            transactionId: paymentResult.transactionId,
        });
        res.status(201).json({
            success: true,
            message: 'Payment initiated successfully',
            data: {
                payment: updatedPayment,
                paymentUrl: paymentResult.paymentUrl,
            },
        });
    }
    catch (error) {
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' },
        });
        logger_1.logger.error('Payment processing failed', {
            paymentId: payment.id,
            error: error.message,
            userId,
        });
        throw error;
    }
}));
router.get('/:id', (0, validation_1.validateRequest)({ params: validation_1.commonSchemas.id }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.userType;
    let payment;
    if (userType === 'CUSTOMER') {
        payment = await prisma.payment.findFirst({
            where: { id, customerId: userId },
        });
    }
    else if (userType === 'TESTER') {
        payment = await prisma.earning.findFirst({
            where: { id, testerId: userId },
        });
    }
    if (!payment) {
        throw new errors_1.NotFoundError('Payment');
    }
    res.json({
        success: true,
        data: { payment },
    });
}));
router.post('/:id/verify', (0, validation_1.validateRequest)({ params: validation_1.commonSchemas.id }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const payment = await prisma.payment.findFirst({
        where: { id, customerId: userId },
        include: {
            customer: {
                select: { id: true, name: true, email: true },
            },
        },
    });
    if (!payment) {
        throw new errors_1.NotFoundError('Payment');
    }
    if (payment.status === 'COMPLETED') {
        return res.json({
            success: true,
            message: 'Payment already verified',
            data: { payment },
        });
    }
    let verificationResult;
    try {
        switch (payment.method) {
            case 'CHAPA':
                verificationResult = await verifyEthiopianPayment('chapa', payment.transactionId);
                break;
            case 'TELEBIRR':
                verificationResult = await verifyEthiopianPayment('telebirr', payment.transactionId);
                break;
            case 'CBE_BIRR':
                verificationResult = await verifyEthiopianPayment('cbe_birr', payment.transactionId);
                break;
            default:
                verificationResult = await verifyInternationalPayment(payment.transactionId);
        }
        const updatedPayment = await prisma.payment.update({
            where: { id },
            data: {
                status: verificationResult.status,
                paidAt: verificationResult.status === 'COMPLETED' ? new Date() : null,
                metadata: payment.metadata || verificationResult.metadata,
            },
        });
        if (verificationResult.status === 'COMPLETED') {
            await emailService_1.emailService.sendPaymentNotification(payment.customer.email, payment.customer.name, {
                amount: payment.amount,
                currency: payment.currency,
                status: 'COMPLETED',
                transactionId: payment.transactionId,
            });
        }
        logger_1.logger.info('Payment verified', {
            paymentId: id,
            status: verificationResult.status,
            userId,
        });
        res.json({
            success: true,
            message: 'Payment verification completed',
            data: { payment: updatedPayment },
        });
    }
    catch (error) {
        logger_1.logger.error('Payment verification failed', {
            paymentId: id,
            error: error.message,
            userId,
        });
        throw new errors_1.PaymentError('Payment verification failed');
    }
    return;
}));
router.get('/earnings/summary', (0, auth_1.requireRole)('TESTER'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const [totalEarnings, thisMonthEarnings, pendingEarnings, completedEarnings,] = await Promise.all([
        prisma.earning.aggregate({
            where: { testerId: userId },
            _sum: { amount: true },
            _count: { _all: true },
        }),
        prisma.earning.aggregate({
            where: {
                testerId: userId,
                createdAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            },
            _sum: { amount: true },
        }),
        prisma.earning.aggregate({
            where: { testerId: userId, status: 'PENDING' },
            _sum: { amount: true },
            _count: { _all: true },
        }),
        prisma.earning.aggregate({
            where: { testerId: userId, status: 'COMPLETED' },
            _sum: { amount: true },
            _count: { _all: true },
        }),
    ]);
    const summary = {
        totalEarnings: totalEarnings._sum.amount || 0,
        totalTests: totalEarnings._count,
        thisMonthEarnings: thisMonthEarnings._sum.amount || 0,
        pendingAmount: pendingEarnings._sum.amount || 0,
        pendingTests: pendingEarnings._count,
        completedAmount: completedEarnings._sum.amount || 0,
        completedTests: completedEarnings._count,
    };
    res.json({
        success: true,
        data: { summary },
    });
}));
async function processEthiopianPayment(provider, payment) {
    logger_1.logger.info(`Processing Ethiopian payment via ${provider}`, {
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
        status: 'PROCESSING',
        transactionId: `${provider.toUpperCase()}_${Date.now()}`,
        paymentUrl: `https://${provider}.com/pay/${payment.id}`,
        metadata: {
            provider,
            initiatedAt: new Date().toISOString(),
        },
    };
}
async function processInternationalPayment(payment) {
    logger_1.logger.info('Processing international payment', {
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
        status: 'PROCESSING',
        transactionId: `INTL_${Date.now()}`,
        paymentUrl: `https://payment-gateway.com/pay/${payment.id}`,
        metadata: {
            provider: 'international',
            initiatedAt: new Date().toISOString(),
        },
    };
}
async function verifyEthiopianPayment(provider, transactionId) {
    logger_1.logger.info(`Verifying Ethiopian payment via ${provider}`, { transactionId });
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        status: 'COMPLETED',
        metadata: {
            verifiedAt: new Date().toISOString(),
            provider,
        },
    };
}
async function verifyInternationalPayment(transactionId) {
    logger_1.logger.info('Verifying international payment', { transactionId });
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        status: 'COMPLETED',
        metadata: {
            verifiedAt: new Date().toISOString(),
            provider: 'international',
        },
    };
}
exports.default = router;
//# sourceMappingURL=payments.js.map