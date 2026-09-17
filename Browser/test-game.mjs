// Exercise the real game loop without WebGL or external image/network access.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as core from './dist/core.mjs';
import * as floors from './dist/floors.mjs';
import {buildArchitecture} from './dist/architecture.mjs';
import {createEscapeCutscene,sampleEscape} from './dist/escape-cutscene.mjs';
import {bindTreeToggle} from './dist/tree-layer.mjs';
import {sampleLanding} from './dist/aerial-controls.mjs';
import {createArrivalCutscene,sampleArrival} from './dist/arrival-cutscene.mjs';
class Vector {
  constructor(){this.set(0,0,0);}
  set(x,y,z){Object.assign(this,{x,y,z});return this;}
  copy(v){return this.set(v.x,v.y,v.z);}
  addScaledVector(v,s){this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s;return this;}
}
class Object3D {
  constructor(g,m){this.children=[];this.position=new Vector();this.scale=new Vector();this.rotation=new Vector();this.material=m;this.visible=true;this.instanceMatrix={};}
  add(...objects){for(const o of objects){if(o.parent)o.parent.children=o.parent.children.filter(p=>p!==o);o.parent=this;this.children.push(o);}}
  updateMatrix(){} setMatrixAt(){} setPixelRatio(){} setSize(){} render(scene,camera){this.lastRender={scene,camera};}
  getWorldDirection(v){return v.set(0,0,-1);} updateProjectionMatrix(){} lookAt(){}
}
class Geometry {clone(){return new Geometry();}}
const THREE={Vector3:Vector,Object3D,Group:Object3D,Scene:Object3D,Mesh:Object3D,InstancedMesh:Object3D,
  WebGLRenderer:Object3D,PerspectiveCamera:Object3D,HemisphereLight:Object3D,PointLight:Object3D,SpotLight:Object3D,
  BoxGeometry:Geometry,PlaneGeometry:Geometry,CylinderGeometry:Geometry,SphereGeometry:Geometry,
  MeshStandardMaterial:class {constructor(args){Object.assign(this,args);}},MeshBasicMaterial:class {},CanvasTexture:class {},Color:class {},FogExp2:class {},Clock:class {getDelta(){return .016;}},
  MathUtils:{clamp:(v,a,b)=>Math.min(b,Math.max(a,v)),lerp:(a,b,t)=>a+(b-a)*t,mapLinear:(v,a,b,c,d)=>c+(v-a)/(b-a)*(d-c)}};
const elements=new Map();
function element(id){
 if(elements.has(id))return elements.get(id);
 const e={id,style:{},value:1.2,dataset:{},width:410,height:330,hidden:false,focus(){},addEventListener(){},classList:{toggle(){},add(){}},querySelector:s=>element(id+s)};
 const context=new Proxy({canvas:e},{get:(o,k)=>k in o?o[k]:()=>{}});e.getContext=()=>context;
 elements.set(id,e);return e;
}
const layout=JSON.parse(await readFile(new URL('./dist/layout.json',import.meta.url)));
const source=(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'');
const sandbox={bindTreeToggle,sampleLanding,...core,...floors,buildArchitecture,createEscapeCutscene,createArrivalCutscene,
 createEscapeExterior:()=>({scene:new Object3D(),camera:new Object3D()}),
 loadEscapeFrontage:async()=>{},THREE,GLTFLoader:class {},
 document:{getElementById:element,createElement:()=>element('canvas'+elements.size),querySelectorAll:()=>[],body:element('body'),addEventListener(){},exitPointerLock(){}},
 window:{AudioContext:class {resume(){return Promise.resolve();}}},Image:class {},
 fetch:async()=>({ok:true,json:async()=>layout}),matchMedia:()=>({matches:false}),
 innerWidth:1280,innerHeight:800,devicePixelRatio:1,addEventListener(){},requestAnimationFrame(){},performance:{now:()=>0},console};
vm.createContext(sandbox);
vm.runInContext(source+`\nglobalThis.test={finish,escapeCutscene,start,update,animate,resetPositions,showFloor,player,keys,get escapeExterior(){return escapeExterior;},get lastRender(){return renderer.lastRender;},get arrival(){return arrivalCutscene;},get elapsed(){return elapsed;},get enemies(){return enemies;},get groups(){return floorGroups;},get artPanels(){return artPanels;},get artViewing(){return artViewing;},openArtViewer,closeArtViewer,get ready(){return ready;},get state(){return state;},get camera(){return camera;},setElapsed(v){elapsed=v;},setAudio(){audioOn=false;},setFrameDt(v){clock.getDelta=()=>v;}};`,sandbox);
await new Promise(r=>setImmediate(r));
const t=sandbox.test;assert(t.ready,'init must complete');t.setAudio();
assert.deepEqual(Array.from(t.enemies,e=>({name:e.name,type:e.type,x:e.x,z:e.z})),[
 {name:'Security',type:1,x:80,z:57.5},
 {name:'Deva asylum ghost',type:2,x:50,z:52.5}
],'Only Security and the ghost spawn, retaining their behavior types and positions');
function startPlaying(){t.start();t.arrival.update(3);assert.equal(t.state,'play');}

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
 t.keys.add('KeyE');for(let i=0;i<22;i++)t.update(.04);
 assert.equal(t.player.floor,1);assert.equal(elements.get('floorName').textContent,'UPPER FLOOR');
 assert.equal(t.groups[0].visible,false);assert.equal(t.groups[1].visible,true);
 assert(t.camera.position.y>=floors.FLOOR_HEIGHT+1);
 for(let i=0;i<22;i++)t.update(.04);assert.equal(t.player.floor,1,'Held key must not bounce floors');
 t.keys.delete('KeyE');t.update(.04);t.keys.add('KeyE');
 for(let i=0;i<22;i++)t.update(.04);assert.equal(t.player.floor,0);
 t.keys.delete('KeyE');t.update(.04);startPlaying();
}
// The ghost uses a staircase, not an x/z-only collision through the ceiling.
Object.assign(t.player,{x:50,z:20,floor:1});t.showFloor();
for(const e of t.enemies){Object.assign(e,{x:35,z:30,floor:0,memory:0,rethink:0,path:[]});}
t.setElapsed(6);t.update(.04);assert.equal(t.state,'play');
const ghost=t.enemies.find(e=>e.type===2);for(let i=0;i<100&&ghost.floor===0;i++)t.update(.04);
assert.equal(ghost.floor,1,'Ghost must follow upstairs via stair route');
Object.assign(t.player,{x:50,z:20,floor:1});
for(const e of t.enemies){Object.assign(e,{x:50,z:20,floor:0,memory:0,rethink:0,path:[]});}
t.update(.04);assert.equal(t.state,'play','Different-floor enemies must not capture player');
assert(t.enemies.every(e=>!e.mesh.visible));
startPlaying();assert.equal(t.player.floor,0);assert(t.enemies.every(e=>e.floor===0));
assert.equal(t.groups[0].visible,true);assert.equal(t.groups[1].visible,false);
console.log('PASS: real game init, both stair interactions, held-key latch, floor groups/HUD, ghost follows, cross-floor capture isolation, restart.');

for(const exit of layout.exits){
 startPlaying();t.finish(true,exit.name);
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
}
startPlaying();t.finish(true,layout.exits[0].name);t.escapeCutscene.skip();assert.equal(t.state,'won');
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
console.log('PASS: 3D escape after all five exits, ten-second pan at low FPS, frozen gameplay, retained result background, skip, retry, defeat exclusion, reduced motion.');
