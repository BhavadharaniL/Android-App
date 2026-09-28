const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Opportunity title is required'],
      trim: true
    },
    normalizedTitle: {
      type: String,
      trim: true,
      index: true
    },
    organization: {
      type: String,
      required: [true, 'Organization/Company/Provider is required'],
      trim: true
    },
    normalizedOrganization: {
      type: String,
      trim: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        'job',
        'internship',
        'government_job',
        'scholarship',
        'course',
        'certification',
        'hackathon',
        'higher_study'
      ],
      index: true
    },
    location: {
      type: String,
      default: 'Remote',
      trim: true,
      index: true
    },
    workType: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site', 'Not Specified'],
      default: 'Not Specified'
    },
    jobType: {
      type: String,
      default: 'Full-time'
    },
    description: {
      type: String,
      default: ''
    },
    qualification: {
      type: String,
      default: 'Any Graduate / Student'
    },
    skills: {
      type: [String],
      default: [],
      index: true
    },
    salaryOrStipend: {
      text: { type: String, default: '' },
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' }
    },
    experience: {
      type: String,
      default: 'Fresher'
    },
    deadline: {
      type: Date,
      index: true
    },
    startDate: {
      type: Date
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    applicationUrl: {
      type: String,
      required: [true, 'Application or official URL is required'],
      trim: true
    },
    source: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    sourceType: {
      type: String,
      enum: ['OFFICIAL_GOVERNMENT', 'OFFICIAL_API', 'TRUSTED_API', 'RSS_FEED', 'DEMO_SEED'],
      default: 'TRUSTED_API'
    },
    sourceId: {
      type: String,
      trim: true,
      index: true
    },
    sourceUrl: {
      type: String,
      trim: true
    },
    lastFetchedAt: {
      type: Date,
      default: Date.now
    },
    lastVerifiedAt: {
      type: Date,
      default: Date.now
    },
    verificationStatus: {
      type: String,
      enum: ['VERIFIED', 'UNVERIFIED', 'SOURCE_UNAVAILABLE', 'EXPIRED'],
      default: 'VERIFIED'
    },
    status: {
      type: String,
      enum: ['OPEN', 'UPCOMING', 'CLOSING_SOON', 'CLOSED', 'UNKNOWN'],
      default: 'OPEN',
      index: true
    },
    isDemo: {
      type: Boolean,
      default: false,
      index: true
    },

    // Government job specific fields
    department: { type: String, default: '' },
    vacancyCount: { type: String, default: '' },
    ageLimit: { type: String, default: '' },
    selectionProcess: { type: String, default: '' },
    examPattern: { type: String, default: '' },
    syllabus: { type: String, default: '' },
    officialNotificationPdf: { type: String, default: '' },

    // Scholarship specific fields
    academicYear: { type: String, default: '' },
    incomeRequirement: { type: String, default: '' },
    scholarshipAmount: { type: String, default: '' },
    requiredDocuments: { type: [String], default: [] },
    courseApplicable: { type: String, default: '' },

    // Course & Certification fields
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels', ''],
      default: ''
    },
    duration: { type: String, default: '' },
    isFree: { type: Boolean, default: false },

    // Hackathon fields
    prizePool: { type: String, default: '' },
    eventDate: { type: String, default: '' },

    // Higher studies fields
    degreeOffered: { type: String, default: '' },
    universityName: { type: String, default: '' },
    country: { type: String, default: '' },
    entranceExams: { type: [String], default: [] }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to normalize titles and organization names for duplicate detection
opportunitySchema.pre('save', function (next) {
  if (this.title) {
    this.normalizedTitle = this.title.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  if (this.organization) {
    this.normalizedOrganization = this.organization.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Automatic deadline evaluation
  if (this.deadline) {
    const now = new Date();
    const diffDays = Math.ceil((new Date(this.deadline) - now) / (1000 * 60 * 60 * 24));
    if (now > new Date(this.deadline)) {
      this.status = 'CLOSED';
    } else if (diffDays <= 3 && diffDays >= 0) {
      this.status = 'CLOSING_SOON';
    } else if (this.status !== 'CLOSED') {
      this.status = 'OPEN';
    }
  }

  next();
});

// Compound Indexes for fast, filtered querying
opportunitySchema.index({ category: 1, status: 1, publishedAt: -1 });
opportunitySchema.index({ category: 1, location: 1 });
opportunitySchema.index({ category: 1, skills: 1 });
opportunitySchema.index({ source: 1, sourceId: 1 });
opportunitySchema.index({ normalizedTitle: 1, normalizedOrganization: 1, location: 1 });
opportunitySchema.index({ title: 'text', description: 'text', organization: 'text' });

module.exports = mongoose.model('Opportunity', opportunitySchema);
