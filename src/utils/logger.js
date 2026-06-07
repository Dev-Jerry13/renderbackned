const env = require('../config/env');

const logger = {
  info: (...args) => { if (env.NODE_ENV !== 'test') console.log('[INFO]', ...args); },
  warn: (...args) => { if (env.NODE_ENV !== 'test') console.warn('[WARN]', ...args); },
  error: (...args) => console.error('[ERROR]', ...args),
};

module.exports = logger;
