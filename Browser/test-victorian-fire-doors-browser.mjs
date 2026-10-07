import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const out=new URL('./artifacts/victorian-fire-doors/',import.meta.url);await mkdir(out,{recursive:true});
const {server,base}=await startTestServer();let browser;const errors=[],results=[];
const instrument=`
window.periodDoorTest={get ready(){return ready&&(interiorLoader?.complete??true)},
begin(){window.__manual=true;start();arrivalCutscene.update(3);enemyReleaseAt=Infinity;state='play';keys.clear();$('result').hidden=true;uiPlaying(true)},
get progress(){return escapeProgress},sync:syncEscapeWorld,
snapshot(){let signs=0;scene.traverse(o=>{if(/Emergency exit signage|Illuminated exit route sign|Push bar instruction/.test(o.name))signs++});return {mode:interiorLoader.stats.mode,signs,doors:escapeWorld.doorLocks.map(d=>({floor:d.floor,id:d.exit.id,visible:d.group.visible,locked:escapeProgress.doorLocked(d.exit)}))}},
view(floor,id,oblique=false){const d=escapeWorld.doorLocks.find(d=>d.floor===floor&&d.exit.id===id),normal=new THREE.Vector3(d.exit.axis==='x'?-d.exit.facing:0,0,d.exit.axis==='z'?-d.exit.facing:0),target=d.group.position.clone();target.y=floors[floor].elevation+1.48;const tangent=new THREE.Vector3(normal.z,0,-normal.x);const eye=target.clone().addScaledVector(normal,2.6).addScaledVector(tangent,oblique?.8:0);Object.assign(player,{x:eye.x,z:eye.z,y:floors[floor].elevation,floor,outside:false,stair:null});showFloor();camera.position.set(eye.x,player.y+1.65,eye.z);camera.lookAt(target);camera.getWorldDirection(tmp);scene.add(torch,torchTarget);torch.position.copy(camera.position);torchTarget.position.copy(camera.position).addScaledVector(tmp,12);renderer.toneMappingExposure=1;renderer.render(scene,camera)},
attempt(){const d=escapeWorld.doorLocks.find(d=>d.floor===0&&d.exit.id!==escapeProgress.run.exitId);Object.assign(player,{...d.exit.inside,y:floors[0].elevation,floor:0,outside:false,stair:null});return {allowed:useDoor(d.exit),chain:d.group.visible,message:interactionMessage}},
contacts(){scene.updateMatrixWorld(true);let count=0;for(const {floor,exit,group} of escapeWorld.doorLocks){if(exit.id==='D1')continue;const normal=new THREE.Vector3(exit.axis==='x'?-exit.facing:0,0,exit.axis==='z'?-exit.facing:0),timber=[];floorGroups[floor].traverse(o=>{if(['Asylum Panel','Asylum VictorianTimber','Asylum VictorianInset'].includes(o.name))timber.push(o)});group.traverse(o=>{if(o.name!=='Chain anchor plate')return;const p=o.getWorldPosition(new THREE.Vector3()),ray=new THREE.Raycaster(p.clone().addScaledVector(normal,.2),normal.clone().negate(),0,.3),hit=ray.intersectObjects(timber,false)[0];if(!hit||Math.abs(hit.distance-.214)>.01)throw Error('Chain anchor misses period timber: '+floor+':'+exit.id);count++})}return count}
};`;
try{
 browser=await launchHardwareBrowser();
 for(const worker of [false,true]){
  const name=worker?'worker':'compiled',page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'reduce'});
  page.setDefaultTimeout(180000);page.setDefaultNavigationTimeout(180000);
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text())});
  await page.route('https://**/*',r=>r.abort());
  if(worker)await page.route('**/compiled/interior/manifest.json',r=>r.fulfill({status:404,body:'Source validation'}));
  const game=(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');
  await page.route('**/game.mjs',r=>r.fulfill({contentType:'text/javascript',body:game+instrument}));
  await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.periodDoorTest?.ready);await page.evaluate(()=>periodDoorTest.begin());
  const initial=await page.evaluate(()=>periodDoorTest.snapshot());assert.equal(initial.mode,worker?'worker':'assets');assert.equal(initial.signs,0);assert.equal(initial.doors.length,24);assert(initial.doors.every(d=>d.visible&&d.locked));
  const contacts=await page.evaluate(()=>periodDoorTest.contacts());assert.equal(contacts,92,'All four anchors on 23 restyled leaves retain contact');
  for(const [label,floor,id,oblique] of [['rear-ground',0,'F1'],['rear-upper',1,'F3'],['pavilion-upper',3,'F4'],['basement',2,'D11'],['reception',0,'D1'],['mouldings-oblique',0,'F1',true]]){
   await page.evaluate(args=>periodDoorTest.view(...args),[floor,id,oblique]);await page.screenshot({path:fileURLToPath(new URL(name+'-'+label+'.png',out))});
  }
  const attempt=await page.evaluate(()=>periodDoorTest.attempt());assert(!attempt.allowed&&attempt.chain);assert.match(attempt.message,/Bolted|Locked/);
  await page.evaluate(()=>{periodDoorTest.progress.interact('plan');periodDoorTest.sync()});
  const keyed=await page.evaluate(()=>periodDoorTest.snapshot());assert.equal(keyed.doors.filter(d=>!d.visible).length,1);assert(keyed.doors.every(d=>d.visible===d.locked));
  await page.evaluate(()=>{periodDoorTest.progress.capture();periodDoorTest.sync()});assert((await page.evaluate(()=>periodDoorTest.snapshot())).doors.every(d=>d.visible));
  await page.evaluate(()=>{periodDoorTest.progress.interact('reclaim');periodDoorTest.sync()});
  await page.keyboard.press('-');await page.keyboard.press('u');assert((await page.evaluate(()=>periodDoorTest.snapshot())).doors.every(d=>!d.visible));
  await page.evaluate(()=>periodDoorTest.view(0,'F1'));await page.screenshot({path:fileURLToPath(new URL(name+'-unlocked.png',out))});
  await page.keyboard.press('u');await page.setViewportSize({width:390,height:844});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.evaluate(()=>periodDoorTest.view(1,'F3'));await page.screenshot({path:fileURLToPath(new URL(name+'-phone.png',out))});
  results.push({mode:name,initial,contacts,attempt,keyed});await page.close();console.log('PASS: '+name+' period-door views, 92 anchor contacts, no modern signs, blocked/key/capture/recovery and U states, desktop and phone.');
 }
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',out),JSON.stringify({results,errors},null,2)+'\n');
}finally{await browser?.close();server.kill();}
