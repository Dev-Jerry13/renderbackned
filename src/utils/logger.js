const env = require('../config/env');

function formatEntry(level, args) {
  const message = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
  if (env.NODE_ENV === 'production') {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
    });
  }
  return `[${level.toUpperCase()}] ${message}`;
}

const logger = {
  info: (...args) => {
    if (env.NODE_ENV !== 'test') console.log(formatEntry('info', args));
  },
  warn: (...args) => {
    if (env.NODE_ENV !== 'test') console.warn(formatEntry('warn', args));
  },
  error: (...args) => console.error(formatEntry('error', args)),
};

module.exports = logger;
