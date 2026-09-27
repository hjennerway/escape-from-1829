import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from '../../Browser/node_modules/playwright/index.mjs';
import { desktop, webSource } from './prepare-web.mjs';

export async function createAssets() {
  const directory = join(desktop, 'assets');
  await mkdir(directory, { recursive: true });
  const svg = await readFile(join(webSource, 'favicon.svg'), 'utf8');
  const browser = await chromium.launch({ headless: true,
    ...(process.env.MODEL_CHROME_PATH ? { executablePath: process.env.MODEL_CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    await page.setContent('<body style="margin:0;background:#17251e;display:grid;place-items:center;height:100vh">' + svg);
    for (const [name, width, height] of [
      ['StoreLogo', 50, 50], ['Square44x44Logo', 44, 44], ['Square150x150Logo', 150, 150],
      ['Wide310x150Logo', 310, 150], ['Icon256', 256, 256],
    ]) {
      await page.setViewportSize({ width, height });
      await page.locator('svg').evaluate((element, size) => { element.style.width = size + 'px'; element.style.height = size + 'px'; }, Math.min(width, height));
      await page.screenshot({ path: join(directory, name + '.png') });
    }
    // Windows Vista+ ICO containers support PNG frames. Reuse the game's SVG artwork.
    const png = await readFile(join(directory, 'Icon256.png'));
    const header = Buffer.alloc(22);
    header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
    header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
    header.writeUInt32LE(png.length, 14); header.writeUInt32LE(22, 18);
    await writeFile(join(directory, 'game.ico'), Buffer.concat([header, png]));
  } finally { await browser.close(); }
}
