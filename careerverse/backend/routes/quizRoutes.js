const express = require('express');
const router = express.Router();
const { getQuestions, submitQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

router.get('/questions', getQuestions);
router.post('/submit', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, submitQuiz);

module.exports = router;
