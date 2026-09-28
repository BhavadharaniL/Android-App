const test = require('node:test');
const assert = require('node:assert/strict');
const aiService = require('../services/aiService');

test('AI Service - Resume Analyzer parses keywords and produces actionable breakdown', async () => {
  const sampleResume = `
    Bhavadharani Student
    Degree: B.Tech Computer Science and Engineering
    Technical Skills: Java, Python, SQL, React, Node.js, AWS, Docker, Data Structures
    Projects:
    1. Developed real-time e-commerce backend handling 1000 requests/sec with Redis caching.
    2. Built mobile application for campus placement tracking.
  `;

  const analysis = await aiService.analyzeResume(sampleResume, 'Software Engineer');
  assert.ok(analysis.score >= 50, `Expected score >= 50, got ${analysis.score}`);
  assert.ok(analysis.extractedSkills.includes('Java'));
  assert.ok(analysis.extractedSkills.includes('Python'));
  assert.ok(analysis.recommendations.length > 0);
});

test('AI Service - Skill Gap compares target role skills against user profile', async () => {
  const result = await aiService.analyzeSkillGap('Cloud Engineer', ['Linux', 'Python']);
  assert.ok(result.strongSkills.includes('Linux'));
  assert.ok(result.strongSkills.includes('Python'));
  assert.ok(result.missingSkills.includes('AWS') || result.missingSkills.includes('Docker'));
  assert.ok(result.readinessScore > 0 && result.readinessScore < 100);
});

test('AI Service - Generates tailored multi-step roadmap milestones', async () => {
  const roadmap = await aiService.generateCareerRoadmap('Software Engineer', ['Java']);
  assert.equal(roadmap.targetRole, 'Software Engineer');
  assert.ok(roadmap.milestones.length >= 5);
  const firstMilestone = roadmap.milestones[0];
  assert.ok(firstMilestone.title);
  assert.ok(firstMilestone.description);
});
