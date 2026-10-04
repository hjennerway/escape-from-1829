import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const url='https://earth.google.com/web/@53.2112896,-2.89851492,23.70718065a,214.60683921d,35y,-38.873579h,0.19268479t,-0r/data=CgRCAggBMikKJwolCiExalh1NDlPZTNpWFdvSExBUzFHZFM4bFVoS2NwZzhjVWsgAUICCABKCAjG56rDBxAB?pli=1&authuser=0';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1300,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForTimeout(15000);
 const state={url:page.url(),title:await page.title(),text:await page.locator('body').innerText(),errors};
 await writeFile(new URL('earth-check.json',import.meta.url),JSON.stringify(state,null,2));
 await page.screenshot({path:fileURLToPath(new URL('earth-live.png',import.meta.url))});
 console.log(JSON.stringify(state));
}finally{await browser.close();}
