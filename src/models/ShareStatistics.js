const mongoose = require('mongoose');

const shareStatisticsSchema = new mongoose.Schema({
  certificateId: { type: String, required: true },
  shares: {
    linkedin: { type: Number, default: 0 },
    twitter: { type: Number, default: 0 },
    facebook: { type: Number, default: 0 },
    whatsapp: { type: Number, default: 0 }
  },
  totalShares: { type: Number, default: 0 },
  lastSharedAt: Date
});

shareStatisticsSchema.methods.incrementShare = function(platform) {
  if(this.shares[platform] !== undefined) {
    this.shares[platform] += 1;
    this.totalShares += 1;
    this.lastSharedAt = new Date();
    return this.save();
  }
  return null;
};

module.exports = mongoose.model('ShareStatistics', shareStatisticsSchema);
