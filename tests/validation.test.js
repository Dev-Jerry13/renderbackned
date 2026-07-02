const request = require('supertest');
const app = require('../src/app');

describe('Input validation', () => {
  describe('POST /api/auth/login', () => {
    it('returns 400 for missing email', async () => {
      const res = await request(app).post('/api/auth/login').send({ password: 'Test1234' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('returns 400 for missing password', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('returns 400 for empty body', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid email format', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'not-an-email',
        password: 'Test1234',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('returns 400 for missing token', async () => {
      const res = await request(app).post('/api/auth/refresh').send({});
      expect(res.status).toBe(400);
    });

    it('returns 400 for empty token', async () => {
      const res = await request(app).post('/api/auth/refresh').send({ token: '' });
      expect(res.status).toBe(400);
    });
  });
});
