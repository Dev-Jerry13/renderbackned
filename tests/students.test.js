const request = require('supertest');
const app = require('../src/app');

describe('GET /api/students (unauthenticated)', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/students');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('No token provided');
  });

  it('returns 401 with malformed token', async () => {
    const res = await request(app)
      .get('/api/students')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid or expired token');
  });
});
