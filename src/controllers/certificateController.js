const Certificate = require('../models/Certificate');
const pdfGenerator = require('../services/pdfGenerator');
const { uploadPDF } = require('../services/cloudinary.service');
const qrCodeService = require('../services/qrCodeService');
const tokenGenerator = require('../utils/tokenGenerator');
const logger = require('../utils/logger');

class CertificateController {

  /**
   * Generate a single certificate
   */
  async generateCertificate(req, res) {
    try {
      if (process.env.LOG_REQUEST_BODY === 'true') {
        // requested: safe logging for debugging Postman issues
        console.log('REQUEST BODY:', req.body);
      }

      const {
        studentId,
        studentName,
        courseId,
        courseTitle,
        courseDescription,
        completionDate,
        language = 'en',
        metadata = {}
      } = req.body;

      // ✅ FIX: email removed
      if (!studentId || !studentName || !courseId || !courseTitle) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'studentId, studentName, courseId, courseTitle are required'
          }
        });
      }

      const existingCertificate = await Certificate.findOne({
        'studentInfo.studentId': studentId,
        'courseInfo.courseId': courseId
      });

      if (existingCertificate) {
        return res.status(200).json({
          success: true,
          data: {
            certificateUrl: existingCertificate.certificateUrl,
            cloudinaryId: existingCertificate.cloudinaryId
          }
        });
      }

      const certificateId = tokenGenerator.generateCertificateId();
      const accessToken = tokenGenerator.generateAccessToken();

      const certificateData = {
        certificateId,
        studentId,
        studentName,
        courseId,
        courseTitle,
        courseDescription,
        completionDate: completionDate || new Date(),
        accessToken,
        metadata
      };

      const pdfResult = await pdfGenerator.generateCertificate(
        certificateData,
        language
      );

      const uploadResult = await uploadPDF(pdfResult.filepath);
      const { cloudinaryId, certificateUrl } = uploadResult;

      const certificate = new Certificate({
        certificateId,
        certificateUrl,
        cloudinaryId,

        studentInfo: {
          studentId,
          studentName
          // ❌ studentEmail removed completely
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
          accessToken,
          viewUrl: `${process.env.BASE_URL}/view/${accessToken}`,
          downloadUrl: `${process.env.BASE_URL}/download/${accessToken}`,
          qrCodeUrl: pdfResult.qrCodeUrl,
          qrCodeData: pdfResult.qrCodeData
        },

        metadata: {
          generatedBy: 'certificate-service-cloudinary',
          fileSize: pdfResult.fileSize,
          templateVersion: '1.0',
          generationTimeMs: pdfResult.generationTimeMs
        }
      });

      await certificate.save();

      logger.info(`Certificate generated: ${certificateId}`);

      return res.status(201).json({
        success: true,
        data: {
          certificateUrl: certificate.certificateUrl,
          cloudinaryId: certificate.cloudinaryId
        }
      });

    } catch (error) {
      logger.error('Certificate generation error:', error);
      return res.status(500).json({
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

      return res.json({
        success: true,
        data: {
          certificateUrl: certificate.certificateUrl,
          cloudinaryId: certificate.cloudinaryId
        }
      });

    } catch (error) {
      logger.error('Get certificate error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve certificate'
        }
      });
    }
  }

  /**
   * Get student certificates
   */
  async getStudentCertificates(req, res) {
    try {
      const { studentId } = req.params;

      const certificates = await Certificate.findByStudent(studentId);

      return res.json({
        success: true,
        data: {
          certificates: certificates.map(cert => ({
            certificateUrl: cert.certificateUrl,
            cloudinaryId: cert.cloudinaryId
          }))
        }
      });

    } catch (error) {
      logger.error('Get student certificates error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve certificates'
        }
      });
    }
  }

  /**
   * Revoke certificate
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

      return res.json({
        success: true,
        data: {
          certificateUrl: certificate.certificateUrl,
          cloudinaryId: certificate.cloudinaryId
        }
      });

    } catch (error) {
      logger.error('Revoke certificate error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'REVOKE_FAILED',
          message: 'Failed to revoke certificate'
        }
      });
    }
  }

  /**
   * Delete certificate
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

      await Certificate.deleteOne({ certificateId });

      return res.json({
        success: true,
        data: {
          certificateUrl: certificate.certificateUrl,
          cloudinaryId: certificate.cloudinaryId
        }
      });

    } catch (error) {
      logger.error('Delete certificate error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: 'Failed to delete certificate'
        }
      });
    }
  }

  /**
   * Stats
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

      const topShared = await Certificate.find()
        .sort({ 'socialSharing.shareCount': -1 })
        .limit(10)
        .select('certificateId courseInfo.courseTitle socialSharing.shareCount');

      const recent = await Certificate.find()
        .sort({ 'timestamps.createdAt': -1 })
        .limit(10)
        .select('certificateId studentInfo.studentName courseInfo.courseTitle certificateDetails.issueDate');

      return res.json({
        success: true,
        data: {
          totalCertificates,
          activeCertificates,
          revokedCertificates,
          topShared,
          recent
        }
      });

    } catch (error) {
      logger.error('Stats error:', error);
      return res.status(500).json({
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