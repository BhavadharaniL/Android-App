/**
 * BaseProvider
 * Abstract interface for all external data providers in CareerVerse.
 */
class BaseProvider {
  constructor(name, sourceType = 'TRUSTED_API') {
    if (this.constructor === BaseProvider) {
      throw new Error('BaseProvider is an abstract class and cannot be instantiated directly.');
    }
    this.name = name;
    this.sourceType = sourceType;
  }

  /**
   * Fetch live records from the external source
   * @param {Object} options Query/filter parameters
   * @returns {Promise<Array>} Raw records
   */
  async fetch(options = {}) {
    throw new Error('fetch() must be implemented by subclass');
  }

  /**
   * Normalize an external record into the standard CareerVerse format
   * @param {Object} rawRecord External item
   * @returns {Object} Normalized CareerVerse opportunity or news object
   */
  normalize(rawRecord) {
    throw new Error('normalize() must be implemented by subclass');
  }

  /**
   * Validate that a record contains all mandatory fields and legitimate URLs
   * @param {Object} record
   * @returns {Boolean}
   */
  validate(record) {
    if (!record.title || !record.organization || !record.applicationUrl) {
      return false;
    }
    // Prevent dummy/invalid URLs
    try {
      new URL(record.applicationUrl);
      return true;
    } catch (e) {
      return false;
    }
  }
}

module.exports = BaseProvider;
