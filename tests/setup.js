const path = require('path');
const fs = require('fs');

const envTestPath = path.join(__dirname, '..', '.env.test');
if (!fs.existsSync(envTestPath)) {
  throw new Error(
    '.env.test file is required to run tests. ' +
    'Copy .env.example to .env.test and configure a test database. ' +
    'Refusing to fall back to .env to avoid accidental production database access.'
  );
}

process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.RATE_LIMIT_MAX = '1000';

require('dotenv').config({ path: envTestPath });
