const express = require('express');
const router = express.Router();
const {
  toggleSaveOpportunity,
  getSavedOpportunities,
  createOrUpdateApplication,
  getUserApplications,
  deleteApplication
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/save/:opportunityId', toggleSaveOpportunity);
router.get('/saved', getSavedOpportunities);
router.get('/', getUserApplications);
router.post('/', createOrUpdateApplication);
router.delete('/:id', deleteApplication);

module.exports = router;
