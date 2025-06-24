/**
 * Authentication Service
 * Core authentication logic for the Masada platform
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, User, UserType, UserStatus } from '@prisma/client';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { 
  ApiError, 
  AuthenticationError, 
  ConflictError, 
  NotFoundError,
  ValidationError 
} from '@/utils/errors';
import { emailService } from '@/services/emailService';

const prisma = new PrismaClient();

/**
 * Authentication response interface
 */
interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    userType: UserType;
    status: UserStatus;
    emailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Registration data interface
 */
interface RegisterData {
  email: string;
  password: string;
  name: string;
  userType: UserType;
}

/**
 * Tester registration data interface
 */
interface TesterRegisterData extends RegisterData {
  phone?: string;
  city?: string;
  region?: string;
  age?: string;
  education?: string;
  occupation?: string;
  experience?: string;
  languages?: string[];
  devices?: string[];
  internetSpeed?: string;
  availability?: string;
  motivation?: string;
}

/**
 * Authentication Service Class
 */
export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData | TesterRegisterData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, config.security.bcryptRounds);

      // Create user in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email: data.email.toLowerCase(),
            password: hashedPassword,
            name: data.name,
            userType: data.userType,
            status: 'PENDING_VERIFICATION',
          },
        });

        // Create profile based on user type
        if (data.userType === 'CUSTOMER') {
          await tx.customerProfile.create({
            data: {
              userId: user.id,
              company: `${data.name}'s Company`,
            },
          });
        } else if (data.userType === 'TESTER') {
          const testerData = data as TesterRegisterData;
          await tx.testerProfile.create({
            data: {
              userId: user.id,
              phone: testerData.phone,
              city: testerData.city,
              region: testerData.region,
              age: testerData.age,
              education: testerData.education,
              occupation: testerData.occupation,
              experience: testerData.experience,
              languages: testerData.languages || [],
              devices: testerData.devices || [],
              internetSpeed: testerData.internetSpeed,
              availability: testerData.availability,
              motivation: testerData.motivation,
            },
          });
        }

        return user;
      });

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens(result);

      // Send verification email
      await this.sendVerificationEmail(result);

      // Log registration
      logger.info('User registered successfully', {
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
    } catch (error) {
      logger.error('Registration failed', { error, email: data.email });
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Find user with profile data
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          customerProfile: true,
          testerProfile: true,
        },
      });

      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check if account is suspended
      if (user.status === 'SUSPENDED') {
        throw new AuthenticationError('Account is suspended. Please contact support.');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens(user);

      // Log successful login
      logger.info('User logged in successfully', {
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
    } catch (error) {
      logger.error('Login failed', { error, email });
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshTokenString: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshTokenString, config.jwt.refreshSecret) as any;

      // Find refresh token in database
      const refreshToken = await prisma.refreshToken.findUnique({
        where: { token: refreshTokenString },
        include: { user: true },
      });

      if (!refreshToken || refreshToken.expiresAt < new Date()) {
        throw new AuthenticationError('Invalid or expired refresh token');
      }

      // Check if user is still active
      if (refreshToken.user.status !== 'ACTIVE') {
        throw new AuthenticationError('Account is not active');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(refreshToken.user);

      // Delete old refresh token
      await prisma.refreshToken.delete({
        where: { id: refreshToken.id },
      });

      logger.info('Token refreshed successfully', {
        userId: refreshToken.user.id,
      });

      return tokens;
    } catch (error) {
      logger.error('Token refresh failed', { error });
      throw error;
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(refreshTokenString: string): Promise<void> {
    try {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshTokenString },
      });

      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout failed', { error });
      throw error;
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      if (user.emailVerified) {
        throw new ValidationError('Email is already verified');
      }

      // Update user status
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
          status: 'ACTIVE',
        },
      });

      logger.info('Email verified successfully', {
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      logger.error('Email verification failed', { error });
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Don't reveal if email exists
        logger.warn('Password reset requested for non-existent email', { email });
        return;
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      // Send reset email
      await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

      logger.info('Password reset email sent', {
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      logger.error('Password reset failed', { error, email });
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;

      if (decoded.type !== 'password_reset') {
        throw new ValidationError('Invalid reset token');
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);

      // Update password and invalidate all refresh tokens
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        }),
        prisma.refreshToken.deleteMany({
          where: { userId: user.id },
        }),
      ]);

      logger.info('Password reset successfully', {
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      logger.error('Password reset failed', { error });
      throw error;
    }
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new AuthenticationError('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      logger.info('Password changed successfully', {
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      logger.error('Password change failed', { error, userId });
      throw error;
    }
  }

  /**
   * Generate JWT tokens
   */
  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    // Generate access token
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        userType: user.userType,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Generate refresh token
    const refreshTokenString = jwt.sign(
      { userId: user.id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: user.id,
        expiresAt,
      },
    });

    return { accessToken, refreshToken: refreshTokenString };
  }

  /**
   * Send verification email
   */
  private async sendVerificationEmail(user: User): Promise<void> {
    const verificationToken = jwt.sign(
      { userId: user.id, type: 'email_verification' },
      config.jwt.secret,
      { expiresIn: '24h' }
    );

    await emailService.sendVerificationEmail(user.email, user.name, verificationToken);
  }
}

export const authService = new AuthService();
export default authService;