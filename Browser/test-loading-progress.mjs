import assert from 'node:assert/strict';
import {waitForLoadingProgress} from './test-support/loading-progress.mjs';

function clock() {
  let time = 0;
  return {now: () => time, sleep: async milliseconds => { time += milliseconds; }};
}

// Reproduce a healthy ten-section worker build lasting much longer than the
// old one-minute total allowance, without software rendering or real delays.
const advancing = clock();
await waitForLoadingProgress(() => advancing.now() >= 450000, {
  ...advancing, progress: () => Math.floor(advancing.now() / 50000),
  idleTimeout: 60000, totalTimeout: 600000, pollInterval: 1000,
});
assert.equal(advancing.now(), 450000);

const stalled = clock();
await assert.rejects(waitForLoadingProgress(() => false, {
  ...stalled, progress: () => '1-west:loading', describe: () => '1-west remains loading',
  idleTimeout: 60000, totalTimeout: 600000, pollInterval: 1000,
}), /no progress after 60000ms; 1-west remains loading/);

const endless = clock();
await assert.rejects(waitForLoadingProgress(() => false, {
  ...endless, progress: () => endless.now(), idleTimeout: 60000,
  totalTimeout: 180000, pollInterval: 1000,
}), /total deadline exceeded after 180000ms/);

await waitForLoadingProgress(() => true, {progress: () => 0, sleep: () => assert.fail('Already complete')});
console.log('PASS: slow progressing loads finish beyond one minute; stalled and endlessly advancing loads remain bounded.');
