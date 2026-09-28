const rateLimit = require('express-rate-limit');

// General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.'
  }
});

// Stricter Limiter for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.'
  }
});

// AI endpoints limiter to prevent abuse
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 40,
  message: {
    success: false,
    message: 'AI request limit reached. Please wait a few moments before asking another question.'
  }
});

module.exports = { apiLimiter, authLimiter, aiLimiter };
