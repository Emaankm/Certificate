const express = require('express');
const certificateRoutes = require('./src/routes/certificate.routes');

const app = express();

app.disable('x-powered-by');

/* =========================
   🛡️ MIDDLEWARE
========================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   ❤️ HEALTH CHECK
========================= */
app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

/* =========================
   🚀 ROUTES
========================= */
app.use('/api/certificates', certificateRoutes);

/* =========================
   🏠 ROOT
========================= */
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Certificate microservice is running'
  });
});

/* =========================
   ❌ 404
========================= */
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

/* =========================
   🚨 ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error('❌ SERVER ERROR:', err);

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong'
    }
  });
});

module.exports = app;