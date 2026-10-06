import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const svgURL=new URL('../../../Research/room-furnishings/basement.svg',import.meta.url),svg=await readFile(svgURL,'utf8');
const [width,height]=[...svg.match(/<svg[^>]*width="(\d+)" height="(\d+)"/)].slice(1).map(Number);
const browser=await launchHardwareBrowser({executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{const page=await browser.newPage({viewport:{width,height}});await page.goto(svgURL.href);await page.locator('svg').screenshot({path:fileURLToPath(new URL('basement.png',svgURL))});}finally{await browser.close();}
