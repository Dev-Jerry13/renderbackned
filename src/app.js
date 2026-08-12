"use strict";

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const cors = require('cors');
const env = require('./config/env');
const db = require('./config/db');
const logger = require('./utils/logger');

const app = express();

if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

if (env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const forwardedProto = req.headers['x-forwarded-proto'] || req.protocol;
    if (forwardedProto !== 'https' && !app.get('trust proxy')) {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

app.use(helmet({
  hsts: { maxAge: 63072000, preload: true },
  contentSecurityPolicy: false,
}));

const allowedOrigins = env.CORS_ORIGINS.split(',').map(s => s.trim());
app.use(cors({
  origin: function (origin, cb) {
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

const apiLimiter = rateLimit({
  windowMs: env.API_RATE_LIMIT_WINDOW_MS,
  max: env.API_RATE_LIMIT_MAX,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const requestId = require('./middleware/requestId');
const auth = require('./middleware/auth');
const auditLog = require('./middleware/auditLog');

app.use(requestId);

async function healthCheck(req, res) {
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
      error: env.NODE_ENV === 'production' ? 'Database connection failed' : err.message,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }
}

app.get('/api/health', healthCheck);

const apiModules = [
  { path: '/auth', middleware: [authLimiter], module: require('./modules/auth/auth.routes') },
  { path: '/students', middleware: [auth, auditLog], module: require('./modules/students/students.routes') },
  { path: '/teachers', middleware: [auth, auditLog], module: require('./modules/teachers/teachers.routes') },
  { path: '/classes', middleware: [auth, auditLog], module: require('./modules/classes/classes.routes') },
  { path: '/subjects', middleware: [auth, auditLog], module: require('./modules/subjects/subjects.routes') },
  { path: '/attendance', middleware: [auth, auditLog], module: require('./modules/attendance/attendance.routes') },
  { path: '/exams', middleware: [auth, auditLog], module: require('./modules/exams/exams.routes') },
  { path: '/results', middleware: [auth, auditLog], module: require('./modules/results/results.routes') },
  { path: '/assignments', middleware: [auth, auditLog], module: require('./modules/assignments/assignments.routes') },
  { path: '/timetable', middleware: [auth, auditLog], module: require('./modules/timetable/timetable.routes') },
  { path: '/announcements', middleware: [auth, auditLog], module: require('./modules/announcements/announcements.routes') },
  { path: '/fees', middleware: [auth, auditLog], module: require('./modules/fees/fees.routes') },
  { path: '/remarks', middleware: [auth, auditLog], module: require('./modules/remarks/remarks.routes') },
  { path: '/admin', middleware: [auth, auditLog], module: require('./modules/admin/admin.routes') },
  { path: '/reports', middleware: [auth, auditLog], module: require('./modules/reports/reports.routes') },
  { path: '/grading', middleware: [auth, auditLog], module: require('./modules/grading/grading.routes') },
  { path: '/holidays', middleware: [auth, auditLog], module: require('./modules/holidays/holidays.routes') },
  { path: '/staff', middleware: [auth, auditLog], module: require('./modules/staff/staff.routes') },
  { path: '/proxy', middleware: [auth, auditLog], module: require('./modules/proxy/proxy.routes') },
];

for (const mod of apiModules) {
  app.use(`/api${mod.path}`, ...mod.middleware, mod.module);
  app.use(`/api/v1${mod.path}`, ...mod.middleware, mod.module);
}

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.statusCode
    ? err.message
    : env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message;

  if (statusCode === 500) {
    logger.error(`[${req.requestId}] Unhandled error:`, err);
  } else {
    logger.warn(`[${req.requestId}] ${statusCode} - ${err.message}`);
  }

  res.status(statusCode).json({ error: message });
});

module.exports = app;