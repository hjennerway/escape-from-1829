import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,moveAsylumActor,flatWalkable} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
if(process.argv.includes('--baseline')){
 delete plan.rooms.find(r=>r.id==='R35').variants[0];
 delete plan.corridors.find(c=>c.id==='C6').variants[0];
}
const floors=buildAsylumLayout(plan).floors,floor=floors[0],scene=new THREE.Scene();
buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster();let samples=0;
// The owner's marked ground-floor view replaces the isolated R35 fragment
// with a continuous diagonal from the north wall to the doorway's side wall.
// Fixed points keep this survey independent of the generated room boundary.
for(const z of [19.2,19.4,19.6]){
 assert(flatWalkable(floor,34.5,z,.34),'The former pillar footprint is walkable');
 for(const [kind,y] of [['Brick',.55],['Plaster',1.65],['Skirting',.13]]){
  ray.set(new THREE.Vector3(34.9,y,z),new THREE.Vector3(-1,0,0));ray.far=.65;
  assert.equal(ray.intersectObject(scene.getObjectByName('Asylum '+kind),false).length,0,'No masonry or skirting remains at the former pillar');
 }
}
const a=[36.9,19.1],b=[34.5,22.85],length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length;
for(let i=1;i<25;i++){
 const t=i/25,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
 assert(!flatWalkable(floor,x,z,.01),'The closed wall is in the shared collision/map data');
 for(const side of [-1,1])for(const [kind,y,depth] of [['Brick',.55,.09],['Plaster',1.65,.09],['Plaster',3.79,.09],['Skirting',.13,.1075]]){
  ray.set(new THREE.Vector3(x-dz*side*.35,y,z+dx*side*.35),new THREE.Vector3(dz*side,0,-dx*side));ray.far=.5;
  const hit=ray.intersectObject(scene.getObjectByName('Asylum '+kind),false)[0];
  assert(hit&&Math.abs(hit.distance-(.35-depth))<1e-5,`${kind} closes the marked diagonal on both faces, sample ${i}, side ${side}`);samples++;
 }
}
for(const [x,z] of [a,b])assert(floor.walls.filter(w=>[w.a,w.b].some(p=>Math.hypot(p[0]-x,p[1]-z)<1e-6)).length>=2,'The diagonal joins both existing wall runs');
for(const route of [
 [[36.3,13.8],[35.3,18.1],[33.3,22.5],[33.3,24.5],[37.7,24.5]],
 [[36.3,13.8],[35.3,18.1],[33.3,22.5],[33.3,26],[32.1,26.8],[30.25,29],[30.25,35]],
])for(const reverse of [false,true]){
 const points=reverse?[...route].reverse():route,actor={x:points[0][0],z:points[0][1],floor:0,y:0};
 for(const [x,z] of points.slice(1)){moveAsylumActor(floors,actor,x-actor.x,z-actor.z);assert(Math.hypot(actor.x-x,actor.z-z)<1e-6,`The room doorway and forward corridor remain walkable in both directions: ${actor.x},${actor.z} → ${x},${z}, reverse ${reverse}`);}
}
assert(flatWalkable(floors[1],34.5,19.4,.34),'The later all-floor request removes the matching first-floor pillar too');
console.log(`PASS: ${samples} masonry/skirting rays, removed pillars on both floors, continuous diagonal wall and room/corridor walks.`);
