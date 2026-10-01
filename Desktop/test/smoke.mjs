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
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--force-device-scale-factor=1',
  // Match Playwright's browser defaults when launching Electron ourselves.
  '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
], { windowsHide: true, env: environment, stdio: ['ignore', 'pipe', 'pipe'] });
let browser, page, viewport, logs = '', stage = 'starting Electron', checkingOfflineConsole = false;
const errors = [], externalRequests = [];
const navigation = [];
const label = packaged ? 'packaged' : 'development';

async function clickToNavigate(selector, destination) {
  // A software-rendered frame can delay each click actionability check. Give
  // input and navigation their own limits instead of starting both clocks at
  // once. waitForURL also handles a destination reached before the click ends.
  stage = 'clicking ' + selector;
  const started = Date.now();
  await page.locator(selector).click({ noWaitAfter: true });
  const clicked = Date.now();
  console.log(`${selector} click completed in ${clicked - started}ms; waiting for its destination.`);
  stage = 'waiting for navigation from ' + selector;
  await page.waitForURL(destination, { waitUntil: 'domcontentloaded' });
  navigation.push({ selector, clickMs: clicked - started, navigationMs: Date.now() - clicked, url: page.url() });
}

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
  page.setDefaultTimeout(120000);
  page.setDefaultNavigationTimeout(120000);
  const network = await context.newCDPSession(page);
  await network.send('Network.enable');
  await network.send('Network.setBlockedURLs', { urls: ['http://*', 'https://*'] });
  page.on('request', request => {
    if (/^https?:/.test(request.url())) externalRequests.push({ url: request.url(), type: request.resourceType() });
  });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    // The automatically opened page can have archive images in flight before
    // CDP blocks the network. Check console errors from our offline navigation;
    // JavaScript exceptions are collected throughout startup as well.
    if (!checkingOfflineConsole) return;
    // The existing game paints fallback artwork when optional online archive images fail.
    if ((message.type() === 'error' && !message.text().includes('net::ERR_BLOCKED_BY_CLIENT')) ||
      message.text().startsWith('Precompiled estate unavailable')) errors.push(message.text());
  });
  // Keep software-rendering work independent of the runner's display/DPI.
  await page.setViewportSize({ width: 960, height: 640 });
  await page.bringToFront();
  stage = 'loading the landing page';
  // Let the initial navigation finish before exercising reloads/navigation.
  await page.waitForFunction(() => document.querySelector('#start')?.disabled === false);
  viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, pixelRatio: devicePixelRatio }));
  assert.deepEqual(viewport, { width: 960, height: 640, pixelRatio: 1 });
  await page.goto('escape1829://game/', { waitUntil: 'domcontentloaded' });
  checkingOfflineConsole = true;
  console.log('Game page opened; waiting for the start button.');
  await page.waitForFunction(() => document.querySelector('#start')?.disabled === false);
  assert.deepEqual(await page.evaluate(() => [typeof require, typeof process, window.isSecureContext]), ['undefined', 'undefined', true]);
  await page.evaluate(() => localStorage.setItem('desktop-smoke', 'persistent'));
  await page.reload();
  await page.waitForFunction(() => document.querySelector('#start')?.disabled === false);
  assert.equal(await page.evaluate(() => localStorage.getItem('desktop-smoke')), 'persistent');
  await page.screenshot({ path: join(artifacts, label + '-landing.png') });
  console.log('Landing, renderer isolation and storage passed.');

  stage = 'playing the escape game';
  await page.bringToFront();
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

  await page.goto('escape1829://game/', { waitUntil: 'domcontentloaded' });
  stage = 'waiting for the title frame';
  // The title-frame capture must not race the first software-rendered frame.
  await page.waitForFunction(() => document.querySelector('#game')?.classList.contains('scene-ready'));
  console.log('Title scene ready; opening aerial view.');
  // Match both the temporary ?intro=1 handoff and the final aerial URL.
  await clickToNavigate('#aerial', url => url.protocol === 'escape1829:' && url.hostname === 'game' &&
    url.pathname === '/aerial.html');
  console.log('Aerial page opened; waiting for the intro handoff.');
  stage = 'waiting for the aerial handoff and timeline';
  await page.waitForFunction(() => !document.body.classList.contains('intro-arriving'));
  // The year change proves scene initialization and the timeline handler finished.
  await page.waitForFunction(() => {
    const slider = document.querySelector('#periodSlider');
    if (slider) { slider.value = '0'; slider.dispatchEvent(new Event('input', { bubbles: true })); }
    return document.querySelector('#periodYear')?.textContent === '1829';
  });
  await page.screenshot({ path: join(artifacts, label + '-aerial.png') });
  console.log('Compiled aerial view and timeline passed.');
  stage = 'checking compiled asset integrity';
  const model = await page.evaluate(async () => {
    const manifest = await (await fetch('./compiled/manifest.json')).json();
    const data = await (await fetch('./compiled/' + manifest.file)).arrayBuffer();
    const raw = await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
    return { bytes: data.byteLength, expected: manifest.bytes, unpacked: raw.byteLength, expectedUnpacked: manifest.uncompressedBytes };
  });
  assert.equal(model.bytes, model.expected);
  assert.equal(model.unpacked, model.expectedUnpacked);

  stage = 'exploring on foot';
  await page.goto('escape1829://game/explore.html');
  await page.waitForFunction(() => document.querySelector('#look')?.disabled === false);
  assert.doesNotMatch(await page.locator('#look').innerText(), /RELOAD/);
  stage = 'capturing the mouse for walking';
  await page.bringToFront();
  await page.locator('#look').click();
  await page.waitForFunction(() => document.pointerLockElement?.id === 'game');
  stage = 'walking and returning to the menu';
  await page.keyboard.down('w');
  await page.waitForTimeout(250);
  await page.keyboard.up('w');
  await page.screenshot({ path: join(artifacts, label + '-walking.png') });
  await page.evaluate(() => document.exitPointerLock());
  await clickToNavigate('#backToIntro', 'escape1829://game/');
  stage = 'checking return to the landing page';
  await page.waitForFunction(() => document.querySelector('#start')?.disabled === false);
  assert.equal(context.pages().length, 1);
  assert(externalRequests.every(request => request.type === 'image' &&
    ['www.whateversleft.co.uk', 'basedinchurton.co.uk'].includes(new URL(request.url).hostname)),
  'Only the existing optional archive wall images may attempt online access');
  assert.deepEqual(errors, [], 'All game modes should load without runtime errors');
  await writeFile(join(artifacts, label + '-smoke.json'), JSON.stringify({ passed: true, packaged, offline: true, viewport, navigation, errors, externalRequests, model }, null, 2));
  console.log(`PASS: ${label} Windows game, offline assets, isolated renderer, storage, game/map, compiled aerial timeline, walking and return navigation.`);
} catch (error) {
  console.error('Desktop smoke failed:', stage, error.message, 'URL:', page?.url(), 'Renderer errors:', errors);
  const documentState = page && await Promise.race([
    page.evaluate(() => ({ focused: document.hasFocus(), hidden: document.hidden,
      pointerLock: document.pointerLockElement?.id ?? null,
      walkingHint: document.querySelector('#lookHint')?.textContent })).catch(() => null),
    new Promise(resolve => setTimeout(() => resolve(null), 2000)),
  ]);
  if (page) await page.screenshot({ path: join(artifacts, label + '-failure.png'), timeout: 10000 }).catch(() => {});
  await writeFile(join(artifacts, label + '-failure.json'), JSON.stringify({ stage, message: error.message, url: page?.url(), viewport, navigation, documentState, errors, externalRequests }, null, 2));
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
