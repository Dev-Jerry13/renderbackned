require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
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
    migrations: { directory: './db/migrations' },
    seeds: { directory: './db/seeds' },
  }
};
