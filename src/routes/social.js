const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const auth = require('../middleware/auth');

// Get share URL for a certificate
router.get('/share/:certificateId/:platform', auth, socialController.getShareUrl);

// Increment share count
router.post('/share/:certificateId/:platform', auth, socialController.incrementShare);

module.exports = router;
