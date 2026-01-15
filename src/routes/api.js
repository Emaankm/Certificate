const express = require('express');
const router = express.Router();

const batchRoutes = require('./batch');
const socialRoutes = require('./social');
const publicRoutes = require('./public');
const certificateController = require('../controllers/certificateController');
const auth = require('../middleware/auth');

// Batch endpoints
router.use('/batch', batchRoutes);

// Certificate endpoints
router.post('/certificates/generate', auth, certificateController.generateCertificate);
router.get('/certificates/:certificateId', auth, certificateController.getCertificate);
router.get('/certificates/student/:studentId', auth, certificateController.getStudentCertificates);
router.patch('/certificates/:certificateId/revoke', auth, certificateController.revokeCertificate);
router.delete('/certificates/:certificateId', auth, certificateController.deleteCertificate);
router.get('/certificates/stats', auth, certificateController.getCertificateStats);

// Social media endpoints
router.use('/social', socialRoutes);

// Public routes
router.use('/public', publicRoutes);

module.exports = router;
