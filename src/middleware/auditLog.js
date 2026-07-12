const logger = require('../utils/logger');

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

function auditLog(req, res, next) {
  if (MUTATING_METHODS.includes(req.method) && req.user) {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      const statusCode = res.statusCode;
      const logFn = statusCode >= 500 ? logger.error : statusCode >= 400 ? logger.warn : logger.info;
      logFn(
        `[${req.requestId}] AUDIT: userId=${req.user.userId} role=${req.user.role} ` +
        `${req.method} ${req.originalUrl} -> ${statusCode}`
      );
      return originalJson(body);
    };
  }
  next();
}

module.exports = auditLog;
