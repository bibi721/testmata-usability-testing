/**
 * Test Setup Configuration
 * Global test setup for all test files
 */

import { PrismaClient } from '@prisma/client';
import { config } from '@/config/environment';

// Mock environment for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/masada_test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';

// Global test database instance
export const testDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Global test utilities
export const testUtils = {
  /**
   * Clean database between tests
   */
  async cleanDatabase() {
    const tablenames = await testDb.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;

    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations') {
        await testDb.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
      }
    }
  },

  /**
   * Create test user
   */
  async createTestUser(userData: any = {}) {
    return testDb.user.create({
      data: {
        email: userData.email || 'test@example.com',
        password: userData.password || 'hashedpassword',
        name: userData.name || 'Test User',
        userType: userData.userType || 'CUSTOMER',
        status: userData.status || 'ACTIVE',
        emailVerified: userData.emailVerified || true,
        ...userData,
      },
    });
  },

  /**
   * Create test with customer
   */
  async createTestWithCustomer(testData: any = {}, customerData: any = {}) {
    const customer = await this.createTestUser({
      userType: 'CUSTOMER',
      ...customerData,
    });

    const test = await testDb.test.create({
      data: {
        title: testData.title || 'Test Title',
        description: testData.description || 'Test Description',
        testType: testData.testType || 'USABILITY',
        platform: testData.platform || 'WEB',
        maxTesters: testData.maxTesters || 10,
        paymentPerTester: testData.paymentPerTester || 20,
        estimatedDuration: testData.estimatedDuration || 30,
        createdById: customer.id,
        ...testData,
      },
    });

    return { customer, test };
  },

  /**
   * Generate JWT token for testing
   */
  generateTestToken(userId: string, userType: string = 'CUSTOMER') {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId, userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },
};

// Global test constants
export const TEST_CONSTANTS = {
  VALID_EMAIL: 'test@masada.et',
  VALID_PASSWORD: 'TestPassword123!',
  INVALID_EMAIL: 'invalid-email',
  INVALID_PASSWORD: '123',
  ETHIOPIAN_PHONE: '+251911234567',
  ETHIOPIAN_REGIONS: ['Addis Ababa', 'Oromia', 'Amhara', 'Tigray'],
};

// Jest global setup
beforeAll(async () => {
  // Connect to test database
  await testDb.$connect();
});

afterAll(async () => {
  // Disconnect from test database
  await testDb.$disconnect();
});

beforeEach(async () => {
  // Clean database before each test
  await testUtils.cleanDatabase();
});