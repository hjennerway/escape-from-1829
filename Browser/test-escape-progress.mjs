import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeProgress,MAST,OBJECTIVE_HINT_DELAY} from './dist/escape-progress.mjs';
import {createEscapeWorld,outdoorPath} from './dist/escape-world.mjs';
import {createNotebook} from './dist/notebook.mjs';
import {buildAsylumLayout,stairRoute,moveAsylumActor} from './dist/asylum-layout.mjs';
import {furnishAsylum} from './dist/asylum-furniture.mjs';
import {path,walkable} from './dist/core.mjs';
import {createAsylumJump} from './dist/asylum-jump.mjs';
import {asylumDoorLabels} from './dist/asylum-door-labels.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))),floors=buildAsylumLayout(plan).floors;
const noticeText=[];
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(text){noticeText.push(text);}})})};
const plaqueNumber=(floor,id)=>asylumDoorLabels(floors[floor]).find(l=>l.door.roomId===id).number;
const combinations=new Set();let routes=0;
for(let sample=0;sample<128;sample++){
 const seed=Math.imul(sample,10000019)>>>0;
 const journal=createNotebook(floors),p=createEscapeProgress({seed,journal,floors}),run=p.run;
 combinations.add([run.exitId,run.office,run.keyRoom].join(':'));
 assert.deepEqual([...run.evidence],[]);assert.equal(journal.entries.length,0);
 const before={...run};assert.deepEqual(createEscapeProgress({seed,floors}).run,before,'Seeds reproduce the scenario');
 p.discover('gate');assert(!journal.entries.some(e=>e.kind==='deduction'));
 p.interact('memo');assert(journal.entries.some(e=>e.id==='escape:staff-route'));
 p.interact('release-note');assert(journal.entries.some(e=>e.id==='escape:release-route'));
 p.interact('office-index');
 assert(journal.entries.find(e=>e.id==='escape:memo').text.includes(`room ${plaqueNumber(0,run.keyRoom)}`),'Key clue agrees with the ground-floor door plaque');
 assert(journal.entries.find(e=>e.id==='escape:office-index').text.includes(`room ${plaqueNumber(3,run.office)} on the second floor`),'Record clue agrees with the second-floor door plaque');
 assert(journal.entries.find(e=>e.id==='escape:release-note').text.includes(`room ${plaqueNumber(2,'B4')}`));
 assert(journal.entries.every(e=>!(/\bR\d+\b/.test(e.title+' '+e.text))),'Narrative does not expose internal room IDs');
 const state=createEscapeProgress({seed,floors,journal:createNotebook(floors)});
 assert(!state.openStair('S1'));state.interact('staff-key');assert(state.openStair('S1'));assert(state.openStair('S5'));
 assert(!state.door({id:run.exitId}).allowed,'Stair key cannot unlock outside door');
 state.interact('plan');
 for(const floor of floors)for(const exit of floor.exits){const allowed=exit.x<0||exit.id===run.exitId;assert.equal(state.door(exit).allowed,allowed,`Brass key coverage ${floor.id}:${exit.id}`);assert.equal(state.doorLocked(exit),!allowed);}
 assert(state.door({id:run.exitId}).allowed);
 const outcome=state.capture();assert(!outcome.terminal);assert(!state.run.staffKey&&!state.run.serviceKey);assert(state.run.opened.has('S1'));
 state.interact('reclaim');assert(state.run.staffKey&&state.run.serviceKey);
 const second=state.capture();assert.equal(second.floor,2);assert.equal(second.delay,4);
 state.interact('plan');assert(state.door({id:run.exitId}).allowed,'Upstairs source is an alternate recovery');
 assert(state.capture().terminal);
 const bypass=createEscapeProgress({seed,floors});bypass.interact('release');assert(bypass.openStair('S5'));assert(bypass.openStair('S1'));bypass.interact('plan');assert(bypass.door({id:run.exitId}).allowed);
 assert(!bypass.canFinish({outside:true,x:0,z:75}));assert(!bypass.canFinish({outside:true,...MAST}));bypass.run.pedestrianOpen=true;bypass.observeBoundary({outside:true,x:-80,z:-86},{outside:true,x:-80,z:-84});assert(bypass.canFinish({outside:true,...MAST}));assert(!bypass.canFinish({outside:false,...MAST}));
 const reversed=createEscapeProgress({seed,floors,journal:createNotebook(floors)});reversed.interact('plan');reversed.door({id:run.exitId});assert(reversed.has('outside-door'));
 reversed.interact('memo');assert(!reversed.run.evidence.has('gate'),'A document cannot reveal an unseen door');
}
assert.equal(combinations.size,8,'All eight intended combinations occur');

// The developer bypass covers every exit and both grilles without inventing keys.
for(const seed of [0,1829,10000019,20000038]){
 const journal=createNotebook(floors),p=createEscapeProgress({seed,journal,floors});
 const exits=floors.flatMap(f=>f.exits);
 assert(!p.run.doorsUnlocked);assert(exits.every(exit=>!p.door(exit).allowed));
 journal.reset();p.setDoorsUnlocked(true);
 assert(p.stairOpen('S1')&&p.stairOpen('S5')&&p.openStair('S1'));
 assert.equal(p.run.opened.size,0,'Bypass does not permanently release a grille');
 assert.equal(journal.entries.length,0,'Bypass does not invent discovered clues or key evidence');
 assert.equal(p.objective({floor:0}).title,'Leave through any outside door');
 for(const exit of exits){assert(p.door(exit).allowed,exit.id+' bypasses both locked and bolted exits');assert(p.run.outside);}
 assert(!p.run.staffKey&&!p.run.serviceKey);
 p.capture();assert(p.run.doorsUnlocked&&p.door(exits[0]).allowed,'Capture cannot restore key requirements while the bypass is active');
 assert(!p.run.confiscated.size&&!p.run.opened.size);
 assert(!p.canFinish({outside:true,...MAST}),'Unlocked asylum doors still require crossing a grounds gate');
 p.setDoorsUnlocked(false);assert(!p.stairOpen('S1')&&!p.stairOpen('S5'));
 assert(exits.every(exit=>!p.door(exit).allowed),'Disabling bypass restores every normal exit restriction');
 assert(p.door(exits[0],{returning:true}).allowed,'Return indoors remains allowed after disabling bypass outside');
 p.interact('staff-key');p.openStair('S1');p.setDoorsUnlocked(true);p.setDoorsUnlocked(false);
 assert(p.stairOpen('S1')&&!p.stairOpen('S5'),'Disabling bypass preserves a grille opened normally');
 assert(!createEscapeProgress({seed,floors}).run.doorsUnlocked,'A new run starts locked');
}

// Each step starts with a broad direction. Only 60 active seconds without
// progress reveal the practical hint, including the disconnected upstairs wing.
const delayedHint=(progress,actor)=>{
 assert.equal(progress.objective(actor).detail,'','A new objective starts without the detailed hint');
 assert.equal(progress.objective(actor,OBJECTIVE_HINT_DELAY-.001).detail,'','No hint before 60 seconds');
 const next=progress.objective(actor,.001);
 assert(next.detail,'The hint appears at 60 seconds');
 return next;
};
for(const seed of [0,1829,10000019,20000038]){
 const journal=createNotebook(floors),p=createEscapeProgress({seed,journal,floors});
 const actor={floor:0,x:0,z:17.5,outside:false};
 assert(p.objective(actor).title.includes('upper offices'));
 assert(!p.objective(actor).detail.includes('201')&&!p.objective(actor).detail.includes('209'),'Undiscovered record location is not announced at the start');
 assert.equal(journal.entries.length,0,'Asking for the objective does not invent notebook evidence');
 assert(delayedHint(p,actor).detail.includes('Reception'));
 assert.equal(journal.entries.length,0,'Timed hints do not invent notebook evidence');
 p.interact('memo');assert(delayedHint(p,actor).detail.includes(plaqueNumber(0,p.run.keyRoom)));
 p.interact('staff-key');assert.equal(p.objective(actor).title,'Use the key you found to access the staff stairs');
 assert.equal(delayedHint(p,actor).detail,'Find the porter’s records and brass outside-door key.');
 p.openStair('S5');
 const number=plaqueNumber(3,p.run.office),upstairs=delayedHint(p,{floor:3,x:p.run.office==='R41'?0:-45});
 assert.equal(upstairs.title,'Explore the upper offices');assert(upstairs.detail.includes('room '+number));assert(upstairs.detail.includes('Press E'));
 const wrongWing=p.objective({floor:3,x:p.run.office==='R41'?-65:0});
 assert(wrongWing.detail.includes('first floor')&&wrongWing.detail.includes('other staff stair'));
 assert(journal.entries.find(e=>e.id==='escape:gate:S5').text.includes('room '+number),'Opened-gate evidence retains the next room for later reading');
 p.interact('plan');assert.equal(p.objective(actor).title,'Unlock any west-side exit');assert(delayedHint(p,actor).detail.includes(p.run.exitId));
 p.capture();assert(p.objective(actor).title.includes('Recover'));assert(delayedHint(p,actor).detail.includes('property tray'));
 p.interact('reclaim');assert(p.objective(actor).title.includes('Unlock'));delayedHint(p,actor);
 assert(delayedHint(p,{...actor,outside:true}).detail.includes('perimeter path'));
 p.run.pedestrianOpen=true;p.observeBoundary({outside:true,x:-80,z:-86},{outside:true,x:-80,z:-84});assert(delayedHint(p,{...actor,outside:true}).detail.includes('Press E'));
 const release=createEscapeProgress({seed,floors});release.interact('release-note');assert(delayedHint(release,{floor:2}).detail.includes('room B4'));release.interact('release');assert(delayedHint(release,actor).detail.includes('room '+number));
}

// Progress resets the delay even when the overall objective stays the same;
// repeated interactions, HUD reads and movement between floors do not.
{
 const p=createEscapeProgress({seed:1829,floors}),actor={floor:0};
 p.interact('staff-key');p.objective(actor);p.objective(actor,40);
 p.interact('staff-key');p.discover('gate');p.discover('office-index');
 assert.equal(p.objective({floor:1},19.875).detail,'');
 assert(p.objective(actor,.125).detail.includes('porter’s records'));
 p.openStair('S5');p.objective(actor);p.objective(actor,45);
 p.openStair('S1');delayedHint(p,actor);
 p.capture();delayedHint(p,actor);p.capture();delayedHint(p,actor);
 const outside={outside:true};delayedHint(p,outside);
 p.run.crowbar=true;delayedHint(p,outside);
 p.run.wicketOpen=true;delayedHint(p,outside);
 assert.equal(createEscapeProgress({seed:1829,floors}).objective(actor).detail,'','Restart has no inherited hint');
}

// Fittings and approaches must work with actual furnished plans and continuous stairs.
for(let seed=0;seed<8;seed++){
 furnishAsylum(floors,{seed});const progress=createEscapeProgress({seed:seed*4000+1829,floors}),groups=floors.map(()=>new THREE.Group());
 noticeText.length=0;
 const world=createEscapeWorld(THREE,floors,groups,progress);
 const printed=noticeText.join(' ');
 assert(printed.includes(`Key kept in room ${plaqueNumber(0,progress.run.keyRoom)}`),'Printed memorandum uses the visible key-room number');
 assert(printed.includes(`room ${plaqueNumber(3,progress.run.office)}, second floor`),'Printed filing notice uses the visible office number');
 assert(!/\bR\d+\b/.test(printed),'Actual notice textures contain no old room references');
 assert(!printed.includes('STAFF STAIR KEY'),'The key name belongs on the HUD, not a notice board');
 assert(!printed.includes('PROPERTY TRAY'),'Property is represented by a tray, not a notice board');
 const tray=world.nodes.find(n=>n.id==='reclaim'),desk=floors[0].furniture.find(i=>i.kind==='receptionDesk');
 assert.equal(tray.roomId,'Reception');assert.equal(tray.mount.supportId,desk.id);
 assert.equal(tray.mount.y,desk.y+desk.height+.008,'Tray rests on the actual desk surface');
 assert.equal(tray.tray.children.length,6,'Tray has a base, four open rims and its loose keys');
 const [base,...rims]=tray.tray.children.filter(m=>m.isMesh).map(m=>{
  m.geometry.computeBoundingBox();return m.geometry.boundingBox.clone().translate(m.position);
 });
 assert(rims.every(r=>Math.abs(r.min.y-base.max.y)<1e-8),
  'Tray rims meet the base top without overlapping coplanar outer faces');
 assert(!tray.key.visible&&!tray.halo.visible,'Empty tray has no keys or recovery glow');
 for(const n of world.nodes){
  assert(n.halo.material.transparent&&!n.halo.material.depthWrite,'Interaction glow feathers around the prop');
  assert(n.beacon.isSprite&&n.beacon.material.depthTest&&!n.beacon.material.depthWrite,'Desk clues have a camera-facing glow that respects walls');
  if(n.mount.kind==='wall')assert(n.mount.wall&&!n.mount.wall.exterior,'Wall notices use supported interior masonry');
  else assert(floors[n.floor].furniture.some(i=>i.id===n.mount.supportId),'Desk papers have actual furniture support');
 }
 const staff=world.nodes.find(n=>n.id==='staff-key');
 assert(staff.key.children.some(m=>m.geometry.type==='TorusGeometry'),'Staff key has an open bow');
 assert.equal(staff.mount.kind,'wall','Staff key hangs on a supported rack');
 assert(staff.key.visible&&staff.halo.visible);
 for(const node of world.nodes){
  if(node.id==='reclaim'){progress.run.confiscated.add('serviceKey');world.sync();}
  assert(walkable(floors[node.floor],node.x,node.z,.5),node.id+' has a clear reading position');
  assert(world.near({x:node.x,z:node.z,y:floors[node.floor].elevation,floor:node.floor})?.id===node.id,node.id+' is interactive');
  const connected=floors[node.floor].corridors.flatMap(c=>c.points).some(([x,z])=>walkable(floors[node.floor],x,z)&&path(floors[node.floor],{x,z},node).length);
  assert(connected,node.id+' is connected to circulation');routes++;
 }
 progress.interact('staff-key');world.sync();assert(!staff.key.visible&&!staff.halo.visible,'Taking the key clears its rack and glow');
 assert(!staff.beacon.visible,'Taking the key clears its beacon');
 for(const id of ['memo','office-index','release-note','release','plan']){const n=world.nodes.find(n=>n.id===id);progress.interact(id);world.sync();assert(!n.halo.visible&&!n.beacon.visible,id+' stops drawing attention after use');}
 progress.capture();world.sync();assert(world.nodes.find(n=>n.id==='plan').beacon.visible,'Lost service key can be found again at its glowing source');
 world.update(0);const scale=staff.beacon.scale.y;world.update(.7);assert(staff.beacon.scale.y>scale,'Available glows pulse at gameplay speed');
 progress.run.confiscated.clear();progress.run.confiscated.add('staffKey');world.sync();
 assert(tray.key.children[0].visible&&!tray.key.children[1].visible,'Tray displays the actual confiscated key');
 progress.interact('reclaim');world.sync();assert(!tray.key.visible&&!tray.halo.visible,'Reclaim empties the tray');
 progress.run.opened.clear();world.sync();
 for(const gate of world.gates){
  const from={x:gate.x-gate.dx*.6,z:gate.z-gate.dz*.6,y:gate.y,floor:1};
  const to={...from,x:gate.x+gate.dx*.6,z:gate.z+gate.dz*.6};
  assert(!world.allowMove(from,to),'Locked gate rejects crossing '+gate.id);
  assert(!world.allowMove({...from,y:from.y+.7},{...to,y:to.y+.7}),'Jump cannot bypass gate');
  assert(world.near({...from,x:gate.x-gate.dz*1.05,z:gate.z+gate.dx*1.05})?.gate,'The grille can be operated before its collision padding blocks approach');
  assert(world.allowMove({...from,y:0},{...to,y:0}),'Lower storey stays clear');
  progress.interact('staff-key');progress.openStair(gate.id);world.sync();
  assert(!world.allowMove(from,to),'Released gate still blocks until its leaf swings clear');
  world.update(0,.55);assert(Math.abs(gate.hinge.rotation.y-gate.openAngle/2)<1e-8,'Gate swings through a visible intermediate pose');
  const paused=gate.hinge.rotation.y;world.sync();world.update(10,0);assert.equal(gate.hinge.rotation.y,paused,'Sync and paused time do not advance the swing');
  world.update(0,.55);assert(world.allowMove(from,to),'Open gate clears the stair route');
  assert(gate.leaf.visible&&!gate.lock.visible,'Open leaf remains visible with its lock released');
  gate.group.updateWorldMatrix(true,true);
  const centre=gate.leaf.getWorldPosition(new THREE.Vector3());
  const left={...from,x:centre.x+gate.dz*.6,z:centre.z-gate.dx*.6},right={...from,x:centre.x-gate.dz*.6,z:centre.z+gate.dx*.6};
  assert(!world.allowMove(left,right),'Open leaf still blocks walking through its bars beside the landing');
  if(gate.id==='S5'){
   // The lower flight's railing leaves no detour around a leaf hung from the
   // other post. Exercise the actual side approach, rather than only its axis.
   const actor={x:gate.x+.95,z:gate.z+.42,y:gate.y,floor:1,stair:null},jump=createAsylumJump(floors,{allowMove:world.allowMove});
   for(let i=0;i<38;i++)jump.update(actor,-.025,0,.01);
   assert(Math.abs(actor.x-gate.x)<.01,'S5 remains reachable from beside the lower flight with its leaf open');
  }
 }
 const release=world.anchor(2,'B5');assert(walkable(floors[2],release.x,release.z,.5),'Capture cell has a safe pose');
 world.dispose();
}
const stillProgress=createEscapeProgress({seed:1829,floors}),still=createEscapeWorld(THREE,floors,floors.map(()=>new THREE.Group()),stillProgress,{reducedMotion:true});
still.update(0);const scale=still.nodes[0].beacon.scale.toArray();still.update(.7);assert.deepEqual(still.nodes[0].beacon.scale.toArray(),scale,'Reduced motion keeps a strong steady glow');
stillProgress.interact('release');still.sync();assert(still.gates.every(g=>g.leaf.visible&&g.hinge.rotation.y===g.openAngle),'Reduced motion shows the open leaf immediately');still.dispose();
{
 const progress=createEscapeProgress({seed:1829,floors}),world=createEscapeWorld(THREE,floors,floors.map(()=>new THREE.Group()),progress);
 for(const unlocked of [true,false,true]){
  progress.setDoorsUnlocked(unlocked);world.sync();world.update(0,1.1);
  for(const gate of world.gates){
   const from={x:gate.x-gate.dx*.6,z:gate.z-gate.dz*.6,y:gate.y,floor:1,outside:false},to={...from,x:gate.x+gate.dx*.6,z:gate.z+gate.dz*.6};
   assert(gate.leaf.visible,'Developer unlock retains the visible grille');
   assert.equal(gate.lock.visible,!unlocked,'Grille lock follows developer unlock');
   assert.equal(world.allowMove(from,to),unlocked,'Grille collision follows developer unlock');
   assert.equal(world.near(from)?.gate?.id===gate.id,!unlocked,'Unlocked grilles cannot show a locked interaction prompt');
  }
 }
 world.dispose();
}
const route=outdoorPath({clear:(x,z)=>!(x===-80&&z>-4&&z<4)},{x:-85,z:0},{x:-75,z:0});assert(route.length>10,'Outdoor routing goes around cover');
const navigation={revision:0,clear:()=>true},from={x:-85,z:0},to={x:-75,z:0};
const direct=outdoorPath(navigation,from,to);navigation.clear=(x,z)=>!(x===-80&&z>-4&&z<4);navigation.revision++;assert(outdoorPath(navigation,from,to).length>direct.length,'Changed obstacles invalidate cached navigation');
for(const stage of ['start','key','grille','record','outside']){
 const journal=createNotebook(floors),progress=createEscapeProgress({seed:1829,journal,floors});
 if(stage!=='start')progress.interact('staff-key');if(['grille','record','outside'].includes(stage))progress.openStair('S1');if(['record','outside'].includes(stage))progress.interact('plan');if(stage==='outside')progress.door({id:progress.run.exitId});
 const evidence=journal.entries.map(e=>e.id);assert(!progress.capture().terminal);assert(evidence.every(id=>journal.entries.some(e=>e.id===id)),stage+' capture retains discoveries');
 progress.interact('reclaim');progress.interact('release');progress.interact('plan');assert(progress.door({id:progress.run.exitId}).allowed,stage+' capture cannot soft-lock the escape');
}
console.log(`PASS: all ${combinations.size} route/key/office combinations, evidence-only deductions, both branches, out-of-order clues, three captures, confiscation recovery, ending gates, ${routes} furnished clue approaches, grille/jump barriers and outdoor cover routing.`);
