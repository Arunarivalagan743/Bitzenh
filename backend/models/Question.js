const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  code: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: false
  }
}, { _id: false });

const questionSchema = new mongoose.Schema({
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  statement: {
    type: String,
    required: false
  },
  imageUrls: {
    type: [String],
    default: []
  },
  imagePublicIds: {
    type: [String],
    default: [] // Store Cloudinary public IDs for deletion
  },
  answers: [answerSchema],
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  languages: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search functionality
questionSchema.index({ title: 'text', statement: 'text', tags: 'text' });

// Ensure unique languages in answers & sync languages array automatically
questionSchema.pre('validate', function(next) {
  if (this.answers && this.answers.length > 0) {
    const seen = new Set();
    for (const ans of this.answers) {
      if (seen.has(ans.language)) {
        return next(new Error(`Duplicate answer language: ${ans.language}`));
      }
      seen.add(ans.language);
    }
    this.languages = Array.from(seen);
  } else {
    // Must have at least one answer
    if (!this.answers || this.answers.length === 0) {
      return next(new Error('At least one answer is required'));
    }
  }
  next();
});

// Normalize tags (remove empties, lowercase)
questionSchema.pre('save', function(next) {
  if (this.tags && Array.isArray(this.tags)) {
    this.tags = this.tags
      .map(t => (t || '').trim().toLowerCase())
      .filter(Boolean);
  }
  
  // Migration: Convert old single image fields to arrays if needed
  if (this.imageUrl && !Array.isArray(this.imageUrls)) {
    this.imageUrls = [this.imageUrl];
    this.imageUrl = undefined;
  }
  if (this.imagePublicId && !Array.isArray(this.imagePublicIds)) {
    this.imagePublicIds = [this.imagePublicId];
    this.imagePublicId = undefined;
  }
  
  next();
});

module.exports = mongoose.model('Question', questionSchema);