const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');

const server = app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

server.on('error', (err) => {
  logger.error(`Server failed to start: ${err.message}`);
  process.exit(1);
});
