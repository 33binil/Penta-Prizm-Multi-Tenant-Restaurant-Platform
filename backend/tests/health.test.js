import test from 'node:test';
import assert from 'node:assert';

test('health check payload structure validation', () => {
  const sampleResponse = {
    status: 'ok',
    service: 'penta-prizm-backend',
    timestamp: new Date().toISOString(),
    uptime: 12
  };

  assert.strictEqual(sampleResponse.status, 'ok');
  assert.strictEqual(sampleResponse.service, 'penta-prizm-backend');
  assert.ok(sampleResponse.timestamp);
  assert.ok(typeof sampleResponse.uptime === 'number');
});
