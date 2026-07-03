const path = require('path');
require('dotenv').config();

const commonConfig = {
  client: 'pg',
  migrations: { directory: './db/migrations' },
  seeds: { directory: './db/seeds' },
};

module.exports = {
  development: {
    ...commonConfig,
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: true },
      statement_timeout: 30000,
    },
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 10000,
      createTimeoutMillis: 10000,
    },
  },

  test: {
    ...commonConfig,
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'test' ? false : { rejectUnauthorized: true },
      statement_timeout: 30000,
    },
    pool: {
      min: 1,
      max: 5,
      acquireTimeoutMillis: 5000,
      createTimeoutMillis: 5000,
    },
  },

  production: {
    ...commonConfig,
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: true },
      statement_timeout: 15000,
      query_timeout: 15000,
    },
    pool: {
      min: 2,
      max: 20,
      acquireTimeoutMillis: 10000,
      createTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
    },
  },
};
