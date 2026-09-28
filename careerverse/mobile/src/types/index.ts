export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  college: string;
  degree: string;
  branch: string;
  currentYear: string;
  careerGoals: string[];
  programmingLanguages: string[];
  technicalSkills: string[];
  softSkills: string[];
  areasOfInterest: string[];
  preferredRoles: string[];
  preferredLocations: string[];
  experienceLevel: string;
  remotePreference: string;
  resumeUrl?: string;
  resumeText?: string;
}

export type OpportunityCategory =
  | 'job'
  | 'internship'
  | 'government_job'
  | 'scholarship'
  | 'course'
  | 'certification'
  | 'hackathon'
  | 'higher_study';

export interface Opportunity {
  _id: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  location: string;
  workType: 'Remote' | 'Hybrid' | 'On-site' | 'Not Specified';
  jobType: string;
  description: string;
  qualification: string;
  skills: string[];
  salaryOrStipend?: {
    text: string;
    min: number;
    max: number;
    currency: string;
  };
  experience?: string;
  deadline?: string;
  startDate?: string;
  publishedAt: string;
  applicationUrl: string;
  source: string;
  sourceType: string;
  lastFetchedAt: string;
  lastVerifiedAt: string;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'SOURCE_UNAVAILABLE' | 'EXPIRED';
  status: 'OPEN' | 'UPCOMING' | 'CLOSING_SOON' | 'CLOSED';
  matchScore?: number;
  matchReason?: string;

  // Specific
  department?: string;
  vacancyCount?: string;
  ageLimit?: string;
  selectionProcess?: string;
  examPattern?: string;
  syllabus?: string;
  officialNotificationPdf?: string;
  academicYear?: string;
  scholarshipAmount?: string;
  incomeRequirement?: string;
  requiredDocuments?: string[];
  difficulty?: string;
  duration?: string;
  isFree?: boolean;
  prizePool?: string;
  eventDate?: string;
  degreeOffered?: string;
  universityName?: string;
}

export interface NewsArticle {
  _id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  sourceName: string;
  url: string;
  category: string;
  publishedAt: string;
  retrievedAt: string;
}

export interface ApplicationItem {
  _id: string;
  userId?: string;
  opportunityId: Opportunity;
  status: 'Saved' | 'Applied' | 'Interview' | 'Selected' | 'Rejected' | 'Closed';
  notes?: string;
  interviewDate?: string;
  appliedAt: string;
}

export interface RoadmapMilestone {
  _id: string;
  title: string;
  description: string;
  resources: string[];
  status: 'Not Started' | 'In Progress' | 'Completed';
  order: number;
}

export interface CareerRoadmap {
  _id: string;
  targetRole: string;
  category: string;
  milestones: RoadmapMilestone[];
  progressPercentage: number;
  generatedByAI: boolean;
}
