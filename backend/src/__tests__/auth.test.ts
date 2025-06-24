/**
 * Authentication Tests
 * Comprehensive tests for auth endpoints
 */

import request from 'supertest';
import { testDb, testUtils, TEST_CONSTANTS } from '../../tests/setup';
import { AuthService } from '@/services/authService';

// Mock the server app
const app = require('@/server').default;

describe('Authentication Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new customer successfully', async () => {
      const userData = {
        email: TEST_CONSTANTS.VALID_EMAIL,
        password: TEST_CONSTANTS.VALID_PASSWORD,
        name: 'Test Customer',
        userType: 'CUSTOMER',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.userType).toBe('CUSTOMER');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();

      // Verify user was created in database
      const user = await testDb.user.findUnique({
        where: { email: userData.email },
      });
      expect(user).toBeTruthy();
      expect(user?.userType).toBe('CUSTOMER');
    });

    it('should register a new tester successfully', async () => {
      const userData = {
        email: 'tester@masada.et',
        password: TEST_CONSTANTS.VALID_PASSWORD,
        name: 'Test Tester',
        userType: 'TESTER',
        phone: TEST_CONSTANTS.ETHIOPIAN_PHONE,
        city: 'Addis Ababa',
        region: 'Addis Ababa',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.userType).toBe('TESTER');

      // Verify tester profile was created
      const user = await testDb.user.findUnique({
        where: { email: userData.email },
        include: { testerProfile: true },
      });
      expect(user?.testerProfile).toBeTruthy();
      expect(user?.testerProfile?.phone).toBe(userData.phone);
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: TEST_CONSTANTS.INVALID_EMAIL,
        password: TEST_CONSTANTS.VALID_PASSWORD,
        name: 'Test User',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Validation failed');
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: TEST_CONSTANTS.VALID_EMAIL,
        password: TEST_CONSTANTS.INVALID_PASSWORD,
        name: 'Test User',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject duplicate email registration', async () => {
      // Create user first
      await testUtils.createTestUser({
        email: TEST_CONSTANTS.VALID_EMAIL,
      });

      const userData = {
        email: TEST_CONSTANTS.VALID_EMAIL,
        password: TEST_CONSTANTS.VALID_PASSWORD,
        name: 'Test User',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      const authService = new AuthService();
      await authService.register({
        email: TEST_CONSTANTS.VALID_EMAIL,
        password: TEST_CONSTANTS.VALID_PASSWORD,
        name: 'Test User',
        userType: 'CUSTOMER',
      });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: TEST_CONSTANTS.VALID_EMAIL,
        password: TEST_CONSTANTS.VALID_PASSWORD,
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@masada.et',
        password: TEST_CONSTANTS.VALID_PASSWORD,
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should reject login with invalid password', async () => {
      const loginData = {
        email: TEST_CONSTANTS.VALID_EMAIL,
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register and login to get refresh token
      const authService = new AuthService();
      const result = await authService.register({
        email: TEST_CONSTANTS.VALID_EMAIL,
        password: TEST_CONSTANTS.VALID_PASSWORD,
        name: 'Test User',
        userType: 'CUSTOMER',
      });
      refreshToken = result.refreshToken;
    });

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const authService = new AuthService();
      const result = await authService.register({
        email: TEST_CONSTANTS.VALID_EMAIL,
        password: TEST_CONSTANTS.VALID_PASSWORD,
        name: 'Test User',
        userType: 'CUSTOMER',
      });
      refreshToken = result.refreshToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify refresh token is invalidated
      const tokenResponse = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(tokenResponse.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let accessToken: string;
    let user: any;

    beforeEach(async () => {
      user = await testUtils.createTestUser();
      accessToken = testUtils.generateTestToken(user.id, user.userType);
    });

    it('should return current user info', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(user.id);
      expect(response.body.data.user.email).toBe(user.email);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});