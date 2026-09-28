const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  /**
   * Create a notification for a user
   */
  async createNotification({ userId, title, message, category, relatedOpportunityId }) {
    try {
      return await Notification.create({
        userId,
        title,
        message,
        category,
        relatedOpportunityId
      });
    } catch (err) {
      console.error(`[NotificationService] Error creating notification: ${err.message}`);
      return null;
    }
  }

  /**
   * Broadcast an opportunity update to interested users based on their followed categories or skills
   */
  async notifyInterestedUsers(opportunity) {
    try {
      // Find users who have preferences or skills matching this opportunity
      const query = {
        $or: [
          { followedCategories: opportunity.category },
          { technicalSkills: { $in: opportunity.skills || [] } },
          { careerGoals: { $regex: new RegExp(opportunity.category.replace('_', ' '), 'i') } }
        ]
      };

      const users = await User.find(query).limit(100);
      for (const user of users) {
        await this.createNotification({
          userId: user._id,
          title: `New ${opportunity.category.replace('_', ' ').toUpperCase()}: ${opportunity.title}`,
          message: `${opportunity.organization} posted an opportunity matching your skills/interests. Deadline: ${opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString() : 'N/A'}.`,
          category: opportunity.category === 'government_job' ? 'governmentJobs' : opportunity.category === 'internship' ? 'internships' : 'jobDeadlines',
          relatedOpportunityId: opportunity._id
        });
      }
    } catch (err) {
      console.error(`[NotificationService] Error notifying interested users: ${err.message}`);
    }
  }
}

module.exports = new NotificationService();
