const News = require('../models/News');
const syncService = require('../services/syncService');

// @desc    Get live technology and career news
// @route   GET /api/news
// @access  Public
exports.getNews = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (category && category !== 'all' && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim()) {
      query.$or = [
        { title: new RegExp(search.trim(), 'i') },
        { description: new RegExp(search.trim(), 'i') }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await News.countDocuments(query);
    const news = await News.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: news.length,
      total: totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      news
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single news article
// @route   GET /api/news/:id
// @access  Public
exports.getNewsById = async (req, res, next) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }
    res.status(200).json({ success: true, article });
  } catch (err) {
    next(err);
  }
};

// @desc    Trigger immediate News refresh
// @route   POST /api/news/refresh
// @access  Public / Private
exports.refreshNews = async (req, res, next) => {
  try {
    const log = await syncService.syncNews();
    res.status(200).json({
      success: true,
      message: 'News synchronization triggered successfully.',
      log
    });
  } catch (err) {
    next(err);
  }
};
