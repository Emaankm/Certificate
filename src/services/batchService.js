const certificateController = require('../controllers/certificateController');
const logger = require('../utils/logger');

class BatchService {
  async processBatch(batchJob) {
    logger.info(`Processing batch: ${batchJob.jobId}`);

    for (const student of batchJob.students) {
      try {
        await certificateController.generateCertificate({
          studentId: student.studentId,
          studentName: student.studentName,
          studentEmail: student.studentEmail,
          courseId: batchJob.batchDetails.courseId,
          courseTitle: batchJob.batchDetails.courseTitle,
          completionDate: batchJob.batchDetails.completionDate,
          language: batchJob.batchDetails.language
        });

        student.status = 'completed';
      } catch (error) {
        logger.error(`Failed for student ${student.studentId}:`, error);
        student.status = 'failed';
        student.error = error.message;
      }
    }

    // Update batch progress after processing
    batchJob.progress.completed = batchJob.students.filter(s => s.status === 'completed').length;
    batchJob.progress.failed = batchJob.students.filter(s => s.status === 'failed').length;
    batchJob.progress.percentage = (batchJob.progress.completed / batchJob.students.length) * 100;
    batchJob.progress.status = 'done';

    await batchJob.save();
  }
}

module.exports = new BatchService();
