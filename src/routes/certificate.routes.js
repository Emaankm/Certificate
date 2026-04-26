const express = require('express');
const router = express.Router();
const certificateService = require('../services/certificate.service');
console.log('Certificate Service:', certificateService);
console.log('generateCertificate:', certificateService.generateCertificate);

const { generateCertificate, getCertificateById } = certificateService;
// Create certificate
router.post('/', async (req, res) => {
  try {
    const certificate = await generateCertificate(req.body);
    res.status(201).json({
      success: true,
      data: {
        certificateUrl: certificate.certificateUrl,
        cloudinaryId: certificate.cloudinaryId
      }
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get certificate by ID
router.get('/:certificateId', async (req, res) => {
  try {
    const certificate = await getCertificateById(req.params.certificateId);
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
        certificateUrl: certificate.certificateUrl,
        cloudinaryId: certificate.cloudinaryId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

module.exports = router;
