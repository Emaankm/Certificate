const express = require('express');
const router = express.Router();

const certificateService = require('../services/certificate.service');
const { generateCertificate, getCertificateById } = certificateService;

/* ---------------- CREATE CERTIFICATE (EXTERNAL API) ---------------- */
router.post('/generate', async (req, res) => {
  try {
    const { userId, userName, courseId, courseTitle, language } = req.body;

    // Validation
    if (!userId || !userName || !courseId || !courseTitle) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Generate certificate
    const certificate = await generateCertificate({
      userId,
      userName,
      courseId,
      courseTitle,
      language
    });

    return res.status(201).json({
      success: true,
      data: {
        certificateUrl: certificate.certificateUrl,
        cloudinaryId: certificate.cloudinaryId
      }
    });

  } catch (error) {
    console.error('Certificate generation error:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


/* ---------------- GET CERTIFICATE BY ID ---------------- */
router.get('/:certificateId', async (req, res) => {
  try {
    const certificate = await getCertificateById(req.params.certificateId);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
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
    console.error('Get certificate error:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;