const fs = require('fs');
const path = require('path');
const BatchJob = require('../models/BatchJob');
const logger = require('../utils/logger');

const TEMP_DIR = path.join(__dirname, '../../storage/temp');
const JOB_EXPIRY_DAYS = 30;

class CleanupJobs {

  /**
   * Clean temporary files
   */
  async cleanTempFiles() {
    try {
      if (!fs.existsSync(TEMP_DIR)) return;

      const files = fs.readdirSync(TEMP_DIR);

      for (const file of files) {
        const filePath = path.join(TEMP_DIR, file);
        fs.unlinkSync(filePath);
      }

      logger.info('Temporary files cleaned successfully');

    } catch (error) {
      logger.error('Failed to clean temp files:', error);
    }
  }

  /**
   * Remove old batch jobs
   */
  async cleanOldBatchJobs() {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - JOB_EXPIRY_DAYS);

      const result = await BatchJob.deleteMany({
        createdAt: { $lt: expiryDate }
      });

      logger.info(
        `Old batch jobs cleaned: ${result.deletedCount}`
      );

    } catch (error) {
      logger.error('Failed to clean old batch jobs:', error);
    }
  }

  /**
   * Run all cleanup tasks
   */
  async run() {
    logger.info('Running cleanup jobs...');
    await this.cleanTempFiles();
    await this.cleanOldBatchJobs();
  }
}

module.exports = new CleanupJobs();
