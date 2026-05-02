require('dotenv').config();
const express = require('express');
const connectDatabase = require('./src/config/database');
const certificateRoutes = require('./src/routes/certificate.routes');

const app = express();

app.disable('x-powered-by');

/* =========================
   🛡️ BASIC SAFETY MIDDLEWARE
========================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   🧠 OPTIONAL DEBUG (safe for dev)
   Turn OFF in production if needed
========================= */
if (process.env.LOG_REQUEST_BODY === 'true') {
  app.use((req, res, next) => {
    console.log('📥 REQUEST:', {
      method: req.method,
      url: req.url,
      body: req.body
    });
    next();
  });
}

/* =========================
   ❤️ HEALTH CHECK (NO DB)
========================= */
app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

/* =========================
   🗄️ DATABASE CONNECTION
========================= */
connectDatabase().catch((err) => {
  console.error('❌ DB Connection Failed:', err);
});

/* =========================
   🚀 ROUTES
========================= */
app.use('/api/certificates', certificateRoutes);

/* =========================
   🏠 ROOT ROUTE
========================= */
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Certificate microservice is running'
  });
});

/* =========================
   ❌ 404 HANDLER (NO HTML EVER)
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
   🚨 GLOBAL ERROR HANDLER
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

/* =========================
   💀 SAFETY NET (CRASH PREVENTION)
========================= */
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION:', err);
});

module.exports = app;