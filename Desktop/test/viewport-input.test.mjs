import assert from 'node:assert/strict';
import test from 'node:test';
import {createViewportInput} from './viewport-input.mjs';

function browserFixture(t, acknowledgement) {
  t.mock.timers.enable({apis: ['setTimeout']});
  let signalInput;
  const started = new Promise(resolve => { signalInput = resolve; });
  const waits = [];
  return {
    started, waits,
    page: {
      async waitForFunction(predicate, argument, options) {
        waits.push(options);
        return {jsonValue: async () => ({x: 100, y: 100}), dispose: async () => {}};
      },
      mouse: {click: () => {
        signalInput();
        return new Promise(resolve => { if (Number.isFinite(acknowledgement)) setTimeout(resolve, acknowledgement); });
      }},
    },
  };
}

test('hosted input can complete after two minutes within the shared five-minute budget', async t => {
  const fixture = browserFixture(t, 180000);
  const input = createViewportInput(fixture.page, {timeout: 300000});
  let outcome = 'pending';
  const click = input.click('#aerial');
  click.then(() => { outcome = 'complete'; }, () => { outcome = 'failed'; });
  await fixture.started;
  t.mock.timers.tick(120000);
  await Promise.resolve();
  assert.equal(outcome, 'pending');
  t.mock.timers.tick(60000);
  await click;
  assert.equal(outcome, 'complete');
  await input.waitForUi(() => true);
  assert.deepEqual(fixture.waits.map(wait => wait.timeout), [300000, 300000]);
});

test('local input retains its two-minute deadline', async t => {
  const fixture = browserFixture(t, 180000);
  const click = createViewportInput(fixture.page, {timeout: 120000}).click('#aerial');
  const rejection = assert.rejects(click, /Mouse input timed out: #aerial/);
  await fixture.started;
  t.mock.timers.tick(120000);
  await rejection;
});

test('a stalled hosted mouse acknowledgement still fails at the configured deadline', async t => {
  const fixture = browserFixture(t, Infinity);
  const click = createViewportInput(fixture.page, {timeout: 300000}).click('#aerial');
  const rejection = assert.rejects(click, /Mouse input timed out: #aerial/);
  await fixture.started;
  t.mock.timers.tick(300000);
  await rejection;
});

test('input configuration requires an explicit finite positive deadline', () => {
  for (const timeout of [undefined, 0, -1, Infinity, NaN]) {
    assert.throws(() => createViewportInput({}, {timeout}), /positive UI\/input timeout/);
  }
});
