const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

function authHeader(role = 'admin') {
  const token = jwt.sign(
    {
      userId: '00000000-0000-0000-0000-000000000000',
      role,
      schoolId: '00000000-0000-0000-0000-000000000000',
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  return `Bearer ${token}`;
}

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

  describe('GET /api/attendance', () => {
    it('returns 400 when classId and date are missing', async () => {
      const res = await request(app)
        .get('/api/attendance')
        .set('Authorization', authHeader());
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('returns 400 for an invalid classId or date', async () => {
      const res = await request(app)
        .get('/api/attendance')
        .query({ classId: 'not-a-uuid', date: '2026-13-99' })
        .set('Authorization', authHeader());
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/results', () => {
    it('returns 400 when examId and subjectId are missing', async () => {
      const res = await request(app)
        .get('/api/results')
        .set('Authorization', authHeader());
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('returns 400 for an invalid pagination limit', async () => {
      const res = await request(app)
        .get('/api/results')
        .query({
          examId: '00000000-0000-0000-0000-000000000000',
          subjectId: '00000000-0000-0000-0000-000000000001',
          limit: '9999',
        })
        .set('Authorization', authHeader());
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });
});
