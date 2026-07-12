const ApiError = require('./ApiError');

function createHandler(handlerFn) {
  return async (req, res, next) => {
    try {
      await handlerFn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

function createAsyncHandler(handlerFn) {
  return (req, res, next) => handlerFn(req, res, next).catch(next);
}

module.exports = { ApiError, createHandler, createAsyncHandler };