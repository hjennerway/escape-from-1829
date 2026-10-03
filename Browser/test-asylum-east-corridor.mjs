import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,moveAsylumActor,flatWalkable,segmentDistance} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
if(process.argv.includes('--baseline')){
 const before=JSON.parse(await readFile(new URL('./artifacts/east-corridor/asylum-plan-before.json',import.meta.url)));
 for(const id of ['R35','R36'])plan.rooms[plan.rooms.findIndex(r=>r.id===id)]=before.rooms.find(r=>r.id===id);
 plan.corridors[plan.corridors.findIndex(c=>c.id==='C6')]=before.corridors.find(c=>c.id==='C6');
 plan.floors[0].outline=before.floors[0].outline;
}
const floors=buildAsylumLayout(plan).floors,floor=floors[0],scene=new THREE.Scene();
buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster();let probes=0;
// Fixed endpoints come from the owner's purple wall ends and opposite blue
// corner. Test actual masonry on both faces, independently of plan generation.
for(const [a,b] of [[[33.8375,27],[31.45,29.42]],[[30.25,27],[32,25.25]]]){
 const length=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
 // Stay clear of the mitred end sectors where the adjoining wall shares
 // the ray's origin; endpoint connectivity is checked separately below.
 for(let i=3;i<=22;i++){
  const t=i/25,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
  assert(!flatWalkable(floor,x,z,.01),'The new wall faces have solid collision');
  for(const side of [-1,1])for(const [kind,y,depth] of [['Brick',.55,.09],['Plaster',1.65,.09],['Plaster',3.79,.09],['Skirting',.13,.1075]]){
   ray.set(new THREE.Vector3(x+nx*side*.35,y,z+nz*side*.35),new THREE.Vector3(-nx*side,0,-nz*side));ray.far=.5;
   const hit=ray.intersectObject(scene.getObjectByName('Asylum '+kind),false)[0];
   assert(hit&&Math.abs(hit.distance-(.35-depth))<1e-5,`${kind} joins the marked wall or 45-degree corner, sample ${i}, side ${side}`);probes++;
  }
 }
 for(const [x,z] of [a,b])assert(floor.walls.filter(w=>[w.a,w.b].some(p=>Math.hypot(p[0]-x,p[1]-z)<1e-6)).length>=2,'Each new end meets an existing wall');
}
// The cut-back triangle must lose the old square wall and its duplicate room
// edge. A normal-sized actor can now occupy and move through the former corner.
for(const [x,z] of [[31.9,26.9],[31.7,26.7],[31.9,26.5]])assert(flatWalkable(floor,x,z,.34),'The marked blue corner gives the corridor more room');
assert(Math.min(...floor.walls.map(w=>segmentDistance(32.28,26.76,w.a,w.b)))-.09>1.15,'The new diagonal corridor has over 2.3 units of clear width at the bend');
for(const [x,z] of [[31.6,26.7],[31.7,26.5]])for(const [name,y,dy] of [['Asylum floor',.5,-1],['Asylum ceiling',2.5,1]]){
 ray.set(new THREE.Vector3(x,y,z),new THREE.Vector3(0,dy,0));ray.far=2;
 assert.equal(ray.intersectObjects(scene.children,false)[0]?.object.name,name,'The cut-back triangle has a continuous floor and ceiling');
}
assert(!flatWalkable(floors[1],32,26.8,.01),'The first-floor square corner is retained');
assert(flatWalkable(floors[1],32.65,28.2,.01),'The new purple wall is ground-floor only');
const routes=[
 [[33.3,24.5],[33.3,26],[32.1,26.8],[30.25,29],[30.25,35]],
 [[30.25,32],[33,32]],
 [[33.3,24.5],[37.7,24.5]],
 [[33.3,26],[31.9,26.5],[31.9,26.9],[30.25,29]],
];
for(const route of routes)for(const reverse of [false,true]){
 const points=reverse?[...route].reverse():route,actor={x:points[0][0],z:points[0][1],floor:0,y:0};
 assert(flatWalkable(floor,actor.x,actor.z),'A route starts on a clear floor');
 for(const [x,z] of points.slice(1)){moveAsylumActor(floors,actor,x-actor.x,z-actor.z);assert(Math.hypot(actor.x-x,actor.z-z)<1e-6,`The bend and both room doorways stay walkable: ${actor.x},${actor.z} → ${x},${z}, reverse ${reverse}`);}
}
for(const id of ['R35','R36'])assert(floor.doorways.some(d=>d.roomId===id),'Both green room surrounds remain fitted');
console.log(`PASS: ${probes} wall/corner masonry and skirting rays, solid joins, widened corner, four routes walked both ways and ground-floor scope.`);
