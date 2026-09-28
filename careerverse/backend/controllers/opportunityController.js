const Opportunity = require('../models/Opportunity');
const recommendationService = require('../services/recommendationService');
const User = require('../models/User');

// @desc    Get Opportunities with live filtering, pagination, search, status
// @route   GET /api/opportunities
// @access  Public
exports.getOpportunities = async (req, res, next) => {
  try {
    const {
      category,
      status = 'Open',
      search,
      location,
      workType,
      skills,
      page = 1,
      limit = 15,
      sortBy = 'newest'
    } = req.query;

    const query = {};

    // 1. Category Filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // 2. Status Filter (All, Open, Closing Soon, Closed)
    // Section 13 & 24: Default view hides closed opportunities
    if (status === 'Open') {
      query.status = { $in: ['OPEN', 'CLOSING_SOON'] };
    } else if (status === 'Closing Soon') {
      query.status = 'CLOSING_SOON';
    } else if (status === 'Closed') {
      query.status = 'CLOSED';
    }
    // If status === 'All', no status restriction is applied

    // 3. Search query
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { organization: searchRegex },
        { skills: { $in: [searchRegex] } },
        { location: searchRegex }
      ];
    }

    // 4. Location filter
    if (location && location !== 'all') {
      query.location = new RegExp(location, 'i');
    }

    // 5. Work Type
    if (workType && workType !== 'all') {
      query.workType = workType;
    }

    // 6. Skills filter
    if (skills) {
      const skillArray = Array.isArray(skills) ? skills : skills.split(',');
      query.skills = { $in: skillArray.map(s => new RegExp(s.trim(), 'i')) };
    }

    // Sorting
    let sortOptions = { publishedAt: -1 };
    if (sortBy === 'deadline') {
      sortOptions = { deadline: 1 };
    } else if (sortBy === 'oldest') {
      sortOptions = { publishedAt: 1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Opportunity.countDocuments(query);
    const opportunities = await Opportunity.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: opportunities.length,
      total: totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      opportunities
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single opportunity details
// @route   GET /api/opportunities/:id
// @access  Public
exports.getOpportunityById = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found or may have been archived.'
      });
    }

    res.status(200).json({
      success: true,
      opportunity
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Personalized Recommendations
// @route   GET /api/opportunities/recommendations
// @access  Private / Optional
exports.getRecommendations = async (req, res, next) => {
  try {
    let user = null;
    if (req.user) {
      user = await User.findById(req.user.id);
    }

    const limit = parseInt(req.query.limit, 10) || 8;
    const recommendations = await recommendationService.getRecommendations(user, limit);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upcoming deadlines countdown list
// @route   GET /api/opportunities/deadlines
// @access  Public
exports.getUpcomingDeadlines = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAhead = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const deadlines = await Opportunity.find({
      deadline: { $gte: now, $lte: thirtyDaysAhead },
      status: { $in: ['OPEN', 'CLOSING_SOON'] }
    })
      .sort({ deadline: 1 })
      .limit(10)
      .select('title organization category deadline applicationUrl source');

    res.status(200).json({
      success: true,
      count: deadlines.length,
      deadlines
    });
  } catch (err) {
    next(err);
  }
};
