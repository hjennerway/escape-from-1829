import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=new URL('./',import.meta.url),cards=[];
for(const [title,file] of [['Table','close-table'],['Chair','close-chair'],['Wardrobe','model-cupboard'],['Dispensary','model-apothecary']]){
 const images=[];for(const mode of ['before','after'])images.push(`<div><span>${mode==='before'?'Before':'After'}</span><img alt="${title}: ${mode}" src="data:image/png;base64,${(await readFile(new URL(mode+'-'+file+'.png',root))).toString('base64')}"></div>`);
 cards.push(`<section><h2>${title}</h2><div class="pair">${images.join('')}</div></section>`);
}
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>Furniture surface comparison</title><style>*{box-sizing:border-box}body{margin:0;padding:26px;background:#ebe7df;color:#354134;font:16px Arial,sans-serif}h1{margin:0 0 8px;font-size:28px}p{margin:0 0 20px;color:#626855}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}section{background:#f8f5ed;border:1px solid #c6bdac;padding:14px}h2{margin:0 0 10px;font-size:18px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:10px}span{display:block;font-size:12px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:7px}img{display:block;width:100%;height:250px;object-fit:contain;background:#c8c3b8}</style><h1>Softer furniture surfaces</h1><p>Irregular wood fibres and subtle wear replace repeating stripes. Geometry, lights and cameras match within each pair.</p><div class="grid">${cards.join('')}</div></html>`;
await writeFile(new URL('review.html',root),html);
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{const page=await browser.newPage({viewport:{width:1440,height:820}});await page.setContent(html);await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));await page.screenshot({path:fileURLToPath(new URL('review.png',root)),fullPage:true});}finally{await browser.close();}
