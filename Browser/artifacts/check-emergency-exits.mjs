import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {makeFloors} from '../dist/floors.mjs';
import {selectEscapeRoutes} from '../dist/escape-routes.mjs';

const quick=process.argv.includes('--quick');
let port;
const layout=JSON.parse(await readFile(new URL('../dist/layout.json',import.meta.url)));
const candidates=makeFloors(layout),key=(floor,exit)=>floor+':'+exit.x+','+exit.z;
const randomFor=initial=>{let seed=initial;return ()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);};
// Pick a small deterministic collection of real random draws covering every door.
const coverage=new Set(),seeds=[];
for(let draw=1;coverage.size<14&&draw<100;draw++){
 const seed=draw*7919;
 const keys=selectEscapeRoutes(candidates,randomFor(seed)).flatMap((f,i)=>f.exits.map(e=>key(i,e)));
 if(keys.some(k=>!coverage.has(k))){seeds.push(seed);keys.forEach(k=>coverage.add(k));}
}
assert.equal(coverage.size,14);
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,PORT:'0'}});
let browser;
try{
 port=await new Promise((resolve,reject)=>{
  server.stdout.on('data',data=>{const match=String(data).match(/127\.0\.0\.1:(\d+)/);if(match)resolve(Number(match[1]));});
  server.stderr.on('data',data=>reject(new Error(String(data))));server.on('exit',code=>reject(new Error('Server exited: '+code)));
 });
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1300,height:900}}),errors=[],results=[],visited=new Set();
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&m.text().includes('THREE'))errors.push(m.text());});
 await page.route('https://**/*',async route=>{
  if(route.request().url().startsWith('https://cdn.jsdelivr.net/'))await route.fulfill({contentType:'text/javascript',body:await readFile(new URL('../dist/vendor/'+route.request().url().split('/').at(-1),import.meta.url),'utf8')});
  else await route.abort();
 });
 await page.route('**/game.mjs',async route=>{
  let source=await readFile(new URL('../dist/game.mjs',import.meta.url),'utf8');
  source=source.replace('floors=selectEscapeRoutes(makeFloors(layout));','floors=selectEscapeRoutes(makeFloors(layout),window.exitRandom||Math.random);');
  const hook=`
window.exitTest={
 get ready(){return ready;},get state(){return state;},get floors(){return floors;},get lights(){return lights;},get artPanels(){return artPanels;},
 player,keys,showFloor,update,drawMap,start,get arrival(){return arrivalCutscene;},get escape(){return escapeCutscene;},
 pose(x,z,floor,dx=0,dz=-1){
  keys.clear();closeArtViewer();Object.assign(player,{x,z,floor});showFloor();yaw=Math.atan2(-dx,-dz);pitch=0;hold=0;stairHold=0;stairLatch=false;elapsed=0;audioOn=false;
  camera.position.set(x,floor*FLOOR_HEIGHT+1.65,z);state='play';update(.001);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;drawMap();
 },
 map(value){$('floorMap').hidden=!value;drawMap();},play(){state='play';},
 inspect(candidates){
  return floors.map((floor,floorIndex)=>{
   const group=floorGroups[floorIndex];group.updateWorldMatrix(true,true);
   return candidates[floorIndex].exits.map(exit=>{
    const {dx,dz}=exitDirection(exit),x=exit.x*floor.cellSize,z=exit.z*floor.cellSize;
    const ray=new THREE.Raycaster(new THREE.Vector3(x-dx*1.5,floorIndex*FLOOR_HEIGHT+1.65,z-dz*1.5),new THREE.Vector3(dx,0,dz),0,3);
    return {exit,floor:floorIndex,active:floor.exits.some(e=>e.x===exit.x&&e.z===exit.z),
     door:ray.intersectObjects(group.children,true)[0]?.object.name==='Layout Panel',
     lamp:lights.some(l=>l.floor===floorIndex&&l.x===x&&l.z===z&&l.color===0x77db97),
     artClear:artPanels.filter(a=>a.floor===floorIndex).every(a=>Math.hypot(a.x-x,a.z-z)>=3.5)};
   });
  });
 }
};`;
  await route.fulfill({contentType:'text/javascript',body:source+hook});
 });
 await page.addInitScript(()=>{
  const value=new URL(location.href).searchParams.get('testSeed');
  if(value!==null){
   let seed=Number(value),i=14;
   window.exitRandom=value==='upper'?()=>{const n=--i;return (n>=9?13-n:n)/(n+1);}:value==='ground'?()=>.999999:()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
  }
 });
 for(const seed of (quick?seeds.slice(0,1):[...seeds,'ground','upper'])){
  await page.goto('http://127.0.0.1:'+port+'/?testSeed='+seed);
  await page.waitForFunction(()=>window.exitTest?.ready,null,{timeout:120000});
  await page.locator('#start').click();
  await page.evaluate(()=>window.exitTest.arrival.update(3));
  const inspection=await page.evaluate(candidates=>window.exitTest.inspect(candidates),candidates);
  const active=inspection.flat().filter(e=>e.active);
  assert.equal(active.length,5);
  for(const entry of inspection.flat()){
   assert.equal(entry.door,entry.active,entry.exit.name+' geometry');
   assert.equal(entry.lamp,entry.active,entry.exit.name+' lamp');
   if(entry.active)assert(entry.artClear,entry.exit.name+' artwork clearance');
  }
  if(seed==='ground')assert.equal(active.filter(e=>e.floor===1).length,0);
  if(seed==='upper')assert.equal(active.filter(e=>e.floor===0).length,0);
  for(const floorIndex of [0,1]){
   await page.evaluate(floor=>{const t=window.exitTest;t.pose(50,47.5,floor);t.map(true);},floorIndex);
   assert.equal(await page.locator('#floorExits').textContent(),active.filter(e=>e.floor===floorIndex).length+' EXITS THIS FLOOR');
   if(!quick&&(seed===seeds[0]||seed==='upper'))await page.screenshot({path:'Browser/artifacts/emergency-exits-map-'+seed+'-'+floorIndex+'.png'});
   await page.evaluate(()=>window.exitTest.map(false));
  }
  for(const entry of active){
   const id=key(entry.floor,entry.exit);if(visited.has(id))continue;
   const {exit,floor}=entry,dx=exit.axis==='x'?exit.facing:0,dz=exit.axis==='x'?0:exit.facing;
   await page.evaluate(({exit,floor,dx,dz})=>{const t=window.exitTest;t.start();t.arrival.update(3);t.pose(exit.x*2.5-dx*1.7,exit.z*2.5-dz*1.7,floor,dx,dz);},{exit,floor,dx,dz});
   assert.equal(await page.locator('#exitName').textContent(),exit.name);
   assert.equal(await page.locator('#interact b').textContent(),'HOLD E TO ESCAPE');
   assert(await page.locator('#interact').isVisible());
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   await page.screenshot({path:'Browser/artifacts/emergency-exits-door-'+floor+'-'+exit.x+'-'+exit.z+'.png'});
   if(exit.axis==='x'&&floor===1){
    await page.setViewportSize({width:390,height:844});await page.screenshot({path:'Browser/artifacts/emergency-exits-mobile.png'});await page.setViewportSize({width:1300,height:900});
   }
   await page.evaluate(()=>window.exitTest.play());await page.keyboard.down('e');
   await page.waitForFunction(()=>['cutscene','won'].includes(window.exitTest.state),null,{timeout:10000});await page.keyboard.up('e');
   await page.evaluate(()=>window.exitTest.escape.skip());
   assert.equal(await page.locator('#resultTitle').textContent(),'You made it out.');
   assert((await page.locator('#resultBody').textContent()).includes(exit.name.toLowerCase()));
   assert((await page.locator('#resultBody').textContent()).includes('4 other routes are waiting.'));
   visited.add(id);
  }
  const after=await page.evaluate(()=>{const t=window.exitTest;t.start();t.arrival.update(3);return t.floors.map(f=>f.exits);});
  assert.deepEqual(after,inspection.map(entries=>entries.filter(e=>e.active).map(e=>e.exit)),'Retry preserves route set');
  // Attempt every inactive location and the removed portico on both floors.
  for(const entry of [...inspection.flat().filter(e=>!e.active),...[0,1].map(floor=>({floor,exit:{x:20,z:21}}))]){
   await page.evaluate(({floor,exit})=>{const t=window.exitTest;t.pose(exit.x*2.5,exit.z*2.5,floor);t.play();t.keys.add('KeyE');t.update(.6);t.keys.clear();},entry);
   assert.equal(await page.evaluate(()=>window.exitTest.state),'play');
  }
  results.push({seed,active:active.map(e=>({floor:e.floor,...e.exit})),inspection});
  console.log('PASS WebGL load '+seed+': five doors/lamps, maps, disabled exits, retry stability.');
 }
 assert.equal(visited.size,quick?5:14,'Keyboard escape checked through every selected route');
 // Unseeded page reloads use production randomness.
 const reloads=[];
 for(let i=0;i<(quick?0:3);i++){
  await page.goto('http://127.0.0.1:'+port+'/');
  await page.waitForFunction(()=>window.exitTest?.ready,null,{timeout:120000});
  const routes=await page.evaluate(()=>window.exitTest.floors.map(f=>f.exits));
  assert.equal(routes.flat().length,5);reloads.push(routes);
 }
 if(!quick)assert(new Set(reloads.map(r=>JSON.stringify(r))).size>1,'Fresh loads reroll the five-route set');
 assert.deepEqual(errors,[]);
 await writeFile('Browser/artifacts/emergency-exits-validation.json',JSON.stringify({results,keyboardEscapes:[...visited],reloads,errors},null,2)+'\n');
 console.log(quick?'PASS: five active WebGL doors and keyboard escapes, inactive/removed exits disabled, desktop/mobile views and no browser errors.':'PASS: all 14 candidate doors/keyboard escapes, inactive/removed exits, real reloads, zero-exit floors, desktop/mobile views and no browser errors.');
}finally{await browser?.close();server.kill();}

