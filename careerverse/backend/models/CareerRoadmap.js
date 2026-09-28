const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  resources: [{ type: String }],
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  order: { type: Number, default: 0 }
});

const careerRoadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    targetRole: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: 'Software Engineering'
    },
    milestones: [milestoneSchema],
    progressPercentage: {
      type: Number,
      default: 0
    },
    generatedByAI: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

careerRoadmapSchema.pre('save', function (next) {
  if (this.milestones && this.milestones.length > 0) {
    const completedCount = this.milestones.filter(m => m.status === 'Completed').length;
    this.progressPercentage = Math.round((completedCount / this.milestones.length) * 100);
  } else {
    this.progressPercentage = 0;
  }
  next();
});

module.exports = mongoose.model('CareerRoadmap', careerRoadmapSchema);
