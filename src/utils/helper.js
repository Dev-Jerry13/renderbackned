const { createAsyncHandler } = require('./controller');

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
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

function buildSearchQuery(knex, search, searchFields) {
  if (!search) return null;
  return function () {
    this.where(function () {
      searchFields.forEach((field, idx) => {
        if (idx === 0) {
          this.where(field, 'ilike', `%${search}%`);
        } else {
          this.orWhere(field, 'ilike', `%${search}%`);
        }
      });
    });
  };
}

function getFilteredQuery(queryBuilder, query, filters = {}, searchFields = [], customSearch = null) {
  if (Object.keys(filters).length > 0) {
    queryBuilder.where(filters);
  }

  if (searchFields && query.search) {
    const searchFn = buildSearchQuery(null, query.search, searchFields);
    if (searchFn) {
      queryBuilder.where(searchFn);
    }
  }

  if (customSearch) {
    customSearch(queryBuilder, query);
  }
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
  return function (qb) {
    dateFields.forEach(field => {
      if (query[`${field}_from`]) {
        qb.where(field, '>=', query[`${field}_from`]);
      }
      if (query[`${field}_to`]) {
        qb.where(field, '<=', query[`${field}_to`]);
      }
    });
  };
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