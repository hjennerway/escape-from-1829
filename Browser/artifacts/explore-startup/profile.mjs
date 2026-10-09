import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'reduce'});
 page.setDefaultTimeout(120000);
 await page.addInitScript(()=>{window.startupSteps=[];window.startupMark=name=>startupSteps.push({name,ms:performance.now()});});
 await page.route('**/explore.mjs',async route=>{
  const response=await route.fetch();let body=await response.text();
  for(const [token,name] of [
   ['try{','modules'],
   ['  const layouts=','exterior'],
   ['  const timeline=','layouts'],
   ['  const lighting=','timeline'],
   ["  hint.textContent='Preparing",'lighting'],
   ['  furnishAsylum(floors);','plan'],
   ['  const interior=','furniture-plan'],
   ['  let workshops;','interior-and-furniture'],
   ['  const loadingStatus=','walker'],
   ['  const view=','workshops-controls'],
   ['  const input=','pose'],
   ['  const clock=new THREE.Timer();','entry-ready'],
  ])body=body.replace(token,`  startupMark('${name}');\n${token}`);
  body=body.replace('    renderer.render(walker.actor.outside?','    if(!window.firstExploreDraw)startupMark("first-render-start");renderer.render(walker.actor.outside?');
  body=body.replace('developer.render(renderer,exterior.camera);','if(!window.firstExploreDraw){startupMark("first-render-end");window.firstExploreDraw=true;}developer.render(renderer,exterior.camera);');
  await route.fulfill({response,body});
 });
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/aerial.html?at=0,40,0&period=1916&lighting=day');
 await page.locator('#switchView').waitFor({state:'visible'});
 await page.waitForTimeout(3000);
 const start=Date.now();await page.locator('#switchView').click();
 await page.waitForFunction(()=>window.firstExploreDraw);
 const results={clickToDraw:Date.now()-start,steps:await page.evaluate(()=>startupSteps),errors};
 const label=process.argv[2]??'profile';
 await mkdir(new URL('./',import.meta.url),{recursive:true});
 await writeFile(new URL(label+'.json',import.meta.url),JSON.stringify(results,null,2));
 await page.screenshot({path:new URL(label+'.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/i,'$1')});
 console.log(JSON.stringify(results,null,2));
}finally{await browser?.close();server.kill();}
