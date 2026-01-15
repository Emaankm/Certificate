const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const CertificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true
    },

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

    issuedAt: {
      type: Date,
      default: Date.now
    },

    pdfPath: {
      type: String,
      required: true
    },

    verificationUrl: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ['generated', 'revoked'],
      default: 'generated'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Certificate', CertificateSchema);