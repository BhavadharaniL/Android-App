const QuizResult = require('../models/Quiz');

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'When solving a complex problem, what excites you the most?',
    options: [
      { text: 'Designing clean architectures and writing scalable code', role: 'Software Engineer', weight: 3 },
      { text: 'Configuring servers, networks, and automated cloud deployments', role: 'Cloud Engineer', weight: 3 },
      { text: 'Discovering hidden patterns and training predictive statistical models', role: 'Data Scientist', weight: 3 },
      { text: 'Securing vulnerabilities, reverse-engineering, and preventing breaches', role: 'Cybersecurity Analyst', weight: 3 }
    ]
  },
  {
    id: 'q2',
    question: 'Which of the following topics do you enjoy studying the most?',
    options: [
      { text: 'Data Structures, Algorithms, and Object-Oriented Design', role: 'Software Engineer', weight: 3 },
      { text: 'Distributed Systems, Docker, AWS, and Linux', role: 'Cloud Engineer', weight: 3 },
      { text: 'Statistics, Linear Algebra, Machine Learning, and Python Data Frames', role: 'Data Scientist', weight: 3 },
      { text: 'Cryptography, Network Protocols, and Penetration Testing', role: 'Cybersecurity Analyst', weight: 3 }
    ]
  },
  {
    id: 'q3',
    question: 'What type of final product would you prefer to build?',
    options: [
      { text: 'A responsive full-stack web or mobile platform used by thousands', role: 'Software Engineer', weight: 2 },
      { text: 'A resilient multi-region infrastructure pipeline with zero downtime', role: 'Cloud Engineer', weight: 2 },
      { text: 'An intelligent recommendation or natural language processing model', role: 'Data Scientist', weight: 2 },
      { text: 'A comprehensive security audit report and zero-trust authentication framework', role: 'Cybersecurity Analyst', weight: 2 }
    ]
  }
];

// @desc    Get assessment questions
// @route   GET /api/quiz/questions
// @access  Public
exports.getQuestions = (req, res) => {
  res.status(200).json({
    success: true,
    count: QUIZ_QUESTIONS.length,
    questions: QUIZ_QUESTIONS
  });
};

// @desc    Submit answers & compute career recommendation
// @route   POST /api/quiz/submit
// @access  Private / Public
exports.submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const scores = {
      'Software Engineer': 0,
      'Cloud Engineer': 0,
      'Data Scientist': 0,
      'Cybersecurity Analyst': 0
    };

    if (Array.isArray(answers)) {
      for (const ans of answers) {
        if (ans.selectedRole && scores[ans.selectedRole] !== undefined) {
          scores[ans.selectedRole] += ans.weight || 2;
        }
      }
    }

    // Rank roles
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) || 1;

    const recommendations = sorted.map(([title, score]) => ({
      title,
      matchPercentage: Math.min(Math.round((score / totalScore) * 100) + 20, 95),
      rationale: `Strong affinity for ${title} fundamentals based on problem-solving preferences.`
    }));

    if (req.user) {
      await QuizResult.create({
        userId: req.user.id,
        answers: answers || [],
        recommendedCareers: recommendations
      });
    }

    res.status(200).json({
      success: true,
      topRecommendation: recommendations[0],
      allRecommendations: recommendations
    });
  } catch (err) {
    next(err);
  }
};
