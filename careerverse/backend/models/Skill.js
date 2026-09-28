const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Programming', 'Framework', 'Database', 'Cloud', 'DevOps', 'Core CS', 'Soft Skills', 'Tools'],
      default: 'Programming'
    },
    relatedRoles: {
      type: [String],
      default: []
    },
    learningResources: [
      {
        title: String,
        url: String,
        type: { type: String, enum: ['Documentation', 'Course', 'Video', 'Book'] }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Skill', skillSchema);
