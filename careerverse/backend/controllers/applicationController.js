const Application = require('../models/Application');
const SavedOpportunity = require('../models/SavedOpportunity');
const Opportunity = require('../models/Opportunity');

// @desc    Toggle save opportunity
// @route   POST /api/applications/save/:opportunityId
// @access  Private
exports.toggleSaveOpportunity = async (req, res, next) => {
  try {
    const { opportunityId } = req.params;
    const userId = req.user.id;

    const existing = await SavedOpportunity.findOne({ userId, opportunityId });
    if (existing) {
      await SavedOpportunity.deleteOne({ _id: existing._id });
      return res.status(200).json({
        success: true,
        saved: false,
        message: 'Opportunity removed from saved items.'
      });
    } else {
      await SavedOpportunity.create({ userId, opportunityId });
      return res.status(201).json({
        success: true,
        saved: true,
        message: 'Opportunity saved successfully.'
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's saved opportunities
// @route   GET /api/applications/saved
// @access  Private
exports.getSavedOpportunities = async (req, res, next) => {
  try {
    const saved = await SavedOpportunity.find({ userId: req.user.id })
      .populate('opportunityId')
      .sort({ createdAt: -1 });

    const opportunities = saved
      .filter(item => item.opportunityId)
      .map(item => item.opportunityId);

    res.status(200).json({
      success: true,
      count: opportunities.length,
      opportunities
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Record or update an application
// @route   POST /api/applications
// @access  Private
exports.createOrUpdateApplication = async (req, res, next) => {
  try {
    const { opportunityId, status = 'Applied', notes, interviewDate } = req.body;
    const userId = req.user.id;

    if (!opportunityId) {
      return res.status(400).json({ success: false, message: 'opportunityId is required.' });
    }

    let application = await Application.findOne({ userId, opportunityId });
    if (application) {
      application.status = status;
      if (notes !== undefined) application.notes = notes;
      if (interviewDate !== undefined) application.interviewDate = interviewDate;
      await application.save();
    } else {
      application = await Application.create({
        userId,
        opportunityId,
        status,
        notes: notes || '',
        interviewDate: interviewDate || null
      });
    }

    const populated = await Application.findById(application._id).populate('opportunityId');

    res.status(200).json({
      success: true,
      message: `Opportunity status updated to ${status}.`,
      application: populated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user applications dashboard stats & list
// @route   GET /api/applications
// @access  Private
exports.getUserApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const applications = await Application.find({ userId })
      .populate('opportunityId')
      .sort({ updatedAt: -1 });

    const stats = {
      total: applications.length,
      applied: applications.filter(a => a.status === 'Applied').length,
      interview: applications.filter(a => a.status === 'Interview').length,
      selected: applications.filter(a => a.status === 'Selected').length,
      rejected: applications.filter(a => a.status === 'Rejected').length
    };

    res.status(200).json({
      success: true,
      stats,
      applications
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete application tracker entry
// @route   DELETE /api/applications/:id
// @access  Private
exports.deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Application entry deleted.'
    });
  } catch (err) {
    next(err);
  }
};
