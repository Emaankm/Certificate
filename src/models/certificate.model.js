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
  certificateUrl: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String
  }
}, {
  timestamps: true
});

// Use the same Mongo collection ('certificates') while avoiding model name clashes
// with `src/models/Certificate.js` (which also registers 'Certificate').
module.exports = mongoose.model('CertificateSimple', certificateSchema, 'certificates');