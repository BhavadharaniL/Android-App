const aiService = require('../services/aiService');
const User = require('../models/User');

// @desc    Ask Career AI Assistant (RAG Grounded)
// @route   POST /api/ai/ask
// @access  Public / Private
exports.askCareerAI = async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question cannot be empty.' });
    }

    let userProfile = null;
    if (req.user) {
      userProfile = await User.findById(req.user.id);
    }

    const response = await aiService.answerCareerQuestion(question, userProfile);

    res.status(200).json({
      success: true,
      answer: response.answer,
      groundedRecords: response.groundedRecords,
      isGrounded: response.isGrounded
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Analyze Resume Text / Document
// @route   POST /api/ai/resume-analyzer
// @access  Private
exports.analyzeResume = async (req, res, next) => {
  try {
    const { resumeText, targetRole = 'Software Engineer' } = req.body;

    const analysis = await aiService.analyzeResume(resumeText, targetRole);

    // Save analysis on user document if logged in
    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, {
        resumeAnalysis: {
          ...analysis,
          analyzedAt: new Date()
        }
      });
    }

    res.status(200).json({
      success: true,
      analysis
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Perform Skill Gap Analysis
// @route   POST /api/ai/skill-gap
// @access  Private / Public
exports.analyzeSkillGap = async (req, res, next) => {
  try {
    const { targetRole, userSkills = [] } = req.body;

    let skillsToEvaluate = userSkills;
    if (skillsToEvaluate.length === 0 && req.user) {
      const user = await User.findById(req.user.id);
      skillsToEvaluate = [
        ...(user.programmingLanguages || []),
        ...(user.technicalSkills || [])
      ];
    }

    const result = await aiService.analyzeSkillGap(targetRole || 'Software Engineer', skillsToEvaluate);

    res.status(200).json({
      success: true,
      result
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Mock Interview Questions
// @route   GET /api/ai/interview/questions
// @access  Public
exports.getInterviewQuestions = async (req, res, next) => {
  try {
    const { topic = 'Java', difficulty = 'Medium' } = req.query;
    const questions = await aiService.generateInterviewQuestions(topic, difficulty);

    res.status(200).json({
      success: true,
      topic,
      difficulty,
      questions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Evaluate User's Interview Answer
// @route   POST /api/ai/interview/evaluate
// @access  Public
exports.evaluateInterviewAnswer = async (req, res, next) => {
  try {
    const { question, userAnswer } = req.body;

    if (!question || !userAnswer) {
      return res.status(400).json({ success: false, message: 'Question and userAnswer are required.' });
    }

    const evaluation = await aiService.evaluateInterviewAnswer(question, userAnswer);

    res.status(200).json({
      success: true,
      evaluation
    });
  } catch (err) {
    next(err);
  }
};
