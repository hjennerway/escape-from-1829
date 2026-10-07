import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,asylumExitCenter} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
import {furnishAsylum} from './dist/asylum-furniture.mjs';
import {createEscapeProgress} from './dist/escape-progress.mjs';
import {createEscapeWorld} from './dist/escape-world.mjs';
import {createDoorLockFactory} from './dist/door-lock.mjs';
import {ESCAPE_GALLERY} from './dist/escape-corridor-plan.mjs';
import {STAIR_WIDTH} from './dist/asylum-stairs.mjs';

// Count signed crossings of an actual loop's interior, in that loop's plane.
// A linked pair crosses once; merely overlapping bounds cannot pass this test.
function linked(loop,matrix,other,otherMatrix){
 const inverse=matrix.clone().invert(),polygon=loop.map(p=>[p.x,p.y]);
 const inside=p=>{let result=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const [x,y]=polygon[i],[a,b]=polygon[j];if((y>p.y)!==(b>p.y)&&p.x<(a-x)*(p.y-y)/(b-y)+x)result=!result;
 }return result;};
 const points=other.map(p=>p.clone().applyMatrix4(otherMatrix).applyMatrix4(inverse));let crossings=0;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i];if((a.z>0)===(b.z>0))continue;
  const p=a.clone().lerp(b,-a.z/(b.z-a.z));if(inside(p))crossings+=b.z>a.z?1:-1;
 }
 return Math.abs(crossings)===1;
}
const samples=curve=>Array.from({length:129},(_,i)=>curve.getPoint(((i+.371)/128)%1));
const separation=(a,b)=>{let d=Infinity;for(const p of a)for(const q of b)d=Math.min(d,p.distanceTo(q));return d;};
let testedConnections=0;
function checkChain(group){
 group.updateMatrixWorld(true);
 const chain=group.getObjectByName('Heavy interlocking door chain'),runs=chain.userData.chainRuns,loop=samples(chain.geometry.parameters.path);
 const matrices=Array.from({length:chain.count},(_,i)=>{const m=new THREE.Matrix4();chain.getMatrixAt(i,m);return m;});
 assert.equal(runs.length,group.userData.doorLock.faces.length*4,'Four chain runs per face');
 const fittings=group.children.filter(o=>o.name==='Padlock face');
 for(const run of runs){
  for(let i=run.start;i<run.start+run.count-1;i++){
   assert(linked(loop,matrices[i],loop,matrices[i+1]),`${group.userData.doorLock.id}: links ${i}/${i+1} are threaded`);testedConnections++;
   // Wire separation also catches a chain made by intersecting solid rings.
   const a=loop.map(p=>p.clone().applyMatrix4(matrices[i])),b=loop.map(p=>p.clone().applyMatrix4(matrices[i+1]));
   assert(separation(a,b)>=chain.geometry.parameters.radius*2-.001,'Neighbouring iron wires do not cut through one another');
  }
  const fitting=fittings[group.userData.doorLock.faces.indexOf(run.face)];
  const anchors=fitting.children.filter(o=>o.name==='Chain anchor eye'),anchor=anchors[(run.side<0?0:2)+run.row],shackle=fitting.getObjectByName('Padlock shackle');
  const eye=samples({getPoint:t=>new THREE.Vector3(.05*Math.cos(t*Math.PI*2),.05*Math.sin(t*Math.PI*2),0)});
  assert(linked(loop,matrices[run.start],eye,anchor.matrix.clone().premultiply(fitting.matrix)),'First link threads its bolted eye');testedConnections++;
  assert(separation(loop.map(p=>p.clone().applyMatrix4(matrices[run.start])),eye.map(p=>p.clone().applyMatrix4(anchor.matrix).applyMatrix4(fitting.matrix)))>=.025-.001,'First link clears the eye wire');
  // Close the U through the solid lock body to check the last link's topology.
  const path=shackle.geometry.parameters.path,closed={getPoint:t=>t<.8?path.getPoint(t/.8):path.getPoint(1).lerp(path.getPoint(0),(t-.8)/.2)};
  assert(linked(loop,matrices[run.start+run.count-1],samples(closed),shackle.matrix.clone().premultiply(fitting.matrix)),'Last link threads the lock shackle');testedConnections++;
  assert(separation(loop.map(p=>p.clone().applyMatrix4(matrices[run.start+run.count-1])),samples(path).map(p=>p.clone().applyMatrix4(shackle.matrix).applyMatrix4(fitting.matrix)))>=.036-.001,'Last link clears the shackle wire');
 }
 const surface=group.userData.doorLock.depth/2;
 for(const p of loop)for(const m of matrices){const v=p.clone().applyMatrix4(m);assert(Math.abs(v.z)-chain.geometry.parameters.radius>surface,'Chain clears the timber face');}
}

const fittingResources=new Set(),addFitting=createDoorLockFactory(THREE,fittingResources);
for(const width of [STAIR_WIDTH-.14,1.55,1.9,ESCAPE_GALLERY.maxX-ESCAPE_GALLERY.minX-.575]){
 const group=addFitting(new THREE.Group(),{width,id:'width '+width});checkChain(group);
 group.getObjectByName('Heavy interlocking door chain').dispose();
}
for(const resource of fittingResources)resource.dispose();

const context=new Proxy({},{get:(_,key)=>key==='measureText'?text=>({width:text.length*16}):/Gradient$/.test(key)?()=>({addColorStop(){}}):()=>{}});
const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))),floors=buildAsylumLayout(plan).floors;
furnishAsylum(floors,{seed:1829});
for(const seed of [1829,10000019]){
 delete globalThis.document;
 const progress=createEscapeProgress({seed,floors}),groups=floors.map(f=>{const g=new THREE.Group();buildAsylumArchitecture(THREE,g,f);return g;});
 globalThis.document={createElement:()=>({getContext:()=>context})};
 const world=createEscapeWorld(THREE,floors,groups,progress);
 assert.equal(world.doorLocks.length,24);assert(world.doorLocks.every(d=>d.group.visible));
 for(const {floor,exit,group} of world.doorLocks){
  const centre=asylumExitCenter(exit),label=`${floor}:${exit.id}`,entrance=exit.id==='D1';
  assert.equal(group.position.x,centre.x);assert.equal(group.position.z,centre.z);
  assert.equal(group.rotation.y,exit.axis==='x'?Math.PI/2:0);
  group.updateWorldMatrix(true,true);
  const anchors=[];group.traverse(o=>{if(o.name==='Chain anchor plate')anchors.push(o);if(o.isMesh)assert(o.userData.noWalkingCollision);});
  assert.equal(anchors.length,4);
  // Test actual contact with timber at both mountings; also catches mounting
  // on the outside face or on an obsolete pre-inset doorway coordinate.
  for(const anchor of anchors){
   const p=anchor.getWorldPosition(new THREE.Vector3()),normal=new THREE.Vector3(exit.axis==='x'?-exit.facing:0,0,exit.axis==='z'?-exit.facing:0);
   const ray=new THREE.Raycaster(p.clone().addScaledVector(normal,.2),normal.clone().negate(),0,.3);
   const hit=ray.intersectObjects(groups[floor].children.filter(o=>entrance?['Asylum EntrancePaint','Asylum EntranceInset'].includes(o.name):o.name==='Asylum Panel'),false)[0];
   assert(hit,`${label} chain mounts to its rendered leaf`);
   assert(Math.abs(hit.distance-.214)<.01,`${label} anchor beds against timber (${hit.distance})`);
  }
  const bounds=new THREE.Box3().setFromObject(group),chain=group.getObjectByName('Heavy interlocking door chain');
  assert(bounds.max.y-bounds.min.y>.55,'Prominent chain and hanging lock');assert(chain.count>=16);checkChain(group);
 }
 for(const gate of world.gates)checkChain(gate.leaf.getObjectByName('Door chain and padlock'));
 progress.interact('staff-key');progress.openStair('S1');world.sync();
 assert(!world.gates.find(g=>g.id==='S1').leaf.visible);assert(world.gates.find(g=>g.id==='S5').leaf.visible);
 progress.interact('plan');world.sync();
 assert(world.doorLocks.every(d=>d.group.visible===progress.doorLocked(d.exit)));
 assert.equal(world.doorLocks.filter(d=>!d.group.visible).length,1,'Only the service-key entrance loses its chain');
 assert(progress.door({id:progress.run.exitId}).allowed);
 progress.capture();world.sync();assert(world.doorLocks.every(d=>d.group.visible),'Confiscated service key restores the existing lock requirement');
 progress.interact('reclaim');world.sync();assert.equal(world.doorLocks.filter(d=>!d.group.visible).length,1);
 progress.setDoorsUnlocked(true);world.sync();assert(world.doorLocks.every(d=>!d.group.visible));assert(world.gates.every(g=>!g.leaf.visible));
 progress.setDoorsUnlocked(false);world.sync();assert.equal(world.doorLocks.filter(d=>!d.group.visible).length,1);
 const locks=world.doorLocks.map(d=>d.group),textureDisposals=new Map();
 for(const lock of locks)lock.traverse(o=>{for(const property of ['map','roughnessMap','bumpMap']){
  const t=o.material?.[property];if(t&&!textureDisposals.has(t)){textureDisposals.set(t,0);t.addEventListener('dispose',()=>textureDisposals.set(t,textureDisposals.get(t)+1));}
 }});
 world.dispose();assert(locks.every(g=>!g.parent),'Restart removes every lock assembly');
 assert.equal(textureDisposals.size,2,'Patina and grain textures are shared across all door fittings');
 assert([...textureDisposals.values()].every(n=>n===1),'Restart disposes each shared lock texture exactly once');
}
console.log(`PASS: ${testedConnections} threaded link/eye/shackle connections; 24 locked exit fittings, timber attachment, both key routes, grille release, capture/reclaim, developer unlock and disposal.`);
