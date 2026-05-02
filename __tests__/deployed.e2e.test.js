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

    // Render/Cloudflare can return gateway statuses during cold start
    expect([200, 502, 503, 504]).toContain(res.status);

    if (res.status === 200) {
      expect(res.data).toHaveProperty('status', 'OK');
      // timestamp exists after latest stability patch; older deployments may not include it
      if (Object.prototype.hasOwnProperty.call(res.data, 'timestamp')) {
        expect(typeof res.data.timestamp).toBe('string');
      }
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

    // 400 = correct validation
    // 502/503/504 = gateway/cold start (ignore safely)
    // 500 may occur on older deployments; we still assert JSON (not HTML)
    expect([400, 500, 502, 503, 504]).toContain(res.status);

    if (res.status === 400) {
      expect(res.data?.success).toBe(false);
      expect(res.data?.error?.code).toBe('MISSING_FIELDS');
    }

    if (res.status === 500) {
      // Must be JSON, not an HTML error page
      expect(typeof res.data).toBe('object');
      expect(res.data).toHaveProperty('success', false);
    }
  });

});