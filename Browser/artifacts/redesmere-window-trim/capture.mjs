import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const label=process.argv[2]??'after',out=new URL('./',import.meta.url);
await mkdir(out,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1400,height:850}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.courtTest={walker,exterior,renderer};const clock=new THREE.Timer();')});});
 await page.goto(base+'/explore.html?view=rear-court-photo');
 await page.waitForFunction(()=>window.courtTest?.renderer.info.render.frame>3);
 await page.locator('[data-lighting="day"]').click();
 const views=[
  {name:'courtyard',position:[61,2.1,-23.5],target:[74,4.8,-32.5],fov:70},
  {name:'door-trim',position:[66.4,5.4,-30.3],target:[66.4,5.1,-32.9],fov:78},
  {name:'corner-window',position:[78,2.1,-24],target:[84,4.5,-29.8],fov:65}
 ];
 for(const view of views){
  await page.evaluate(v=>window.courtTest.walker.setView(v),view);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:fileURLToPath(new URL(label+'-'+view.name+'.png',out))});
 }
 assert.deepEqual(errors,[]);
 await writeFile(new URL(label+'-browser.json',out),JSON.stringify({views,errors},null,2)+'\n');
 console.log('PASS: Redesmere courtyard, fire-exit trim and corner-window views render without browser or shader errors ('+label+').');
}finally{await browser.close();server.kill();}
