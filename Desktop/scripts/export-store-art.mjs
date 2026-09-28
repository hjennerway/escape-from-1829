import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { chromium } from '../../Browser/node_modules/playwright/index.mjs';

const [posterSource, boxSource] = process.argv.slice(2);
const checkOnly = process.argv.includes('--check-only');
if (!checkOnly && (!posterSource || !boxSource)) throw new Error('Provide the approved portrait and square PNG source paths.');
const root = fileURLToPath(new URL('../../', import.meta.url));
const art = join(root, 'Art');
const evidence = join(root, 'Desktop/artifacts');
await mkdir(art, { recursive: true });
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ headless: true,
  ...(process.env.MODEL_CHROME_PATH ? { executablePath: process.env.MODEL_CHROME_PATH } : {}) });
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const [source, label, sizes] of checkOnly ? [] : [
    [posterSource, 'poster', [[1440, 2160], [720, 1080]]],
    [boxSource, 'box', [[2160, 2160], [1080, 1080]]],
  ]) {
    const data = await readFile(source);
    for (const [width, height] of sizes) {
      // Export size variants from the approved artwork; never crop or repaint it.
      const encoded = await page.evaluate(async ({ src, width, height }) => {
        const image = new Image(); image.src = src; await image.decode();
        if (Math.abs(image.width / image.height - width / height) > 0.002) throw new Error('Source artwork has the wrong aspect ratio');
        const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: false });
        ctx.fillStyle = '#17251e'; ctx.fillRect(0, 0, width, height);
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(image, 0, 0, width, height);
        return canvas.toDataURL('image/png').split(',')[1];
      }, { src: 'data:image/png;base64,' + data.toString('base64'), width, height });
      const name = `store-${label}-${width}x${height}.png`;
      await writeFile(join(art, name), Buffer.from(encoded, 'base64'), { flag: 'wx' });
      console.log('Saved ' + name);
    }
  }
  const inventory = [];
  for (const [name, width, height] of [
    ['store-poster-1440x2160.png', 1440, 2160], ['store-poster-720x1080.png', 720, 1080],
    ['store-box-2160x2160.png', 2160, 2160], ['store-box-1080x1080.png', 1080, 1080],
    ...[300, 150, 71].map(size => [`store-tile-${size}x${size}.png`, size, size]),
  ]) {
    const data = await readFile(join(art, name));
    assert.equal(data.subarray(1, 4).toString(), 'PNG', name);
    assert.equal(data.readUInt32BE(16), width, name);
    assert.equal(data.readUInt32BE(20), height, name);
    assert(data.length < 50 * 1024 * 1024, name + ' exceeds the Store size limit');
    inventory.push({ file: name, width, height, bytes: data.length });
  }
  await writeFile(join(evidence, 'store-art-validation.json'), JSON.stringify({ passed: true, files: inventory }, null, 2) + '\n');
  const previewFiles = ['store-poster-720x1080.png', 'store-box-1080x1080.png', 'store-tile-300x300.png', 'store-tile-150x150.png', 'store-tile-71x71.png'];
  const cards = [];
  for (const file of previewFiles) {
    const data = await readFile(join(art, file));
    cards.push(`<figure><img src="data:image/png;base64,${data.toString('base64')}"/><figcaption>${file}</figcaption></figure>`);
  }
  await page.setViewportSize({ width: 1500, height: 900 });
  await page.setContent(`<body style="margin:0;background:#e6e4cf;color:#17251e;font:16px Arial"><style>figure{margin:0}img{display:block;max-width:420px;max-height:740px}figure:first-child img{width:440px;max-width:440px}figcaption{margin-top:14px;font-size:12px}figure:nth-child(n+3) img{max-width:145px}</style><h1 style="margin:24px 30px">Escape from 1829 — Microsoft Store artwork</h1><main style="display:flex;gap:24px;align-items:start;padding:0 30px">${cards.join('')}</main></body>`);
  await page.evaluate(() => Promise.all([...document.images].map(image => image.decode())));
  await page.screenshot({ path: join(evidence, 'store-art-contact-sheet.png') });
  console.log('PASS: all seven PNG files have the requested dimensions and are below 50 MB.');
} finally { await browser.close(); }
