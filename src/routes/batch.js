const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const auth = require('../middleware/auth'); // if admin authentication is required

// Create a batch job
router.post('/generate', auth, batchController.createBatchJob);

// Get batch job status
router.get('/:jobId', auth, batchController.getBatchJobStatus);

// Get all batch jobs with optional status filter
router.get('/', auth, batchController.getAllBatchJobs);

module.exports = router;
