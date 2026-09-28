const mongoose = require('mongoose');

const newsSourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: String,
      default: 'Technology'
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['API', 'RSS'],
      default: 'API'
    },
    enabled: {
      type: Boolean,
      default: true
    },
    lastFetchedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('NewsSource', newsSourceSchema);
