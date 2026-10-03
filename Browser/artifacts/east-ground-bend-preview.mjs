import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const mode=process.argv[2]??'before',destination=new URL('./east-ground-bend/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1600,height:700}}),errors=[];page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 if(mode==='before')await page.route('**/asylum-plan.json',async route=>route.fulfill({contentType:'application/json',body:await readFile(new URL('./plan-before.json',destination),'utf8')}));
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.wallCheck={walker,interior,renderer,floors};const clock=new THREE.Timer();')});});
 await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.wallCheck?.renderer.info.render.frame>2);
 await page.addStyleTag({content:'#layoutControls,#walkTouch,#exploreDoor,#lookHint,#look,.vignette{display:none!important}'});
 const views=mode==='west-before'?[['r22-room',-40.5,6.5,-37,3.5],['r22-corridor',-35.8,8.2,-38.5,3],['r17-room',-67,8,-64.5,5],['r19-corner',-60,9,-62.5,6]]:[['r27-room',48,10,45.1,7],['r27-corridor',43,8.2,47,6.5],['r22-room',-40.5,6.5,-37,3.5],['r22-corridor',-35.8,8.2,-38.5,3],['r4-corner',-36.2,8.2,-33.8,6.2],['r4-door',-35.8,2,-31,2]];
 async function pose(points,floor=0){
  await page.evaluate(({points,floor})=>{const t=window.wallCheck,[x,z,tx,tz]=points,y=t.floors[floor].elevation;t.walker.setView({position:[x,y+1.65,z],target:[tx,y+1.5,tz],fov:58});Object.assign(t.walker.actor,{floor,outside:false,y});},{points,floor});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 }
 for(const [name,...points] of views){await pose(points);await page.screenshot({path:fileURLToPath(new URL(`${mode}-${name}.png`,destination))});}
 assert.deepEqual(errors,[]);await writeFile(new URL(`${mode}.json`,destination),JSON.stringify({views:views.length,errors},null,2)+'\n');
 console.log(`PASS: ${mode} east ground-floor bend views; no page or shader errors.`);
}finally{await browser.close();server.kill();}
