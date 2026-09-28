const express = require('express');
const router = express.Router();
const {
  getOpportunities,
  getOpportunityById,
  getRecommendations,
  getUpcomingDeadlines
} = require('../controllers/opportunityController');
const { protect } = require('../middleware/auth');

// Public route to list opportunities with live filters, search, pagination, status
router.get('/', getOpportunities);

// Personalized recommendations
router.get('/recommendations', protect, getRecommendations);

// Upcoming deadlines
router.get('/deadlines', getUpcomingDeadlines);

// Single opportunity detail
router.get('/:id', getOpportunityById);

module.exports = router;
