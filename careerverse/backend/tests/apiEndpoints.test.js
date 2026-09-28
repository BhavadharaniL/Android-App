const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const app = require('../server');
const { connectDB, disconnectDB } = require('../config/db');

let server;
let baseUrl;

test.before(async () => {
  await connectDB();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDB();
});

const makeRequest = (path, method = 'GET', body = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

test('API Integration - Health check returns ONLINE status', async () => {
  const res = await makeRequest('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ONLINE');
});

test('API Integration - Opportunities endpoint returns live opportunities', async () => {
  const res = await makeRequest('/api/opportunities');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.opportunities));
});

test('API Integration - Technology News endpoint returns articles', async () => {
  const res = await makeRequest('/api/news');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.news));
});

test('API Integration - Career Quiz returns questions', async () => {
  const res = await makeRequest('/api/quiz/questions');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.questions.length >= 3);
});

test('API Integration - AI RAG answers grounded opportunity query without crashing', async () => {
  const res = await makeRequest('/api/ai/ask', 'POST', {
    question: 'Are there any Java internships available today?'
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.answer);
  assert.equal(res.body.isGrounded, true);
});
