const Opportunity = require('../models/Opportunity');

class DuplicateDetectionService {
  /**
   * Normalizes a string by lowercasing, stripping punctuation, and compressing whitespaces
   * @param {string} str
   * @returns {string}
   */
  normalizeString(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Stem a word to its common root (e.g., engineering -> engineer, internship -> intern)
   */
  stem(word) {
    const w = word.toLowerCase();
    if (w.startsWith('engineer')) return 'engineer';
    if (w.startsWith('intern')) return 'intern';
    if (w.startsWith('develop')) return 'developer';
    if (w.startsWith('programm')) return 'programmer';
    return w.replace(/(ing|ship|ed|er|s)$/g, '');
  }

  /**
   * Checks similarity between two title strings
   * Handles cases like "Software Engineer Intern" vs "Software Engineering Internship"
   * @param {string} s1
   * @param {string} s2
   * @returns {number} 0.0 - 1.0 similarity score
   */
  calculateSimilarity(s1, s2) {
    const norm1 = this.normalizeString(s1);
    const norm2 = this.normalizeString(s2);
    if (norm1 === norm2) return 1.0;

    const words1 = norm1.split(' ').filter(w => w.length > 2).map(w => this.stem(w));
    const words2 = norm2.split(' ').filter(w => w.length > 2).map(w => this.stem(w));
    if (words1.length === 0 || words2.length === 0) return 0.0;

    const set1 = new Set(words1);
    const set2 = new Set(words2);

    let intersection = 0;
    for (const w of set1) {
      if (set2.has(w)) {
        intersection++;
      }
    }
    const union = new Set([...set1, ...set2]).size;
    return intersection / union;
  }

  /**
   * Checks if an opportunity already exists in the database
   * @param {Object} candidate Opportunity candidate to check
   * @returns {Promise<Object|null>} Returns existing matching opportunity or null
   */
  async findDuplicate(candidate) {
    // 1. Direct match on applicationUrl or sourceId + source
    if (candidate.applicationUrl) {
      const byUrl = await Opportunity.findOne({ applicationUrl: candidate.applicationUrl });
      if (byUrl) return byUrl;
    }

    if (candidate.source && candidate.sourceId) {
      const bySourceId = await Opportunity.findOne({
        source: candidate.source,
        sourceId: candidate.sourceId
      });
      if (bySourceId) return bySourceId;
    }

    // 2. Fuzzy match on organization + similar title + category
    const normOrg = this.normalizeString(candidate.organization);
    const existingSameOrg = await Opportunity.find({
      category: candidate.category,
      $or: [
        { normalizedOrganization: normOrg },
        { organization: new RegExp(`^${normOrg}$`, 'i') }
      ]
    });

    for (const existing of existingSameOrg) {
      const sim = this.calculateSimilarity(candidate.title, existing.title);
      if (sim >= 0.75) {
        return existing;
      }
    }

    return null;
  }
}

module.exports = new DuplicateDetectionService();
