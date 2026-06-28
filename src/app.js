const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const db = require('./config/db');
const auth = require('./middleware/auth');
const requestId = require('./middleware/requestId');
const logger = require('./utils/logger');

const app = express();

app.use(requestId);

app.use(helmet({
  hsts: { maxAge: 63072000, preload: true },
  contentSecurityPolicy: false,
}));

if (env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

const allowedOrigins = env.CORS_ORIGINS.split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
}));

morgan.token('request-id', (req) => req.requestId);
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request-id', {
  skip: () => env.NODE_ENV === 'test',
}));

app.use(express.json({ limit: '1mb', strict: true }));

const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/api/health', async (req, res) => {
  try {
    await db.raw('SELECT 1');
    const { count: migrationCount } = await db('knex_migrations')
      .count('* as count')
      .first();
    res.json({
      status: 'ok',
      db: 'connected',
      uptime: process.uptime(),
      migrations: parseInt(migrationCount, 10),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error(`[${req.requestId}] Health check DB error:`, err);
    res.status(503).json({
      status: 'error',
      db: 'disconnected',
      error: err.message,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }
});

app.use('/api/auth', authLimiter, require('./modules/auth/auth.routes'));
app.use('/api/students', auth, require('./modules/students/students.routes'));
app.use('/api/teachers', auth, require('./modules/teachers/teachers.routes'));
app.use('/api/classes', auth, require('./modules/classes/classes.routes'));
app.use('/api/subjects', auth, require('./modules/subjects/subjects.routes'));
app.use('/api/attendance', auth, require('./modules/attendance/attendance.routes'));
app.use('/api/exams', auth, require('./modules/exams/exams.routes'));
app.use('/api/results', auth, require('./modules/results/results.routes'));
app.use('/api/assignments', auth, require('./modules/assignments/assignments.routes'));
app.use('/api/timetable', auth, require('./modules/timetable/timetable.routes'));
app.use('/api/announcements', auth, require('./modules/announcements/announcements.routes'));
app.use('/api/fees', auth, require('./modules/fees/fees.routes'));
app.use('/api/admin', auth, require('./modules/admin/admin.routes'));

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal server error';
  if (statusCode === 500) {
    logger.error(`[${req.requestId}] Unhandled error:`, err);
  } else {
    logger.warn(`[${req.requestId}] ${statusCode} - ${err.message}`);
  }
  res.status(statusCode).json({ error: message });
});

module.exports = app;
