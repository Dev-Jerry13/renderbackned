const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});
