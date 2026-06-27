const app = require('./app');
const db = require('./config/db');
const env = require('./config/env');
const logger = require('./utils/logger');

async function start() {
  try {
    if (env.NODE_ENV !== 'production') {
      logger.info('Running pending migrations...');
      const [batchNo, migrations] = await db.migrate.latest();
      if (migrations.length > 0) {
        logger.info(`Applied ${migrations.length} migration(s) in batch ${batchNo}`);
      } else {
        logger.info('All migrations are up to date');
      }
    } else {
      const [completed, pending] = await db.migrate.list();
      if (pending.length > 0) {
        logger.warn(`${pending.length} pending migration(s) found in production`);
        pending.forEach((m) => logger.warn(`  - ${m.file}`));
      }
    }

    const server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });

    server.on('error', (err) => {
      logger.error(`Server failed to start: ${err.message}`);
      process.exit(1);
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      server.close(async () => {
        await db.destroy();
        logger.info('Server shut down complete');
        process.exit(0);
      });
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
