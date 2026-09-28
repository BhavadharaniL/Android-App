const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },
    college: {
      type: String,
      trim: true,
      default: ''
    },
    degree: {
      type: String,
      trim: true,
      default: ''
    },
    branch: {
      type: String,
      trim: true,
      default: ''
    },
    currentYear: {
      type: String,
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', ''],
      default: ''
    },
    careerGoals: {
      type: [String],
      default: []
    },
    programmingLanguages: {
      type: [String],
      default: []
    },
    technicalSkills: {
      type: [String],
      default: []
    },
    softSkills: {
      type: [String],
      default: []
    },
    areasOfInterest: {
      type: [String],
      default: []
    },
    preferredRoles: {
      type: [String],
      default: []
    },
    preferredLocations: {
      type: [String],
      default: []
    },
    experienceLevel: {
      type: String,
      enum: ['Fresher', '0-1 Years', '1-3 Years', '3+ Years', 'Student'],
      default: 'Student'
    },
    remotePreference: {
      type: String,
      enum: ['Any', 'Remote', 'Hybrid', 'On-site'],
      default: 'Any'
    },
    resumeText: {
      type: String,
      default: ''
    },
    resumeUrl: {
      type: String,
      default: ''
    },
    resumeAnalysis: {
      score: Number,
      extractedSkills: [String],
      strengths: [String],
      weaknesses: [String],
      recommendations: [String],
      analyzedAt: Date
    },
    notificationPreferences: {
      jobDeadlines: { type: Boolean, default: true },
      internships: { type: Boolean, default: true },
      scholarships: { type: Boolean, default: true },
      governmentJobs: { type: Boolean, default: true },
      news: { type: Boolean, default: false }
    },
    followedCategories: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
