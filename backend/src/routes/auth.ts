/**
 * Authentication Routes
 * All authentication-related endpoints
 */

import { Router } from 'express';
import { authService } from '@/services/authService';
import { validateRequest, authSchemas } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';
import { sensitiveOperationLimit } from '@/middleware/auth';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Register a new user (customer or tester)
 */
router.post('/register', 
  validateRequest({ body: authSchemas.register }),
  asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: result,
    });
  })
);

/**
 * POST /api/v1/auth/register/tester
 * Register a new tester with additional profile data
 */
router.post('/register/tester',
  validateRequest({ 
    body: authSchemas.register.extend({
      phone: z.string().optional(),
      city: z.string().optional(),
      region: z.string().optional(),
      age: z.string().optional(),
      education: z.string().optional(),
      occupation: z.string().optional(),
      experience: z.string().optional(),
      languages: z.array(z.string()).optional(),
      devices: z.array(z.string()).optional(),
      internetSpeed: z.string().optional(),
      availability: z.string().optional(),
      motivation: z.string().optional(),
    })
  }),
  asyncHandler(async (req, res) => {
    const testerData = { ...req.body, userType: 'TESTER' as const };
    const result = await authService.register(testerData);
    
    res.status(201).json({
      success: true,
      message: 'Tester registration successful. Please check your email to verify your account.',
      data: result,
    });
  })
);

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post('/login',
  validateRequest({ body: authSchemas.login }),
  sensitiveOperationLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  })
);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post('/refresh',
  validateRequest({ body: authSchemas.refreshToken }),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    });
  })
);

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
router.post('/logout',
  validateRequest({ body: authSchemas.refreshToken }),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    
    res.json({
      success: true,
      message: 'Logout successful',
    });
  })
);

/**
 * POST /api/v1/auth/verify-email
 * Verify email address
 */
router.post('/verify-email',
  validateRequest({ body: authSchemas.verifyEmail }),
  asyncHandler(async (req, res) => {
    const { token } = req.body;
    await authService.verifyEmail(token);
    
    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  })
);

/**
 * POST /api/v1/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password',
  validateRequest({ body: authSchemas.forgotPassword }),
  sensitiveOperationLimit(3, 60 * 60 * 1000), // 3 attempts per hour
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    await authService.forgotPassword(email);
    
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  })
);

/**
 * POST /api/v1/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password',
  validateRequest({ body: authSchemas.resetPassword }),
  sensitiveOperationLimit(3, 60 * 60 * 1000), // 3 attempts per hour
  asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    
    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  })
);

/**
 * POST /api/v1/auth/change-password
 * Change password (authenticated)
 */
router.post('/change-password',
  validateRequest({ body: authSchemas.changePassword }),
  sensitiveOperationLimit(5, 60 * 60 * 1000), // 5 attempts per hour
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user?.id;
    
    await authService.changePassword(userId, currentPassword, newPassword);
    
    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  })
);

/**
 * GET /api/v1/auth/me
 * Get current user info (requires authentication)
 */
router.get('/me',
  asyncHandler(async (req, res) => {
    const user = (req as any).user;
    
    res.json({
      success: true,
      data: {
        user,
      },
    });
  })
);

export default router;