process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.RATE_LIMIT_MAX = '1000';

const path = require('path');
const fs = require('fs');
const envPath = fs.existsSync(path.join(__dirname, '..', '.env.test'))
  ? path.join(__dirname, '..', '.env.test')
  : path.join(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });
