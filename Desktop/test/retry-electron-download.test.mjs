import assert from 'node:assert/strict';
import test from 'node:test';
import { retryElectronDownload } from '../scripts/retry-electron-download.mjs';

function httpError(status) {
  return Object.assign(new Error(`Response code ${status}`), {
    name: 'HTTPError', response: new Response(null, { status }),
  });
}

function recorder() {
  const waits = [], warnings = [];
  return { waits, warnings, sleep: async ms => { waits.push(ms); }, warn: message => warnings.push(message) };
}

test('packaging recovers from the reported HTTP 500 and returns its output', async () => {
  const options = recorder();
  let calls = 0;
  const output = ['EscapeFrom1829-win32-x64'];
  assert.equal(await retryElectronDownload(async () => {
    if (++calls < 3) throw httpError(500);
    return output;
  }, options), output);
  assert.equal(calls, 3);
  assert.deepEqual(options.waits, [5000, 15000]);
  assert.match(options.warnings[0], /Response code 500.*attempt 2\/4/);
  assert.match(options.warnings[1], /attempt 3\/4/);
});

test('persistent download failures stop after four attempts and preserve the error', async () => {
  const options = recorder();
  const failure = httpError(503);
  let calls = 0;
  await assert.rejects(retryElectronDownload(async () => {
    calls++;
    throw failure;
  }, options), error => error === failure);
  assert.equal(calls, 4);
  assert.deepEqual(options.waits, [5000, 15000, 30000]);
  assert.equal(options.warnings.length, 3);
});

test('temporary HTTP and nested fetch/socket failures can recover', async () => {
  const failures = [
    ...[408, 429, 502, 504].map(httpError),
    new TypeError('fetch failed', { cause: Object.assign(new Error('connection reset'), { code: 'ECONNRESET' }) }),
    new TypeError('terminated', { cause: Object.assign(new Error('socket closed'), { code: 'UND_ERR_SOCKET' }) }),
    Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' }),
  ];
  for (const failure of failures) {
    const options = recorder();
    let calls = 0;
    await retryElectronDownload(async () => { if (++calls === 1) throw failure; }, options);
    assert.equal(calls, 2);
    assert.deepEqual(options.waits, [5000]);
  }
});

test('missing releases, checksum, configuration and disk errors fail immediately', async () => {
  for (const failure of [
    ...[400, 401, 403, 404].map(httpError),
    new Error('Checksum mismatch'), new Error('Invalid packaging configuration'),
    Object.assign(new Error('access denied'), { code: 'EACCES' }),
    Object.assign(new Error('disk full'), { code: 'ENOSPC' }),
    new TypeError('fetch failed', { cause: Object.assign(new Error('certificate expired'), { code: 'CERT_HAS_EXPIRED' }) }),
  ]) {
    const options = recorder();
    let calls = 0;
    await assert.rejects(retryElectronDownload(async () => {
      calls++;
      throw failure;
    }, options), error => error === failure);
    assert.equal(calls, 1);
    assert.deepEqual(options.waits, []);
    assert.deepEqual(options.warnings, []);
  }
});

test('successful packaging runs once without waiting or warnings', async () => {
  const options = recorder();
  let calls = 0;
  assert.equal(await retryElectronDownload(async () => { calls++; return 'output'; }, options), 'output');
  assert.equal(calls, 1);
  assert.deepEqual(options.waits, []);
  assert.deepEqual(options.warnings, []);
});
