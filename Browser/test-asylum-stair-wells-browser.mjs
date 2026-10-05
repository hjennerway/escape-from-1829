import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
import {stairShape,stairConnection,stairFlights} from './dist/asylum-stairs.mjs';

const mode=process.argv[2]??'after',destination=new URL('./artifacts/stair-well-walls/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await launchHardwareBrowser({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1440,height:850}}),errors=[],views=[],movements=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 if(mode==='before')for(const source of ['asylum-architecture','asylum-stairs','asylum-layout']){
  await page.route(`**/${source}.mjs`,async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL(`${source}-before.mjs`,destination),'utf8')}));
 }
 await page.route('**/explore.mjs',async route=>{
  const response=await route.fetch();
  const body=(await response.text())
   .replace('const clock=new THREE.Timer();','window.wellCheck={walker,interior,renderer,floors,camera:exterior.camera,freeze:true};const clock=new THREE.Timer();')
   .replace('else if(input.active)walker.update(dt);','else if(input.active&&!window.wellCheck.freeze)walker.update(dt);');
  await route.fulfill({response,body});
 });
 await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.wellCheck?.renderer.info.render.frame>2);
 await page.addStyleTag({content:'#layoutControls,#walkTouch,#exploreDoor,#lookHint,#look,.vignette,.controls,.hint{display:none!important}'});
 async function pose(position,target,floor){
  await page.evaluate(({position,target,floor})=>{
   const t=window.wellCheck;t.walker.setView({position,target,fov:65});
   Object.assign(t.walker.actor,{floor,outside:false,y:position[1]-1.8,stair:null});t.interior.update(t.walker.actor);
  },{position,target,floor});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 }
 const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
 for(const stair of plan.stairs)for(const [lower,upper] of stair.connections){
  const connection=stairConnection(stair,lower,upper),s=stairShape(connection),lo=plan.floors[lower].elevation,hi=plan.floors[upper].elevation,mid=(lo+hi)/2;
  let poses;
  if(connection.straightFlight){
   const [[a,b]]=stairFlights(connection,lo,hi),dz=Math.sign(b[2]-a[2]);
   poses=[['straight-bottom',[a[0],lo+1.8,a[2]-dz*.5],[b[0],hi+1.5,b[2]],lower],['straight-top',[b[0],hi+1.8,b[2]+dz*.5],[a[0],lo+1.5,a[2]],upper]];
  }else poses=[
   ['approach',[s.left,lo+1.8,s.portal],[s.innerRight,lo+1.5,s.back-.3],lower],
   ['lower-flight',[s.left,(lo+mid)/2+1.8,(s.front+s.back)/2],[s.right,(lo+mid)/2+1.6,s.back+.3],lower],
   ['return',[(s.left+s.right)/2,mid+1.8,s.rear],[(s.left+s.right)/2,mid+1.6,s.front],lower],
   ['arrival',[s.right,hi+1.8,s.portal],[s.innerLeft,hi+1.5,s.back-.3],upper],
  ];
  for(const [name,position,target,floor] of poses){
   await pose(position,target,floor);
   await page.screenshot({path:fileURLToPath(new URL(`${mode}-${stair.id}-${lower}-${upper}-${name}.png`,destination))});views.push({stair:stair.id,lower,upper,name});
  }
  if(mode==='after')for(const reverse of [false,true]){
   const movement=await page.evaluate(async({id,lower,upper,reverse})=>{
    const {stairRoute,stairDeparture}=await import('/asylum-layout.mjs'),t=window.wellCheck,w=t.walker;
    const stair=t.floors[lower].stairs.find(s=>s.id===id),route=stairRoute(stair,t.floors[lower].elevation,t.floors[upper].elevation,lower,upper);
    const points=reverse?[...route].reverse():route,startFloor=reverse?upper:lower,endFloor=reverse?lower:upper;
    const start=stairDeparture(t.floors[startFloor],points[0]),end=stairDeparture(t.floors[endFloor],points.at(-1));
    w.setView({position:[start.x,t.floors[startFloor].elevation+1.8,start.z],target:[points[0][0],points[0][1]+1.8,points[0][2]]});
    Object.assign(w.actor,{floor:startFloor,outside:false,y:t.floors[startFloor].elevation,stair:null});
    function go(x,z){
     for(let n=0;n<4000&&Math.hypot(w.actor.x-x,w.actor.z-z)>.025;n++){
      const dx=x-w.actor.x,dz=z-w.actor.z,d=Math.hypot(dx,dz);
      w.look((t.camera.rotation.y-Math.atan2(-dx,-dz))/.002,0);w.keys.add('KeyW');w.update(Math.min(.008,d/5));
     }
     w.keys.clear();return Math.hypot(w.actor.x-x,w.actor.z-z)<.04;
    }
    const passes=[...points.map(p=>go(p[0],p[2])),go(end.x,end.z)];
    return {passes,floor:w.actor.floor,stair:w.actor.stair?.id??null,outside:w.actor.outside};
   },{id:stair.id,lower,upper,reverse});
   assert(movement.passes.every(Boolean)&&movement.floor===(reverse?lower:upper)&&!movement.stair&&!movement.outside,`Walk ${stair.id}/${lower}-${upper}/${reverse}: ${JSON.stringify(movement)}`);
   movements.push({stair:stair.id,lower,upper,reverse,...movement});
  }
 }
 await page.setViewportSize({width:390,height:844});
 const s=stairShape(plan.stairs.find(s=>s.id==='S1'));
 await pose([s.left,1.8,s.portal],[s.innerRight,1.5,s.back-.3],0);
 await page.screenshot({path:fileURLToPath(new URL(`${mode}-mobile.png`,destination))});
 assert.deepEqual(errors,[]);
 await writeFile(new URL(`${mode}.json`,destination),JSON.stringify({views,mobile:true,movements,errors},null,2)+'\n');
 console.log(`PASS: ${mode}, ${views.length+1} desktop/mobile well views, ${movements.length} actual stair walks, no page or shader errors.`);
}finally{await browser?.close();server.kill();}
