require('dotenv').config();
const express = require('express');
const connectDatabase = require('./src/config/database');
const certificateRoutes = require('./src/routes/certificate.routes');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));

// Connect MongoDB
connectDatabase();

// 🚀 START BATCH WORKER (SAFE GUARD)
if (process.env.ENABLE_BATCH_WORKER === 'true') {
  require('./src/jobs/batchProcessor');
}

// Routes
app.use('/api/certificates', certificateRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Root route
app.get('/', (req, res) => {
  res.send('✅ Certificate microservice is running 🚀');
});

// Global error handler (IMPORTANT for production)
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message
    }
  });
});

module.exports = app;