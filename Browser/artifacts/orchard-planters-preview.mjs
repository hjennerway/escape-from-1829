import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise(resolve=>server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1100,height:850}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__check={exterior,renderer,controls};function frame(){')});});
 const modes=process.argv.includes('--before')?['source']:['source','compiled'];
 for(const mode of modes){
  await page.goto(base+'/aerial.html?period=1916&models='+mode,{timeout:120000});
  await page.waitForFunction(()=>window.__check?.renderer.info.render.frame>3,null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__check.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  if(!await page.evaluate(()=>window.__check.exterior.trees.visible))await page.keyboard.press('t');
  await page.addStyleTag({content:'#layoutControls,#aerialHelp{display:none!important}'});
  const result=await page.evaluate(()=>{
   const {exterior,controls}=window.__check;exterior.scene.fog.density=0;
   exterior.camera.position.set(-87,101.5,-30.3);exterior.camera.lookAt(25,0,-66);controls.sync([25,0,-66]);
   return {trees:exterior.trees.children.filter(t=>t.userData.broadleafTree?.z===-64).map(t=>t.userData.broadleafTree)};
  });
  await page.waitForTimeout(500);
  const suffix=process.argv.includes('--before')?'before':mode;
  await page.screenshot({path:new URL('orchard-planters-'+suffix+'.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1'),timeout:120000});
  await writeFile(new URL('orchard-planters-'+suffix+'.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
 }
 assert.deepEqual(errors,[]);console.log('PASS: orchard planter views captured without browser errors.');
}finally{await browser?.close();server.kill();}
