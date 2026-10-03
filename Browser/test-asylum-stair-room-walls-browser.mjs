import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const mode=process.argv[2]??'after',destination=new URL('./artifacts/stair-room-walls/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1500,height:800}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 if(mode==='before')await page.route('**/asylum-plan.json',async route=>route.fulfill({contentType:'application/json',body:await readFile(new URL('plan-before.json',destination),'utf8')}));
 await page.route('**/explore.mjs',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.stairWallCheck={walker,interior,renderer,floors,camera:exterior.camera};const clock=new THREE.Timer();')});
 });
 await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.stairWallCheck?.renderer.info.render.frame>2);
 await page.addStyleTag({content:'#layoutControls,#walkTouch,#exploreDoor,#lookHint,#look,.vignette{display:none!important}'});
 async function pose(x,z,tx,tz,floor){
  const result=await page.evaluate(async({x,z,tx,tz,floor})=>{
   const t=window.stairWallCheck,y=t.floors[floor].elevation,{flatWalkable}=await import('/asylum-layout.mjs');
   t.walker.setView({position:[x,y+1.65,z],target:[tx,y+1.5,tz],fov:65});
   Object.assign(t.walker.actor,{floor,outside:false,y});t.interior.update(t.walker.actor);
   return flatWalkable(t.floors[floor],x,z);
  },{x,z,tx,tz,floor});
  assert(result,`The ${floor} camera stands on a clear landing or room floor`);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 }
 const views=[];
 for(const floor of [0,1])for(const side of [-1,1])for(const face of ['landing','room']){
  const name=`${side<0?'west':'east'}-${floor===0?'ground':'first'}-${face}`;
  const x=side*(face==='landing'?35.6:33.5),z=face==='landing'?-31.55:-34.7,tx=side*31.4,tz=face==='landing'?-33.5:-31.7;
  await pose(x,z,tx,tz,floor);
  await page.screenshot({path:fileURLToPath(new URL(`${mode}-${name}.png`,destination))});views.push(name);
 }
 const movements=[];
 if(mode==='after')for(const stairId of ['S3','S4'])for(const reverse of [false,true]){
  const result=await page.evaluate(async({stairId,reverse})=>{
   const {stairRoute,stairDeparture}=await import('/asylum-layout.mjs'),t=window.stairWallCheck,walker=t.walker;
   const stair=t.floors[0].stairs.find(s=>s.id===stairId),route=stairRoute(stair,0,4.2),points=reverse?[...route].reverse():route;
   const startFloor=reverse?1:0,endFloor=reverse?0:1,arrival=stairDeparture(t.floors[startFloor],points[0]),departure=stairDeparture(t.floors[endFloor],points.at(-1));
   walker.setView({position:[arrival.x,t.floors[startFloor].elevation+1.8,arrival.z],target:[points[0][0],points[0][1]+1.8,points[0][2]]});
   Object.assign(walker.actor,{floor:startFloor,outside:false,y:t.floors[startFloor].elevation});
   function go(x,z){
    const actor=walker.actor;
    for(let n=0;n<4000&&Math.hypot(actor.x-x,actor.z-z)>.045;n++){
     const dx=x-actor.x,dz=z-actor.z;
     walker.look((t.camera.rotation.y-Math.atan2(-dx,-dz))/.002,0);
     walker.keys.add('KeyW');walker.update(.008);
    }
    walker.keys.clear();return Math.hypot(actor.x-x,actor.z-z)<.05;
   }
   const passes=[...points.map(p=>go(p[0],p[2])),go(departure.x,departure.z)];
   return {passes,floor:walker.actor.floor,stair:walker.actor.stair?.id??null,outside:walker.actor.outside,end:[walker.actor.x,walker.actor.z]};
  },{stairId,reverse});
  assert(result.passes.every(Boolean)&&result.floor===(reverse?0:1)&&result.stair===null&&!result.outside,`${stairId} actual exploration walks and releases both flights: ${JSON.stringify(result)}`);
  movements.push({stairId,reverse,...result});
 }
 await page.setViewportSize({width:390,height:844});await pose(-35.6,-31.55,-31.4,-33.5,1);
 await page.screenshot({path:fileURLToPath(new URL(`${mode}-mobile.png`,destination))});
 assert.deepEqual(errors,[]);
 await writeFile(new URL(`${mode}.json`,destination),JSON.stringify({views:[...views,'mobile'],movements,errors},null,2)+'\n');
 console.log(`PASS: ${mode}, ${views.length+1} rear-stair wall views on both wings/floors, ${movements.length} actual exploration stair walks, no page or shader errors.`);
}finally{await browser.close();server.kill();}
