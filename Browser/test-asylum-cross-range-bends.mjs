import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,moveAsylumActor,flatWalkable,segmentDistance} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
const control=structuredClone(plan);
delete control.rooms.find(r=>r.id==='R27').variants[0];
for(const id of ['R22','R4'])delete control.rooms.find(r=>r.id===id).variants[0];
const loop=control.floors[0].outline.loops[0],corner=loop.findIndex(p=>p[0]===43.35&&p[1]===7);
assert(corner>=0,'The opposite corner has its reviewed 45-degree cut');
loop.splice(corner,2,[45.1,7]);
control.floors[0].outline.area-=1.75*1.75/2;
const floors=buildAsylumLayout(process.argv.includes('--baseline')?control:plan).floors;
const floor=floors[0],scene=new THREE.Scene();
buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster();let probes=0;
// Survey the two marked boundaries independently of the plan's generated walls.
const closure=[[45.1,8.535087719298245],[46.6139534883721,7]],chamfer=[[43.35,7],[45.1,5.25]];
const westClosure=[[-39.09756097560975,2.2],[-38,5.265822784810127]],westChamfer=[[-34.6,5.25],[-32.85,7]];
for(const [a,b] of [closure,chamfer,westClosure,westChamfer]){
 const length=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
 for(let i=3;i<=22;i++){
  const t=i/25,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
  assert(!flatWalkable(floor,x,z,.01),'The repaired boundary blocks walking');
  for(const side of [-1,1])for(const [kind,y,depth] of [['Brick',.55,.09],['Plaster',1.65,.09],['Plaster',3.79,.09],['Skirting',.13,.1075]]){
   ray.set(new THREE.Vector3(x+nx*side*.35,y,z+nz*side*.35),new THREE.Vector3(-nx*side,0,-nz*side));ray.far=.5;
   const hit=ray.intersectObject(scene.getObjectByName('Asylum '+kind),false)[0];
   assert(hit&&Math.abs(hit.distance-(.35-depth))<1e-5,`${kind} is continuous on both faces at ${x},${z}, side ${side}`);probes++;
  }
 }
 for(const [x,z] of [a,b])assert(floor.walls.filter(w=>[w.a,w.b].some(p=>Math.hypot(p[0]-x,p[1]-z)<1e-6)).length>=2,'The new section joins the existing walls');
}
assert.equal(Math.abs(chamfer[1][0]-chamfer[0][0]),Math.abs(chamfer[1][1]-chamfer[0][1]),'The opposite wall is exactly 45 degrees');
assert(Math.abs(Math.abs(westChamfer[1][0]-westChamfer[0][0])-Math.abs(westChamfer[1][1]-westChamfer[0][1]))<1e-8,'The west opposite wall is also 45 degrees');
for(const [x,z] of [[44.95,6.9],[44.8,6.8],[44.6,6.8]]){
 assert(flatWalkable(floor,x,z,.34),'The old projecting corner has walking clearance');
 for(const [name,y,dy] of [['Asylum floor',.5,-1],['Asylum ceiling',2.5,1]]){
  ray.set(new THREE.Vector3(x,y,z),new THREE.Vector3(0,dy,0));ray.far=2;
  assert.equal(ray.intersectObjects(scene.children,false)[0]?.object.name,name,'The cut-back triangle has a solid floor and ceiling');
 }
}
assert(Math.min(...floor.walls.map(w=>segmentDistance(45.1,6.9,w.a,w.b)))-.09>1,'The bend retains over two units of clear width');
for(const [x,z] of [[-34.6,6.9],[-34.5,6.7],[-34.5,6.5]])assert(flatWalkable(floor,x,z,.34),'The west square corner is cleared');
const routes=[
 [[40,8.2],[43.8,8.2],[46.3,5.7],[49.75,5.7],[54,5.7]],
 [[49.75,5.7],[49.75,7],[49.75,11],[47,11],[46,10]],
 [[43.8,8.2],[44.6,6.8],[44.95,6.9],[46.3,5.7]],
 [[-48,1],[-38.4,1],[-35.8,8.2],[-30,8.2]],
 [[-42.5,1],[-42.5,2.2],[-42.5,8],[-40.5,8]],
 [[-35.8,2],[-34.6,2],[-31,2]],
 [[-35.8,8.2],[-34.6,6.9],[-34.5,6.5],[-35.8,4]],
];
for(const route of routes)for(const reverse of [false,true]){
 const points=reverse?[...route].reverse():route,actor={x:points[0][0],z:points[0][1],floor:0,y:0};
 assert(flatWalkable(floor,actor.x,actor.z),'The route starts on a clear surface');
 for(const [x,z] of points.slice(1)){moveAsylumActor(floors,actor,x-actor.x,z-actor.z);assert(Math.hypot(actor.x-x,actor.z-z)<1e-6,`The corridor and retained doorway are walkable both ways: ${actor.x},${actor.z} -> ${x},${z}`);}
}
assert(floor.doorways.some(d=>d.roomId==='R27'&&d.x===49.75&&d.z===7),'The green room entrance remains fitted in place');
for(const id of ['R22','R4'])assert(floor.doorways.some(d=>d.roomId===id),'The west room entrances retain their fitted surrounds');
const unaffected=buildAsylumLayout(control).floors;
for(const f of floors.filter(f=>f.id!==0))assert.deepEqual(f.walls,unaffected[f.id].walls,'Other floor boundaries are unchanged by this repair');
assert.deepEqual(plan,JSON.parse(await readFile(new URL('../Research/1829-interior-proposal/plan-data.json',import.meta.url))),'Game and review plans agree');
console.log(`PASS: ${probes} masonry/skirting rays, east/west room closures and opposite 45-degree faces, floor/ceiling coverage, seven bidirectional routes and ground-floor scope.`);
