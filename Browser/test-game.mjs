// Exercise the real game loop without WebGL or external image/network access.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as core from './dist/core.mjs';
import * as floors from './dist/floors.mjs';
import {buildArchitecture} from './dist/architecture.mjs';
import {createEscapeCutscene} from './dist/escape-cutscene.mjs';
class Vector {
  constructor(){this.set(0,0,0);}
  set(x,y,z){Object.assign(this,{x,y,z});return this;}
  copy(v){return this.set(v.x,v.y,v.z);}
  addScaledVector(v,s){this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s;return this;}
}
class Object3D {
  constructor(g,m){this.children=[];this.position=new Vector();this.scale=new Vector();this.rotation=new Vector();this.material=m;this.visible=true;this.instanceMatrix={};}
  add(...objects){for(const o of objects){if(o.parent)o.parent.children=o.parent.children.filter(p=>p!==o);o.parent=this;this.children.push(o);}}
  updateMatrix(){} setMatrixAt(){} setPixelRatio(){} setSize(){} render(){}
  getWorldDirection(v){return v.set(0,0,-1);} updateProjectionMatrix(){}
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
const sandbox={...core,...floors,buildArchitecture,createEscapeCutscene,THREE,GLTFLoader:class {},
 document:{getElementById:element,createElement:()=>element('canvas'+elements.size),querySelectorAll:()=>[],body:element('body'),addEventListener(){},exitPointerLock(){}},
 window:{AudioContext:class {resume(){return Promise.resolve();}}},Image:class {},
 fetch:async()=>({ok:true,json:async()=>layout}),matchMedia:()=>({matches:false}),
 innerWidth:1280,innerHeight:800,devicePixelRatio:1,addEventListener(){},requestAnimationFrame(){},performance:{now:()=>0},console};
vm.createContext(sandbox);
vm.runInContext(source+`\nglobalThis.test={finish,escapeCutscene,start,update,resetPositions,showFloor,player,keys,get enemies(){return enemies;},get groups(){return floorGroups;},get artPanels(){return artPanels;},get artViewing(){return artViewing;},openArtViewer,closeArtViewer,get ready(){return ready;},get state(){return state;},get camera(){return camera;},setElapsed(v){elapsed=v;},setAudio(){audioOn=false;}};`,sandbox);
await new Promise(r=>setImmediate(r));
const t=sandbox.test;assert(t.ready,'init must complete');t.setAudio();t.start();
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
 t.keys.delete('KeyE');t.update(.04);t.start();
}
// The ghost uses a staircase, not an x/z-only collision through the ceiling.
Object.assign(t.player,{x:50,z:20,floor:1});t.showFloor();
for(const e of t.enemies){Object.assign(e,{x:35,z:30,floor:0,memory:0,rethink:0,path:[]});}
t.setElapsed(6);t.update(.04);assert.equal(t.state,'play');
const ghost=t.enemies[2];for(let i=0;i<100&&ghost.floor===0;i++)t.update(.04);
assert.equal(ghost.floor,1,'Ghost must follow upstairs via stair route');
Object.assign(t.player,{x:50,z:20,floor:1});
for(const e of t.enemies){Object.assign(e,{x:50,z:20,floor:0,memory:0,rethink:0,path:[]});}
t.update(.04);assert.equal(t.state,'play','Different-floor enemies must not capture player');
assert(t.enemies.every(e=>!e.mesh.visible));
t.start();assert.equal(t.player.floor,0);assert(t.enemies.every(e=>e.floor===0));
assert.equal(t.groups[0].visible,true);assert.equal(t.groups[1].visible,false);
console.log('PASS: real game init, both stair interactions, held-key latch, floor groups/HUD, ghost follows, cross-floor capture isolation, restart.');

for(const exit of layout.exits){
 t.start();t.finish(true,exit.name);
 assert.equal(t.state,'cutscene');assert.equal(elements.get('escapeCutscene').hidden,false);
 assert.equal(elements.get('result').hidden,true);assert.equal(elements.get('hud').hidden,true);
 const position={...t.player};
 t.escapeCutscene.update(5);assert.equal(t.state,'cutscene');assert.deepEqual({...t.player},position);
 t.escapeCutscene.update(5);assert.equal(t.state,'won');assert.equal(elements.get('result').hidden,false);
 assert.equal(elements.get('escapeCutscene').hidden,true);
 assert(elements.get('resultBody').textContent.includes(exit.name.toLowerCase()));
}
t.start();t.finish(true,layout.exits[0].name);t.escapeCutscene.skip();assert.equal(t.state,'won');
t.escapeCutscene.skip();assert.equal(t.state,'won','Repeated skip is harmless');
t.start();assert.equal(t.escapeCutscene.active,false);assert.equal(elements.get('escapeCutscene').hidden,true);
assert.equal(elements.get('hud').hidden,false);
t.finish(false,'Sandra');assert.equal(t.state,'lost');assert.equal(t.escapeCutscene.active,false);
const reducedRoot=element('reduced'),wide=reducedRoot.querySelector('[data-shot="wide"]'),detail=reducedRoot.querySelector('[data-shot="detail"]');
let completed=0;const reduced=createEscapeCutscene(reducedRoot,()=>completed++,{reducedMotion:true});
reduced.start();reduced.update(5);assert.equal(wide.style.transform,'none');assert.equal(detail.style.opacity,'1');
reduced.update(5);assert.equal(completed,1);
console.log('PASS: cutscene after all five exits, timed completion, skip, retry reset, defeat exclusion, reduced motion.');
