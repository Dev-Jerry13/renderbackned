const request = require('supertest');
const app = require('../src/app');

describe('API versioning — /api/v1/* mirrors /api/*', () => {
  it('GET /api/v1/health responds same as /api/health', async () => {
    const res = await request(app).get('/api/v1/health');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('db');
  });

  it('POST /api/v1/auth/login validates input', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('GET /api/v1/students returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/students');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/teachers returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/teachers');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/classes returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/classes');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/subjects returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/subjects');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/attendance returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/attendance');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/exams returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/exams');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/results returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/results');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/assignments returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/assignments');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/timetable returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/timetable');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/announcements returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/announcements');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/fees returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/fees');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/students with bad token returns 401', async () => {
    const res = await request(app)
      .get('/api/v1/students')
      .set('Authorization', 'Bearer bad-token');
    expect(res.status).toBe(401);
  });
});
