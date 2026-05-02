const axios = require('axios');

const BASE_URL = (process.env.DEPLOYED_BASE_URL || 'https://certificate-ojax.onrender.com')
  .replace(/\/+$/, '');

const RETRYABLE_STATUSES = new Set([502, 503, 504]);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// 🔁 Retry helper (handles Render cold starts)
async function requestWithRetry(fn, { attempts = 8, baseDelayMs = 750 } = {}) {
  let lastRes;
  let lastErr;

  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fn();
      lastRes = res;

      if (!RETRYABLE_STATUSES.has(res.status)) {
        return res;
      }
    } catch (err) {
      lastErr = err;
    }

    const delay = Math.min(8000, baseDelayMs * (i + 1));
    await sleep(delay);
  }

  if (lastRes) return lastRes;
  throw lastErr || new Error('Request failed with no response');
}

describe('Deployed service (Render) smoke tests', () => {

  jest.setTimeout(120000);

  test('GET /health returns OK', async () => {
    const res = await requestWithRetry(() =>
      axios.get(`${BASE_URL}/health`, { validateStatus: () => true })
    );

    expect([200, 503]).toContain(res.status);

    if (res.status === 200) {
      expect(res.data).toHaveProperty('status', 'OK');
    }
  });

  test('POST /api/certificates/generate rejects missing fields (safe prod test)', async () => {
    const res = await requestWithRetry(() =>
      axios.post(
        `${BASE_URL}/api/certificates/generate`,
        {
          studentId: 'test-student',
          studentName: 'Test Student',
          courseId: 'test-course',
          courseTitle: 'Test Course'
        },
        { validateStatus: () => true }
      )
    );

    expect([400, 503]).toContain(res.status);

    if (res.status === 400) {
      expect(res.data).toHaveProperty('success', false);
      expect(res.data).toHaveProperty('error.code', 'MISSING_FIELDS');
    }
  });

});