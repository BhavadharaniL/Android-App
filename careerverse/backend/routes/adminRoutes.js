const express = require('express');
const router = express.Router();
const {
  getStats,
  getDataSources,
  triggerSync,
  getSyncLogs
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Allow dev/admin access (in dev mode, can be tested directly; in prod, requires admin role)
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/sources', getDataSources);
router.post('/sync', triggerSync);
router.get('/logs', getSyncLogs);

module.exports = router;
