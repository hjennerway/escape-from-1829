import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,flatWalkable,segmentDistance,moveAsylumActor} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
const baseline=process.argv.includes('--baseline');
if(baseline){
 for(const id of ['R33','R32','R17','R11'])delete plan.rooms.find(r=>r.id===id).variants;
 for(const id of ['R35','R36','R22'])delete plan.rooms.find(r=>r.id===id).variants[1];
 delete plan.rooms.find(r=>r.id==='R30').variants[0];delete plan.rooms.find(r=>r.id==='B11').variants[2];
}
const floors=buildAsylumLayout(plan).floors,ray=new THREE.Raycaster();let probes=0,ends=0,walks=0;
// Independent coordinates survey every added room return and both faces of
// the north/south walls reserving a continuous west pavilion lobby.
const closures=[
 ...[0,1].flatMap(floor=>[
  {floor,a:[-36.9,19.1],b:[-34.5,22.85]},
  {floor,a:[-33.8375,27],b:[-31.45,29.42]},
  {floor,a:[-39.09756097560975,2.2],b:[-38,5.265822784810127]},
  {floor,a:[-69.65,7.4],b:[-66,7.4]},
  {floor,a:[-66,7.4],b:[-66,16.7]},
  {floor,a:[-66,16.7],b:[-69.65,16.7]},
  {floor,a:[-6.5,4.9],b:[3.9,4.9]},
 ]),
 {floor:1,a:[36.9,19.1],b:[34.5,22.85]},
 {floor:1,a:[33.8375,27],b:[31.45,29.42]},
 {floor:0,a:[67.1,19.5],b:[69.7,20.5]},
 {floor:2,a:[-7.8,9.4],b:[-7.8,17.3]},
];
for(const floor of floors){
 const scene=new THREE.Scene();buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
 for(const {a,b} of closures.filter(c=>c.floor===floor.id)){
  const length=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
  for(let i=3;i<=22;i++){
   const t=i/25,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
   assert(!flatWalkable(floor,x,z,.01),`Floor ${floor.id} room closure is solid in collision and map data`);
   for(const side of [-1,1])for(const [kind,y,depth] of [['Brick',.55,.09],['Plaster',1.65,.09],['Plaster',floor.id===2?2.89:4.19,.09],['Skirting',.13,.1075]]){
    ray.set(new THREE.Vector3(x+nx*side*.35,y,z+nz*side*.35),new THREE.Vector3(-nx*side,0,-nz*side));ray.far=.5;
    const hit=ray.intersectObject(scene.getObjectByName('Asylum '+kind),false)[0];
    assert(hit&&Math.abs(hit.distance-(.35-depth))<1e-5,`Floor ${floor.id} ${kind} continuously closes both room faces at ${x},${z}`);probes++;
   }
  }
  // Player-sized approaches independently prove that neither face is passable.
  const x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;
  for(const side of [-1,1]){
   const actor={x:x+nx*side*.7,z:z+nz*side*.7,y:floor.elevation,floor:floor.id};
   if(!flatWalkable(floor,actor.x,actor.z))continue;
   moveAsylumActor(floors,actor,-nx*side*1.4,-nz*side*1.4);
   assert((actor.x-x)*nx*side+(actor.z-z)*nz*side>.42,'Walking stops at each exposed closed face');walks++;
  }
 }
 // All remaining free ends must belong to a fitted doorway, an exterior
 // reveal, an explicit open space or a stair mouth. No loose room pillars
 // or unframed gaps can survive elsewhere on any of the four floors.
 for(const [i,w] of floor.walls.entries())if(!w.exterior)for(const p of [w.a,w.b]){
  if(floor.walls.some((v,j)=>j!==i&&segmentDistance(...p,v.a,v.b)<.12))continue;
  if(floor.doorways.some(d=>Math.abs((p[0]-d.x)*-d.dz+(p[1]-d.z)*d.dx)<.001&&Math.abs(Math.abs((p[0]-d.x)*d.dx+(p[1]-d.z)*d.dz)-d.width/2)<.001))continue;
  if(floor.exits.some(e=>Math.hypot(p[0]-e.worldX,p[1]-e.worldZ)<1.3))continue;
  if(floor.stairs.some(s=>p[0]>Math.min(...s.points.map(v=>v[0]))-.4&&p[0]<Math.max(...s.points.map(v=>v[0]))+.4&&p[1]>Math.min(...s.points.map(v=>v[1]))-.4&&p[1]<Math.max(...s.points.map(v=>v[1]))+.4))continue;
  assert.fail(`Unframed room-wall end on floor ${floor.id} at ${p}`);
 }
 ends+=floor.walls.filter(w=>!w.exterior).length*2;
}
for(const floor of floors.slice(0,2))for(const x of [-34.5,34.5])assert(flatWalkable(floor,x,19.4,.34),'Old forward-room pillar footprints are clear on both wings and both floors');
assert(flatWalkable(floors[2],-10.2,17.05,.01),'The isolated basement room pier is removed beside the retained outside wall');
assert.deepEqual(plan.rooms.filter(r=>r.floors.includes(3)).map(r=>r.id),['R41','R42','R43','R44','R45'],'The approved second-floor rooms all remain enclosed');
console.log(`PASS: ${closures.length} room closures, ${probes} masonry/skirting rays, ${walks} collision attempts, ${ends} wall ends audited across all four floors, removed pillars and retained second-floor rooms.`);
