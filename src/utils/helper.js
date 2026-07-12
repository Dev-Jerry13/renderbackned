const { createAsyncHandler } = require('./controller');

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function parsePagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 50, 1), 200);
  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

function parseFilters(query, filterKeys) {
  const filters = {};
  filterKeys.forEach(key => {
    if (query[key] !== undefined && query[key] !== '') {
      filters[key] = query[key];
    }
  });
  return filters;
}

function mergeFilters(baseFilters, queryFilters) {
  const merged = { ...baseFilters };
  Object.keys(queryFilters).forEach(key => {
    if (queryFilters[key] !== undefined) {
      merged[key] = queryFilters[key];
    }
  });
  return merged;
}

function buildSearchQuery(search, searchFields) {
  if (!search) return {};
  const orConditions = [];
  searchFields.forEach(field => {
    orConditions.push({ [field]: { $like: `%${search}%` } });
  });
  return orConditions.length ? { $or: orConditions } : {};
}

function getFilteredQuery(query, filters = {}, searchFields = [], customSearch = null) {
  const whereConditions = { ...filters };

  if (searchFields && query.search) {
    const searchConditions = buildSearchQuery(query.search, searchFields);
    Object.assign(whereConditions, searchConditions);
  }

  if (customSearch) {
    const customConditions = customSearch(query);
    Object.assign(whereConditions, customConditions);
  }

  return whereConditions;
}

function formatValidationError(errors) {
  return errors.map(err => ({
    field: err.path?.join('.') || err.path || 'unknown',
    message: err.message || 'Validation error',
    type: err.type || 'validation_error',
  }));
}

function safeGet(req, path, defaultValue = null) {
  const keys = path.split('.');
  let value = req;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }
  return value;
}

function addAuditInfo(req) {
  return {
    userId: req.user?.userId || null,
    role: req.user?.role || null,
    action: req.method,
    path: req.originalUrl,
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  };
}

function checkAccess(control, user) {
  if (!user) return false;
  return control.split(',').includes(user.role);
}

function getConfigFromEnv(config, key, defaultValue) {
  const value = config[key];
  return value !== undefined ? value : defaultValue;
}

function parseDateRange(query, dateFields) {
  const filters = {};
  dateFields.forEach(field => {
    if (query[`${field}_from`]) {
      filters[field] = filters[field] || {};
      filters[field].$gte = query[`${field}_from`];
    }
    if (query[`${field}_to`]) {
      filters[field] = filters[field] || {};
      filters[field].$lte = query[`${field}_to`];
    }
  });
  return Object.keys(filters).length ? { $and: Object.entries(filters).map(([field, operator]) => ({ [field]: operator })) } : {};
}

module.exports = {
  createAsyncHandler,
  generateId,
  parsePagination,
  parseFilters,
  mergeFilters,
  buildSearchQuery,
  getFilteredQuery,
  formatValidationError,
  safeGet,
  addAuditInfo,
  checkAccess,
  getConfigFromEnv,
  parseDateRange,
};