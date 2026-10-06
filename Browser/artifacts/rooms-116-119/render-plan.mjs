import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const browser=await launchHardwareBrowser({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const svg=await readFile(new URL('../../../Research/room-furnishings/first-floor.svg',import.meta.url),'utf8');
 const height=Number(svg.match(/height="(\d+)"/)[1]),page=await browser.newPage({viewport:{width:1400,height}});
 await page.setContent('<style>html,body{margin:0}</style>'+svg);
 await page.screenshot({path:fileURLToPath(new URL('../../../Research/room-furnishings/first-floor.png',import.meta.url))});
 console.log('Rendered the first-floor furnished review drawing with verified hardware acceleration.');
}finally{await browser.close();}
