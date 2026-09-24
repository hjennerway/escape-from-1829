import {captureOutcome,diagnoses,causes} from './dist/capture-outcome.mjs';
// Exercise the real game loop without WebGL or external image/network access.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as core from './dist/core.mjs';
import {selectEscapeRoutes,exitDirection} from './dist/escape-routes.mjs';
import * as floors from './dist/floors.mjs';
import {buildArchitecture,interiorWallSurfaces} from './dist/architecture.mjs';
import {BoxGeometry,Shape,ExtrudeGeometry,BufferGeometry,Float32BufferAttribute} from './dist/vendor/three.module.js';
import {createInteriorLights} from './dist/interior-lights.mjs';
import {createEscapeCutscene,sampleEscape} from './dist/escape-cutscene.mjs';
import {bindTreeToggle} from './dist/tree-layer.mjs';
import {sampleLanding} from './dist/aerial-controls.mjs';
import {createArrivalCutscene,sampleArrival} from './dist/arrival-cutscene.mjs';
import * as GuardTHREE from './dist/vendor/three.module.js';
import {createSecurityGuard,updateSecurityGuard,resetSecurityGuard} from './dist/security-guard.mjs';
class Vector {
  constructor(){this.set(0,0,0);}
  set(x,y,z){Object.assign(this,{x,y,z});return this;}
  copy(v){return this.set(v.x,v.y,v.z);}
  addScaledVector(v,s){this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s;return this;}
}
class Object3D {
  constructor(g,m,count){this.count=count;this.children=[];this.position=new Vector();this.scale=new Vector();this.rotation=new Vector();this.material=m;this.visible=true;this.instanceMatrix={};this.color={setHex(){}};}
  add(...objects){for(const o of objects){if(o.parent)o.parent.children=o.parent.children.filter(p=>p!==o);o.parent=this;this.children.push(o);}}
  updateMatrix(){} setMatrixAt(){} setPixelRatio(){} setSize(){} render(scene,camera){this.lastRender={scene,camera};this.renders=(this.renders||0)+1;}
  getWorldDirection(v){return v.set(0,0,-1);} updateProjectionMatrix(){} lookAt(){}
}
class Geometry {clone(){return new Geometry();}}
const THREE={Vector3:Vector,Object3D,Group:Object3D,Scene:Object3D,Mesh:Object3D,InstancedMesh:Object3D,
  WebGLRenderer:Object3D,PerspectiveCamera:Object3D,HemisphereLight:Object3D,PointLight:Object3D,SpotLight:Object3D,
  BoxGeometry,Shape,ExtrudeGeometry,BufferGeometry,Float32BufferAttribute,PlaneGeometry:Geometry,CylinderGeometry:Geometry,SphereGeometry:Geometry,
  MeshStandardMaterial:class {constructor(args){Object.assign(this,args);}},MeshBasicMaterial:class {},CanvasTexture:class {},Color:class {},FogExp2:class {},Clock:class {getDelta(){return .016;}},
  MathUtils:{clamp:(v,a,b)=>Math.min(b,Math.max(a,v)),lerp:(a,b,t)=>a+(b-a)*t,mapLinear:(v,a,b,c,d)=>c+(v-a)/(b-a)*(d-c)}};
const elements=new Map();
function element(id){
 if(elements.has(id))return elements.get(id);
 const e={id,style:{},value:1.2,dataset:{},width:410,height:330,hidden:false,focus(){},addEventListener(){},classList:{toggle(){},add(){}},querySelector:s=>element(id+s)};
 const context=new Proxy({canvas:e,fillRect(){e.fills=(e.fills||0)+1;},drawImage(){e.blits=(e.blits||0)+1;}},{get:(o,k)=>k in o?o[k]:()=>{}});e.getContext=()=>context;
 elements.set(id,e);return e;
}
const layout=JSON.parse(await readFile(new URL('./dist/layout.json',import.meta.url)));
const source=(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'');
const listeners=new Map();
function keydown(code,repeat=false){const event={code,repeat,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;}};listeners.get('keydown')(event);return event;}
const sandbox={captureOutcome:(previous)=>captureOutcome(previous,sandbox.Math.random),Math:Object.create(Math),selectEscapeRoutes,exitDirection,createSecurityGuard:()=>createSecurityGuard(GuardTHREE),updateSecurityGuard,resetSecurityGuard,bindTreeToggle,sampleLanding,...core,...floors,buildArchitecture,interiorWallSurfaces,createInteriorLights,createEscapeCutscene,createArrivalCutscene,
 createLandingExterior:async()=>({scene:new Object3D(),camera:new Object3D()}),
 loadEscapeFrontage:async()=>{},THREE,GLTFLoader:class {},
 document:{getElementById:element,createElement:()=>element('canvas'+elements.size),querySelectorAll:()=>[],body:element('body'),addEventListener(){},exitPointerLock(){}},
 window:{AudioContext:class {resume(){return Promise.resolve();}}},Image:class {},
 fetch:async()=>({ok:true,json:async()=>layout}),matchMedia:()=>({matches:false}),
 innerWidth:1280,innerHeight:800,devicePixelRatio:1,addEventListener(type,listener){listeners.set(type,listener);},requestAnimationFrame(){},performance:{now:()=>0},console};
vm.createContext(sandbox);
vm.runInContext(source+`\nglobalThis.test={finish,escapeCutscene,start,update,animate,resetPositions,showFloor,player,keys,get escapeExterior(){return escapeExterior;},get lastRender(){return renderer.lastRender;},get arrival(){return arrivalCutscene;},get elapsed(){return elapsed;},get enemies(){return enemies;},get floors(){return floors;},get groups(){return floorGroups;},get artPanels(){return artPanels;},get artViewing(){return artViewing;},openArtViewer,closeArtViewer,get ready(){return ready;},get state(){return state;},get camera(){return camera;},setElapsed(v){elapsed=v;},setAudio(){audioOn=false;},setFrameDt(v){clock.getDelta=()=>v;}};`,sandbox);
await new Promise(r=>setImmediate(r));
const t=sandbox.test;assert(t.ready,'init must complete');t.setAudio();
const routeSnapshot=JSON.stringify(t.floors.map(f=>f.exits));
assert.equal(t.floors.reduce((n,f)=>n+f.exits.length,0),5,'Exactly five exits are active at initialization');
assert.equal(layout.exits.length+layout.upperFloor.exits.length,14,'Selection preserves the source pool');
assert.equal(t.groups.reduce((n,g)=>n+g.children.filter(m=>m.name==='Layout Panel').reduce((n,m)=>n+m.count,0),0),5,'Only active exit doors are built');
vm.runInContext('globalThis.perfTest={drawMap,get renders(){return renderer.renders;}}',sandbox);
const perf=sandbox.perfTest;
element('floorMap').hidden=true;
const fullMapBlits=elements.get('map').blits||0;
perf.drawMap();
const backgrounds=[...elements.values()].filter(e=>e.id.startsWith('canvas')&&e.fills);
const backgroundPaints=backgrounds.map(e=>e.fills);
const miniBlits=elements.get('miniMap').blits;
for(let i=0;i<5;i++)perf.drawMap();
assert.equal(elements.get('miniMap').blits,miniBlits+5);
assert.equal(elements.get('map').blits||0,fullMapBlits,'Hidden full map does no drawing');
assert.deepEqual(backgrounds.map(e=>e.fills),backgroundPaints,'Static map backgrounds are reused');
elements.get('floorMap').hidden=false;perf.drawMap();assert.equal(elements.get('map').blits,fullMapBlits+1);
sandbox.document.hidden=true;const frames=perf.renders;t.animate();assert.equal(perf.renders,frames,'Hidden browser tabs skip rendering');sandbox.document.hidden=false;
assert.deepEqual(Array.from(t.enemies,e=>({name:e.name,type:e.type})),[
 {name:'Security',type:1},
 {name:'Deva asylum ghost',type:2}
],'Security and the ghost retain their behavior types');
function startPlaying(){t.start();t.arrival.update(3);assert.equal(t.state,'play');assert.equal(JSON.stringify(t.floors.map(f=>f.exits)),routeSnapshot,'Retry keeps this page load’s routes');}

// Help pauses the current run and every way of closing it preserves progress.
element('instructions').hidden=true;keydown('KeyH');assert.equal(element('instructions').hidden,true,'H is inactive on the intro');
startPlaying();t.setElapsed(12);t.player.x+=.25;
const helpPlayer={...t.player},helpEnemies=t.enemies.map(e=>({x:e.x,z:e.z,floor:e.floor}));
for(const close of [()=>keydown('KeyH'),()=>keydown('Escape'),()=>keydown('KeyP'),()=>element('closeHelp').onclick(),()=>element('helpPlay').onclick()]){
 t.keys.add('KeyW');keydown('KeyH');
 assert.equal(t.state,'paused');assert.equal(element('instructions').hidden,false);assert.equal(element('result').hidden,true);assert.equal(t.keys.size,0);
 keydown('KeyH',true);assert.equal(element('instructions').hidden,false,'Held H does not toggle help repeatedly');
 assert.equal(keydown('Tab').defaultPrevented,false,'Help settings remain keyboard accessible');
 keydown('KeyW');t.update(1);assert.equal(t.keys.size,0);assert.equal(t.elapsed,12);
 assert.deepEqual({...t.player},helpPlayer);assert.deepEqual(t.enemies.map(e=>({x:e.x,z:e.z,floor:e.floor})),helpEnemies);
 close();assert.equal(t.state,'play');assert.equal(element('instructions').hidden,true);assert.equal(t.elapsed,12);assert.deepEqual({...t.player},helpPlayer);
}
keydown('KeyP');keydown('KeyH');assert.equal(element('instructions').hidden,false,'Help opens while paused');keydown('Escape');assert.equal(t.state,'play');

// Launch and retry choose safe new positions, then keep them through the arrival.
const enemyPositions=()=>Array.from(t.enemies,e=>({x:e.x,z:e.z,floor:e.floor}));
const spawnHistory=t.enemies.map(()=>new Set());
let previousSpawns=enemyPositions(),spawnSeed=1829;
try{
 for(let run=0;run<24;run++){
  // Include repeated extreme draws to catch duplicate picks and off-by-one errors.
  sandbox.Math.random=run<4?()=>run<2?0:.999999:()=>((spawnSeed=(Math.imul(spawnSeed,1664525)+1013904223)>>>0)/2**32);
  (run===0?element('start'):element('retry')).onclick();
  const spawns=enemyPositions();
  for(const [index,e] of t.enemies.entries()){
   assert.equal(e.floor,0);assert(core.walkable(layout,e.x,e.z,.5),'Spawn must clear corridor walls');
   assert(Math.hypot(e.x-t.player.x,e.z-t.player.z)>=12,'Reception has breathing room');
   assert(core.path(layout,t.player,e).length>0,'Every spawn connects to the player');
   assert(!core.nearExit(t.floors[0],e));assert(!floors.nearStair(floors.makeFloors(layout),e));
   assert.notDeepEqual(spawns[index],previousSpawns[index],'Each pursuer changes its starting position on retry');
   assert.equal(e.mesh.position.x,e.x);assert.equal(e.mesh.position.z,e.z);assert.equal(e.mesh.position.y,0);
   spawnHistory[index].add(e.x+','+e.z);
  }
  assert(Math.hypot(spawns[0].x-spawns[1].x,spawns[0].z-spawns[1].z)>=5,'Pursuers start apart');
  t.start();assert.deepEqual(enemyPositions(),spawns,'Repeated start during arrival does not reroll');
  t.arrival.update(3);assert.equal(t.state,'play');
  assert.deepEqual(enemyPositions(),spawns,'Arrival handoff retains the chosen positions');
  assert.equal(t.elapsed,0);t.update(4.9);assert.deepEqual(enemyPositions(),spawns,'The head start freezes both pursuers');
  previousSpawns=spawns;
 }
}finally{delete sandbox.Math.random;}
assert(spawnHistory.every(positions=>positions.size>8),'Both pursuers vary across the building');
console.log('PASS: randomized launch/retry spawns, wall clearance, reachable routes, reception/exit/stair clearance, separate pursuers, arrival stability and head start.');

// Exercise the actual arrival state and animation loop with deliberately slow frames.
t.start();assert.equal(t.state,'arrival');assert.equal(elements.get('hud').hidden,true);
const arrivalEnemies=t.enemies.map(e=>({x:e.x,z:e.z,floor:e.floor})),arrivalPlayer={...t.player};
t.keys.add('KeyW');t.update(2);assert.deepEqual({...t.player},arrivalPlayer);assert.equal(t.elapsed,0);
t.setFrameDt(.25);
assert.equal(elements.get('arrivalFade').style.opacity,'0');
for(let i=0;i<4;i++)t.animate();
assert.equal(t.state,'arrival');assert.equal(elements.get('arrivalFade').style.opacity,'0');
for(let i=0;i<3;i++)t.animate();
assert.equal(t.state,'arrival');assert.equal(elements.get('arrivalFade').style.opacity,'0.5');
for(let i=0;i<2;i++)t.animate();
t.animate();assert.equal(elements.get('arrivalFade').style.opacity,'1');assert.equal(t.arrival.inside,true);
assert.equal(t.camera.position.x,layout.spawn.x*layout.cellSize);assert.equal(t.camera.position.z,layout.spawn.z*layout.cellSize);
assert.equal(t.camera.position.y,1.65);assert.equal(t.player.floor,0);
t.animate();assert.equal(elements.get('arrivalFade').style.opacity,'0.5');assert.equal(t.state,'arrival');
t.animate();assert.equal(t.state,'play');assert.equal(elements.get('arrivalFade').hidden,true);
assert.equal(elements.get('hud').hidden,false);assert.equal(t.elapsed,0);assert.equal(t.keys.size,0);
assert.deepEqual(t.enemies.map(e=>({x:e.x,z:e.z,floor:e.floor})),arrivalEnemies);
t.setFrameDt(.04);t.animate();assert.equal(t.elapsed,.04);
assert(sampleArrival(0).position[1]>100,'intro establishes the whole estate from above');
const startShot=sampleArrival(0),midShot=sampleArrival(1.75),doorShot=sampleArrival(2.5);
for(const seconds of [.5,1])assert.deepEqual(sampleArrival(seconds),startShot,'camera and fade hold for one second');
assert.deepEqual(doorShot.position,[0,3.5,25],'approach reaches the front entrance at blackout');
for(let axis=0;axis<3;axis++)assert(Math.abs(midShot.position[axis]-(startShot.position[axis]+doorShot.position[axis])/2)<1e-10,'camera moves at speed throughout the fade');
assert.deepEqual(doorShot.target,[0,3.5,19.9]);
assert.equal(sampleArrival(2.49).inside,false);
assert.equal(doorShot.opacity,1);assert.equal(doorShot.inside,true);
assert.deepEqual(sampleArrival(0,{reducedMotion:true}).position,sampleArrival(3,{reducedMotion:true}).position);
assert(sampleArrival(0,{aspect:.5}).position[2]>sampleArrival(0).position[2]);
let enters=0,completes=0;
const arrival=createArrivalCutscene({camera:new Object3D(),overlay:element('testArrival'),onEnter:()=>enters++,onComplete:()=>completes++});
arrival.start();arrival.update(5);arrival.update(5);assert.equal(enters,1);assert.equal(completes,1);
arrival.start();arrival.update(.75);arrival.reset();assert.equal(arrival.active,false);assert.equal(element('testArrival').hidden,true);
console.log('PASS: three-second arrival at low FPS, one-second hold, fast approach with 1.5-second fade out and half-second reveal, reception handoff, frozen input/NPCs/timer, clean restart, reduced motion and portrait framing.');
startPlaying();
assert.equal(t.player.floor,0);assert.equal(t.groups.length,2);
assert(t.artPanels.length>=16,'supplied artwork must be mounted throughout both floors');
const frozen=t.enemies.map(e=>({x:e.x,z:e.z,floor:e.floor}));t.setElapsed(6);t.keys.add('KeyE');t.update(.4);
assert.deepEqual(t.enemies.map(e=>({x:e.x,z:e.z,floor:e.floor})),frozen,'holding E must pause every NPC');t.keys.delete('KeyE');
t.openArtViewer(t.artPanels[0]);assert.equal(t.artViewing,t.artPanels[0]);assert.equal(elements.get('artViewer').hidden,false);t.update(.4);assert.equal(t.state,'play');t.closeArtViewer();
for(const stair of layout.stairs){
 Object.assign(t.player,{x:stair.x*layout.cellSize,z:stair.z*layout.cellSize});
 t.keys.add('KeyE');t.update(.49);assert.equal(t.player.floor,0,'Stairs wait for the full half-second hold');t.update(.01);
 assert.equal(t.player.floor,1);assert.equal(elements.get('floorName').textContent,'UPPER FLOOR');assert.equal(elements.get('floorExits').textContent,t.floors[1].exits.length+' EXITS THIS FLOOR');
 assert.equal(t.groups[0].visible,false);assert.equal(t.groups[1].visible,true);
 assert(t.camera.position.y>=floors.FLOOR_HEIGHT+1);
 for(let i=0;i<22;i++)t.update(.04);assert.equal(t.player.floor,1,'Held key must not bounce floors');
 t.keys.delete('KeyE');t.update(.04);t.keys.add('KeyE');
 t.setFrameDt(.25);t.animate();assert.equal(t.player.floor,1);assert.equal(elements.get('exitFill').style.width,'50%');
 t.animate();assert.equal(t.player.floor,0,'Stairs use half a second of real time at low FPS');t.setFrameDt(.04);
 t.keys.delete('KeyE');t.update(.04);startPlaying();
}
// The ghost uses a staircase, not an x/z-only collision through the ceiling.
Object.assign(t.player,{x:50,z:30,floor:1});t.showFloor();
for(const e of t.enemies){Object.assign(e,{x:40,z:47.5,floor:0,memory:0,rethink:0,path:[]});}
t.setElapsed(6);t.update(.04);assert.equal(t.state,'play');
const ghost=t.enemies.find(e=>e.type===2);for(let i=0;i<100&&ghost.floor===0;i++)t.update(.04);
assert.equal(ghost.floor,1,'Ghost must follow upstairs via stair route');
Object.assign(t.player,{x:50,z:30,floor:1});
for(const e of t.enemies){Object.assign(e,{x:50,z:30,floor:0,memory:0,rethink:0,path:[]});}
t.update(.04);assert.equal(t.state,'play','Different-floor enemies must not capture player');
assert(t.enemies.every(e=>!e.mesh.visible));
startPlaying();assert.equal(t.player.floor,0);assert(t.enemies.every(e=>e.floor===0));
assert.equal(t.groups[0].visible,true);assert.equal(t.groups[1].visible,false);assert.equal(elements.get('floorExits').textContent,t.floors[0].exits.length+' EXITS THIS FLOOR');
console.log('PASS: real game init, both stair interactions, held-key latch, floor groups/HUD, ghost follows, cross-floor capture isolation, restart.');

for(const [floorIndex,floor] of t.floors.entries())for(const exit of floor.exits){
 startPlaying();Object.assign(t.player,{x:exit.x*layout.cellSize,z:exit.z*layout.cellSize,floor:floorIndex});t.showFloor();t.update(.01);
 assert.equal(elements.get('interact').hidden,false);assert.equal(element('interactb').textContent,'HOLD E TO ESCAPE');assert.equal(elements.get('exitName').textContent,exit.name);
 t.keys.add('KeyE');t.update(.25);assert.equal(t.state,'play');assert.equal(elements.get('exitFill').style.width,'50%');
 t.keys.delete('KeyE');t.update(.01);assert.equal(elements.get('exitFill').style.width,'0%','Releasing E cancels the partial hold');
 t.keys.add('KeyE');t.setFrameDt(.25);t.animate();assert.equal(t.state,'play');assert.equal(elements.get('exitFill').style.width,'50%');
 t.animate();assert.equal(t.state,'cutscene','Exits use half a second of real time at low FPS');
 assert.equal(t.state,'cutscene');assert.equal(elements.get('escapeCutscene').hidden,false);
 assert.equal(elements.get('result').hidden,true);assert.equal(elements.get('hud').hidden,true);
 const position={...t.player},pursuers=t.enemies.map(e=>({x:e.x,z:e.z})),gameTime=t.elapsed;
 const firstCamera={...t.escapeExterior.camera.position};
 t.setFrameDt(.25);for(let i=0;i<20;i++)t.animate();
 assert.equal(t.state,'cutscene');assert.deepEqual({...t.player},position);
 assert.notDeepEqual({...t.escapeExterior.camera.position},firstCamera,'aerial camera must pan');
 assert.equal(t.lastRender.scene,t.escapeExterior.scene,'escape must render the 3D estate');
 assert.equal(t.elapsed,gameTime);assert.deepEqual(t.enemies.map(e=>({x:e.x,z:e.z})),pursuers);
 for(let i=0;i<20;i++)t.animate();
 assert.equal(t.state,'won');assert.equal(elements.get('result').hidden,false);
 t.animate();assert.equal(t.lastRender.scene,t.escapeExterior.scene,'result keeps the estate background');
 assert.equal(elements.get('escapeCutscene').hidden,true);
 assert(elements.get('resultBody').textContent.includes(exit.name.toLowerCase()));
 assert(elements.get('resultBody').textContent.includes('4 other routes are waiting.'));
}
for(const [floorIndex,floor] of floors.makeFloors(layout).entries())for(const exit of floor.exits){
 if(t.floors[floorIndex].exits.includes(exit))continue;
 startPlaying();Object.assign(t.player,{x:exit.x*layout.cellSize,z:exit.z*layout.cellSize,floor:floorIndex});t.showFloor();t.update(.01);
 assert(!core.nearExit(t.floors[floorIndex],t.player),'Unselected routes cannot be used');
 assert(elements.get('interact').hidden||element('interactb').textContent!=='HOLD E TO ESCAPE');
 t.keys.add('KeyE');t.update(.6);assert.equal(t.state,'play','Holding E at an inactive location must not escape');
}
for(const floorIndex of [0,1]){
 startPlaying();Object.assign(t.player,{x:20*layout.cellSize,z:21*layout.cellSize,floor:floorIndex});t.showFloor();t.keys.add('KeyE');t.update(.6);assert.equal(t.state,'play','The former portico exit is removed');
}
console.log('PASS: unselected routes and old portico cannot escape; active routes persist through retry.');
startPlaying();t.finish(true,t.floors.flatMap(f=>f.exits)[0].name);t.escapeCutscene.skip();assert.equal(t.state,'won');
t.escapeCutscene.skip();assert.equal(t.state,'won','Repeated skip is harmless');
startPlaying();assert.equal(t.escapeCutscene.active,false);assert.equal(elements.get('escapeCutscene').hidden,true);
assert.equal(elements.get('hud').hidden,false);
t.finish(false,'Security');assert.equal(t.state,'lost');assert.equal(t.escapeCutscene.active,false);
const reducedRoot=element('reduced'),reducedCamera=new Object3D();reducedCamera.aspect=16/9;
let completed=0;const reduced=createEscapeCutscene(reducedRoot,()=>completed++,{reducedMotion:true,getCamera:()=>reducedCamera});
reduced.start();const still={...reducedCamera.position};reduced.update(5);assert.deepEqual({...reducedCamera.position},still);
reduced.update(5);assert.equal(completed,1);
assert(sampleEscape(0,{aspect:.5}).position[1]>sampleEscape(0).position[1],'portrait framing pulls back');
assert.deepEqual(sampleEscape(30),sampleEscape(10),'camera stops at the final shot');
console.log('PASS: hold-E escape through all five active exits, ten-second pan at low FPS, frozen gameplay, retained result background, skip, retry, defeat exclusion, reduced motion.');

// Guard animation follows the actual NPC route, and shares all game freezes.
startPlaying();t.setElapsed(6);
const security=t.enemies.find(e=>e.type===1),guardRig=security.mesh.userData.guardRig;
function guardPose(){return [guardRig.phase,guardRig.amount,...guardRig.legs.flatMap(l=>[l.hip.rotation.x,l.knee.rotation.x,l.ankle.rotation.x]),...guardRig.arms.map(a=>a.shoulder.rotation.x)];}
// Keep the ghost away from the staged guard-animation scene.
Object.assign(t.enemies.find(e=>e.type===2),{x:50,z:17.5,floor:0,path:[],memory:0,rethink:0});
Object.assign(t.player,{x:10,z:50,floor:0});
Object.assign(security,{x:70,z:30,floor:0,path:[{x:70,z:40,floor:0}],target:{x:70,z:40,floor:0},memory:0,rethink:10});
const initialGuardPose=guardPose(),startZ=security.z;
for(let i=0;i<8;i++)t.update(.04);
assert(security.z>startZ,'Security patrol moves');
assert.notDeepEqual(guardPose(),initialGuardPose,'Patrolling must articulate the legs');
assert.equal(security.mesh.position.y,0,'Guard root stays on its floor instead of floating');
const frozenGuardPose=guardPose();
t.keys.add('KeyE');t.update(.04);assert.deepEqual(guardPose(),frozenGuardPose,'Hold-E freezes limbs as well as NPC navigation');t.keys.clear();
keydown('KeyH');t.update(.04);assert.deepEqual(guardPose(),frozenGuardPose,'Help/pause freezes the walk cycle');keydown('KeyH');
t.openArtViewer(t.artPanels[0]);t.keys.add('KeyE');t.update(.04);assert.deepEqual(guardPose(),frozenGuardPose,'Artwork inspection freezes the walk cycle');t.closeArtViewer();t.keys.clear();
Object.assign(t.player,{x:70,z:security.z+8,floor:0});
const chaseStart=security.z,chasePhase=guardRig.phase;t.update(.04);
assert(Math.abs(security.z-chaseStart-3.85*.04)<1e-8,'Pursuit keeps its existing speed');
assert(Math.abs((guardRig.phase-chasePhase)-3.85*.04*Math.PI*2/1.65)<1e-8,'Chasing advances the stride by its actual distance');
Object.assign(t.player,{x:10,z:50,floor:0});
security.path=[];security.rethink=10;const stoppedPhase=guardRig.phase;
for(let i=0;i<45;i++)t.update(.04);
assert.equal(guardRig.phase,stoppedPhase,'An idle route must not keep stepping');
assert.equal(guardRig.amount,0);
Object.assign(security,{floor:1,path:[{x:70,z:40,floor:1}],rethink:10});t.update(.04);
assert.equal(security.mesh.position.y,floors.FLOOR_HEIGHT,'Rig follows the upstairs floor offset');
assert.equal(security.mesh.visible,false,'The detailed guard remains hidden on another floor');
startPlaying();assert.equal(guardRig.phase,0);assert.equal(guardRig.amount,0);
const headStartPose=guardPose();t.update(.04);assert.deepEqual(guardPose(),headStartPose,'Five-second head start leaves the guard still');
console.log('PASS: guard patrol/chase stride integration, hold-E/help/artwork freeze, stationary routes, floor visibility and restart.');

// Detection latches the warning until both NPCs are outside the clearance radius.
for(const type of [1,2]){
 startPlaying();t.setElapsed(6);
 Object.assign(t.player,{x:70,z:38,floor:0});
 for(const e of t.enemies)Object.assign(e,{x:140,z:100,floor:0,path:[],rethink:10});
 const observer=t.enemies.find(e=>e.type===type),other=t.enemies.find(e=>e.type!==type);
 Object.assign(observer,{x:70,z:33});t.update(0);
 assert.equal(element('warning').textContent,"You've been spotted",`NPC type ${type} triggers the warning`);
 // Freeze NPCs while moving away, so loss of sight cannot clear the warning.
 t.keys.add('KeyE');Object.assign(observer,{x:70,z:100});Object.assign(other,{x:70,z:63});t.update(0);
 assert.equal(element('warning').textContent,"You've been spotted",'The other NPC keeps the warning active within 26 units');
 other.z=64;t.update(0);
 assert.equal(element('warning').textContent,'','Warning clears at 26 units from both NPCs, including while E is held');
 t.keys.clear();observer.z=33;t.update(0);
 assert.equal(element('warning').textContent,"You've been spotted",'Spotting can trigger again');
 startPlaying();t.update(0);
 assert.equal(element('warning').textContent,'YOU HAVE A FIVE-SECOND HEAD START','Restart clears the previous spotted state');
 t.keys.add('KeyE');t.setElapsed(6);t.update(0);
 assert.notEqual(element('warning').textContent,"You've been spotted",'No spotting is inherited by a new run');
}
console.log('PASS: guard/ghost spotted warning, both-NPC clearance, held-E persistence, retrigger and restart.');

let lastDiagnosis;
for(const draw of [0,0,.999999,.999999,.5]){
 sandbox.Math.random=()=>draw;
 startPlaying();t.finish(false,'Security');
 assert.equal(element('resultTitle').textContent,"You've been captured");
 const body=element('resultBody').textContent;
 const name=body.split('\n')[0].slice('Diagnosis: '.length);
 const diagnosis=diagnoses.find(d=>d.name===name);
 assert(diagnosis);assert.notEqual(name,lastDiagnosis);
 assert(body.includes('Treatment: '+diagnosis.treatment));
 assert(causes.some(c=>body.includes('Supposed cause: '+c.name+' — '+c.description)));
 assert(body.endsWith('Try again for a different diagnosis and treatment.'));
 assert.equal(element('result').hidden,false);assert.equal(element('resume').hidden,true);
 lastDiagnosis=name;
}
delete sandbox.Math.random;
console.log('PASS: randomized capture diagnoses, matching treatments and causes.');
