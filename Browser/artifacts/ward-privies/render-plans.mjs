import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const browser=await launchHardwareBrowser({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1600,height:1050}});
 for(const name of ['ground-floor','first-floor']){
  const svg=await readFile(new URL('../../../Research/1829-interior-proposal/'+name+'.svg',import.meta.url),'utf8');
  await page.setContent('<style>html,body{margin:0}</style>'+svg);
  await page.screenshot({path:fileURLToPath(new URL('../../../Research/1829-interior-proposal/'+name+'.png',import.meta.url))});
 }
 console.log('Rendered the ground/first architectural review plans with the verified hardware browser.');
}finally{await browser.close();}
