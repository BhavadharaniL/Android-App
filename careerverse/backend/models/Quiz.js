const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    answers: [
      {
        questionId: String,
        selectedOption: String,
        traits: [String]
      }
    ],
    recommendedCareers: [
      {
        title: String,
        matchPercentage: Number,
        rationale: String,
        topSkills: [String]
      }
    ],
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('QuizResult', quizResultSchema);
