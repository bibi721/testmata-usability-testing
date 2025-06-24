/**
 * Payment Routes
 * Payment processing and Ethiopian payment gateway integration
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateRequest, paymentSchemas, commonSchemas } from '@/middleware/validation';
import { requireRole } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { ApiError, NotFoundError, PaymentError } from '@/utils/errors';
import { logger, logPayment } from '@/utils/logger';
import { AuthenticatedRequest } from '@/middleware/auth';
import { emailService } from '@/services/emailService';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/v1/payments
 * Get user's payment history
 */
router.get('/',
  validateRequest({ query: commonSchemas.pagination }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const userType = req.user!.userType;
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as any;

    let payments;
    let total;

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
    } else if (userType === 'TESTER') {
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

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  })
);

/**
 * POST /api/v1/payments
 * Create a new payment (for customers)
 */
router.post('/',
  requireRole('CUSTOMER'),
  validateRequest({ body: paymentSchemas.createPayment }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const { amount, currency, method, description, metadata } = req.body;

    // Create payment record
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

    // Process payment based on method
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
          throw new PaymentError('Unsupported payment method');
      }

      // Update payment with transaction details
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: paymentResult.status,
          transactionId: paymentResult.transactionId,
          metadata: {
            ...payment.metadata,
            ...paymentResult.metadata,
          },
        },
      });

      // Log payment
      logPayment({
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
    } catch (error) {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      logger.error('Payment processing failed', {
        paymentId: payment.id,
        error: error.message,
        userId,
      });

      throw error;
    }
  })
);

/**
 * GET /api/v1/payments/:id
 * Get payment details
 */
router.get('/:id',
  validateRequest({ params: commonSchemas.id }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userType = req.user!.userType;

    let payment;

    if (userType === 'CUSTOMER') {
      payment = await prisma.payment.findFirst({
        where: { id, customerId: userId },
      });
    } else if (userType === 'TESTER') {
      payment = await prisma.earning.findFirst({
        where: { id, testerId: userId },
      });
    }

    if (!payment) {
      throw new NotFoundError('Payment');
    }

    res.json({
      success: true,
      data: { payment },
    });
  })
);

/**
 * POST /api/v1/payments/:id/verify
 * Verify payment status (webhook or manual verification)
 */
router.post('/:id/verify',
  validateRequest({ params: commonSchemas.id }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const payment = await prisma.payment.findFirst({
      where: { id, customerId: userId },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment');
    }

    if (payment.status === 'COMPLETED') {
      return res.json({
        success: true,
        message: 'Payment already verified',
        data: { payment },
      });
    }

    // Verify payment with provider
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

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id },
        data: {
          status: verificationResult.status,
          paidAt: verificationResult.status === 'COMPLETED' ? new Date() : null,
          metadata: {
            ...payment.metadata,
            ...verificationResult.metadata,
          },
        },
      });

      // Send confirmation email if successful
      if (verificationResult.status === 'COMPLETED') {
        await emailService.sendPaymentNotification(
          payment.customer.email,
          payment.customer.name,
          {
            amount: payment.amount,
            currency: payment.currency,
            status: 'COMPLETED',
            transactionId: payment.transactionId,
          }
        );
      }

      logger.info('Payment verified', {
        paymentId: id,
        status: verificationResult.status,
        userId,
      });

      res.json({
        success: true,
        message: 'Payment verification completed',
        data: { payment: updatedPayment },
      });
    } catch (error) {
      logger.error('Payment verification failed', {
        paymentId: id,
        error: error.message,
        userId,
      });

      throw new PaymentError('Payment verification failed');
    }
  })
);

/**
 * GET /api/v1/payments/earnings/summary
 * Get earnings summary for testers
 */
router.get('/earnings/summary',
  requireRole('TESTER'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;

    const [
      totalEarnings,
      thisMonthEarnings,
      pendingEarnings,
      completedEarnings,
    ] = await Promise.all([
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
  })
);

/**
 * Ethiopian Payment Processing Functions
 */
async function processEthiopianPayment(provider: string, payment: any) {
  // Mock implementation - replace with actual Ethiopian payment gateway integration
  logger.info(`Processing Ethiopian payment via ${provider}`, {
    paymentId: payment.id,
    amount: payment.amount,
    currency: payment.currency,
  });

  // Simulate payment processing
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

async function processInternationalPayment(payment: any) {
  // Mock implementation - replace with actual international payment processing
  logger.info('Processing international payment', {
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

async function verifyEthiopianPayment(provider: string, transactionId: string) {
  // Mock verification - replace with actual verification
  logger.info(`Verifying Ethiopian payment via ${provider}`, { transactionId });

  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    status: 'COMPLETED',
    metadata: {
      verifiedAt: new Date().toISOString(),
      provider,
    },
  };
}

async function verifyInternationalPayment(transactionId: string) {
  // Mock verification - replace with actual verification
  logger.info('Verifying international payment', { transactionId });

  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    status: 'COMPLETED',
    metadata: {
      verifiedAt: new Date().toISOString(),
      provider: 'international',
    },
  };
}

export default router;