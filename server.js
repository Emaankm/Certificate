require('dotenv').config();
const { validateEnv } = require('./src/config/validateEnv');
const connectDatabase = require('./src/config/database');

validateEnv();

const app = require('./app');

const PORT = process.env.PORT || 3000;

/* =========================
   🗄️ CONNECT DB FIRST
========================= */
connectDatabase()
  .then(() => {
    console.log("✅ Database connected. Starting server...");

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Timeouts (good 👍)
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 70000;
    server.requestTimeout = 120000;
  })
  .catch((err) => {
    console.error("❌ Failed to connect DB:", err.message);
    process.exit(1);
  });

/* =========================
   💀 SAFETY HANDLERS
========================= */
process.on('unhandledRejection', (reason) => {
  console.error('💥 UnhandledRejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('💥 UncaughtException:', err);
});