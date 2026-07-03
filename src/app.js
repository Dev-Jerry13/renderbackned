const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const db = require('./config/db');
const auth = require('./middleware/auth');
const auditLog = require('./middleware/auditLog');
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

const apiLimiter = rateLimit({
  windowMs: env.API_RATE_LIMIT_WINDOW_MS,
  max: env.API_RATE_LIMIT_MAX,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

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
app.get('/api/v1/health', healthCheck);

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
];

// Mount on both /api (legacy) and /api/v1 for versioning
for (const mod of apiModules) {
  app.use(`/api${mod.path}`, ...mod.middleware, mod.module);
  app.use(`/api/v1${mod.path}`, ...mod.middleware, mod.module);
}

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
