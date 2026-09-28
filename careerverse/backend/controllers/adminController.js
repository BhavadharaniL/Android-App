const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const DataSyncLog = require('../models/DataSyncLog');
const GovernmentSource = require('../models/GovernmentSource');
const syncService = require('../services/syncService');

// @desc    Get Admin Dashboard Statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOpportunities = await Opportunity.countDocuments();
    const activeOpportunities = await Opportunity.countDocuments({ status: { $in: ['OPEN', 'CLOSING_SOON'] } });
    const totalApplications = await Application.countDocuments();

    const lastSyncLog = await DataSyncLog.findOne().sort({ createdAt: -1 });

    // Popular career goals
    const goalsAgg = await User.aggregate([
      { $unwind: '$careerGoals' },
      { $group: { _id: '$careerGoals', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Most popular skills
    const skillsAgg = await User.aggregate([
      { $unwind: '$technicalSkills' },
      { $group: { _id: '$technicalSkills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    const apiStatus = {
      adzuna: Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) ? 'CONNECTED' : 'STANDBY',
      newsApi: Boolean(process.env.NEWS_API_KEY) ? 'CONNECTED' : 'RSS_FALLBACK',
      geminiAi: Boolean(process.env.GEMINI_API_KEY) ? 'CONNECTED' : 'STANDBY',
      ncsFeed: 'CONNECTED',
      govPortals: 'CONNECTED'
    };

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalOpportunities,
        activeOpportunities,
        totalApplications,
        lastSyncTime: lastSyncLog ? lastSyncLog.createdAt : null,
        popularGoals: goalsAgg.map(g => ({ goal: g._id, count: g.count })),
        popularSkills: skillsAgg.map(s => ({ skill: s._id, count: s.count })),
        apiStatus
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all managed data sources
// @route   GET /api/admin/sources
// @access  Private (Admin)
exports.getDataSources = async (req, res, next) => {
  try {
    const govSources = await GovernmentSource.find();

    const coreSources = [
      {
        id: 'adzuna-api',
        name: 'Adzuna Job Search API',
        type: 'TRUSTED_API',
        category: 'Private Jobs & Internships',
        status: Boolean(process.env.ADZUNA_APP_ID) ? 'ENABLED' : 'CONFIG_REQUIRED',
        refreshInterval: '30-60 minutes'
      },
      {
        id: 'ncs-portal',
        name: 'National Career Service (NCS)',
        type: 'OFFICIAL_GOVERNMENT',
        category: 'Govt & Industry Postings',
        status: 'ENABLED',
        refreshInterval: '60 minutes'
      },
      {
        id: 'nsp-portal',
        name: 'National Scholarship Portal (NSP)',
        type: 'OFFICIAL_GOVERNMENT',
        category: 'Scholarships & Grants',
        status: 'ENABLED',
        refreshInterval: 'Daily'
      },
      {
        id: 'news-service',
        name: 'Live Technology News (NewsAPI + RSS)',
        type: 'OFFICIAL_API / RSS',
        category: 'Tech & Career News',
        status: 'ENABLED',
        refreshInterval: '15-30 minutes'
      },
      ...govSources.map(s => ({
        id: s._id,
        name: s.name,
        type: 'OFFICIAL_GOVERNMENT',
        category: s.category,
        status: s.enabled ? 'ENABLED' : 'DISABLED',
        refreshInterval: `${s.syncFrequencyMinutes || 120} minutes`
      }))
    ];

    res.status(200).json({
      success: true,
      count: coreSources.length,
      sources: coreSources
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Trigger immediate sync for a source or all
// @route   POST /api/admin/sync
// @access  Private (Admin)
exports.triggerSync = async (req, res, next) => {
  try {
    const { source = 'all' } = req.body;
    console.log(`[Admin] Manual sync triggered for source: ${source}`);

    if (source === 'news') {
      await syncService.syncNews();
    } else if (source === 'jobs') {
      await syncService.syncJobsAndInternships();
    } else if (source === 'government') {
      await syncService.syncGovernmentJobs();
    } else if (source === 'scholarships') {
      await syncService.syncScholarships();
    } else {
      await syncService.syncAllSources();
    }

    const latestLogs = await DataSyncLog.find().sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      message: `Synchronization cycle completed for: ${source}.`,
      latestLogs
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Synchronization Logs
// @route   GET /api/admin/logs
// @access  Private (Admin)
exports.getSyncLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    const total = await DataSyncLog.countDocuments();
    const logs = await DataSyncLog.find()
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      logs
    });
  } catch (err) {
    next(err);
  }
};
