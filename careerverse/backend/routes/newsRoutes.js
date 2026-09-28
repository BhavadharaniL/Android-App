const express = require('express');
const router = express.Router();
const { getNews, getNewsById, refreshNews } = require('../controllers/newsController');

router.get('/', getNews);
router.get('/:id', getNewsById);
router.post('/refresh', refreshNews);

module.exports = router;
