import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const destination=new URL('./artifacts/stair-lighting/',import.meta.url);
await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;
const instrument=`
window.stairLightTest={get ready(){return ready;},
 start(){start();arrivalCutscene.update(3);state='paused';torch.visible=false;enemies.forEach(e=>e.mesh.visible=false);escapeWorld.gates.forEach(g=>escapeProgress.run.opened.add(g.id));escapeWorld.sync();},
 async survey(){
  const {stairDeparture}=await import('./asylum-layout.mjs');
  const results=[],captures=[],programs=new Set();
  for(const floor of floors)for(const stair of floor.stairs)for(const [lower,upper] of stair.connections){
   if(lower!==floor.id)continue;
   const route=stairRoute(stair,floors[lower].elevation,floors[upper].elevation,lower,upper);
   for(const descending of [false,true]){
    const origin=descending?upper:lower,destination=descending?lower:upper,points=descending?[...route].reverse():route;
    const [x,y,z]=points[0];Object.assign(player,{x,y,z,floor:origin,stair:{id:stair.id,lower,upper,route},outside:false});indoorJump.reset();showFloor();
    for(const point of points){
     for(let step=0;step<400&&Math.hypot(player.x-point[0],player.z-point[2])>.015;step++){
      const dx=point[0]-player.x,dz=point[2]-player.z,d=Math.hypot(dx,dz),distance=Math.min(d,.04);
      indoorJump.update(player,dx/d*distance,dz/d*distance,1/120);
     }
     if(Math.hypot(player.x-point[0],player.z-point[2])>.025)throw Error('Stair blocked: '+stair.id+' '+origin+' '+JSON.stringify(player));
    }
    const endpoint={x:player.x,y:player.y,z:player.z,floor:player.floor,stair:!!player.stair};
    // Identical geometry, camera, textures and actor position: compare the
    // final stair frame with the lighting used once the floor handoff completes.
    camera.position.set(player.x,player.y+1.65,player.z);camera.rotation.set(-.42,Math.PI/2,0);
    interiorLights.update(player);renderer.render(scene,camera);const first=canvas.toDataURL('image/png');
    const wall=floorGroups[destination].getObjectByName('Asylum floor');
    programs.add(renderer.properties.get(wall.material).currentProgram.id);
    interiorLights.update({...player,floor:destination,stair:null});renderer.render(scene,camera);
    const settled=canvas.toDataURL('image/png');
    const departure=stairDeparture(floors[destination],points.at(-1));
    for(let step=0;step<100&&player.floor!==destination;step++){
     const dx=departure.x-player.x,dz=departure.z-player.z,d=Math.hypot(dx,dz),distance=Math.min(d,.04);
     if(d<.001)break;indoorJump.update(player,dx/d*distance,dz/d*distance,1/120);
    }
    const name=stair.id+'-'+lower+'-'+upper+'-'+(descending?'down':'up');
    results.push({name,endpoint,departed:{floor:player.floor,stair:!!player.stair},firstMatchesSettled:first===settled,lightCount:interiorLights.pool.length});
    if(stair.id==='S1'||stair.id==='S5'&&upper===3)captures.push({name,image:first});
   }
  }
  return {results,captures,programs:[...programs]};
 },
 async phone(){
  const stair=floors[0].stairs.find(s=>s.id==='S1'),route=stairRoute(stair,0,floors[1].elevation,0,1),[x,y,z]=route.at(-1);
  Object.assign(player,{x,y,z,floor:0,stair:{lower:0,upper:1,route},outside:false});showFloor();
  camera.position.set(x,y+1.65,z);camera.rotation.set(-.42,Math.PI/2,0);interiorLights.update(player);renderer.render(scene,camera);
  const first=canvas.toDataURL('image/png');interiorLights.update({...player,floor:1,stair:null});renderer.render(scene,camera);
  return {image:first,firstMatchesSettled:first===canvas.toDataURL('image/png')};
 }};`;
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+instrument}));
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.stairLightTest?.ready);
 await page.evaluate(()=>window.stairLightTest.start());
 const survey=await page.evaluate(()=>window.stairLightTest.survey());
 assert.equal(survey.results.length,16);
 for(const result of survey.results){
  assert(result.endpoint.stair,result.name+' reaches the landing while still on the flight');
  assert(result.firstMatchesSettled,result.name+' must show the settled floor appearance immediately');
  assert(!result.departed.stair,result.name+' physically leaves the flight');
  assert.notEqual(result.departed.floor,result.endpoint.floor,result.name+' completes the ordinary floor handoff');
  assert.equal(result.lightCount,12);
 }
 assert.equal(survey.programs.length,1,'All floor transitions retain the same floor shader');
 for(const {name,image} of survey.captures)await writeFile(new URL(name+'.png',destination),Buffer.from(image.split(',')[1],'base64'));
 delete survey.captures;
 await page.setViewportSize({width:390,height:844});
 const phone=await page.evaluate(()=>window.stairLightTest.phone());assert(phone.firstMatchesSettled);
 await writeFile(new URL('phone-upper-landing.png',destination),Buffer.from(phone.image.split(',')[1],'base64'));
 // Explore consumes the same live actor/lighting path, without Escape's NPCs.
 await page.route('**/explore.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/explore.mjs',import.meta.url),'utf8')).replace('const clock=new THREE.Timer();','window.stairExplore={walker,interior,renderer,floors,exterior};const clock=new THREE.Timer();')}));
 await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.stairExplore?.renderer.info.render.frame>2);
 const explore=await page.evaluate(async()=>{
  const {stairRoute}=await import('./asylum-layout.mjs'),t=window.stairExplore,s=t.floors[0].stairs.find(s=>s.id==='S1'),route=stairRoute(s,0,t.floors[1].elevation,0,1),[x,y,z]=route.at(-1),actor=t.walker.actor,camera=t.exterior.camera;
  Object.assign(actor,{x,y,z,floor:0,stair:{lower:0,upper:1,route},outside:false});camera.position.set(x,y+1.8,z);camera.rotation.set(-.42,Math.PI/2,0);
  t.interior.update(actor);t.renderer.render(t.interior.scene,camera);const first=t.renderer.domElement.toDataURL('image/png');
  t.interior.update({...actor,floor:1,stair:null});t.renderer.render(t.interior.scene,camera);
  return {image:first,firstMatchesSettled:first===t.renderer.domElement.toDataURL('image/png')};
 });
 assert(explore.firstMatchesSettled,'Explore also lights the arrival floor before the handoff');
 await writeFile(new URL('explore-upper-landing.png',destination),Buffer.from(explore.image.split(',')[1],'base64'));
 assert.deepEqual(errors,[]);
 await writeFile(new URL('validation.json',destination),JSON.stringify({survey,phone:phone.firstMatchesSettled,explore:explore.firstMatchesSettled,errors},null,2)+'\n');
 console.log('PASS: 16 physically climbed stair journeys, identical first/settled landing textures, fixed shader/light budget, Escape/Explore and portrait GPU views, no page/shader errors.');
}finally{await browser?.close();server.kill();}
