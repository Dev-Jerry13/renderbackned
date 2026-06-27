const request = require('supertest');
const app = require('../src/app');

describe('POST /api/auth/login', () => {
  it('returns 400 when body is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('returns 400 for invalid email format', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'not-an-email',
      password: 'Test1234',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});

describe('POST /api/auth/change-password (unauthenticated)', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/auth/change-password').send({
      oldPassword: 'OldPass1',
      newPassword: 'NewPass1',
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('No token provided');
  });
});
