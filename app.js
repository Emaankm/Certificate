require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDatabase = require('./src/config/database');
const certificateRoutes = require('./src/routes/certificate.routes');

const app = express();

// Middleware
app.use(express.json());

// Connect MongoDB
connectDatabase();

// 🚀 START BATCH WORKER (VERY IMPORTANT)
require('./src/jobs/batchProcessor');

// Certificate API routes
app.use('/api/certificates', certificateRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Root route
app.get('/', (req, res) => res.send('✅ Certificate microservice is running 🚀'));

module.exports = app;