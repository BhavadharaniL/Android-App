const test = require('node:test');
const assert = require('node:assert/strict');
const duplicateDetectionService = require('../services/duplicateDetectionService');

test('Duplicate Detection - Normalizes strings properly', () => {
  const norm1 = duplicateDetectionService.normalizeString('Software Engineer (Full-Time) - 2026!');
  const norm2 = duplicateDetectionService.normalizeString('software engineer full time 2026');
  assert.equal(norm1, 'software engineer full time 2026');
  assert.equal(norm1, norm2);
});

test('Duplicate Detection - Identifies similar titles with high confidence', () => {
  const sim1 = duplicateDetectionService.calculateSimilarity(
    'Software Engineer Intern',
    'Software Engineering Internship'
  );
  assert.ok(sim1 >= 0.75, `Expected similarity >= 0.75, got ${sim1}`);

  const sim2 = duplicateDetectionService.calculateSimilarity(
    'Civil Engineer Trainee',
    'Python Cloud Developer'
  );
  assert.ok(sim2 < 0.3, `Expected low similarity for different roles, got ${sim2}`);
});
