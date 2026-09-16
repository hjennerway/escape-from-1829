import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore'});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
  const page=await browser.newPage({viewport:{width:1300,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const mode of ['before','after']){
    await page.unrouteAll();
    if(mode==='before')for(const file of ['escape-exterior.mjs','east-photo-detail.mjs','west-wing-photo-detail.mjs','courtyard-photo-detail.mjs'])
      await page.route('**/'+file,route=>route.fulfill({contentType:'text/javascript',body:execFileSync('git',['show','HEAD:Browser/dist/'+file],{encoding:'utf8'})}));
    await page.route('**/aerial.html?*',async route=>{
      const response=await route.fetch();
      const body=(await response.text()).replace('function frameFront(){','function frameFront(){exterior.camera.position.set(55,80,138);navigationTarget=[0,6,-1];exterior.camera.lookAt(...navigationTarget);return;');
      await route.fulfill({response,body});
    });
    await page.goto('http://127.0.0.1:1829/aerial.html?view=front');
    await page.waitForTimeout(2400);
    await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#replay {display:none!important}'});
    await page.screenshot({path:'Browser/artifacts/1829-roofs-windows-'+mode+'.jpg',quality:65});
  }
  if(errors.length)throw new Error(errors.join('\n'));
  console.log('Rendered before/after; no browser errors.');
}finally{await browser.close();server.kill();}

