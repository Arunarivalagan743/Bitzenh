const mongoose = require('mongoose');

const siteStatsSchema = new mongoose.Schema({
  totalViews: {
    type: Number,
    default: 0,
    min: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

siteStatsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('SiteStats', siteStatsSchema);
