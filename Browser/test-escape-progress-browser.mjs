import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
const destination=new URL('./artifacts/escape-chain/',import.meta.url);await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;const errors=[],runs=[],screens=[];
const instrument=`
let walkSamples=0;
window.escapeTest={get ready(){return ready},get state(){return state},get run(){return escapeProgress.run},get world(){return escapeWorld},get journal(){return notebook},get time(){return elapsed},get floors(){return floors},get guard(){return enemies.find(e=>e.type===1)},get renderer(){return renderer},player,keys,start,update,caught,resumeCapture,openNotebook,closeNotebook,get arrival(){return arrivalCutscene},get recovery(){return recoveryRemaining},
hold(){enemyReleaseAt=Infinity;state='play';keys.clear()},get walkSamples(){return walkSamples},
outdoorCollision(){this.hold();update(.001);const guard=this.guard;Object.assign(guard,{x:player.x+.4,z:player.z,y:player.y});enemyReleaseAt=0;update(.001);return state},
outdoorJumpIsolation(){const saved={...player};Object.assign(player,{x:-10,z:60,y:0});outsideWalker.resetJump();const patrol={x:-15,z:60,y:0};outsideWalker.jump(player);let peak=0;for(let i=0;i<120;i++){outsideWalker.update(player,0,0,1/120);outsideWalker.update(patrol,0,0,1/120,{jump:false});peak=Math.max(peak,player.y)}const result={peak,patrolY:patrol.y,playerY:player.y};outsideWalker.resetJump();Object.assign(player,saved);return result},
visibleMast(){const g=exterior.model.getObjectByName('Escape radio mast landmark');let count=0;g.traverseVisible(o=>{if(o.isMesh)count++});return {count,position:g.position.toArray(),support:outsideWalker.heightAt(-69,-89,0)}},
testPursuit(){this.keys.add('KeyE');elapsed=20;enemyReleaseAt=0;const before=this.guard.x+','+this.guard.z;update(.04);this.keys.clear();this.hold();return {before,after:this.guard.x+','+this.guard.z}},
testBarrier(){const g=this.poseGate(),a={...player};indoorJump.update(player,g.dx,g.dz,.04);const blocked=Math.hypot(player.x-a.x,player.z-a.z)<.1;this.jump();indoorJump.update(player,g.dx,g.dz,.04);const jumping=Math.hypot(player.x-a.x,player.z-a.z)<.1;indoorJump.reset();Object.assign(player,a);return {blocked,jumping}},
use(){keys.add('KeyE');update(.001);keys.delete('KeyE');update(.001)},
async walk(target){
 const route=routeBetweenFloors(floors,player,target);if(!route.length)throw Error('No route '+JSON.stringify(target));
 // Grid cells at the edge of an open leaf can be clear while the segment
 // between them clips it. Follow the real doorway centre through its mouth.
 const endpoint={...route.at(-1)};
 for(const point of route)for(const door of floors[point.floor].doorways){
  const along=(point.x-door.x)*door.dx+(point.z-door.z)*door.dz,across=(point.x-door.x)*-door.dz+(point.z-door.z)*door.dx;
  if(Math.abs(across)<.75&&Math.abs(along)<door.width/2){point.x-=along*door.dx;point.z-=along*door.dz;}
 }
 if(Math.hypot(endpoint.x-route.at(-1).x,endpoint.z-route.at(-1).z)>.001)route.push(endpoint);
 let samples=0;
 for(const point of route){for(let step=0;step<500&&Math.hypot(player.x-point.x,player.z-point.z)>.045;step++){
  const clue=escapeWorld.near(player);if(clue?.gate&&escapeProgress.run.staffKey){this.use()}
  const dx=point.x-player.x,dz=point.z-player.z,d=Math.hypot(dx,dz),distance=Math.min(.04,d);
  const before=[player.x,player.z];indoorJump.update(player,dx/d*distance,dz/d*distance,.013);samples++;if(player.floor!==layout.id)showFloor();
  if(step>10&&Math.hypot(player.x-before[0],player.z-before[1])<.000001)throw Error('Walking blocked '+JSON.stringify({point,player,clue:clue?.id}));
 }
 if(Math.hypot(player.x-point.x,player.z-point.z)>.05)throw Error('Did not reach route point');}
 walkSamples+=samples;showFloor();observeNotebook();camera.position.set(player.x,player.y+1.65,player.z);camera.rotation.set(0,0,0);return samples;
},
async clue(id){const node=escapeWorld.nodes.find(n=>n.id===id);if(node.roomId!=='Reception')await this.walk({...escapeWorld.anchor(node.floor,node.roomId),floor:node.floor});await this.walk({...node,floor:node.floor});this.use();return node},
async grounds(){const target={x:-74,z:-89},route=outdoorPath(outsideWalker,player,target);if(!route.length)throw Error('No outside route');let samples=0;
 for(const point of route){for(let i=0;i<200&&Math.hypot(player.x-point.x,player.z-point.z)>.06;i++){const dx=point.x-player.x,dz=point.z-player.z,d=Math.hypot(dx,dz),step=Math.min(.04,d);outsideWalker.update(player,dx/d*step,dz/d*step,.013);samples++;}
  if(Math.hypot(player.x-point.x,player.z-point.z)>.07)throw Error('Grounds blocked '+JSON.stringify({point,player}));escapeProgress.observeBoundary(player);}
 camera.position.set(player.x,player.y+1.65,player.z);yaw=-Math.PI/2;camera.rotation.set(0,yaw,0);observeNotebook();return samples;},
snapshot(){return {time:elapsed,player:{...player},captures:escapeProgress.run.captures,notes:notebook.entries.map(e=>e.id),fog:[...notebook.fog].map(([key,f])=>[key,f.cells.reduce((a,b)=>a+b,0)]),guard:[this.guard.x,this.guard.z]}},
get airborne(){return indoorJump.airborne},jump(){indoorJump.start()},
poseGate(){const g=escapeWorld.gates[0];Object.assign(player,{x:g.x-g.dx*.5,z:g.z-g.dz*.5,y:g.y,floor:1,stair:null,outside:false});showFloor();yaw=Math.atan2(-g.dx,-g.dz);pitch=0;camera.position.set(player.x,player.y+1.65,player.z);camera.rotation.set(pitch,yaw,0);return g},
lookAtNode(id){const n=escapeWorld.nodes.find(n=>n.id===id);this.hold();Object.assign(player,{x:n.x,z:n.z,y:floors[n.floor].elevation,floor:n.floor,stair:null,outside:false});showFloor();yaw=Math.atan2(-(n.mount.x-player.x),-(n.mount.z-player.z));pitch=Math.atan2(n.mount.y-1.65,Math.hypot(n.mount.x-player.x,n.mount.z-player.z));camera.position.set(player.x,player.y+1.65,player.z);camera.rotation.set(pitch,yaw,0);document.getElementById('result').hidden=true;update(.001);},
setTorch(enabled){torch.visible=enabled},clearRecovery(){recoveryRemaining=0},get exterior(){return exterior},get outsideWalker(){return outsideWalker}};`;
async function shot(page,name){await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});screens.push(name);}
try{
 browser=await launchHardwareBrowser({executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text())});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+instrument}));
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.escapeTest?.ready);
 await page.locator('#start').click();await page.evaluate(()=>{escapeTest.arrival.update(3);escapeTest.hold()});
 const landmark=await page.evaluate(()=>escapeTest.visibleMast());assert(landmark.count>0&&landmark.support>=.24,'Mast is physically visible and its footing supports walking: '+JSON.stringify(landmark));assert.deepEqual(landmark.position,[-69,0,-89]);
 const initial=await page.evaluate(()=>({notes:escapeTest.journal.entries.map(e=>e.id),run:{exit:escapeTest.run.exitId,office:escapeTest.run.office,keyRoom:escapeTest.run.keyRoom}}));
 assert(!initial.notes.some(id=>id.startsWith('escape:')),'No future clues in fresh notebook');
 assert((await page.locator('#objectiveTitle').innerText()).includes('upper offices'));
 // Outside doors cannot skip the discovery chain.
 await page.evaluate(async()=>{const t=escapeTest,e=t.floors[0].exits.find(e=>e.id==='D1');await t.walk({...e.inside,floor:0});t.use()});
 assert.equal(await page.evaluate(()=>escapeTest.player.outside),false);
 // Normal use input does not become an unlimited safety freeze.
 const pursuit=await page.evaluate(()=>escapeTest.testPursuit());assert.notEqual(pursuit.before,pursuit.after);
 // Locked grilles resist normal movement and jumping.
 const barrier=await page.evaluate(()=>escapeTest.testBarrier());assert(barrier.blocked&&barrier.jumping);
 await shot(page,'locked-grille');
 // Restart clears temporary state, then physically walk the entire indoor branch.
 await page.evaluate(()=>{escapeTest.start();escapeTest.arrival.update(3);escapeTest.hold()});
 await page.evaluate(()=>escapeTest.lookAtNode('staff-key'));await shot(page,'staff-key-rack');
 assert.equal(await page.locator('#exitName').innerText(),'STAFF STAIR KEY');assert.equal(await page.locator('#interact b').innerText(),'PRESS E TO TAKE');
 await page.evaluate(()=>escapeTest.setTorch(false));await shot(page,'staff-key-glow');await page.evaluate(()=>escapeTest.setTorch(true));
 await page.evaluate(()=>escapeTest.lookAtNode('plan'));await shot(page,'service-record-with-key');
 assert.equal(await page.locator('#interact b').innerText(),'PRESS E TO TAKE BRASS KEY');
 assert((await page.locator('#objectiveDetail').innerText()).includes('room '+await page.evaluate(()=>escapeTest.run.office==='R41'?'201':'209')));
 const fittings=await page.evaluate(()=>escapeTest.world.nodes.map(n=>({id:n.id,kind:n.mount.kind,support:n.mount.supportId,position:n.group.position.toArray(),glow:n.halo.material.transparent})));
 assert(fittings.every(n=>n.glow));assert.equal(fittings.find(n=>n.id==='reclaim').kind,'desk');
 await page.evaluate(()=>{escapeTest.start();escapeTest.arrival.update(3);escapeTest.hold()});
 const indoor=await page.evaluate(async()=>{const t=escapeTest;await t.clue('memo');await t.clue('office-index');await t.clue('staff-key');const node=await t.clue('plan');return {samples:t.walkSamples,office:node.roomId,staff:t.run.staffKey,service:t.run.serviceKey,opened:[...t.run.opened],notes:t.journal.entries.map(e=>e.id)}});
 assert(indoor.staff&&indoor.service&&indoor.opened.length);assert(indoor.notes.includes('escape:plan'));
 assert((await page.locator('#objectiveTitle').innerText()).includes(await page.evaluate(()=>escapeTest.run.variant+' outer entrance')));
 const clues=await page.evaluate(()=>{const t=escapeTest,number=(floor,id)=>t.floors[floor].roomDoors.map(d=>d.roomId).sort((a,b)=>a.localeCompare(b,'en',{numeric:true})).indexOf(id)+1;return {key:'G'+number(0,t.run.keyRoom),office:String(200+number(3,t.run.office)),memo:t.journal.entries.find(e=>e.id==='escape:memo').text,filing:t.journal.entries.find(e=>e.id==='escape:office-index').text,oldIds:t.journal.entries.some(e=>/\bR\d+\b/.test(e.title+' '+e.text))}});
 assert(clues.memo.includes('room '+clues.key));assert(clues.filing.includes('room '+clues.office+' on the second floor'));assert(!clues.oldIds);
 for(const id of ['memo','office-index']){await page.evaluate(id=>escapeTest.lookAtNode(id),id);await shot(page,id+'-room-numbers');}
 await page.evaluate(()=>escapeTest.lookAtNode('plan'));await shot(page,'upstairs-record');await page.evaluate(()=>escapeTest.hold());
 // Capture preserves elapsed time, notes and fog, confiscates keys and permits reclaim.
 const captureState=await page.evaluate(()=>{const before=escapeTest.snapshot();escapeTest.caught('Security');return {before,after:escapeTest.snapshot()}});
 assert.equal(await page.evaluate(()=>escapeTest.state),'captured');await shot(page,'first-capture');
 const {before:beforeCapture,after:afterCapture}=captureState;assert.equal(afterCapture.time,beforeCapture.time);assert(beforeCapture.notes.every(id=>afterCapture.notes.includes(id)));
 assert.equal(await page.evaluate(()=>escapeTest.run.serviceKey),false);
 assert((await page.locator('#objectiveTitle').innerText()).includes('Recover'));
 await page.locator('#resume').click();await page.evaluate(()=>escapeTest.lookAtNode('reclaim'));await shot(page,'reception-property-tray');
 assert.equal(await page.locator('#exitName').innerText(),'PROPERTY TRAY');assert.equal(await page.locator('#interact b').innerText(),'PRESS E TO RECLAIM');
 await page.evaluate(async()=>{escapeTest.hold();await escapeTest.clue('reclaim')});assert(await page.evaluate(()=>escapeTest.run.serviceKey));
 assert((await page.locator('#objectiveTitle').innerText()).includes('Unlock'));
 assert(!await page.evaluate(()=>escapeTest.world.nodes.find(n=>n.id==='reclaim').key.visible));await shot(page,'reception-property-tray-empty');
 await page.evaluate(()=>escapeTest.openNotebook());const frozen=await page.evaluate(()=>escapeTest.snapshot());await page.evaluate(()=>escapeTest.update(10));assert.deepEqual(await page.evaluate(()=>escapeTest.snapshot()),frozen);await shot(page,'notebook-discoveries');await page.keyboard.press('Escape');
 // Leave through the actual selected door and walk past the old endpoint to the mast.
 await page.evaluate(async()=>{const t=escapeTest;t.hold();const e=t.floors[0].exits.find(e=>e.id===t.run.exitId);await t.walk({...e.inside,floor:0});t.use()});
 assert(await page.evaluate(()=>escapeTest.player.outside));assert.equal(await page.evaluate(()=>escapeTest.state),'play');
 assert.equal(await page.locator('#objectiveTitle').innerText(),'Reach the radio mast');
 const jump=await page.evaluate(()=>escapeTest.outdoorJumpIsolation());assert(jump.peak>1.6&&jump.playerY===0&&jump.patrolY===0,'Guard walking cannot consume the player’s jump arc');
 const grounds=await page.evaluate(async()=>{escapeTest.hold();const samples=await escapeTest.grounds();return {samples,boundary:escapeTest.run.boundary,pos:{...escapeTest.player}}});assert(grounds.boundary);await shot(page,'mast-arrival');
 await page.evaluate(()=>escapeTest.use());assert.equal(await page.evaluate(()=>escapeTest.state),'cutscene');await shot(page,'ending');
 runs.push({initial,indoor,grounds});
 // Second branch, including all recovery outcomes, actual basement release and clean reset.
 await page.evaluate(()=>{escapeTest.start();escapeTest.arrival.update(3);escapeTest.hold()});
 await page.evaluate(async()=>{await escapeTest.clue('release-note');await escapeTest.clue('release');await escapeTest.clue('plan')});assert(await page.evaluate(()=>escapeTest.run.serviceKey&&!escapeTest.run.staffKey));
 await page.evaluate(async()=>{const t=escapeTest;const e=t.floors[0].exits.find(e=>e.id===t.run.exitId);await t.walk({...e.inside,floor:0});t.use()});
 assert.equal(await page.evaluate(()=>escapeTest.outdoorCollision()),'captured','Outdoor guard collision uses recoverable consequences');
 await page.evaluate(()=>{escapeTest.resumeCapture();escapeTest.caught('Security')});
 assert.equal(await page.evaluate(()=>escapeTest.run.captures),2);assert.equal(await page.evaluate(()=>escapeTest.player.floor),2);assert(await page.locator('#resume').isDisabled());
 await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>escapeTest.state),'captured');await page.setViewportSize({width:390,height:844});await shot(page,'second-capture-mobile');
 await page.waitForFunction(()=>!document.getElementById('resume').disabled);await page.locator('#resume').click();
 await page.evaluate(()=>escapeTest.openNotebook());await shot(page,'notebook-mobile');await page.locator('#closeNotebook').click();
 await page.evaluate(async()=>{escapeTest.hold();await escapeTest.clue('reclaim')});assert(await page.evaluate(()=>escapeTest.run.serviceKey));
 await page.evaluate(()=>escapeTest.caught('Security'));assert.equal(await page.evaluate(()=>escapeTest.state),'lost');assert((await page.locator('#resultBody').innerText()).includes('Diagnosis:'));await shot(page,'third-capture-mobile');
 await page.locator('#retry').click();await page.evaluate(()=>escapeTest.arrival.update(3));assert.equal(await page.evaluate(()=>escapeTest.run.captures),0);assert(!await page.evaluate(()=>escapeTest.run.serviceKey));assert(!await page.evaluate(()=>escapeTest.journal.entries.some(e=>e.id==='escape:plan')));
 // Physically exercise the other record wing and outside door without reloading.
 await page.setViewportSize({width:1280,height:820});
 for(const seed of [0,10000019,20000038,30000057]){
  await page.evaluate(seed=>{history.replaceState(null,'','?seed='+seed);escapeTest.start();escapeTest.arrival.update(3);escapeTest.hold()},seed);
  const result=await page.evaluate(async()=>{const t=escapeTest;await t.clue('release');const record=await t.clue('plan');const e=t.floors[0].exits.find(e=>e.id===t.run.exitId);await t.walk({...e.inside,floor:0});t.use();const started=performance.now(),samples=await t.grounds();return {seed:t.run.seed,exit:t.run.exitId,office:record.roomId,outside:t.player.outside,boundary:t.run.boundary,samples,walkingMs:performance.now()-started}});
  assert(result.outside&&result.boundary);runs.push(result);
 }
 assert(new Set(runs.slice(1).map(r=>r.exit)).size===2&&new Set(runs.slice(1).map(r=>r.office)).size===2,'Both outside routes and upstairs wings are physically exercised');
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});mobile.setDefaultTimeout(120000);
 mobile.on('pageerror',e=>errors.push(e.message));await mobile.route('https://**/*',r=>r.abort());await mobile.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+instrument}));
 await mobile.goto(base+'/?seed=0');await mobile.waitForFunction(()=>window.escapeTest?.ready);await mobile.locator('#start').tap();await mobile.evaluate(async()=>{const t=escapeTest;t.arrival.update(3);t.hold();const n=t.world.nodes.find(n=>n.id==='memo');await t.walk({...n,floor:0})});
 const button=await mobile.locator('[data-key="KeyE"]').boundingBox();await mobile.mouse.move(button.x+button.width/2,button.y+button.height/2);await mobile.mouse.down();await mobile.waitForFunction(()=>escapeTest.journal.entries.some(e=>e.id==='escape:memo'));await mobile.mouse.up();
 await mobile.locator('#touchMap').tap();assert.equal(await mobile.evaluate(()=>escapeTest.state),'notebook');const touchFrozen=await mobile.evaluate(()=>escapeTest.snapshot());await mobile.evaluate(()=>escapeTest.update(5));assert.deepEqual(await mobile.evaluate(()=>escapeTest.snapshot()),touchFrozen);await shot(mobile,'touch-notice-notebook');await mobile.locator('#closeNotebook').tap();assert(await mobile.locator('#touch').isVisible());
 await mobile.evaluate(()=>escapeTest.lookAtNode('staff-key'));await shot(mobile,'touch-staff-key-rack');
 assert.equal(await mobile.locator('#exitName').innerText(),'STAFF STAIR KEY');
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({runs,fittings,screens,errors},null,2));
 console.log('PASS: real hardware scene, both physically walked indoor branches, gated doors and jump barriers, held-use pursuit, capture relocation/confiscation/recovery, preserved notebook/fog/time, grounds-to-mast traversal and ending, desktop/mobile, third-capture loss and clean retry.');
}finally{await browser?.close();server.kill();}
