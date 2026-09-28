const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    sourceName: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        'AI',
        'Cloud Computing',
        'Cybersecurity',
        'Software Engineering',
        'Data Science',
        'Internships',
        'Jobs',
        'Technology',
        'Startups'
      ],
      default: 'Technology',
      index: true
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    retrievedAt: {
      type: Date,
      default: Date.now
    },
    isLive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

newsSchema.index({ category: 1, publishedAt: -1 });

module.exports = mongoose.model('News', newsSchema);
