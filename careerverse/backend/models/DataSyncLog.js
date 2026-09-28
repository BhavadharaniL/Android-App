const mongoose = require('mongoose');

const dataSyncLogSchema = new mongoose.Schema(
  {
    sourceName: {
      type: String,
      required: true,
      index: true
    },
    category: {
      type: String,
      default: 'job'
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    durationMs: {
      type: Number,
      default: 0
    },
    recordsFetched: {
      type: Number,
      default: 0
    },
    recordsAdded: {
      type: Number,
      default: 0
    },
    recordsUpdated: {
      type: Number,
      default: 0
    },
    recordsRemoved: {
      type: Number,
      default: 0
    },
    recordsFailed: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'PARTIAL', 'FAILED'],
      default: 'SUCCESS'
    },
    errorMessage: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

dataSyncLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DataSyncLog', dataSyncLogSchema);
