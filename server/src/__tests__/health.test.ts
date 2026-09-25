import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('Health & Readiness Endpoints', () => {
  const app = createApp();

  it('GET /api/healthz returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'HEALTHY');
    expect(res.body).toHaveProperty('uptimeSeconds');
  });

  it('GET /api/readyz verifies database connectivity', async () => {
    const res = await request(app).get('/api/readyz');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'READY');
    expect(res.body).toHaveProperty('database', 'CONNECTED');
  });
});
