import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore'});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
  const page=await browser.newPage({viewport:{width:900,height:1100}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const view of ['front-corner-1','front-corner-2','front-corner-west','front-corners']){
    if(view==='front-corners')await page.setViewportSize({width:1300,height:850});
    await page.goto('http://127.0.0.1:1829/'+(view==='front-corners'?'aerial':'explore')+'.html?view='+view);
    await page.waitForTimeout(1800);
    await page.addStyleTag({content:'body>*:not(canvas){visibility:hidden!important} canvas{visibility:visible!important}'});
    await page.screenshot({path:'Browser/artifacts/'+view+'.jpg',quality:88});
  }
  if(errors.length)throw new Error(errors.join('\n'));
  console.log('PASS: both photo directions, west reflection and aerial render without browser errors.');
}finally{await browser.close();server.kill();}
