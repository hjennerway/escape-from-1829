import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { chromium } from '../../Browser/node_modules/playwright/index.mjs';

const checkOnly = process.argv.includes('--check-only');
const sources = process.argv.slice(2);
if (!checkOnly && sources.length !== 4) {
  throw new Error('Provide the super hero, branded key, titled hero and featured square PNG source paths.');
}
const root = fileURLToPath(new URL('../../', import.meta.url));
const art = join(root, 'Art');
const evidence = join(root, 'Desktop/artifacts');
await mkdir(evidence, { recursive: true });
const assets = [
  { file: 'store-super-hero-3840x2160.png', width: 3840, height: 2160, source: 0 },
  { file: 'store-super-hero-1920x1080.png', width: 1920, height: 1080, source: 0 },
  { file: 'xbox-branded-key-584x800.png', width: 584, height: 800, source: 1 },
  { file: 'xbox-titled-hero-1920x1080.png', width: 1920, height: 1080, source: 2 },
  { file: 'xbox-featured-square-1080x1080.png', width: 1080, height: 1080, source: 3 },
];
const browser = await chromium.launch({ headless: true,
  ...(process.env.MODEL_CHROME_PATH ? { executablePath: process.env.MODEL_CHROME_PATH } : {}) });
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const inventory = [];
  for (const asset of assets) {
    const { file, width, height } = asset;
    let exportDetails;
    if (!checkOnly) {
      const data = await readFile(sources[asset.source]);
      const result = await page.evaluate(async ({ src, width, height }) => {
        const image = new Image(); image.src = src; await image.decode();
        const sourceRatio = image.width / image.height;
        const targetRatio = width / height;
        const difference = Math.abs(sourceRatio / targetRatio - 1);
        if (difference > 0.015) throw new Error('Artwork aspect ratio differs by more than 1.5%; regenerate the composition.');
        const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: false });
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
        // Mechanical export only. Preserve proportions and trim at most 1.5%
        // of the outside edges when the generated size is rounded to pixels.
        const scale = Math.max(width / image.width, height / image.height);
        const dw = image.width * scale, dh = image.height * scale;
        ctx.drawImage(image, (width - dw) / 2, (height - dh) / 2, dw, dh);
        return { png: canvas.toDataURL('image/png').split(',')[1],
          sourceWidth: image.width, sourceHeight: image.height, edgeTrimFraction: difference };
      }, { src: 'data:image/png;base64,' + data.toString('base64'), width, height });
      await writeFile(join(art, file), Buffer.from(result.png, 'base64'), { flag: 'wx' });
      const { png, ...details } = result;
      exportDetails = details;
    }
    const data = await readFile(join(art, file));
    assert.deepEqual([...data.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], file);
    assert.equal(data.readUInt32BE(16), width, file);
    assert.equal(data.readUInt32BE(20), height, file);
    assert(data.length < 50_000_000, file + ' exceeds 50 MB');
    const opaque = await page.evaluate(async src => {
      const image = new Image(); image.src = src; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
      const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
      const pixels = ctx.getImageData(0, 0, image.width, image.height).data;
      for (let i = 3; i < pixels.length; i += 4) if (pixels[i] !== 255) return false;
      return true;
    }, 'data:image/png;base64,' + data.toString('base64'));
    assert(opaque, file + ' contains transparent pixels');
    inventory.push({ file, width, height, bytes: data.length, opaque, ...exportDetails });
  }
  await writeFile(join(evidence, 'promotional-art-validation.json'), JSON.stringify({ passed: true, files: inventory }, null, 2) + '\n');
  const cards = [];
  for (const { file } of assets.filter(asset => asset.width !== 3840)) {
    const data = await readFile(join(art, file));
    cards.push(`<figure><img src="data:image/png;base64,${data.toString('base64')}"/><figcaption>${file}</figcaption></figure>`);
  }
  await page.setViewportSize({ width: 1500, height: 1090 });
  await page.setContent(`<body style="margin:0;background:#e6e4cf;color:#17251e;font:16px Arial"><style>main{display:grid;grid-template-columns:720px 720px;gap:20px;padding:0 20px}figure{margin:0;height:480px}img{display:block;max-width:720px;max-height:450px}figcaption{margin:8px 0 12px;font-size:14px}</style><h1 style="margin:20px">Escape from 1829 — Hero and Xbox artwork</h1><main>${cards.join('')}</main></body>`);
  await page.evaluate(() => Promise.all([...document.images].map(image => image.decode())));
  await page.screenshot({ path: join(evidence, 'promotional-art-contact-sheet.png') });
  console.log(JSON.stringify({ passed: true, files: inventory }, null, 2));
} finally { await browser.close(); }
