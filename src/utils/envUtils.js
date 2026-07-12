const env = require('../config/env');

function isProduction() {
  return env.NODE_ENV === 'production';
}

function getApiPaths(basePath, path) {
  if (isProduction()) {
    return [`${basePath}${path}`, `${basePath}/v1${path}`];
  }
  return [`${basePath}${path}`];
}

module.exports = { isProduction, getApiPaths };