/**
 * Startup validation for required environment variables.
 * Logs clear errors; exits in production when critical vars are missing.
 */

function validateEnv() {
  const errors = [];

  const requireNonEmpty = (name) => {
    const v = process.env[name];
    if (v === undefined || v === null || String(v).trim() === '') {
      errors.push(name);
    }
  };

  ['MONGODB_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].forEach(
    requireNonEmpty
  );

  if (errors.length > 0) {
    console.error('❌ Required environment variables are missing or empty:');
    errors.forEach((key) => console.error(`   - ${key}`));
    console.error('   Set these in Render (or your .env locally). Never commit real secrets.');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  const mongoUri = process.env.MONGODB_URI || '';
  if (/localhost/i.test(mongoUri) && process.env.NODE_ENV === 'production') {
    console.error(
      '❌ MONGODB_URI appears to point at localhost in production. Use MongoDB Atlas, e.g.'
    );
    console.error(
      '   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/certificates'
    );
    process.exit(1);
  }

  const baseUrl = process.env.BASE_URL || '';
  if (
    process.env.NODE_ENV === 'production' &&
    (!baseUrl || /localhost/i.test(baseUrl))
  ) {
    console.error(
      '❌ BASE_URL must be set to your public HTTPS URL (e.g. https://certificate-5-hixf.onrender.com) in production.'
    );
    process.exit(1);
  }
}

module.exports = { validateEnv };
