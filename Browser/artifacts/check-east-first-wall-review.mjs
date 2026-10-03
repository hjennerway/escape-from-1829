import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const mode=process.argv[2]??'after',destination=new URL('./east-first-wall/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1608,height:866}}),errors=[];page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 if(mode==='before')await page.route('**/asylum-plan.json',async route=>route.fulfill({contentType:'application/json',body:await readFile(new URL('./plan-before.json',destination),'utf8')}));
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.wallCheck={walker,interior,renderer,floors};const clock=new THREE.Timer();')});});
 await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.wallCheck?.renderer.info.render.frame>2);
 await page.addStyleTag({content:'#layoutControls,#walkTouch,#exploreDoor,#lookHint,#look,.vignette{display:none!important}'});
 const views=[['from-corridor',34.2,17.5,35.1,22.2],['door-join',33.3,21.5,34.5,24.5],['room-face',38,24,35,22.6]];
 async function pose(points,floor=1){
  await page.evaluate(({points,floor})=>{const t=window.wallCheck,[x,z,tx,tz]=points,y=t.floors[floor].elevation;
   t.walker.setView({position:[x,y+1.65,z],target:[tx,y+1.55,tz],fov:58});Object.assign(t.walker.actor,{floor,outside:false,y});
  },{points,floor});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 }
 for(const [name,...points] of views){await pose(points);await page.screenshot({path:fileURLToPath(new URL(`review-${mode}-${name}.png`,destination))});}
 await pose(views[0].slice(1),0);await page.screenshot({path:fileURLToPath(new URL(`review-${mode}-ground.png`,destination))});
 await page.setViewportSize({width:390,height:844});await pose(views[2].slice(1));await page.screenshot({path:fileURLToPath(new URL(`review-${mode}-mobile.png`,destination))});
 assert.deepEqual(errors,[]);await writeFile(new URL(`review-${mode}.json`,destination),JSON.stringify({views:views.length+2,errors},null,2)+'\n');
 console.log(`PASS: ${mode} first-floor wall/room/corridor, ground comparison and mobile views, no page or shader errors.`);
}finally{await browser.close();server.kill();}
