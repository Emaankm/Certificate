const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  courseTitle: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'en'
  },
  pdfPath: {
    type: String,
    required: true
  },
  verificationUrl: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Certificate', certificateSchema);