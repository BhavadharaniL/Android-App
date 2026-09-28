const express = require('express');
const router = express.Router();
const { register, login, getMe, updateOnboarding, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.put('/onboarding', protect, updateOnboarding);
router.put('/profile', protect, updateProfile);

module.exports = router;
