const BatchJob = require('../models/BatchJob');
const { batchQueue } = require('../../queue');
const tokenGenerator = require('../utils/tokenGenerator');
const logger = require('../utils/logger');

class BatchController {

  /**
   * Create batch certificate generation job
   * POST /api/batch/generate
   */
  async createBatchJob(req, res) {
    try {
      const {
        courseId,
        courseTitle,
        courseDescription,
        students,
        language = 'en',
        completionDate,
        options = {}
      } = req.body;

      if (!courseId || !courseTitle || !students || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATA',
            message: 'Missing required fields or invalid students array'
          }
        });
      }

      const maxBatchSize = parseInt(process.env.MAX_BATCH_SIZE) || 100;
      if (students.length > maxBatchSize) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'BATCH_TOO_LARGE',
            message: `Batch size exceeds maximum of ${maxBatchSize} students`
          }
        });
      }

      for (const student of students) {
        if (!student.studentId || !student.studentName || !student.studentEmail) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_STUDENT_DATA',
              message: 'Each student must have studentId, studentName, and studentEmail'
            }
          });
        }
      }

      const jobId = tokenGenerator.generateBatchJobId();

      const batchJob = new BatchJob({
        jobId,
        requestedBy: {
          adminId: req.user?.adminId || 'system',
          adminName: req.user?.adminName || 'System',
          adminEmail: req.user?.adminEmail || 'system@platform.com'
        },
        batchDetails: {
          totalStudents: students.length,
          courseId,
          courseTitle,
          language,
          completionDate: completionDate || new Date()
        },
        students: students.map(s => ({
          studentId: s.studentId,
          studentName: s.studentName,
          studentEmail: s.studentEmail,
          status: 'pending'
        })),
        progress: {
          total: students.length,
          completed: 0,
          failed: 0,
          percentage: 0,
          status: 'queued',
          estimatedTimeMs: students.length * 3000
        },
        options: {
          sendEmail: options.sendEmail || false,
          generatePreview: options.generatePreview !== false,
          priority: options.priority || 'normal'
        }
      });

      await batchJob.save();

      await batchQueue.add(
        'process-batch',
        {
          jobId,
          courseId,
          courseTitle,
          courseDescription,
          students,
          language,
          completionDate,
          options
        },
        {
          priority: options.priority === 'high' ? 1 : options.priority === 'low' ? 3 : 2,
          timeout: parseInt(process.env.BATCH_TIMEOUT_MS) || 300000
        }
      );

      logger.info(`Batch job created: ${jobId}`);

      res.status(201).json({
        success: true,
        message: 'Batch job created successfully',
        data: {
          jobId: batchJob.jobId,
          totalStudents: batchJob.batchDetails.totalStudents,
          status: batchJob.progress.status,
          estimatedTimeMs: batchJob.progress.estimatedTimeMs
        }
      });

    } catch (error) {
      logger.error('Batch job creation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'BATCH_CREATION_FAILED',
          message: 'Failed to create batch job'
        }
      });
    }
  }

  /**
   * Get batch job status
   * GET /api/batch/:jobId
   */
  async getBatchJobStatus(req, res) {
    try {
      const { jobId } = req.params;

      const batchJob = await BatchJob.findOne({ jobId });

      if (!batchJob) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Batch job not found'
          }
        });
      }

      res.json({
        success: true,
        data: {
          jobId: batchJob.jobId,
          status: batchJob.progress.status,
          progress: {
            total: batchJob.progress.total,
            completed: batchJob.progress.completed,
            failed: batchJob.progress.failed,
            percentage: batchJob.progress.percentage
          },
          batchDetails: batchJob.batchDetails,
          timestamps: batchJob.timestamps,
          students: batchJob.students.map(s => ({
            studentId: s.studentId,
            studentName: s.studentName,
            status: s.status,
            certificateId: s.certificateId,
            certificateUrl: s.certificateUrl,
            error: s.error
          }))
        }
      });

    } catch (error) {
      logger.error('Get batch job error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve batch job'
        }
      });
    }
  }

  /**
   * Get all batch jobs
   * GET /api/batch
   */
  async getAllBatchJobs(req, res) {
    try {
      const { status, limit = 50, page = 1 } = req.query;

      const query = status ? { 'progress.status': status } : {};
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const batchJobs = await BatchJob.find(query)
        .sort({ 'timestamps.createdAt': -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const total = await BatchJob.countDocuments(query);

      res.json({
        success: true,
        data: batchJobs.map(job => ({
          jobId: job.jobId,
          courseTitle: job.batchDetails.courseTitle,
          totalStudents: job.batchDetails.totalStudents,
          status: job.progress.status,
          progress: {
            completed: job.progress.completed,
            failed: job.progress.failed,
            percentage: job.progress.percentage
          },
          createdAt: job.timestamps.createdAt
        })),
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      logger.error('Get all batch jobs error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve batch jobs'
        }
      });
    }
  }
}

module.exports = new BatchController();
