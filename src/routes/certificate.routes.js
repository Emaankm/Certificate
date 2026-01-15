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
      message: 'Certificate generated successfully',
      data: {
        _id: certificate._id,
        userId: certificate.userId,
        userName: certificate.userName,
        courseTitle: certificate.courseTitle,
        verificationUrl: certificate.verificationUrl,
        pdfPath: certificate.pdfPath,
        createdAt: certificate.createdAt
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
      return res.status(404).json({ message: 'Certificate not found' });
    }
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
