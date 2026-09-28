const test = require('node:test');
const assert = require('node:assert/strict');
const BaseProvider = require('../providers/BaseProvider');

class TestProvider extends BaseProvider {
  constructor() {
    super('TestProvider', 'TRUSTED_API');
  }
}

test('BaseProvider - Validation rejects invalid URLs and missing required fields', () => {
  const provider = new TestProvider();

  // Valid record
  const valid = provider.validate({
    title: 'Software Developer',
    organization: 'Acme Corp',
    applicationUrl: 'https://example.com/apply/123'
  });
  assert.equal(valid, true);

  // Missing title
  const invalidTitle = provider.validate({
    organization: 'Acme Corp',
    applicationUrl: 'https://example.com/apply/123'
  });
  assert.equal(invalidTitle, false);

  // Invalid fake URL format
  const invalidUrl = provider.validate({
    title: 'Software Developer',
    organization: 'Acme Corp',
    applicationUrl: 'not_a_valid_url_at_all'
  });
  assert.equal(invalidUrl, false);
});
