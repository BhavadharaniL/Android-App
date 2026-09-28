const express = require('express');
const router = express.Router();
const {
  askCareerAI,
  analyzeResume,
  analyzeSkillGap,
  getInterviewQuestions,
  evaluateInterviewAnswer
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

// Public or optionally authenticated Q&A
router.post('/ask', aiLimiter, (req, res, next) => {
  // Allow optional token parsing for user personalization
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, askCareerAI);

router.post('/resume-analyzer', aiLimiter, (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, analyzeResume);

router.post('/skill-gap', aiLimiter, (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, analyzeSkillGap);

router.get('/interview/questions', getInterviewQuestions);
router.post('/interview/evaluate', aiLimiter, evaluateInterviewAnswer);

module.exports = router;
