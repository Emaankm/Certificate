const Queue = require('bull');
const logger = require('../utils/logger');

const batchQueue = new Queue('batch-certificates', process.env.REDIS_URL, {
  redis: {
    tls: {},
    maxRetriesPerRequest: null
  }
});

// Events
batchQueue.on('completed', (job) => {
  logger.info(`✅ Batch job completed: ${job.id}`);
});

batchQueue.on('failed', (job, err) => {
  logger.error(`❌ Batch job failed: ${job.id}`, err);
});

batchQueue.on('error', (err) => {
  logger.error('⚠️ Queue error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await batchQueue.close();
  logger.info('🛑 Queue closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await batchQueue.close();
  logger.info('🛑 Queue closed');
});

module.exports = { batchQueue };