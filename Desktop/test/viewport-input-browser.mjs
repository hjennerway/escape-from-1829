import assert from 'node:assert/strict';
import {launchHardwareBrowser} from '../../Browser/test-support/hardware-browser.mjs';
import {clickViewportControl} from './viewport-input.mjs';

const browser = await launchHardwareBrowser();
try {
  const page = await browser.newPage({viewport: {width: 960, height: 640}});
  await page.setContent('<button id="control" style="position:absolute;left:100px;top:100px;width:200px;height:80px">Start</button><div id="cover" style="position:absolute;left:100px;top:100px;width:200px;height:80px"></div>');
  await page.evaluate(() => {
    window.clicks = [];
    document.querySelector('#control').onclick = event => window.clicks.push({trusted: event.isTrusted, active: navigator.userActivation.isActive});
  });
  await assert.rejects(clickViewportControl(page, '#control', {timeout: 250}), /Timeout/);
  await page.evaluate(() => { document.querySelector('#cover').remove(); document.querySelector('#control').disabled = true; });
  await assert.rejects(clickViewportControl(page, '#control', {timeout: 250}), /Timeout/);
  await page.evaluate(() => { const button = document.querySelector('#control'); button.disabled = false; button.style.left = '1100px'; });
  await assert.rejects(clickViewportControl(page, '#control', {timeout: 250}), /Timeout/);
  // The click must work without waiting for animation frames or requesting a
  // scroll, and must retain the trusted activation required by pointer lock.
  await page.evaluate(() => {
    document.querySelector('#control').style.left = '100px';
    window.requestAnimationFrame = () => 0;
    Element.prototype.scrollIntoView = () => { throw new Error('Unexpected scrolling'); };
  });
  await clickViewportControl(page, '#control');
  assert.deepEqual(await page.evaluate(() => window.clicks), [{trusted: true, active: true}]);
  console.log('PASS: viewport clicks reject covered, disabled and off-screen controls and preserve trusted user activation without animation-frame polling.');
} finally { await browser.close(); }
