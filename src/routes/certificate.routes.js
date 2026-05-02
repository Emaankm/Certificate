const express = require('express');
const router = express.Router();

const certificateController = require('../controllers/certificateController');
const asyncHandler = require('../utils/asyncHandler');

/* ---------------- CREATE CERTIFICATE (EXTERNAL API) ---------------- */
router.post('/generate', asyncHandler(async (req, res) => {
  // Normalize legacy field names to the controller’s expected payload
  const body = req.body || {};
  req.body = {
    studentId: body.studentId ?? body.userId,
    studentName: body.studentName ?? body.userName,
    courseId: body.courseId,
    courseTitle: body.courseTitle,
    courseDescription: body.courseDescription,
    completionDate: body.completionDate,
    language: body.language,
    metadata: body.metadata
  };

  return certificateController.generateCertificate(req, res);
}));


/* ---------------- GET CERTIFICATE BY ID ---------------- */
router.get('/:certificateId', asyncHandler(certificateController.getCertificate.bind(certificateController)));

module.exports = router;