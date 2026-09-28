const cron = require('node-cron');
const syncService = require('../services/syncService');
const governmentUpdateService = require('../services/governmentUpdateService');
const env = require('../config/env');

const initScheduler = () => {
  console.log('[Scheduler] Initializing automated background synchronization cron jobs...');

  // 1. Technology News Sync
  const newsCron = env.SYNC_NEWS_INTERVAL || '*/15 * * * *';
  cron.schedule(newsCron, async () => {
    console.log(`[Scheduler] Triggering News sync (${newsCron})...`);
    try {
      await syncService.syncNews();
    } catch (err) {
      console.error(`[Scheduler] News sync error: ${err.message}`);
    }
  });

  // 2. Jobs and Internships Sync
  const jobsCron = env.SYNC_JOBS_INTERVAL || '*/30 * * * *';
  cron.schedule(jobsCron, async () => {
    console.log(`[Scheduler] Triggering Jobs & Internships sync (${jobsCron})...`);
    try {
      await syncService.syncJobsAndInternships();
    } catch (err) {
      console.error(`[Scheduler] Jobs sync error: ${err.message}`);
    }
  });

  // 3. Government Jobs & Exam Notifications Sync
  const govCron = env.SYNC_GOVERNMENT_INTERVAL || '0 */2 * * *';
  cron.schedule(govCron, async () => {
    console.log(`[Scheduler] Triggering Government Vacancies sync (${govCron})...`);
    try {
      await governmentUpdateService.checkUpdates();
    } catch (err) {
      console.error(`[Scheduler] Government sync error: ${err.message}`);
    }
  });

  // 4. Scholarships Sync
  const scholarshipCron = env.SYNC_SCHOLARSHIP_INTERVAL || '0 0 * * *';
  cron.schedule(scholarshipCron, async () => {
    console.log(`[Scheduler] Triggering Scholarships sync (${scholarshipCron})...`);
    try {
      await syncService.syncScholarships();
    } catch (err) {
      console.error(`[Scheduler] Scholarships sync error: ${err.message}`);
    }
  });

  // 5. Automatic Deadline Expiration Check (runs hourly)
  cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Checking for expired opportunities...');
    try {
      await syncService.expireDeadlines();
    } catch (err) {
      console.error(`[Scheduler] Deadline expiration error: ${err.message}`);
    }
  });

  console.log('[Scheduler] Cron jobs successfully scheduled.');
};

module.exports = { initScheduler };
