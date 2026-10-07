import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const out=new URL('./artifacts/stair-floor-signs/',import.meta.url);await mkdir(out,{recursive:true});
const {server,base}=await startTestServer();let browser;const errors=[],results=[];
const instrument=`
window.stairSignTest={get ready(){return ready},get loader(){return interiorLoader},get scene(){return scene},get floors(){return floors},get groups(){return floorGroups},get camera(){return camera},get renderer(){return renderer},
pose(view){const floor=floors[view.floor];Object.assign(player,{x:view.x,z:view.z,y:floor.elevation,floor:view.floor,outside:false,stair:null});state='paused';uiPlaying(true);showFloor();camera.position.set(view.x,floor.elevation+1.65,view.z);camera.lookAt(view.tx,floor.elevation+1.88,view.tz);yaw=camera.rotation.y;pitch=camera.rotation.x;for(const id of ['arrivalFade','result','instructions','interact','hud','pause','touch'])$(id).hidden=true;enemies.forEach(e=>e.mesh.visible=false);}};`;

// Inspect the actual streamed materials and choose player-height views from
// clear navigation positions. Every plaque must be the first visible surface.
async function inspect(page,mode){
 return page.evaluate(async mode=>{
  const t=mode==='explore'?window.stairSignExplore:window.stairSignTest,THREE=await import('/vendor/three.module.js'),{asylumStairSigns}=await import('/asylum-stair-signs.mjs'),{flatWalkable}=await import('/asylum-layout.mjs'),{stairRoute}=await import('/asylum-stairs.mjs');
  const scene=mode==='explore'?t.interior.scene:t.scene,groups=mode==='explore'?t.floors.map(f=>scene.getObjectByName(f.name)):t.groups,views=[],records=[];
  for(const floor of t.floors){
   const group=groups[floor.id],meshes=[],surfaces=[];group.traverse(o=>{if(o.isMesh)surfaces.push(o);if(o.name==='Asylum StairFloorSigns')meshes.push(o);});group.updateMatrixWorld(true);
   const signs=meshes.flatMap(m=>m.userData.labels),expected=asylumStairSigns(floor);
   if(JSON.stringify(signs.slice().sort((a,b)=>a.x-b.x||a.z-b.z))!==JSON.stringify(expected.slice().sort((a,b)=>a.x-b.x||a.z-b.z)))throw Error('Missing or changed floor signs '+floor.id);
   if(new Set(meshes.map(m=>m.material)).size!==1)throw Error('Floor sign texture duplicated across sections');
   const image=meshes[0].material.map?.image;if(!image||image.width!==1024||image.height!==320)throw Error('Floor sign paint missing');
   const pixels=image.data??image.getContext('2d').getImageData(0,0,image.width,image.height).data;
   const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',pixels))].map(b=>b.toString(16).padStart(2,'0')).join('');
   records.push({floor:floor.id,signs,paintHash:hash});
   for(const sign of signs){
    const stair=floor.stairs.find(s=>s.id===sign.stairId),normal=[Math.sin(sign.rotation),Math.cos(sign.rotation)],tangent=[Math.cos(sign.rotation),-Math.sin(sign.rotation)];
    const portals=stair.connections.filter(c=>c.includes(floor.id)).map(c=>{const r=stairRoute(stair,t.floors[c[0]].elevation,t.floors[c[1]].elevation,...c);const p=c[0]===floor.id?r[0]:r.at(-1);return {x:p[0],z:p[2]};});
    const candidates=[...[1.5,2,1,.65,2.5].flatMap(d=>[0,-.8,.8,-1.5,1.5].map(u=>({x:sign.x+normal[0]*d+tangent[0]*u,z:sign.z+normal[1]*d+tangent[1]*u}))),...portals];
    const view=candidates.find(p=>{
     if(!flatWalkable(floor,p.x,p.z))return false;
     const start=new THREE.Vector3(p.x,floor.elevation+1.65,p.z),end=new THREE.Vector3(sign.x+normal[0]*.018,floor.elevation+sign.y,sign.z+normal[1]*.018),delta=end.sub(start),ray=new THREE.Raycaster(start,delta.clone().normalize(),0,delta.length()+.02);
     return ray.intersectObjects(surfaces,false)[0]?.object.name==='Asylum StairFloorSigns';
    });
    if(!view)throw Error('No unobstructed walking view '+floor.id+' '+sign.stairId+' '+sign.x);
    views.push({...view,tx:sign.x,tz:sign.z,floor:floor.id,stair:sign.stairId,text:sign.text});
   }
  }
  return {mode,records,views};
 },mode);
}

try{
 browser=await launchHardwareBrowser();
 for(const mode of ['assets','worker']){
  const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'reduce'});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});await page.route('https://**/*',r=>r.abort());
  if(mode==='worker')await page.route('**/compiled/interior/**',r=>r.fulfill({status:404,body:''}));
  await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8')+instrument}));
  await page.goto(base+'/');await page.waitForFunction(()=>window.stairSignTest?.ready);
  await page.evaluate(()=>window.stairSignTest.loader.startBackground());await page.waitForFunction(()=>window.stairSignTest.loader.complete);
  assert.equal(await page.evaluate(()=>window.stairSignTest.loader.stats.mode),mode);
  const result=await inspect(page,mode);assert.deepEqual(result.records.map(r=>r.signs.length),[4,5,2,2]);results.push(result);
  if(mode==='assets'){
   for(const [i,view] of result.views.entries()){
    await page.evaluate(view=>window.stairSignTest.pose(view),view);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    await page.screenshot({path:fileURLToPath(new URL(`escape-${view.floor}-${view.stair}-${i}.png`,out))});
   }
   await page.setViewportSize({width:390,height:844});
   for(const floor of [2,0,1,3]){
    const view=await page.evaluate(floor=>{const t=window.stairSignTest,sign=t.groups[floor].getObjectByName('Asylum StairFloorSigns').userData.labels.find(s=>s.stairId==='S1');return {floor,x:sign.x,z:sign.z-2.5,tx:sign.x,tz:sign.z};},floor);
    await page.evaluate(view=>window.stairSignTest.pose(view),view);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    await page.screenshot({path:fileURLToPath(new URL(`mobile-${floor}.png`,out))});
   }
  }else assert.deepEqual(result.records,results[0].records,'Worker fallback restores identical signs and aged paint');
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:1200,height:800}});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/explore.mjs',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.stairSignExplore={walker,interior,renderer,floors};const clock=new THREE.Timer();')});});
 await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.stairSignExplore?.interior.loading.complete);
 const explore=await inspect(page,'explore');assert.deepEqual(explore.records,results[0].records,'Explore and Escape share every sign and texture');results.push(explore);
 const view=explore.views.find(v=>v.floor===3&&v.stair==='S5');
 await page.evaluate(view=>{const t=window.stairSignExplore,f=t.floors[view.floor];t.walker.setView({position:[view.x,f.elevation+1.65,view.z],target:[view.tx,f.elevation+1.88,view.tz]});Object.assign(t.walker.actor,{x:view.x,z:view.z,y:f.elevation,floor:view.floor,outside:false,stair:null});t.walker.update(.01);},view);
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL('explore-west-second.png',out))});
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',out),JSON.stringify({results,errors},null,2)+'\n');
 console.log('PASS: all 13 floor signs visible from clear walking positions; compiled/worker aged paint and Escape/Explore parity; every stair/floor and phone views; no page/shader errors.');
}finally{await browser?.close();server.kill();}
