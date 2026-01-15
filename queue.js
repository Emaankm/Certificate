const Queue = require('bull');
const logger = require('./src/utils/logger');

const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379
  }
};

const batchQueue = new Queue('batch-certificates', redisConfig);

batchQueue.on('completed', (job) => {
  logger.info(`Batch job completed: ${job.id}`);
});

batchQueue.on('failed', (job, err) => {
  logger.error(`Batch job failed: ${job.id}`, err);
});

module.exports = { batchQueue };
