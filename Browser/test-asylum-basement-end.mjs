import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,moveAsylumActor,flatWalkable} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
import {makeFloors,routeBetweenFloors} from './dist/floors.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
const floors=makeFloors(buildAsylumLayout(plan)),floor=floors[2],scene=new THREE.Scene();
buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
assert(!floor.doorways.some(d=>d.roomId==='B9'),'The rear area has no internal entrance doorway');
assert(floor.doorways.some(d=>d.roomId==='B1')&&floor.doorways.some(d=>d.roomId==='B2'),'Last side rooms retain their doors');
const ray=new THREE.Raycaster();let faces=0,walks=0;
function walk(actor,target){
 moveAsylumActor(floors,actor,target.x-actor.x,target.z-actor.z);
 assert(Math.hypot(actor.x-target.x,actor.z-target.z)<1e-6,'Visible open space is walkable');walks++;
}
// Independent measurements of the requested flares, beginning at the last
// side-room corners. Check rendered masonry/skirting as well as collision.
for(const [a,b,nx] of [[[-32.3,-27.1],[-38.1,-32.9],1],[[-29.9,-27.1],[-24.5,-32.5],-1]]){
 const normal=new THREE.Vector3(nx*Math.SQRT1_2,0,-Math.SQRT1_2);
 const actor={x:a[0]+normal.x*.65,z:a[1]+normal.z*.65,floor:2,y:floor.elevation};
 for(let i=1;i<50;i++){
  const t=i/50,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
  for(const [kind,y,depth] of [['Brick',.55,.09],['Plaster',1.65,.09],['Skirting',.13,.1075]]){
   ray.set(new THREE.Vector3(x+normal.x*.6,y,z+normal.z*.6),normal.clone().negate());ray.far=.8;
   const hit=ray.intersectObject(scene.getObjectByName('Asylum '+kind),false)[0];
   assert(hit&&Math.abs(hit.distance-(.6-depth))<1e-5,`${kind} forms a continuous 45-degree flare at ${x},${z}`);faces++;
  }
  walk(actor,{x:x+normal.x*.65,z:z+normal.z*.65});
  assert(!flatWalkable(floor,x,z),'The angled wall blocks walking');
 }
}
// Look and walk through the former door and across the full widening room.
// Upper rays catch leftover headers; low rays catch skirting across openings.
const passages=[...[-31.7,-31.1,-30.5].map(x=>[[x,-25.5],[x,-34.5]])];
for(const z of [-28,-29.5,-31,-33.8,-34.7]){
 const spread=-27.1-z;
 passages.push([[Math.max(-38.1,-32.3-spread)+.75,z],[Math.min(-24.5,-29.9+spread)-.75,z]]);
}
for(const [a,b] of passages){
 const direction=new THREE.Vector3(b[0]-a[0],0,b[1]-a[1]),distance=direction.length();direction.normalize();
 for(const y of [.13,1.65,2.75]){
  ray.set(new THREE.Vector3(a[0],y,a[1]),direction);ray.far=distance;
  assert.equal(ray.intersectObjects(scene.children,false).length,0,'No internal wall, frame, skirting or header divides the end area');
 }
 for(const reverse of [false,true]){
  const [start,end]=reverse?[b,a]:[a,b];
  walk({x:start[0],z:start[1],y:floor.elevation,floor:2},{x:end[0],z:end[1]});
 }
}
// Both newly opened side portions remain supported and connected to the
// corridor and the retained outside exit, including pursuer navigation.
const start={x:-31.1,z:-25.5,floor:2,y:floor.elevation};
for(const target of [{x:-36.8,z:-34,floor:2},{x:-25.8,z:-34,floor:2},{...floor.exits.find(e=>e.id==='D11').inside,floor:2}]){
 for(const [name,direction] of [['Asylum floor',[0,-1,0]],['Asylum ceiling',[0,1,0]]]){
  ray.set(new THREE.Vector3(target.x,1.65,target.z),new THREE.Vector3(...direction));ray.far=2;
  assert(ray.intersectObject(scene.getObjectByName(name),false).length,'The open room has a continuous '+name);
 }
 const route=routeBetweenFloors(floors,start,target);assert(route.length,'Rear corners and outside exit stay connected');
 const actor={...start};for(const point of route)walk(actor,point);
}
console.log(`PASS: open basement end, ${faces} rendered 45-degree wall/skirting samples, ${walks} walking checks, clear full-height entrance and retained outside exit.`);
