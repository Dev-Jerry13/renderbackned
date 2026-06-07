const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const db = require('./config/db');
const auth = require('./middleware/auth');
const allow = require('./middleware/rbac');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await db.raw('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/students', auth, require('./modules/students/students.routes'));
app.use('/api/teachers', auth, require('./modules/teachers/teachers.routes'));
app.use('/api/classes', auth, require('./modules/classes/classes.routes'));
app.use('/api/subjects', auth, require('./modules/subjects/subjects.routes'));

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal server error';
  if (statusCode === 500) console.error(err);
  res.status(statusCode).json({ error: message });
});

module.exports = app;
