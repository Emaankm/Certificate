const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    // ✅ use correct env name
    const uri = process.env.MONGODB_URI;

    // 🔍 debug log (safe)
    console.log("🔍 Checking Mongo URI exists:", !!uri);

    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(uri);

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;