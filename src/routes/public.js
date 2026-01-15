const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

// Public: view certificate
router.get('/view/:accessToken', certificateController.getCertificate);

// Public: download certificate
router.get('/download/:accessToken', certificateController.getCertificate);

module.exports = router;
