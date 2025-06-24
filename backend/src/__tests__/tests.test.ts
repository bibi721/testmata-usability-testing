/**
 * Test Management Tests
 * Comprehensive tests for test CRUD operations
 */

import request from 'supertest';
import { testDb, testUtils, TEST_CONSTANTS } from '../../tests/setup';

const app = require('@/server').default;

describe('Test Management Endpoints', () => {
  let customer: any;
  let tester: any;
  let customerToken: string;
  let testerToken: string;

  beforeEach(async () => {
    // Create test users
    customer = await testUtils.createTestUser({
      email: 'customer@masada.et',
      userType: 'CUSTOMER',
    });
    
    tester = await testUtils.createTestUser({
      email: 'tester@masada.et',
      userType: 'TESTER',
    });

    customerToken = testUtils.generateTestToken(customer.id, 'CUSTOMER');
    testerToken = testUtils.generateTestToken(tester.id, 'TESTER');
  });

  describe('POST /api/v1/tests', () => {
    it('should create a new test successfully', async () => {
      const testData = {
        title: 'Ethiopian Banking App Test',
        description: 'Test the usability of our banking application',
        testType: 'USABILITY',
        platform: 'MOBILE_APP',
        targetUrl: 'https://banking.et',
        maxTesters: 10,
        paymentPerTester: 25,
        estimatedDuration: 30,
        requirements: ['Mobile device', 'Banking experience'],
        tasks: {
          tasks: [
            { id: 1, title: 'Login', description: 'Login to the app' },
            { id: 2, title: 'Check balance', description: 'View account balance' },
          ],
        },
        demographics: {
          ageRange: ['25-34', '35-44'],
          regions: ['Addis Ababa'],
        },
      };

      const response = await request(app)
        .post('/api/v1/tests')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(testData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.test.title).toBe(testData.title);
      expect(response.body.data.test.createdById).toBe(customer.id);
      expect(response.body.data.test.status).toBe('DRAFT');

      // Verify test was created in database
      const test = await testDb.test.findUnique({
        where: { id: response.body.data.test.id },
      });
      expect(test).toBeTruthy();
    });

    it('should reject test creation by tester', async () => {
      const testData = {
        title: 'Test Title',
        description: 'Test Description',
        testType: 'USABILITY',
        platform: 'WEB',
        maxTesters: 5,
        paymentPerTester: 15,
        estimatedDuration: 20,
      };

      const response = await request(app)
        .post('/api/v1/tests')
        .set('Authorization', `Bearer ${testerToken}`)
        .send(testData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject test creation without authentication', async () => {
      const testData = {
        title: 'Test Title',
        description: 'Test Description',
        testType: 'USABILITY',
        platform: 'WEB',
        maxTesters: 5,
        paymentPerTester: 15,
        estimatedDuration: 20,
      };

      const response = await request(app)
        .post('/api/v1/tests')
        .send(testData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const invalidTestData = {
        title: '', // Empty title
        description: 'Test Description',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/v1/tests')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(invalidTestData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Validation failed');
    });
  });

  describe('GET /api/v1/tests', () => {
    beforeEach(async () => {
      // Create test data
      await testUtils.createTestWithCustomer(
        { title: 'Customer Test 1', status: 'PUBLISHED' },
        { id: customer.id }
      );
      await testUtils.createTestWithCustomer(
        { title: 'Customer Test 2', status: 'DRAFT' },
        { id: customer.id }
      );
    });

    it('should return customer tests for customer', async () => {
      const response = await request(app)
        .get('/api/v1/tests')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tests).toHaveLength(2);
      expect(response.body.data.tests[0].createdById).toBe(customer.id);
    });

    it('should return only published tests for tester', async () => {
      const response = await request(app)
        .get('/api/v1/tests')
        .set('Authorization', `Bearer ${testerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tests).toHaveLength(1);
      expect(response.body.data.tests[0].status).toBe('PUBLISHED');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/tests?page=1&limit=1')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tests).toHaveLength(1);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(1);
    });
  });

  describe('GET /api/v1/tests/:id', () => {
    let test: any;

    beforeEach(async () => {
      const result = await testUtils.createTestWithCustomer(
        { title: 'Test Details', status: 'PUBLISHED' },
        { id: customer.id }
      );
      test = result.test;
    });

    it('should return test details for owner', async () => {
      const response = await request(app)
        .get(`/api/v1/tests/${test.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.test.id).toBe(test.id);
      expect(response.body.data.test.title).toBe(test.title);
    });

    it('should return test details for tester if published', async () => {
      const response = await request(app)
        .get(`/api/v1/tests/${test.id}`)
        .set('Authorization', `Bearer ${testerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.test.id).toBe(test.id);
    });

    it('should reject access to non-existent test', async () => {
      const response = await request(app)
        .get('/api/v1/tests/non-existent-id')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/tests/:id', () => {
    let test: any;

    beforeEach(async () => {
      const result = await testUtils.createTestWithCustomer(
        { title: 'Original Title', status: 'DRAFT' },
        { id: customer.id }
      );
      test = result.test;
    });

    it('should update test successfully', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        maxTesters: 15,
      };

      const response = await request(app)
        .put(`/api/v1/tests/${test.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.test.title).toBe(updateData.title);
      expect(response.body.data.test.description).toBe(updateData.description);
    });

    it('should reject update by non-owner', async () => {
      const otherCustomer = await testUtils.createTestUser({
        email: 'other@masada.et',
        userType: 'CUSTOMER',
      });
      const otherToken = testUtils.generateTestToken(otherCustomer.id, 'CUSTOMER');

      const updateData = { title: 'Unauthorized Update' };

      const response = await request(app)
        .put(`/api/v1/tests/${test.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject update of running test', async () => {
      // Update test status to running
      await testDb.test.update({
        where: { id: test.id },
        data: { status: 'RUNNING' },
      });

      const updateData = { title: 'Cannot Update Running Test' };

      const response = await request(app)
        .put(`/api/v1/tests/${test.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/tests/:id/publish', () => {
    let test: any;

    beforeEach(async () => {
      const result = await testUtils.createTestWithCustomer(
        { title: 'Test to Publish', status: 'DRAFT' },
        { id: customer.id }
      );
      test = result.test;
    });

    it('should publish test successfully', async () => {
      const response = await request(app)
        .post(`/api/v1/tests/${test.id}/publish`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.test.status).toBe('PUBLISHED');
      expect(response.body.data.test.publishedAt).toBeTruthy();

      // Verify in database
      const updatedTest = await testDb.test.findUnique({
        where: { id: test.id },
      });
      expect(updatedTest?.status).toBe('PUBLISHED');
    });

    it('should reject publishing non-draft test', async () => {
      // Update test to published first
      await testDb.test.update({
        where: { id: test.id },
        data: { status: 'PUBLISHED' },
      });

      const response = await request(app)
        .post(`/api/v1/tests/${test.id}/publish`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/tests/:id', () => {
    let test: any;

    beforeEach(async () => {
      const result = await testUtils.createTestWithCustomer(
        { title: 'Test to Delete', status: 'DRAFT' },
        { id: customer.id }
      );
      test = result.test;
    });

    it('should delete test successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/tests/${test.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify test is deleted
      const deletedTest = await testDb.test.findUnique({
        where: { id: test.id },
      });
      expect(deletedTest).toBeNull();
    });

    it('should reject deletion of test with sessions', async () => {
      // Create a test session
      await testDb.testSession.create({
        data: {
          testId: test.id,
          customerId: customer.id,
          status: 'PENDING',
        },
      });

      const response = await request(app)
        .delete(`/api/v1/tests/${test.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});