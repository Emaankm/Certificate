const BatchJob = require('../models/BatchJob');
const batchService = require('./batchService');
const logger = require('../utils/logger');

async function process(job) {
  const { jobId } = job?.data || {};

  if (!jobId) {
    throw new Error('Missing jobId in queue job payload');
  }

  const batchJob = await BatchJob.findByJobId(jobId);
  if (!batchJob) {
    throw new Error(`Batch job not found for jobId: ${jobId}`);
  }

  try {
    batchJob.progress.status = 'processing';
    batchJob.progress.startedAt = batchJob.progress.startedAt || new Date();
    await batchJob.save();

    await batchService.processBatch(batchJob);

    batchJob.progress.status = 'completed';
    batchJob.progress.completedAt = new Date();
    await batchJob.save();
  } catch (error) {
    logger.error(`Batch job failed: ${jobId}`, error);
    batchJob.progress.status = 'failed';
    batchJob.progress.completedAt = new Date();
    await batchJob.save();
    throw error;
  }
}

module.exports = { process };

