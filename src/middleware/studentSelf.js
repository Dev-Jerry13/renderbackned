const ApiError = require('../utils/ApiError');

module.exports = (req, res, next) => {
  if (req.user.role === 'student') {
    const targetId = req.params.id || req.params.studentId;
    if (!req.user.studentId || req.user.studentId !== targetId) {
      return next(new ApiError(403, 'Forbidden: you can only access your own data'));
    }
  }
  next();
};