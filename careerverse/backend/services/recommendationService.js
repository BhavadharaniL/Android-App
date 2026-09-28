const Opportunity = require('../models/Opportunity');

class RecommendationService {
  /**
   * Get personalized recommendations for a user based on their skills, career goals, and location
   * @param {Object} user User profile document
   * @param {number} limit Number of recommendations to return
   * @returns {Promise<Array>} Array of opportunities with `matchScore` and `matchReason`
   */
  async getRecommendations(user, limit = 10) {
    if (!user) {
      // Return top active opportunities if no user logged in
      const general = await Opportunity.find({ status: { $in: ['OPEN', 'CLOSING_SOON'] } })
        .sort({ publishedAt: -1 })
        .limit(limit);
      return general.map(item => ({
        ...item.toObject(),
        matchScore: 80,
        matchReason: 'Trending opportunity in tech'
      }));
    }

    const userSkills = [
      ...(user.programmingLanguages || []),
      ...(user.technicalSkills || []),
      ...(user.softSkills || [])
    ].map(s => s.toLowerCase());

    const userGoals = (user.careerGoals || []).map(g => g.toLowerCase());
    const preferredLocations = (user.preferredLocations || []).map(l => l.toLowerCase());

    // Fetch active opportunities
    const opportunities = await Opportunity.find({
      status: { $in: ['OPEN', 'CLOSING_SOON'] }
    })
      .sort({ publishedAt: -1 })
      .limit(60);

    const scoredOpportunities = opportunities.map(opp => {
      let score = 0;
      const reasons = [];

      // 1. Skill overlap
      const oppSkills = (opp.skills || []).map(s => s.toLowerCase());
      const matchingSkills = oppSkills.filter(s =>
        userSkills.some(us => us.includes(s) || s.includes(us))
      );

      if (matchingSkills.length > 0) {
        score += matchingSkills.length * 25;
        reasons.push(`Matches your ${matchingSkills.slice(0, 2).map(s => s.toUpperCase()).join(' & ')} skills`);
      }

      // 2. Goal & Category alignment
      const isGovGoal = userGoals.some(g => g.includes('government') || g.includes('civil'));
      const isInternGoal = userGoals.some(g => g.includes('intern'));
      const isHigherStudies = userGoals.some(g => g.includes('higher'));

      if (opp.category === 'government_job' && isGovGoal) {
        score += 35;
        reasons.push('Aligned with your Government Jobs career goal');
      } else if (opp.category === 'internship' && isInternGoal) {
        score += 30;
        reasons.push('Aligned with your Internship career goal');
      } else if (opp.category === 'higher_study' && isHigherStudies) {
        score += 30;
        reasons.push('Matches your Higher Studies pursuit');
      }

      // 3. Location match
      const oppLoc = (opp.location || '').toLowerCase();
      if (opp.workType === 'Remote') {
        score += 15;
        reasons.push('Remote flexibility');
      } else if (preferredLocations.some(pl => oppLoc.includes(pl))) {
        score += 20;
        reasons.push(`Located in your preferred city (${opp.location})`);
      }

      // Default baseline score if newly added
      if (score === 0) {
        score = 40;
        reasons.push('Popular opportunity matching your education field');
      }

      return {
        ...opp.toObject(),
        matchScore: Math.min(score, 99),
        matchReason: reasons.slice(0, 2).join(' • ')
      };
    });

    // Sort descending by match score
    scoredOpportunities.sort((a, b) => b.matchScore - a.matchScore);

    return scoredOpportunities.slice(0, limit);
  }
}

module.exports = new RecommendationService();
