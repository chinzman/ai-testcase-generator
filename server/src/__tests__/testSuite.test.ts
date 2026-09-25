import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('Test Suite API Endpoints', () => {
  const app = createApp();
  let createdSuiteId: string;

  it('POST /api/generate - Rejects invalid/empty requirement', async () => {
    const res = await request(app).post('/api/generate').send({
      requirement: 'short',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/generate - Successfully generates structured test cases across dimensions', async () => {
    const res = await request(app).post('/api/generate').send({
      requirement:
        'As a registered user, I want to log into my account using email and password so that I can access my private dashboard. Must support 2FA and lockout after 5 invalid attempts.',
      dimensions: ['POSITIVE', 'NEGATIVE', 'EDGE_CASE', 'VALIDATION', 'SECURITY'],
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('title');
    expect(res.body.data).toHaveProperty('qualityAnalysis');
    expect(res.body.data.qualityAnalysis.completenessScore).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data.testCases)).toBe(true);
    expect(res.body.data.testCases.length).toBeGreaterThan(0);

    const firstCase = res.body.data.testCases[0];
    expect(firstCase).toHaveProperty('testCaseId');
    expect(firstCase).toHaveProperty('title');
    expect(firstCase).toHaveProperty('steps');
    expect(firstCase).toHaveProperty('expectedResult');
    expect(firstCase).toHaveProperty('dimension');
  });

  it('POST /api/suites - Saves generated test suite to database', async () => {
    const suitePayload = {
      title: 'Authentication & Security Suite',
      rawRequirement: 'User login with 2FA and password lockout after 5 attempts.',
      modelUsed: 'gpt-4o-mini',
      qualityScore: 90,
      qualityFeedback: 'High coverage on authentication edge cases.',
      testCases: [
        {
          testCaseId: 'TC-AUTH-01',
          title: 'Verify successful login with valid 2FA token',
          description: 'Ensure user with 2FA enabled receives session token upon valid TOTP entry.',
          dimension: 'POSITIVE',
          priority: 'HIGH',
          preconditions: 'User registered with 2FA enabled.',
          steps: ['Enter email & password', 'Prompt for 2FA TOTP', 'Enter 6-digit code', 'Submit'],
          expectedResult: 'HTTP 200 OK and secure cookie established.',
          gherkin: 'Feature: Auth\nScenario: 2FA login\nGiven user exists\nWhen code entered\nThen access granted',
          status: 'DRAFT',
        },
        {
          testCaseId: 'TC-AUTH-02',
          title: 'Verify account lockout after 5 consecutive failed attempts',
          description: 'Brute force protection lockout check.',
          dimension: 'SECURITY',
          priority: 'HIGH',
          preconditions: 'User account exists.',
          steps: ['Attempt login with wrong password 5 times consecutively'],
          expectedResult: 'HTTP 429 / 403 Account Locked for 15 minutes.',
          status: 'DRAFT',
        },
      ],
    };

    const res = await request(app).post('/api/suites').send(suitePayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.testCases.length).toBe(2);
    createdSuiteId = res.body.data.id;
  });

  it('GET /api/suites - Lists saved test suites', async () => {
    const res = await request(app).get('/api/suites');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/suites/:id - Retrieves specific test suite with cases', async () => {
    const res = await request(app).get(`/api/suites/${createdSuiteId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdSuiteId);
    expect(res.body.data.testCases[0].steps).toEqual([
      'Enter email & password',
      'Prompt for 2FA TOTP',
      'Enter 6-digit code',
      'Submit',
    ]);
  });

  it('PUT /api/suites/:id - Updates suite title and test cases', async () => {
    const res = await request(app)
      .put(`/api/suites/${createdSuiteId}`)
      .send({
        title: 'Updated Auth & 2FA Test Suite',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Updated Auth & 2FA Test Suite');
  });

  it('POST /api/refine - Refines test cases based on feedback', async () => {
    const res = await request(app).post('/api/refine').send({
      requirement: 'User login with 2FA and password lockout.',
      previousTestCases: [
        {
          testCaseId: 'TC-AUTH-01',
          title: 'Verify valid login',
          description: 'Standard login',
          dimension: 'POSITIVE',
          priority: 'HIGH',
          preconditions: 'None',
          steps: ['Submit form'],
          expectedResult: 'Logged in',
        },
      ],
      feedbackPrompt: 'Add edge cases for expired 2FA tokens and clock skew.',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.testCases.length).toBeGreaterThan(1);
  });

  it('DELETE /api/suites/:id - Deletes test suite', async () => {
    const res = await request(app).delete(`/api/suites/${createdSuiteId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const getRes = await request(app).get(`/api/suites/${createdSuiteId}`);
    expect(getRes.status).toBe(404);
  });
});
