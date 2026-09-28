import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { chromium } from '../../Browser/node_modules/playwright/index.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = join(root, 'Art');
await mkdir(output, { recursive: true });
const svg = await readFile(join(root, 'Browser/dist/favicon.svg'), 'utf8');
const browser = await chromium.launch({ headless: true,
  ...(process.env.MODEL_CHROME_PATH ? { executablePath: process.env.MODEL_CHROME_PATH } : {}) });
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  await page.setContent('<body style="margin:0;background:#17251e;display:grid;place-items:center;height:100vh">' + svg);
  for (const size of [300, 150, 71]) {
    await page.setViewportSize({ width: size, height: size });
    await page.locator('svg').evaluate((element, pixels) => {
      element.style.width = pixels + 'px'; element.style.height = pixels + 'px';
    }, size);
    const png = await page.screenshot();
    if (png.readUInt32BE(16) !== size || png.readUInt32BE(20) !== size) throw new Error('Unexpected icon size');
    const name = `store-tile-${size}x${size}.png`;
    await writeFile(join(output, name), png, { flag: 'wx' });
    console.log(name + ' exported from the existing game icon.');
  }
} finally { await browser.close(); }
