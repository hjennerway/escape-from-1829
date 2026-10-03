import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const label=process.argv[2]??'after',destination=new URL('./redesmere-fire-escape/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1400,height:850}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/explore.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../dist/explore.mjs',import.meta.url),'utf8')).replace('const clock=new THREE.Timer();','window.fireExitTest={walker,exterior,renderer,lighting};const clock=new THREE.Timer();')}));
 await page.goto(base+'/explore.html?view=courtyard-photo');
 await page.waitForFunction(()=>window.fireExitTest?.renderer.info.render.frame>2);
 await page.locator('[data-lighting="day"]').click();
 for(const [name,position,target] of [
  ['middle-wall-end',[70.3,5.965,3.95],[71.7,4.3,4.9]],
  ['upper-wall-end',[67.7,10.215,3.7],[69.1,8.5,4.8]],
  ['whole-stair',[77,9,-5],[68.7,5.6,3.8]],
  ['middle-overhead',[72,13,3.2],[70,4.25,3.9]],
  ['upper-overhead',[69.8,16,2.9],[67.8,8.5,3.9]]
 ]){
  await page.evaluate(({position,target})=>window.fireExitTest.walker.setView({position,target}),{position,target});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:fileURLToPath(new URL(label+'-'+name+'.png',destination))});
 }
 assert.deepEqual(errors,[]);
 await writeFile(new URL(label+'-browser.json',destination),JSON.stringify({errors},null,2)+'\n');
 console.log('PASS: five courtyard stair views render without browser errors ('+label+').');
}finally{await browser.close();server.kill();}
