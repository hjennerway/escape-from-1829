import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const destination=new URL('./',import.meta.url);
const references=new URL('../../../Research/west/proportions-2026-10-04/',import.meta.url);
let rows='';
for(let pair=1;pair<=4;pair++){
  const cards=[];
  for(const [label,path] of [
    ['Photograph',new URL(`photo-${pair}.png`,references)],
    ['Previous model',new URL(`before-pair${pair}.png`,destination)],
    ['Refined model',new URL(`after-pair${pair}.png`,destination)]
  ]){
    const data=(await readFile(path)).toString('base64');
    cards.push(`<figure><figcaption>${label}</figcaption><img alt="Pair ${pair}: ${label}" src="data:image/png;base64,${data}"></figure>`);
  }
  rows+=`<section><h2>Pair ${pair}</h2><div class="row">${cards.join('')}</div></section>`;
}
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>West wing photographic proportions</title><style>
*{box-sizing:border-box}body{margin:0;padding:28px;background:#eef0e9;color:#26382e;font:16px system-ui}h1{font-size:28px;margin:0 0 10px}p{margin:0 0 24px}h2{font-size:18px;margin:14px 0 8px}.row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}figure{margin:0;background:#fff;border:1px solid #cbd3c7}figcaption{padding:8px 12px;font-weight:600}img{width:100%;aspect-ratio:4/3;object-fit:contain;display:block;background:#dce3da}
</style><h1>West wing photographic proportions</h1><p>All four reference pairs. Previous and refined models share each camera; photographs have their original perspective. Trees hidden in model comparisons for clarity.</p>${rows}</html>`;
await writeFile(new URL('comparison.html',destination),html);
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
  const page=await browser.newPage({viewport:{width:1500,height:1800}});
  await page.setContent(html);
  await page.evaluate(()=>Promise.all([...document.images].map(image=>image.decode())));
  await page.screenshot({path:fileURLToPath(new URL('comparison.png',destination)),fullPage:true});
}finally{await browser.close();}
console.log('Saved west-wing photograph / previous / refined comparison.');
