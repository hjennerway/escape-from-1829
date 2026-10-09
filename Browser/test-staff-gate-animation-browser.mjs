import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const destination=new URL('./artifacts/staff-gate-animation/',import.meta.url);await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;
const errors=[],results={};
const instrument=`
window.staffGateTest={
 get ready(){return ready&&(interiorLoader?.complete??true)},
 begin(){window.__manual=true;start();arrivalCutscene.update(3);enemyReleaseAt=Infinity;state='play';keys.clear();document.getElementById('result').hidden=true;uiPlaying(true)},
 snapshot(id){const g=escapeWorld.gates.find(g=>g.id===id);g.group.updateWorldMatrix(true,true);const from={x:g.x-g.dx*.6,z:g.z-g.dz*.6,y:g.y,floor:1},to={...from,x:g.x+g.dx*.6,z:g.z+g.dz*.6},frame=new THREE.Box3().setFromObject(g.group.getObjectByName('Fixed stair gate frame'));return {angle:g.hinge.rotation.y,visible:g.leaf.visible,locked:g.lock.visible,clear:escapeWorld.allowMove(from,to),hinge:g.hinge.getWorldPosition(new THREE.Vector3()).toArray(),frame:[...frame.min.toArray(),...frame.max.toArray()]}},
 pose(id){const g=escapeWorld.gates.find(g=>g.id===id);Object.assign(player,{x:g.x-g.dx*1.65,z:g.z-g.dz*1.65,y:g.y,floor:1,stair:null,outside:false});showFloor();yaw=Math.atan2(-g.dx,-g.dz);pitch=-.12;this.draw()},
 draw(){camera.position.set(player.x,player.y+1.65,player.z);camera.rotation.set(pitch,yaw,0);scene.add(torch,torchTarget);torch.visible=true;torch.position.copy(camera.position);camera.getWorldDirection(tmp);torchTarget.position.copy(camera.position).addScaledVector(tmp,12);renderer.toneMappingExposure=1.25;renderer.render(scene,camera)},
 use(){keys.add('KeyE');update(0);keys.delete('KeyE');update(0);this.draw()},
 takeKey(){escapeProgress.interact('staff-key');syncEscapeWorld()},
 release(){escapeProgress.interact('release');syncEscapeWorld()},
 tick(dt){update(dt);this.draw()},
 pause(){state='paused'},resume(){state='play'},
 capture(){escapeProgress.capture();syncEscapeWorld()},
 bypass(on){escapeProgress.setDoorsUnlocked(on);syncEscapeWorld()}
};`;
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'no-preference'});
 page.setDefaultTimeout(180000);page.setDefaultNavigationTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text())});
 await page.route('https://**/*',r=>r.abort());
 const source=(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');
 await page.route('**/game.mjs',r=>r.fulfill({contentType:'text/javascript',body:source+instrument}));
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.staffGateTest?.ready);
 const shot=async name=>page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});
 for(const id of ['S1','S5']){
  await page.evaluate(id=>{staffGateTest.begin();staffGateTest.pose(id)},id);
  const closed=await page.evaluate(id=>staffGateTest.snapshot(id),id);assert(closed.locked&&!closed.clear&&closed.angle===0);
  await shot(id+'-closed');await page.evaluate(()=>staffGateTest.use());
  assert.equal((await page.evaluate(id=>staffGateTest.snapshot(id),id)).angle,0,'E without the key cannot open the gate');
  await page.evaluate(()=>{staffGateTest.takeKey();staffGateTest.use()});
  const released=await page.evaluate(id=>staffGateTest.snapshot(id),id);assert(released.visible&&!released.locked&&!released.clear&&released.angle===0);
  await page.evaluate(()=>staffGateTest.tick(.275));const early=await page.evaluate(id=>staffGateTest.snapshot(id),id);
  assert(early.angle>0&&early.angle<Math.PI/4&&!early.clear,'Gate starts smoothly and still blocks passage');
  await page.evaluate(()=>staffGateTest.tick(.275));await shot(id+'-opening');
  const middle=await page.evaluate(id=>staffGateTest.snapshot(id),id);assert(Math.abs(middle.angle-Math.PI/4)<1e-8);
  await page.evaluate(()=>{staffGateTest.pause();staffGateTest.tick(2)});
  assert.equal((await page.evaluate(id=>staffGateTest.snapshot(id),id)).angle,middle.angle,'Pause freezes the swing');
  await page.evaluate(()=>{staffGateTest.resume();staffGateTest.tick(.55)});await shot(id+'-open');
  const open=await page.evaluate(id=>staffGateTest.snapshot(id),id);assert(open.visible&&open.clear&&!open.locked&&open.angle===Math.PI/2);
  assert.deepEqual(open.hinge,closed.hinge,'Hinge stays anchored');assert.deepEqual(open.frame,closed.frame,'Frame stays fixed');
  await page.evaluate(()=>staffGateTest.capture());assert.equal((await page.evaluate(id=>staffGateTest.snapshot(id),id)).angle,open.angle,'Capture retains the open pose');
  results[id]={closed,released,early,middle,open};
 }
 await page.evaluate(()=>{staffGateTest.begin();staffGateTest.release();staffGateTest.tick(.55)});
 for(const id of ['S1','S5'])assert(Math.abs((await page.evaluate(id=>staffGateTest.snapshot(id),id)).angle-Math.PI/4)<1e-8,'Basement release animates both gates');
 await page.evaluate(()=>staffGateTest.tick(.55));
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.evaluate(()=>staffGateTest.pose('S5'));await shot('S5-open-phone');
 await page.evaluate(()=>{staffGateTest.begin();staffGateTest.bypass(true);staffGateTest.tick(1.1);staffGateTest.bypass(false);staffGateTest.tick(.55)});
 for(const id of ['S1','S5']){const closing=await page.evaluate(id=>staffGateTest.snapshot(id),id);assert(Math.abs(closing.angle-Math.PI/4)<1e-8&&!closing.locked,'Developer relock closes before restoring chains')}
 await page.evaluate(()=>staffGateTest.tick(.55));
 for(const id of ['S1','S5']){const closed=await page.evaluate(id=>staffGateTest.snapshot(id),id);assert(closed.locked&&!closed.clear&&closed.angle===0)}
 await page.evaluate(()=>staffGateTest.begin());assert((await page.evaluate(id=>staffGateTest.snapshot(id),'S1')).locked,'Restart restores a closed locked gate');
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({results,errors},null,2)+'\n');
 console.log('PASS: hardware views of both hinged staff gates; actual E/key use, eased motion, moving collisions, pause, basement release, retained capture state, restart, developer relock and portrait view.');
}finally{await browser?.close();server.kill();}
