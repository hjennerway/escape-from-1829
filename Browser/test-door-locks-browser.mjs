import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const destination=new URL('./artifacts/door-locks-reference/',import.meta.url);await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();
const instrument=`
window.lockTest={get ready(){return ready&&(interiorLoader?.complete??true)},get world(){return escapeWorld},get progress(){return escapeProgress},get grounds(){return escapeGrounds},
begin(){window.__manual=true;start();arrivalCutscene.update(3);enemyReleaseAt=Infinity;state='play';keys.clear();document.getElementById('result').hidden=true;uiPlaying(true)},
sync:syncEscapeWorld,
snapshot(){return escapeWorld.doorLocks.map(d=>({floor:d.floor,id:d.exit.id,x:d.exit.x,visible:d.group.visible,locked:escapeProgress.doorLocked(d.exit)}))},
westRoundTrips(){return escapeWorld.doorLocks.filter(d=>d.exit.x<0).map(d=>{const exit={...d.exit,floor:d.floor};Object.assign(player,{...exit.inside,floor:d.floor,y:floors[d.floor].elevation,outside:false,stair:null});showFloor();const allowed=useDoor(exit),outside=player.outside;useDoor(exit);return {floor:d.floor,id:exit.id,allowed,outside,returned:!player.outside&&player.floor===d.floor}})},
lockCount(){return floorGroups.reduce((n,g)=>{g.traverse(o=>{if(o.userData.doorLock)n++});return n},0)},
view(floor,id,detail=false){const d=escapeWorld.doorLocks.find(d=>d.floor===floor&&d.exit.id===id),normal=new THREE.Vector3(d.exit.axis==='x'?-d.exit.facing:0,0,d.exit.axis==='z'?-d.exit.facing:0);const target=d.group.position.clone();target.y=floors[floor].elevation+1.48;this.draw(target,normal,detail?1.35:2.5,false,floor)},
gate(){const g=escapeWorld.gates[0];this.draw(new THREE.Vector3(g.x,g.y+1.1,g.z),new THREE.Vector3(-g.dx,0,-g.dz),2.2,false,1)},
corridor(id,reverse=false){const d=escapeGrounds.workshops.lockedDoors.find(d=>d.id===id),normal=new THREE.Vector3(d.toward[0]-d.point[0],0,d.toward[1]-d.point[1]).normalize().multiplyScalar(reverse?-1:1);this.draw(new THREE.Vector3(d.point[0],1.60,d.point[1]),normal,3.0,true,0)},
draw(target,normal,distance,outside,floor){keys.clear();Object.assign(player,{x:target.x+normal.x*distance,z:target.z+normal.z*distance,y:outside?0:floors[floor].elevation,outside,floor,stair:null});showFloor();camera.position.set(player.x,player.y+1.65,player.z);camera.lookAt(target);camera.getWorldDirection(tmp);const active=outside?exterior.scene:scene;active.add(torch,torchTarget);torch.position.copy(camera.position);torchTarget.position.copy(camera.position).addScaledVector(tmp,12);if(outside){exterior.lighting.setNight(false);escapeGrounds.update(0,player)}renderer.toneMappingExposure=outside?1.25:1;renderer.render(active,camera)},
tryLocked(){const d=escapeWorld.doorLocks.find(d=>d.exit.id!==escapeProgress.run.exitId&&d.floor===0);Object.assign(player,{...d.exit.inside,floor:d.floor,y:floors[d.floor].elevation,outside:false,stair:null});return {allowed:useDoor(d.exit),visible:d.group.visible,message:interactionMessage}},
restart(){this.begin();return this.snapshot()}
};`;
let browser;const errors=[],results={};
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'reduce'});
 page.setDefaultTimeout(180000);page.setDefaultNavigationTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text())});
 await page.route('https://**/*',r=>r.abort());
 const source=(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');
 await page.route('**/game.mjs',r=>r.fulfill({contentType:'text/javascript',body:source+instrument}));
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.lockTest?.ready);await page.evaluate(()=>lockTest.begin());
 results.initial=await page.evaluate(()=>lockTest.snapshot());assert.equal(results.initial.length,24);assert(results.initial.every(d=>d.visible&&d.locked));
 const capture=async(name,view)=>{await page.evaluate(view);await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});};
 await capture('reception-locked',()=>lockTest.view(0,'D1'));
 await capture('reception-hardware-detail',()=>lockTest.view(0,'D1',true));
 await capture('upper-fire-exit',()=>lockTest.view(3,'F4'));
 await capture('basement-locked',()=>lockTest.view(2,'D11'));
 await capture('staff-grille',()=>lockTest.gate());
 results.attempt=await page.evaluate(()=>lockTest.tryLocked());assert(!results.attempt.allowed&&results.attempt.visible);assert.match(results.attempt.message,/Bolted|Locked/);
 await page.evaluate(()=>{lockTest.progress.interact('plan');lockTest.sync()});
 results.key=await page.evaluate(()=>lockTest.snapshot());const keyExit=await page.evaluate(()=>lockTest.progress.run.exitId);const keyCount=results.key.filter(d=>d.x<0||d.id===keyExit).length;assert.equal(results.key.filter(d=>!d.visible).length,keyCount);assert(results.key.every(d=>d.visible===d.locked));
 results.westTrips=await page.evaluate(()=>lockTest.westRoundTrips());assert(results.westTrips.every(d=>d.allowed&&d.outside&&d.returned),'Actual west-side door transitions work on all floors');assert.deepEqual([...new Set(results.westTrips.map(d=>d.floor))].sort(),[0,1,2,3]);
 await capture('service-door-unlocked',()=>lockTest.view(0,lockTest.progress.run.exitId));
 await page.evaluate(()=>{lockTest.progress.capture();lockTest.sync()});assert((await page.evaluate(()=>lockTest.snapshot())).every(d=>d.visible));
 await page.evaluate(()=>{lockTest.progress.interact('reclaim');lockTest.sync()});assert.equal((await page.evaluate(()=>lockTest.snapshot())).filter(d=>!d.visible).length,keyCount);
 await page.keyboard.press('-');await page.keyboard.press('u');assert((await page.evaluate(()=>lockTest.snapshot())).every(d=>!d.visible));
 await capture('reception-unlocked',()=>lockTest.view(0,'D1'));
 results.corridors=await page.evaluate(()=>{
  const w=lockTest.grounds.workshops,locks=[];w.group.traverse(o=>{if(o.userData.doorLock)locks.push(o)});
  return w.lockedDoors.map(d=>{const lock=locks.find(o=>o.userData.doorLock.id===d.id),chain=lock?.getObjectByName('Heavy interlocking door chain');return {id:d.id,visible:lock?.visible,faces:lock?.userData.doorLock.faces,links:chain?.count,runs:chain?.userData.chainRuns.length,roundLock:!!lock?.getObjectByName('Round weathered iron padlock'),message:lockTest.grounds.use(lockTest.grounds.nodes.find(n=>n.id===d.id))}});
 });
 assert.equal(results.corridors.length,9);assert(results.corridors.every(d=>d.visible&&d.faces.length===2&&d.links>=30&&/locked/.test(d.message)),'All nine corridor pairs stay chained when asylum bypass is active');
 assert(results.corridors.every(d=>d.runs===8&&d.roundLock),'All corridor pairs have four connected chain runs and a round iron lock on each face');
 for(const [i,door] of results.corridors.entries()){
  await page.evaluate(id=>lockTest.corridor(id),door.id);await page.screenshot({path:fileURLToPath(new URL('corridor-'+i+'.png',destination))});
 }
 await page.evaluate(id=>lockTest.corridor(id,true),results.corridors[0].id);await page.screenshot({path:fileURLToPath(new URL('corridor-reverse.png',destination))});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.keyboard.press('u');await capture('reception-phone',()=>lockTest.view(0,'D1'));
 await page.evaluate(id=>lockTest.corridor(id),results.corridors[0].id);await page.screenshot({path:fileURLToPath(new URL('corridor-phone.png',destination))});
 assert((await page.evaluate(()=>lockTest.restart())).every(d=>d.visible&&d.locked));
 results.restartLocks=await page.evaluate(()=>lockTest.lockCount());assert.equal(results.restartLocks,26,'Restart retains exactly 24 door and two grille locks');
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({results,errors},null,2)+'\n');
 console.log('PASS: GPU views of 24 exit locks, two grilles and all nine corridor pairs; key/capture/reclaim, actual U toggle, desktop/phone, blocked messages and restart without page/shader errors.');
}finally{await browser?.close();server.kill();}
