const batchProcessor = require('../services/batchProcessor'); 
const { batchQueue } = require('../queues/queue');
const logger = require('../utils/logger');

// Connect Bull queue to processor
batchQueue.process(async (job) => {
  try {
    await batchProcessor.process(job);
  } catch (error) {
    logger.error('Batch processing failed:', error);
    throw error;
  }
});