import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from '../../Browser/node_modules/playwright/index.mjs';
import { desktop, prepareWeb } from '../scripts/prepare-web.mjs';

const packaged = process.argv.includes('--packaged');
const artifacts = join(desktop, 'artifacts');
await mkdir(artifacts, { recursive: true });
if (!packaged) await prepareWeb();
const profile = await mkdtemp(join(artifacts, 'profile-'));
const executable = packaged
  ? join(desktop, 'out/EscapeFrom1829-win32-x64/EscapeFrom1829.exe')
  : createRequire(import.meta.url)('electron');
const environment = { ...process.env };
delete environment.ELECTRON_RUN_AS_NODE;
delete environment.NODE_OPTIONS;
const child = spawn(executable, [
  ...(packaged ? [] : [desktop]), '--remote-debugging-port=0', '--user-data-dir=' + profile,
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
], { windowsHide: true, env: environment, stdio: ['ignore', 'pipe', 'pipe'] });
let browser, page, logs = '';
const errors = [], externalRequests = [];
const label = packaged ? 'packaged' : 'development';
try {
  const endpoint = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Electron did not start: ' + logs)), 30000);
    child.once('error', error => { clearTimeout(timeout); reject(error); });
    child.once('exit', code => { clearTimeout(timeout); reject(new Error(`Electron exited (${code}): ${logs}`)); });
    child.stderr.on('data', data => {
      logs += data;
      const match = logs.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) { clearTimeout(timeout); resolve(match[1]); }
    });
    child.stdout.on('data', data => { logs += data; });
  });
  console.log('Electron started; connecting to renderer.');
  browser = await chromium.connectOverCDP(endpoint, { timeout: 30000 });
  const context = browser.contexts()[0];
  // Simulate unavailable internet without changing the computer's connection.
  page = context.pages()[0] || await context.waitForEvent('page');
  const network = await context.newCDPSession(page);
  await network.send('Network.enable');
  await network.send('Network.setBlockedURLs', { urls: ['http://*', 'https://*'] });
  page.on('request', request => {
    if (/^https?:/.test(request.url())) externalRequests.push({ url: request.url(), type: request.resourceType() });
  });
  page.setDefaultTimeout(120000);
  page.setDefaultNavigationTimeout(120000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    // The existing game paints fallback artwork when optional online archive images fail.
    if ((message.type() === 'error' && !message.text().includes('net::ERR_BLOCKED_BY_CLIENT')) ||
      message.text().startsWith('Precompiled estate unavailable')) errors.push(message.text());
  });
  // Let the initial navigation finish before exercising reloads/navigation.
  await page.waitForFunction(() => document.querySelector('#start')?.disabled === false);
  await page.goto('escape1829://game/', { waitUntil: 'domcontentloaded' });
  console.log('Game page opened; waiting for the start button.');
  await page.waitForFunction(() => document.querySelector('#start')?.disabled === false);
  assert.deepEqual(await page.evaluate(() => [typeof require, typeof process, window.isSecureContext]), ['undefined', 'undefined', true]);
  await page.evaluate(() => localStorage.setItem('desktop-smoke', 'persistent'));
  await page.reload();
  await page.waitForFunction(() => document.querySelector('#start')?.disabled === false);
  assert.equal(await page.evaluate(() => localStorage.getItem('desktop-smoke')), 'persistent');
  await page.screenshot({ path: join(artifacts, label + '-landing.png') });
  console.log('Landing, renderer isolation and storage passed.');

  await page.locator('#start').click();
  await page.waitForFunction(() => document.querySelector('#hud')?.hidden === false);
  await page.keyboard.press('Tab');
  await page.waitForFunction(() => document.querySelector('#floorMap')?.hidden === false);
  await page.keyboard.press('Tab');
  await page.keyboard.down('w');
  await page.waitForTimeout(250);
  await page.keyboard.up('w');
  await page.screenshot({ path: join(artifacts, label + '-game.png') });
  console.log('Escape game and map passed.');
  await page.evaluate(() => document.exitPointerLock());

  await page.goto('escape1829://game/');
  await page.locator('#aerial').click();
  await page.waitForURL('**/aerial.html');
  // The year change proves scene initialization and the timeline handler finished.
  await page.waitForFunction(() => {
    const slider = document.querySelector('#periodSlider');
    if (slider) { slider.value = '0'; slider.dispatchEvent(new Event('input', { bubbles: true })); }
    return document.querySelector('#periodYear')?.textContent === '1829';
  });
  await page.screenshot({ path: join(artifacts, label + '-aerial.png') });
  console.log('Compiled aerial view and timeline passed.');
  const model = await page.evaluate(async () => {
    const manifest = await (await fetch('./compiled/manifest.json')).json();
    const data = await (await fetch('./compiled/' + manifest.file)).arrayBuffer();
    const raw = await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
    return { bytes: data.byteLength, expected: manifest.bytes, unpacked: raw.byteLength, expectedUnpacked: manifest.uncompressedBytes };
  });
  assert.equal(model.bytes, model.expected);
  assert.equal(model.unpacked, model.expectedUnpacked);

  await page.goto('escape1829://game/explore.html');
  await page.waitForFunction(() => document.querySelector('#look')?.disabled === false);
  assert.doesNotMatch(await page.locator('#look').innerText(), /RELOAD/);
  await page.locator('#look').click();
  await page.waitForFunction(() => document.pointerLockElement?.id === 'game');
  await page.keyboard.down('w');
  await page.waitForTimeout(250);
  await page.keyboard.up('w');
  await page.screenshot({ path: join(artifacts, label + '-walking.png') });
  await page.evaluate(() => document.exitPointerLock());
  await page.locator('#backToIntro').click();
  await page.waitForURL('escape1829://game/');
  assert.equal(context.pages().length, 1);
  assert(externalRequests.every(request => request.type === 'image' &&
    ['www.whateversleft.co.uk', 'basedinchurton.co.uk'].includes(new URL(request.url).hostname)),
  'Only the existing optional archive wall images may attempt online access');
  assert.deepEqual(errors, [], 'All game modes should load without runtime errors');
  await writeFile(join(artifacts, label + '-smoke.json'), JSON.stringify({ passed: true, packaged, offline: true, errors, externalRequests, model }, null, 2));
  console.log(`PASS: ${label} Windows game, offline assets, isolated renderer, storage, game/map, compiled aerial timeline, walking and return navigation.`);
} catch (error) {
  console.error('Desktop smoke failed:', error.message, 'URL:', page?.url(), 'Renderer errors:', errors);
  await writeFile(join(artifacts, label + '-failure.json'), JSON.stringify({ message: error.message, url: page?.url(), errors, externalRequests }, null, 2));
  throw error;
} finally {
  await writeFile(join(artifacts, label + '-electron.log'), logs);
  // Closing an unresponsive Electron browser must not leave the test hanging.
  if (browser) {
    await Promise.race([
      browser.newBrowserCDPSession().then(session => session.send('Browser.close')).catch(() => {}),
      new Promise(resolve => setTimeout(resolve, 2000)),
    ]);
  }
  if (child.exitCode === null) child.kill();
}
