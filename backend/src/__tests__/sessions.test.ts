/**
 * Test Session Tests
 * Tests for tester session management
 */

import request from 'supertest';
import { testDb, testUtils } from '../../tests/setup';

const app = require('@/server').default;

describe('Test Session Endpoints', () => {
  let customer: any;
  let tester: any;
  let test: any;
  let customerToken: string;
  let testerToken: string;

  beforeEach(async () => {
    // Create test users and test
    const result = await testUtils.createTestWithCustomer({
      title: 'Session Test',
      status: 'PUBLISHED',
      maxTesters: 5,
      paymentPerTester: 20,
    });
    
    customer = result.customer;
    test = result.test;
    
    tester = await testUtils.createTestUser({
      email: 'tester@masada.et',
      userType: 'TESTER',
    });

    customerToken = testUtils.generateTestToken(customer.id, 'CUSTOMER');
    testerToken = testUtils.generateTestToken(tester.id, 'TESTER');
  });

  describe('POST /api/v1/sessions/start', () => {
    it('should start a new test session successfully', async () => {
      const sessionData = {
        testId: test.id,
        deviceInfo: {
          userAgent: 'Mozilla/5.0 (Test Browser)',
          deviceType: 'mobile',
          screenResolution: '375x667',
        },
      };

      const response = await request(app)
        .post('/api/v1/sessions/start')
        .set('Authorization', `Bearer ${testerToken}`)
        .send(sessionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.session.testId).toBe(test.id);
      expect(response.body.data.session.testerId).toBe(tester.id);
      expect(response.body.data.session.status).toBe('IN_PROGRESS');

      // Verify session was created in database
      const session = await testDb.testerSession.findUnique({
        where: { id: response.body.data.session.id },
      });
      expect(session).toBeTruthy();
    });

    it('should reject starting session for non-published test', async () => {
      // Create draft test
      const draftResult = await testUtils.createTestWithCustomer({
        title: 'Draft Test',
        status: 'DRAFT',
      });

      const sessionData = {
        testId: draftResult.test.id,
        deviceInfo: { userAgent: 'Test' },
      };

      const response = await request(app)
        .post('/api/v1/sessions/start')
        .set('Authorization', `Bearer ${testerToken}`)
        .send(sessionData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject duplicate session for same test', async () => {
      // Start first session
      await testDb.testerSession.create({
        data: {
          testId: test.id,
          testerId: tester.id,
          testSessionId: 'temp-id',
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });

      const sessionData = {
        testId: test.id,
        deviceInfo: { userAgent: 'Test' },
      };

      const response = await request(app)
        .post('/api/v1/sessions/start')
        .set('Authorization', `Bearer ${testerToken}`)
        .send(sessionData)
        .expect(409);

      expect(response.body.success).toBe(false);
    });

    it('should reject session start by customer', async () => {
      const sessionData = {
        testId: test.id,
        deviceInfo: { userAgent: 'Test' },
      };

      const response = await request(app)
        .post('/api/v1/sessions/start')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(sessionData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/sessions/:id', () => {
    let session: any;

    beforeEach(async () => {
      // Create test session
      const testSession = await testDb.testSession.create({
        data: {
          testId: test.id,
          customerId: customer.id,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });

      session = await testDb.testerSession.create({
        data: {
          testSessionId: testSession.id,
          testId: test.id,
          testerId: tester.id,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });
    });

    it('should update session successfully', async () => {
      const updateData = {
        status: 'COMPLETED',
        feedback: 'Great app, easy to use!',
        rating: 5,
        taskResults: {
          task1: { completed: true, timeSpent: 120 },
          task2: { completed: true, timeSpent: 180 },
        },
      };

      const response = await request(app)
        .put(`/api/v1/sessions/${session.id}`)
        .set('Authorization', `Bearer ${testerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.session.status).toBe('COMPLETED');
      expect(response.body.data.session.feedback).toBe(updateData.feedback);
      expect(response.body.data.session.rating).toBe(updateData.rating);

      // Verify earning was created
      const earning = await testDb.earning.findFirst({
        where: { testerSessionId: session.id },
      });
      expect(earning).toBeTruthy();
      expect(earning?.amount).toBe(test.paymentPerTester);
    });

    it('should reject update by non-owner', async () => {
      const otherTester = await testUtils.createTestUser({
        email: 'other.tester@masada.et',
        userType: 'TESTER',
      });
      const otherToken = testUtils.generateTestToken(otherTester.id, 'TESTER');

      const updateData = { status: 'COMPLETED' };

      const response = await request(app)
        .put(`/api/v1/sessions/${session.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject update of completed session', async () => {
      // Mark session as completed
      await testDb.testerSession.update({
        where: { id: session.id },
        data: { status: 'COMPLETED' },
      });

      const updateData = { feedback: 'Cannot update completed session' };

      const response = await request(app)
        .put(`/api/v1/sessions/${session.id}`)
        .set('Authorization', `Bearer ${testerToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/sessions', () => {
    beforeEach(async () => {
      // Create multiple sessions
      const testSession = await testDb.testSession.create({
        data: {
          testId: test.id,
          customerId: customer.id,
          status: 'IN_PROGRESS',
        },
      });

      await testDb.testerSession.createMany({
        data: [
          {
            testSessionId: testSession.id,
            testId: test.id,
            testerId: tester.id,
            status: 'COMPLETED',
            startedAt: new Date(),
          },
          {
            testSessionId: testSession.id,
            testId: test.id,
            testerId: tester.id,
            status: 'IN_PROGRESS',
            startedAt: new Date(),
          },
        ],
      });
    });

    it('should return tester sessions for tester', async () => {
      const response = await request(app)
        .get('/api/v1/sessions')
        .set('Authorization', `Bearer ${testerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sessions).toHaveLength(2);
      expect(response.body.data.sessions[0].testerId).toBe(tester.id);
    });

    it('should return customer test sessions for customer', async () => {
      const response = await request(app)
        .get('/api/v1/sessions')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sessions).toHaveLength(2);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/sessions?page=1&limit=1')
        .set('Authorization', `Bearer ${testerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sessions).toHaveLength(1);
      expect(response.body.data.pagination.page).toBe(1);
    });
  });
});