const axios = require('axios');
const BaseProvider = require('./BaseProvider');

class AdzunaProvider extends BaseProvider {
  constructor() {
    super('Adzuna', 'TRUSTED_API');
    this.appId = process.env.ADZUNA_APP_ID;
    this.appKey = process.env.ADZUNA_APP_KEY;
    this.baseUrl = 'https://api.adzuna.com/v1/api/jobs/in/search';
  }

  isConfigured() {
    return Boolean(this.appId && this.appKey);
  }

  async fetch(options = {}) {
    if (!this.isConfigured()) {
      console.warn('[AdzunaProvider] API credentials not configured (ADZUNA_APP_ID/ADZUNA_APP_KEY).');
      return [];
    }

    const { page = 1, resultsPerPage = 20, what = 'software engineer', where = 'india' } = options;
    const url = `${this.baseUrl}/${page}?app_id=${this.appId}&app_key=${this.appKey}&results_per_page=${resultsPerPage}&what=${encodeURIComponent(what)}&where=${encodeURIComponent(where)}&content-type=application/json`;

    try {
      const response = await axios.get(url, { timeout: 10000 });
      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results.map(item => this.normalize(item)).filter(item => this.validate(item));
      }
      return [];
    } catch (err) {
      console.error(`[AdzunaProvider] API request failed: ${err.message}`);
      return [];
    }
  }

  normalize(raw) {
    const isIntern = /intern/i.test(raw.title || '');
    const cleanTitle = (raw.title || '').replace(/<[^>]*>?/gm, '').trim();
    const cleanDesc = (raw.description || '').replace(/<[^>]*>?/gm, '').trim();

    // Extract extracted skills from description
    const commonSkills = ['Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'C++', 'Data Structures'];
    const extractedSkills = commonSkills.filter(skill => 
      new RegExp(`\\b${skill.replace(/[.+*?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(cleanDesc + ' ' + cleanTitle)
    );

    const minSalary = raw.salary_min ? Math.round(raw.salary_min) : 0;
    const maxSalary = raw.salary_max ? Math.round(raw.salary_max) : 0;
    let salaryText = '';
    if (minSalary && maxSalary) {
      salaryText = `₹${minSalary.toLocaleString('en-IN')} - ₹${maxSalary.toLocaleString('en-IN')}`;
    } else if (minSalary) {
      salaryText = `₹${minSalary.toLocaleString('en-IN')}+`;
    }

    return {
      title: cleanTitle,
      organization: raw.company?.display_name || 'Hiring Organization',
      category: isIntern ? 'internship' : 'job',
      location: raw.location?.display_name || 'India',
      workType: /remote/i.test(cleanTitle + ' ' + cleanDesc) ? 'Remote' : /hybrid/i.test(cleanTitle + ' ' + cleanDesc) ? 'Hybrid' : 'On-site',
      jobType: isIntern ? 'Internship' : 'Full-time',
      description: cleanDesc,
      qualification: 'Bachelor\'s degree in Engineering, Computer Science or related field',
      skills: extractedSkills.length > 0 ? extractedSkills : ['Problem Solving', 'Communication'],
      salaryOrStipend: {
        min: minSalary,
        max: maxSalary,
        currency: 'INR',
        text: salaryText
      },
      experience: isIntern ? 'Fresher' : '0-2 Years',
      publishedAt: raw.created ? new Date(raw.created) : new Date(),
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days window from retrieval
      applicationUrl: raw.redirect_url,
      source: 'Adzuna',
      sourceType: 'TRUSTED_API',
      sourceId: String(raw.id),
      sourceUrl: raw.redirect_url,
      lastFetchedAt: new Date(),
      lastVerifiedAt: new Date(),
      verificationStatus: 'VERIFIED',
      status: 'OPEN'
    };
  }
}

module.exports = AdzunaProvider;
