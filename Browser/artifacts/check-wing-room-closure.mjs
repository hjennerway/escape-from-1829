import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const mode=process.argv[2]??'before',destination=new URL('./wing-room-closure/',import.meta.url);
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
 const views=[
  ['west-marked',-35.9,17.5,-34.5,20,0],['east-upper-marked',35.9,17.5,34.5,20,1],
  ['west-upper-marked',-35.9,17.5,-34.5,20,1],['east-ground',35.9,17.5,34.5,20,0],
  ['west-forward',-33.3,25.3,-32,28.5,0],['west-forward-upper',-33.3,25.3,-32,28.5,1],
  ['east-forward-upper',33.3,25.3,32,28.5,1],
  ['west-cross-range',-36.3,8.2,-39,4,0],['west-cross-range-upper',-36.3,8.2,-39,4,1],
  ['west-pavilion',-65,10,-66,11,0],['west-pavilion-upper',-65,10,-66,11,1],
  ['west-pavilion-lobby',-67.5,17.9,-66.5,16.7,0],
  ['central-room',0,6.1,0,4.9,0],['central-room-upper',0,6.1,0,4.9,1],
  ['east-outer-room',68.3,18.4,68.3,20,0],
  ['basement-room',-9.1,13,-7.8,14,2],['second-floor',-4,12.8,-3.3,9,3],
 ];
 async function pose({x,z,tx,tz,floor}){
  await page.evaluate(({x,z,tx,tz,floor})=>{const t=window.wallCheck,y=t.floors[floor].elevation;t.walker.setView({position:[x,y+1.65,z],target:[tx,y+1.55,tz],fov:58});Object.assign(t.walker.actor,{floor,outside:false,y});},{x,z,tx,tz,floor});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 }
 for(const [name,x,z,tx,tz,floor] of views){
  await pose({x,z,tx,tz,floor});
  await page.screenshot({path:fileURLToPath(new URL(`${mode}-${name}.png`,destination))});
 }
 const movements=[];
 if(mode==='after')for(const floor of [0,1])for(const side of [-1,1])for(const reverse of [false,true]){
  const route=[[side*36.3,13.8],[side*35.3,18.1],[side*33.3,22.5],[side*33.3,24.5],[side*37.7,24.5]],points=reverse?[...route].reverse():route;
  const result=await page.evaluate(({floor,points})=>{
   const t=window.wallCheck,walker=t.walker,y=t.floors[floor].elevation;
   function face(x,z,tx,tz){walker.setView({position:[x,y+1.8,z],target:[tx,y+1.8,tz]});Object.assign(walker.actor,{floor,outside:false,y});}
   face(...points[0],...points[1]);
   for(const [x,z] of points.slice(1)){
    face(walker.actor.x,walker.actor.z,x,z);walker.keys.add('KeyW');
    for(let n=0;n<3000&&Math.hypot(walker.actor.x-x,walker.actor.z-z)>.055;n++)walker.update(.008);
    walker.keys.clear();if(Math.hypot(walker.actor.x-x,walker.actor.z-z)>.06)return {pass:false,x:walker.actor.x,z:walker.actor.z,target:[x,z]};
   }
   return {pass:walker.actor.floor===floor,end:[walker.actor.x,walker.actor.z]};
  },{floor,points});
  assert(result.pass,`Actual explore movement follows both room approaches: ${JSON.stringify(result)}`);movements.push({floor,side,reverse,...result});
 }
 await page.setViewportSize({width:390,height:844});await pose({x:-35.9,z:17.5,tx:-34.5,tz:20,floor:0});
 await page.screenshot({path:fileURLToPath(new URL(`${mode}-mobile.png`,destination))});
 assert.deepEqual(errors,[]);await writeFile(new URL(`${mode}.json`,destination),JSON.stringify({views:views.length+1,movements,errors},null,2)+'\n');
 console.log(`PASS: ${mode} ${views.length+1} four-floor desktop/mobile views, ${movements.length} actual explore movement passes; no page or shader errors.`);
}finally{await browser.close();server.kill();}
