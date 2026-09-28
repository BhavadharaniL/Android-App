const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const News = require('../models/News');
const Skill = require('../models/Skill');
const GovernmentSource = require('../models/GovernmentSource');
const env = require('../config/env');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Seeding initial CareerVerse system data...');

    // 1. Seed Default Admin User
    const adminEmail = env.ADMIN_EMAIL || 'admin@careerverse.internal';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'CareerVerse Administrator',
        email: adminEmail,
        password: env.ADMIN_PASSWORD || 'AdminSecurePass2026!',
        role: 'admin',
        college: 'System Administration',
        careerGoals: ['Platform Administration']
      });
      console.log(`[Seed] Created default admin account (${adminEmail})`);
    }

    // 2. Seed Default Student Demo Account for Instant Testing
    const studentEmail = 'student@careerverse.internal';
    const existingStudent = await User.findOne({ email: studentEmail });
    if (!existingStudent) {
      await User.create({
        name: 'Bhavadharani Student',
        email: studentEmail,
        password: 'Password123!',
        role: 'student',
        college: 'Anna University / Tech Institute',
        degree: 'B.Tech',
        branch: 'Computer Science and Engineering',
        currentYear: '3rd Year',
        careerGoals: ['Campus Placement', 'Internships', 'Private Jobs'],
        programmingLanguages: ['Java', 'Python', 'JavaScript'],
        technicalSkills: ['Java', 'Python', 'SQL', 'React', 'Data Structures', 'Spring Boot'],
        softSkills: ['Problem Solving', 'Teamwork', 'Communication'],
        areasOfInterest: ['Full Stack Development', 'Cloud Computing', 'AI'],
        preferredRoles: ['Software Engineer', 'Full Stack Developer', 'Java Developer Intern'],
        preferredLocations: ['Chennai', 'Bangalore', 'Remote'],
        experienceLevel: 'Student',
        remotePreference: 'Hybrid'
      });
      console.log(`[Seed] Created default student account (${studentEmail} / Password123!)`);
    }

    // 3. Seed Government Sources
    const govSources = [
      {
        name: 'UPSC Recruitment Notifications',
        organization: 'Union Public Service Commission',
        category: 'UPSC',
        website: 'https://www.upsc.gov.in/',
        feedUrl: 'https://www.upsc.gov.in/whats-new/feed',
        enabled: true
      },
      {
        name: 'Staff Selection Commission Notices',
        organization: 'Staff Selection Commission (SSC)',
        category: 'SSC',
        website: 'https://ssc.gov.in/',
        apiUrl: 'https://ssc.gov.in/api/notifications',
        enabled: true
      },
      {
        name: 'National Career Service Portal',
        organization: 'Ministry of Labour & Employment',
        category: 'Central',
        website: 'https://www.ncs.gov.in/',
        enabled: true
      }
    ];

    for (const src of govSources) {
      const exists = await GovernmentSource.findOne({ name: src.name });
      if (!exists) await GovernmentSource.create(src);
    }
    console.log('[Seed] Configured default government sources.');

    // 4. Seed Essential Skills
    const coreSkills = [
      { name: 'Java', category: 'Programming', relatedRoles: ['Software Engineer', 'Backend Developer', 'Android Developer'] },
      { name: 'Python', category: 'Programming', relatedRoles: ['Data Scientist', 'AI/ML Engineer', 'Backend Developer'] },
      { name: 'JavaScript', category: 'Programming', relatedRoles: ['Full Stack Developer', 'Frontend Developer'] },
      { name: 'SQL', category: 'Database', relatedRoles: ['Data Analyst', 'Software Engineer', 'Database Administrator'] },
      { name: 'AWS', category: 'Cloud', relatedRoles: ['Cloud Engineer', 'DevOps Engineer'] },
      { name: 'Docker', category: 'DevOps', relatedRoles: ['DevOps Engineer', 'Cloud Engineer'] },
      { name: 'Data Structures', category: 'Core CS', relatedRoles: ['Software Engineer'] }
    ];

    for (const sk of coreSkills) {
      const exists = await Skill.findOne({ name: sk.name });
      if (!exists) await Skill.create(sk);
    }
    console.log('[Seed] Populated standard industry skills taxonomy.');

    console.log('[Seed] Seeding finished successfully.');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error during seeding:', err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
