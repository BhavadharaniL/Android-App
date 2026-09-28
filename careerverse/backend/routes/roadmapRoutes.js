const express = require('express');
const router = express.Router();
const { getUserRoadmap, updateMilestoneStatus } = require('../controllers/roadmapController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getUserRoadmap);
router.put('/:id/milestone/:milestoneId', updateMilestoneStatus);

module.exports = router;
