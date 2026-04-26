const BatchJob = require('../models/BatchJob');
const Certificate = require('../models/Certificate');
const pdfGenerator = require('../services/pdfGenerator');
const qrCodeService = require('../services/qrCodeService');
const { uploadPDF } = require('../services/cloudinary.service');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class BatchProcessor {

  /**
   * Process a batch job
   */
  async process(job) {
    const { batchJobId } = job.data;

    logger.info(`Starting batch job: ${batchJobId}`);

    const batchJob = await BatchJob.findById(batchJobId);

    if (!batchJob) {
      logger.error(`Batch job not found: ${batchJobId}`);
      return;
    }

    batchJob.status = 'processing';
    batchJob.startedAt = new Date();
    await batchJob.save();

    let successCount = 0;
    let failureCount = 0;

    for (const record of batchJob.records) {
      try {
        // 1️⃣ Generate QR Code
        const qrCodePath = await qrCodeService.generateQRCode(
          record.accessToken
        );

        // 2️⃣ Generate PDF certificate
        const pdfBuffer = await pdfGenerator.generate({
          studentName: record.studentName,
          courseTitle: record.courseTitle,
          certificateId: record.certificateId,
          completionDate: record.completionDate,
          qrCodePath
        });

        // 3️⃣ Store PDF (Cloudinary)
        const tempDir = path.join(process.cwd(), 'storage', 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        const pdfPath = path.join(tempDir, `${record.certificateId}.pdf`);
        fs.writeFileSync(pdfPath, pdfBuffer);

        const uploadResult = await uploadPDF(pdfPath);
        const { cloudinaryId, certificateUrl } = uploadResult;

        if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);

        // 4️⃣ Save certificate to DB
        await Certificate.create({
          certificateId: record.certificateId,
          cloudinaryId,
          certificateUrl,
          studentInfo: {
            studentName: record.studentName,
            email: record.email
          },
          courseInfo: {
            courseTitle: record.courseTitle
          },
          certificateDetails: {
            accessToken: record.accessToken,
            issueDate: new Date(),
            completionDate: record.completionDate,
            status: 'active'
          }
        });

        successCount++;
      } catch (error) {
        failureCount++;
        logger.error(
          `Batch record failed (${batchJobId}):`,
          error
        );
      }
    }

    // 5️⃣ Update batch job result
    batchJob.status = 'completed';
    batchJob.completedAt = new Date();
    batchJob.summary = {
      total: batchJob.records.length,
      success: successCount,
      failed: failureCount
    };

    await batchJob.save();

    logger.info(`Batch job completed: ${batchJobId}`);
  }
}

module.exports = new BatchProcessor();
