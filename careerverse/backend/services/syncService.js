const Opportunity = require('../models/Opportunity');
const News = require('../models/News');
const DataSyncLog = require('../models/DataSyncLog');
const duplicateDetectionService = require('./duplicateDetectionService');
const notificationService = require('./notificationService');

const AdzunaProvider = require('../providers/AdzunaProvider');
const NCSProvider = require('../providers/NCSProvider');
const GovernmentJobProvider = require('../providers/GovernmentJobProvider');
const ScholarshipProvider = require('../providers/ScholarshipProvider');
const CourseProvider = require('../providers/CourseProvider');
const NewsProvider = require('../providers/NewsProvider');

class SyncService {
  constructor() {
    this.adzuna = new AdzunaProvider();
    this.ncs = new NCSProvider();
    this.government = new GovernmentJobProvider();
    this.scholarship = new ScholarshipProvider();
    this.course = new CourseProvider();
    this.news = new NewsProvider();
  }

  /**
   * Helper to sync a list of opportunities with duplicate detection and stats logging
   */
  async processOpportunityList(sourceName, rawRecords, category = 'job') {
    const startTime = new Date();
    let recordsFetched = rawRecords.length;
    let recordsAdded = 0;
    let recordsUpdated = 0;
    let recordsFailed = 0;
    let errorMessage = null;

    try {
      for (const record of rawRecords) {
        try {
          const duplicate = await duplicateDetectionService.findDuplicate(record);
          if (duplicate) {
            // Update existing record with verified info and fresh deadline
            duplicate.lastFetchedAt = new Date();
            duplicate.lastVerifiedAt = new Date();
            duplicate.verificationStatus = 'VERIFIED';
            if (record.deadline) duplicate.deadline = record.deadline;
            if (record.salaryOrStipend?.text) duplicate.salaryOrStipend = record.salaryOrStipend;
            if (record.description) duplicate.description = record.description;
            await duplicate.save();
            recordsUpdated++;
          } else {
            // Create new normalized record
            const created = await Opportunity.create({
              ...record,
              lastFetchedAt: new Date(),
              lastVerifiedAt: new Date(),
              verificationStatus: 'VERIFIED'
            });
            recordsAdded++;
            // Notify interested users about new live item
            await notificationService.notifyInterestedUsers(created);
          }
        } catch (itemErr) {
          console.error(`[SyncService] Failed to process record "${record.title}": ${itemErr.message}`);
          recordsFailed++;
        }
      }
    } catch (err) {
      errorMessage = err.message;
      console.error(`[SyncService] Fatal sync error for ${sourceName}: ${err.message}`);
    }

    const endTime = new Date();
    const durationMs = endTime - startTime;
    const status = errorMessage ? (recordsAdded + recordsUpdated > 0 ? 'PARTIAL' : 'FAILED') : 'SUCCESS';

    const log = await DataSyncLog.create({
      sourceName,
      category,
      startTime,
      endTime,
      durationMs,
      recordsFetched,
      recordsAdded,
      recordsUpdated,
      recordsRemoved: 0,
      recordsFailed,
      status,
      errorMessage
    });

    console.log(`[SyncService] ${sourceName} Sync Completed: +${recordsAdded} added, ~${recordsUpdated} updated, !${recordsFailed} failed (${durationMs}ms)`);
    return log;
  }

  /**
   * Sync Jobs and Internships from Adzuna and NCS
   */
  async syncJobsAndInternships() {
    console.log('[SyncService] Starting Jobs & Internships Sync...');
    
    // Adzuna
    let adzunaRecords = [];
    try {
      adzunaRecords = await this.adzuna.fetch({ what: 'software engineer intern developer', where: 'india' });
    } catch (e) {
      console.warn(`[SyncService] Adzuna provider fetch error: ${e.message}`);
    }
    await this.processOpportunityList('Adzuna', adzunaRecords, 'job');

    // NCS
    let ncsRecords = [];
    try {
      ncsRecords = await this.ncs.fetch();
    } catch (e) {
      console.warn(`[SyncService] NCS provider fetch error: ${e.message}`);
    }
    await this.processOpportunityList('National Career Service', ncsRecords, 'internship');
  }

  /**
   * Sync Government notifications from UPSC, SSC, RRB
   */
  async syncGovernmentJobs() {
    console.log('[SyncService] Starting Government Jobs Sync...');
    let govRecords = [];
    try {
      govRecords = await this.government.fetch();
    } catch (e) {
      console.warn(`[SyncService] Government provider fetch error: ${e.message}`);
    }
    await this.processOpportunityList('Official Government Portals (UPSC/SSC/RRB)', govRecords, 'government_job');
  }

  /**
   * Sync Scholarships from National Scholarship Portal
   */
  async syncScholarships() {
    console.log('[SyncService] Starting Scholarships Sync...');
    let scholarshipRecords = [];
    try {
      scholarshipRecords = await this.scholarship.fetch();
    } catch (e) {
      console.warn(`[SyncService] Scholarship provider fetch error: ${e.message}`);
    }
    await this.processOpportunityList('National Scholarship Portal', scholarshipRecords, 'scholarship');
  }

  /**
   * Sync Courses, Certifications, Hackathons, Higher Studies
   */
  async syncCoursesAndHackathons() {
    console.log('[SyncService] Starting Courses & Hackathons Sync...');
    let courseRecords = [];
    try {
      courseRecords = await this.course.fetch();
    } catch (e) {
      console.warn(`[SyncService] Course provider fetch error: ${e.message}`);
    }
    await this.processOpportunityList('Courses & Hackathons Directory', courseRecords, 'course');
  }

  /**
   * Sync Technology News from NewsAPI and live tech feeds
   */
  async syncNews() {
    console.log('[SyncService] Starting Technology News Sync...');
    const startTime = new Date();
    let recordsFetched = 0;
    let recordsAdded = 0;
    let recordsUpdated = 0;
    let recordsFailed = 0;
    let errorMessage = null;

    try {
      const categories = ['AI', 'Cloud Computing', 'Cybersecurity', 'Software Engineering', 'Technology', 'Internships'];
      for (const cat of categories) {
        const articles = await this.news.fetch({ category: cat });
        recordsFetched += articles.length;
        for (const item of articles) {
          try {
            const existing = await News.findOne({ url: item.url });
            if (!existing) {
              await News.create(item);
              recordsAdded++;
            } else {
              existing.retrievedAt = new Date();
              await existing.save();
              recordsUpdated++;
            }
          } catch (itemErr) {
            recordsFailed++;
          }
        }
      }
    } catch (err) {
      errorMessage = err.message;
      console.error(`[SyncService] News sync failed: ${err.message}`);
    }

    const endTime = new Date();
    const durationMs = endTime - startTime;
    const log = await DataSyncLog.create({
      sourceName: 'Technology News Provider',
      category: 'news',
      startTime,
      endTime,
      durationMs,
      recordsFetched,
      recordsAdded,
      recordsUpdated,
      recordsRemoved: 0,
      recordsFailed,
      status: errorMessage ? 'FAILED' : 'SUCCESS',
      errorMessage
    });

    console.log(`[SyncService] News Sync Completed: +${recordsAdded} added (${durationMs}ms)`);
    return log;
  }

  /**
   * Automatically detect expired opportunities and mark them CLOSED
   * Section 13, 24
   */
  async expireDeadlines() {
    const now = new Date();
    const result = await Opportunity.updateMany(
      {
        deadline: { $lt: now },
        status: { $ne: 'CLOSED' }
      },
      {
        $set: {
          status: 'CLOSED',
          verificationStatus: 'EXPIRED'
        }
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`[SyncService] Auto-expired ${result.modifiedCount} opportunities past deadline to CLOSED.`);
    }
    return result.modifiedCount;
  }

  /**
   * Complete orchestration of all data sources
   */
  async syncAllSources() {
    console.log('==================================================');
    console.log('[SyncService] Running Full Live Synchronization...');
    console.log('==================================================');
    await this.expireDeadlines();
    await this.syncJobsAndInternships();
    await this.syncGovernmentJobs();
    await this.syncScholarships();
    await this.syncCoursesAndHackathons();
    await this.syncNews();
    console.log('[SyncService] All live synchronization cycles finished successfully.');
  }
}

module.exports = new SyncService();
