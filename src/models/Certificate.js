const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, unique: true, index: true, required: true },
    certificateUrl: { type: String, required: true },
    cloudinaryId: { type: String },

    studentInfo: {
      studentId: { type: String, required: true, index: true },
      studentName: { type: String, required: true },
      // optional by design (Render stability requirement)
      studentEmail: { type: String }
    },

    courseInfo: {
      courseId: { type: String, required: true, index: true },
      courseTitle: { type: String, required: true },
      courseDescription: { type: String },
      totalChapters: { type: Number },
      duration: { type: String }
    },

    certificateDetails: {
      issueDate: { type: Date, default: Date.now },
      completionDate: { type: Date },
      status: { type: String, enum: ['active', 'revoked'], default: 'active' },
      language: { type: String, default: 'en' },
      accessToken: { type: String, index: true },
      viewUrl: { type: String },
      downloadUrl: { type: String },
      qrCodeUrl: { type: String },
      qrCodeData: { type: String }
    },

    socialSharing: {
      shareCount: { type: Number, default: 0 }
    },

    metadata: {
      generatedBy: { type: String },
      fileSize: { type: Number },
      templateVersion: { type: String },
      generationTimeMs: { type: Number }
    },

    // Backwards-compat fields (older schema/service)
    userId: { type: String },
    userName: { type: String },
    courseId: { type: String },
    courseTitle: { type: String },
    language: { type: String },
    issuedAt: { type: Date }
  },
  { timestamps: true }
);

CertificateSchema.statics.findByCertificateId = function (certificateId) {
  return this.findOne({ certificateId });
};

CertificateSchema.statics.findByStudent = function (studentId) {
  return this.find({ 'studentInfo.studentId': studentId }).sort({ createdAt: -1 });
};

CertificateSchema.methods.revoke = async function () {
  this.certificateDetails = this.certificateDetails || {};
  this.certificateDetails.status = 'revoked';
  return this.save();
};

module.exports = mongoose.model('Certificate', CertificateSchema);