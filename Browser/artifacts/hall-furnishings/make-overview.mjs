import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const out=new URL('./',import.meta.url),browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1800,height:470},deviceScaleFactor:1});
 const cards=await Promise.all([['Visitors’ sitting hall','after-visitors.png'],['Ward service lobby','after-service.png'],['Communal recreation area','after-recreation.png']].map(async([title,file])=>`<article><h2>${title}</h2><img src="data:image/png;base64,${(await readFile(new URL(file,out))).toString('base64')}"></article>`));
 await page.setContent(`<style>*{box-sizing:border-box}body{margin:0;background:#18251b;color:#ece8d4;font-family:Georgia,serif;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:12px}article{overflow:hidden;background:#273526;border:1px solid #6e7652}h2{margin:0;padding:14px 16px;font-size:23px;font-weight:normal}img{display:block;width:100%;height:390px;object-fit:cover}</style>${cards.join('')}`);
 await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));await page.screenshot({path:fileURLToPath(new URL('overview.png',out))});console.log('Saved the three-area visual overview.');
}finally{await browser.close();}
