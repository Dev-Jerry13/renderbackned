const request = require('supertest');
const app = require('../src/app');

describe('Role-based access control', () => {
  describe('GET /api/admin', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/admin/dashboard/stats');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/students', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/students');
      expect(res.status).toBe(401);
    });

    it('returns 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/students')
        .set('Authorization', 'Bearer invalid.jwt.token');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/students', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).post('/api/students').send({});
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/teachers', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/teachers');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/teachers', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).post('/api/teachers').send({});
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/classes', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/classes');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/subjects', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/subjects');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/attendance', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/attendance');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/exams', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/exams');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/results', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/results');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/assignments', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/assignments');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/timetable', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/timetable');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/announcements', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/announcements');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/fees', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/fees');
      expect(res.status).toBe(401);
    });
  });
});
