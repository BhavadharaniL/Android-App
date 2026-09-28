const CareerRoadmap = require('../models/CareerRoadmap');
const aiService = require('../services/aiService');
const User = require('../models/User');

// @desc    Get or generate user career roadmap
// @route   GET /api/roadmaps
// @access  Private
exports.getUserRoadmap = async (req, res, next) => {
  try {
    const { targetRole } = req.query;
    const userId = req.user.id;
    const user = await User.findById(userId);

    const roleToFind = targetRole || (user.careerGoals && user.careerGoals[0]) || 'Software Engineer';

    let roadmap = await CareerRoadmap.findOne({ userId, targetRole: new RegExp(roleToFind, 'i') });

    if (!roadmap) {
      // Generate initial roadmap
      const generated = await aiService.generateCareerRoadmap(roleToFind, user.technicalSkills || []);
      roadmap = await CareerRoadmap.create({
        userId,
        targetRole: generated.targetRole,
        milestones: generated.milestones,
        generatedByAI: true
      });
    }

    res.status(200).json({
      success: true,
      roadmap
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update milestone status in roadmap
// @route   PUT /api/roadmaps/:id/milestone/:milestoneId
// @access  Private
exports.updateMilestoneStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id, milestoneId } = req.params;

    const roadmap = await CareerRoadmap.findOne({ _id: id, userId: req.user.id });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found.' });
    }

    const milestone = roadmap.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found in roadmap.' });
    }

    milestone.status = status;
    await roadmap.save();

    res.status(200).json({
      success: true,
      message: 'Milestone updated.',
      roadmap
    });
  } catch (err) {
    next(err);
  }
};
