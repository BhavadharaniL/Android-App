require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerverse',
  JWT_SECRET: process.env.JWT_SECRET || 'careerverse_jwt_default_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  ADZUNA_APP_ID: process.env.ADZUNA_APP_ID || '',
  ADZUNA_APP_KEY: process.env.ADZUNA_APP_KEY || '',
  NEWS_API_KEY: process.env.NEWS_API_KEY || '',
  NCS_SOURCE_URL: process.env.NCS_SOURCE_URL || 'https://www.ncs.gov.in/',
  UPSC_SOURCE_URL: process.env.UPSC_SOURCE_URL || 'https://www.upsc.gov.in/',
  SSC_SOURCE_URL: process.env.SSC_SOURCE_URL || 'https://ssc.gov.in/',
  SCHOLARSHIP_SOURCE_URL: process.env.SCHOLARSHIP_SOURCE_URL || 'https://scholarships.gov.in/',
  SYNC_JOBS_INTERVAL: process.env.SYNC_JOBS_INTERVAL || '*/30 * * * *',
  SYNC_NEWS_INTERVAL: process.env.SYNC_NEWS_INTERVAL || '*/15 * * * *',
  SYNC_GOVERNMENT_INTERVAL: process.env.SYNC_GOVERNMENT_INTERVAL || '0 */2 * * *',
  SYNC_SCHOLARSHIP_INTERVAL: process.env.SYNC_SCHOLARSHIP_INTERVAL || '0 0 * * *',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@careerverse.internal',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'AdminSecurePass2026!'
};

module.exports = env;
