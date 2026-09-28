const mongoose = require('mongoose');

const governmentSourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    organization: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Central', 'State', 'Defense', 'Railway', 'Banking', 'UPSC', 'SSC'],
      default: 'Central'
    },
    website: {
      type: String,
      required: true
    },
    feedUrl: {
      type: String,
      default: ''
    },
    apiUrl: {
      type: String,
      default: ''
    },
    enabled: {
      type: Boolean,
      default: true
    },
    lastFetchedAt: {
      type: Date
    },
    syncFrequencyMinutes: {
      type: Number,
      default: 120
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('GovernmentSource', governmentSourceSchema);
