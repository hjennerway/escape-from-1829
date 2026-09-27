import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from '../../Browser/node_modules/playwright/index.mjs';
import { desktop } from './prepare-web.mjs';

// Capture the actual packaged renderer at Store resolution, without overlays.
const output = join(desktop, 'out/store-submission/screenshots');
await mkdir(output, { recursive: true });
await mkdir(join(desktop, 'artifacts'), { recursive: true });
const profile = await mkdtemp(join(desktop, 'artifacts/store-capture-'));
const environment = { ...process.env };
delete environment.ELECTRON_RUN_AS_NODE;
delete environment.NODE_OPTIONS;
const child = spawn(join(desktop, 'out/EscapeFrom1829-win32-x64/EscapeFrom1829.exe'), [
  '--remote-debugging-port=0', '--user-data-dir=' + profile,
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
], { windowsHide: true, env: environment, stdio: ['ignore', 'pipe', 'pipe'] });
let browser, logs = '';
const screenshots = [];
try {
  const endpoint = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Desktop launch timed out: ' + logs)), 30000);
    child.once('error', error => { clearTimeout(timeout); reject(error); });
    child.once('exit', code => { clearTimeout(timeout); reject(new Error('Desktop exited: ' + code)); });
    child.stderr.on('data', data => {
      logs += data;
      const match = logs.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) { clearTimeout(timeout); resolve(match[1]); }
    });
    child.stdout.on('data', data => { logs += data; });
  });
  browser = await chromium.connectOverCDP(endpoint);
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.waitForEvent('page');
  page.setDefaultTimeout(180000);
  page.setDefaultNavigationTimeout(180000);
  const network = await context.newCDPSession(page);
  await network.send('Network.enable');
  await network.send('Network.setBlockedURLs', { urls: ['http://*', 'https://*'] });
  await page.waitForFunction(() => document.querySelector('#start')?.disabled === false);
  await page.setViewportSize({ width: 1920, height: 1080 });
  const capture = async (file, caption) => {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const png = await page.screenshot({ path: join(output, file) });
    const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
    if (width !== 1920 || height !== 1080) throw new Error(`Wrong screenshot size: ${width}x${height}`);
    screenshots.push({ file, caption, width, height, bytes: png.length });
    console.log('Captured ' + file);
  };
  await capture('01-choose-your-mode.png', 'Choose the escape game, an aerial view or a walk around the hospital grounds.');
  await page.locator('#start').click();
  await page.waitForFunction(() => document.querySelector('#hud')?.hidden === false);
  await capture('02-asylum-escape.png', 'Search the corridors for an active exit while security and the ghost pursue you.');
  await page.evaluate(() => document.exitPointerLock());
  await page.goto('escape1829://game/aerial.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    const slider = document.querySelector('#periodSlider');
    if (slider) { slider.value = '0'; slider.dispatchEvent(new Event('input', { bubbles: true })); }
    return document.querySelector('#periodYear')?.textContent === '1829';
  });
  await capture('03-historic-aerial-view.png', 'Use the historical timeline to explore how the hospital grounds changed.');
  await page.goto('escape1829://game/explore.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('#look')?.disabled === false);
  await page.locator('#look').click();
  await page.waitForFunction(() => document.pointerLockElement?.id === 'game');
  await capture('04-explore-on-foot.png', 'Explore the hospital buildings and grounds in first person.');
  await page.evaluate(() => document.exitPointerLock());
  await writeFile(join(output, 'captions.json'), JSON.stringify(screenshots, null, 2) + '\n');
  console.log('Four unmodified 1920x1080 PNG screenshots ready for the desktop Store listing.');
} finally {
  await writeFile(join(desktop, 'artifacts/store-capture.log'), logs);
  if (browser) await Promise.race([
    browser.newBrowserCDPSession().then(session => session.send('Browser.close')).catch(() => {}),
    new Promise(resolve => setTimeout(resolve, 2000)),
  ]);
  if (child.exitCode === null) child.kill();
}
