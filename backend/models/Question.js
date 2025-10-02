const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  }
});

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
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  imagePublicId: {
    type: String,
    default: null // Store Cloudinary public ID for deletion
  },
  answers: [answerSchema],
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  languages: [{
    type: String,
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search functionality
questionSchema.index({ title: 'text', statement: 'text', tags: 'text' });

module.exports = mongoose.model('Question', questionSchema);