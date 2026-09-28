const GovernmentSource = require('../models/GovernmentSource');
const GovernmentJobProvider = require('../providers/GovernmentJobProvider');
const syncService = require('./syncService');
const notificationService = require('./notificationService');

class GovernmentUpdateService {
  constructor() {
    this.provider = new GovernmentJobProvider();
  }

  /**
   * Initialize default official government sources if not present
   */
  async seedDefaultSources() {
    const defaults = [
      {
        name: 'UPSC Recruitment Notifications',
        organization: 'Union Public Service Commission',
        category: 'UPSC',
        website: 'https://www.upsc.gov.in/',
        feedUrl: 'https://www.upsc.gov.in/whats-new/feed',
        enabled: true,
        syncFrequencyMinutes: 120
      },
      {
        name: 'SSC Examination Notices',
        organization: 'Staff Selection Commission',
        category: 'SSC',
        website: 'https://ssc.gov.in/',
        apiUrl: 'https://ssc.gov.in/api/notifications',
        enabled: true,
        syncFrequencyMinutes: 120
      },
      {
        name: 'Railway Recruitment Boards (RRB)',
        organization: 'Ministry of Railways',
        category: 'Railway',
        website: 'https://www.rrbcdg.gov.in/',
        enabled: true,
        syncFrequencyMinutes: 180
      }
    ];

    for (const item of defaults) {
      const exists = await GovernmentSource.findOne({ name: item.name });
      if (!exists) {
        await GovernmentSource.create(item);
      }
    }
  }

  /**
   * Monitor configured official sources and sync new vacancies
   */
  async checkUpdates() {
    console.log('[GovernmentUpdateService] Checking official government sources for updates...');
    const sources = await GovernmentSource.find({ enabled: true });
    for (const src of sources) {
      try {
        console.log(`[GovernmentUpdateService] Checking source: ${src.name}`);
        await syncService.syncGovernmentJobs();
        src.lastFetchedAt = new Date();
        await src.save();
      } catch (err) {
        console.error(`[GovernmentUpdateService] Error checking source ${src.name}: ${err.message}`);
      }
    }
  }
}

module.exports = new GovernmentUpdateService();
