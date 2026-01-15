const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: String,
  studentName: String,
  studentEmail: String,
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  certificateId: String,
  certificateUrl: String,
  error: String
});

const batchJobSchema = new mongoose.Schema({
  jobId: { type: String, unique: true, required: true },
  requestedBy: {
    adminId: String,
    adminName: String,
    adminEmail: String
  },
  batchDetails: {
    totalStudents: Number,
    courseId: String,
    courseTitle: String,
    language: { type: String, default: 'en' },
    completionDate: Date
  },
  students: [studentSchema],
  progress: {
    total: Number,
    completed: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    status: { type: String, enum: ['queued','processing','completed','failed'], default: 'queued' },
    estimatedTimeMs: Number,
    startedAt: Date,
    completedAt: Date
  },
  options: {
    sendEmail: { type: Boolean, default: false },
    generatePreview: { type: Boolean, default: true },
    priority: { type: String, enum: ['low','normal','high'], default: 'normal' }
  },
  timestamps: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
  }
});

batchJobSchema.pre('save', function(next) {
  this.timestamps.updatedAt = new Date();
  next();
});

batchJobSchema.statics.findByJobId = function(jobId) {
  return this.findOne({ jobId });
};

module.exports = mongoose.model('BatchJob', batchJobSchema);
