const Certificate = require('../models/Certificate');
const pdfGenerator = require('../services/pdfGenerator');
const storageService = require('../config/storage');
const qrCodeService = require('../services/qrCodeService');
const tokenGenerator = require('../utils/tokenGenerator');
const logger = require('../utils/logger');
const { certificateQueue } = require('../../queue');

class CertificateController {
  /**
   * Generate a single certificate
   * POST /api/certificates/generate
   */
  async generateCertificate(req, res) {
    try {
      const {
        studentId,
        studentName,
        studentEmail,
        courseId,
        courseTitle,
        courseDescription,
        completionDate,
        language = 'en',
        metadata = {}
      } = req.body;

      // Validate required fields
      if (!studentId || !studentName || !studentEmail || !courseId || !courseTitle) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Missing required fields'
          }
        });
      }

      // Check if certificate already exists
      const existingCertificate = await Certificate.findOne({
        'studentInfo.studentId': studentId,
        'courseInfo.courseId': courseId
      });

      if (existingCertificate) {
        return res.status(200).json({
          success: true,
          message: 'Certificate already exists',
          data: {
            certificateId: existingCertificate.certificateId,
            certificateUrl: existingCertificate.certificateDetails.viewUrl,
            downloadUrl: existingCertificate.certificateDetails.downloadUrl,
            issueDate: existingCertificate.certificateDetails.issueDate,
            status: existingCertificate.certificateDetails.status
          }
        });
      }

      // Generate unique identifiers
      const certificateId = tokenGenerator.generateCertificateId();
      const accessToken = tokenGenerator.generateAccessToken();

      // Prepare certificate data
      const certificateData = {
        certificateId,
        studentId,
        studentName,
        studentEmail,
        courseId,
        courseTitle,
        courseDescription,
        completionDate: completionDate || new Date(),
        accessToken,
        metadata
      };

      // Generate PDF with QR code
      const pdfResult = await pdfGenerator.generateCertificate(certificateData, language);

      // Upload to storage
      const uploadResult = await storageService.uploadFile(
        pdfResult.filename,
        pdfResult.filepath,
        'application/pdf'
      );

      // Create certificate record
      const certificate = new Certificate({
        certificateId,
        studentInfo: {
          studentId,
          studentName,
          studentEmail
        },
        courseInfo: {
          courseId,
          courseTitle,
          courseDescription,
          totalChapters: metadata.totalChapters,
          duration: metadata.duration
        },
        certificateDetails: {
          issueDate: new Date(),
          completionDate: completionDate || new Date(),
          status: 'active',
          language,
          fileUrl: uploadResult.url,
          viewUrl: `${process.env.BASE_URL}/view/${accessToken}`,
          downloadUrl: `${process.env.BASE_URL}/download/${accessToken}`,
          accessToken,
          qrCodeUrl: pdfResult.qrCodeUrl,
          qrCodeData: pdfResult.qrCodeData
        },
        metadata: {
          generatedBy: 'certificate-service-v1',
          fileSize: pdfResult.fileSize,
          fileFormat: 'pdf',
          templateVersion: '1.0',
          generationTimeMs: pdfResult.generationTimeMs
        }
      });

      await certificate.save();

      logger.info(`Certificate generated: ${certificateId} for student: ${studentId}`);

      res.status(201).json({
        success: true,
        message: 'Certificate generated successfully',
        data: {
          certificateId: certificate.certificateId,
          certificateUrl: certificate.certificateDetails.viewUrl,
          downloadUrl: certificate.certificateDetails.downloadUrl,
          issueDate: certificate.certificateDetails.issueDate,
          status: certificate.certificateDetails.status,
          qrCodeUrl: certificate.certificateDetails.qrCodeUrl
        }
      });

    } catch (error) {
      logger.error('Certificate generation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: 'Failed to generate certificate'
        }
      });
    }
  }

  /**
   * Get certificate by ID
   * GET /api/certificates/:certificateId
   */
  async getCertificate(req, res) {
    try {
      const { certificateId } = req.params;

      const certificate = await Certificate.findByCertificateId(certificateId);

      if (!certificate) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Certificate not found'
          }
        });
      }

      res.json({
        success: true,
        data: {
          certificateId: certificate.certificateId,
          studentInfo: certificate.studentInfo,
          courseInfo: certificate.courseInfo,
          certificateDetails: {
            issueDate: certificate.certificateDetails.issueDate,
            completionDate: certificate.certificateDetails.completionDate,
            status: certificate.certificateDetails.status,
            language: certificate.certificateDetails.language,
            viewUrl: certificate.certificateDetails.viewUrl,
            downloadUrl: certificate.certificateDetails.downloadUrl
          },
          verification: {
            verificationCount: certificate.verification.verificationCount,
            lastVerified: certificate.verification.lastVerified
          },
          socialSharing: {
            shareCount: certificate.socialSharing.shareCount
          }
        }
      });

    } catch (error) {
      logger.error('Get certificate error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve certificate'
        }
      });
    }
  }

  /**
   * Get all certificates for a student
   * GET /api/certificates/student/:studentId
   */
  async getStudentCertificates(req, res) {
    try {
      const { studentId } = req.params;

      const certificates = await Certificate.findByStudent(studentId);

      res.json({
        success: true,
        count: certificates.length,
        data: certificates.map(cert => ({
          certificateId: cert.certificateId,
          courseTitle: cert.courseInfo.courseTitle,
          issueDate: cert.certificateDetails.issueDate,
          completionDate: cert.certificateDetails.completionDate,
          status: cert.certificateDetails.status,
          viewUrl: cert.certificateDetails.viewUrl,
          downloadUrl: cert.certificateDetails.downloadUrl,
          language: cert.certificateDetails.language
        }))
      });

    } catch (error) {
      logger.error('Get student certificates error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve certificates'
        }
      });
    }
  }

  /**
   * Revoke a certificate
   * PATCH /api/certificates/:certificateId/revoke
   */
  async revokeCertificate(req, res) {
    try {
      const { certificateId } = req.params;

      const certificate = await Certificate.findByCertificateId(certificateId);

      if (!certificate) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Certificate not found'
          }
        });
      }

      await certificate.revoke();

      logger.info(`Certificate revoked: ${certificateId}`);

      res.json({
        success: true,
        message: 'Certificate revoked successfully',
        data: {
          certificateId: certificate.certificateId,
          status: certificate.certificateDetails.status
        }
      });

    } catch (error) {
      logger.error('Revoke certificate error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'REVOKE_FAILED',
          message: 'Failed to revoke certificate'
        }
      });
    }
  }

  /**
   * Delete a certificate
   * DELETE /api/certificates/:certificateId
   */
  async deleteCertificate(req, res) {
    try {
      const { certificateId } = req.params;

      const certificate = await Certificate.findByCertificateId(certificateId);

      if (!certificate) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Certificate not found'
          }
        });
      }

      // Delete file from storage
      try {
        const filename = certificate.certificateDetails.fileUrl.split('/').pop();
        await storageService.deleteFile(filename);
      } catch (error) {
        logger.warn('Failed to delete certificate file:', error);
      }

      // Delete from database
      await Certificate.deleteOne({ certificateId });

      logger.info(`Certificate deleted: ${certificateId}`);

      res.json({
        success: true,
        message: 'Certificate deleted successfully'
      });

    } catch (error) {
      logger.error('Delete certificate error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: 'Failed to delete certificate'
        }
      });
    }
  }

  /**
   * Get certificate statistics
   * GET /api/certificates/stats
   */
  async getCertificateStats(req, res) {
    try {
      const totalCertificates = await Certificate.countDocuments();
      const activeCertificates = await Certificate.countDocuments({ 
        'certificateDetails.status': 'active' 
      });
      const revokedCertificates = await Certificate.countDocuments({ 
        'certificateDetails.status': 'revoked' 
      });

      // Get top shared certificates
      const topShared = await Certificate.find()
        .sort({ 'socialSharing.shareCount': -1 })
        .limit(10)
        .select('certificateId courseInfo.courseTitle socialSharing.shareCount');

      // Get recent certificates
      const recent = await Certificate.find()
        .sort({ 'timestamps.createdAt': -1 })
        .limit(10)
        .select('certificateId studentInfo.studentName courseInfo.courseTitle certificateDetails.issueDate');

      res.json({
        success: true,
        data: {
          total: totalCertificates,
          active: activeCertificates,
          revoked: revokedCertificates,
          topShared: topShared,
          recent: recent
        }
      });

    } catch (error) {
      logger.error('Get certificate stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'STATS_FAILED',
          message: 'Failed to retrieve statistics'
        }
      });
    }
  }
}

module.exports = new CertificateController();