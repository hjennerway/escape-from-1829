import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,moveAsylumActor,flatWalkable,segmentDistance} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))),floors=buildAsylumLayout(plan).floors;
const ray=new THREE.Raycaster();let openings=0,walks=0;
for(const floor of floors){
 const scene=new THREE.Scene();buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
 assert.deepEqual(floor.doorways.filter(d=>d.roomId).map(d=>d.roomId),floor.rooms.filter(r=>r.doorSide&&r.id!=='R24').map(r=>r.id),'Enclosed rooms have framed doorways; open spaces and the Reception stair hall stay open');
 assert.deepEqual(floor.doorways.filter(d=>d.partitionId).map(d=>d.partitionId),(plan.partitions??[]).filter(p=>p.floors.includes(floor.id)).map(p=>p.id),'Corridor partitions retain their doorway');
 assert.equal(scene.children.filter(m=>m.name==='Asylum DoorFrame').length,1,'All frames share one material batch per floor');
 for(const partition of (plan.partitions??[]).filter(p=>p.floors.includes(floor.id))){
  const [a,b]=partition.points,d=floor.doorways.find(d=>d.partitionId===partition.id);
  assert.equal(d.x,(a[0]+b[0])/2);assert.equal(d.z,(a[1]+b[1])/2,'Corridor door is centered between the connected walls');
  // Inspect the requested joints themselves, including the angled outer wall.
  for(const [end,sign] of [[a,1],[b,-1]]){
   assert(floor.walls.filter(w=>segmentDistance(...end,w.a,w.b)<1e-6).length>=2,'Partition endpoints meet the existing wall center lines');
   // Offset from the center-line junction so the ray starts outside masonry.
   const x=end[0]+d.dx*sign*.12,z=end[1]+d.dz*sign*.12;
   for(const y of [.13,.55,1.65,3.2])for(const side of [-1,1]){
   ray.set(new THREE.Vector3(x-d.dz*side*.4,y,z+d.dx*side*.4),new THREE.Vector3(d.dz*side,0,-d.dx*side));ray.far=.8;
   if(floor.walls.some(w=>segmentDistance(ray.ray.origin.x,ray.ray.origin.z,w.a,w.b)<.09)){
    // This side starts inside the adjoining angled wall. Its hidden caps
    // disappear when masonry is united; probe the solid junction from above.
    ray.set(new THREE.Vector3(x,1.2,z),new THREE.Vector3(0,-1,0));ray.far=.2;
    assert(ray.intersectObject(scene.getObjectByName('Asylum Brick'),false).length,`${partition.id} has solid masonry at its buried junction`);continue;
   }
   assert(ray.intersectObjects(scene.children,false).length,`${partition.id} joins both existing walls at every height`);
   }
  }
 }
 for(const d of floor.doorways){
  const label=`floor ${floor.id} ${d.roomId??d.partitionId}`,normal=[-d.dz,d.dx];
  const point=(u,v,y)=>new THREE.Vector3(d.x+d.dx*u+normal[0]*v,y,d.z+d.dz*u+normal[1]*v);
  function across(u,y,side=1){ray.set(point(u,side*(d.depth/2+.20),y),new THREE.Vector3(-normal[0]*side,0,-normal[1]*side));ray.far=d.depth+.4;return ray.intersectObjects(scene.children,false);}
  for(const side of [-1,1]){
   for(const u of [-.45,0,.45])for(const y of [.13,1.65,2.3])assert.equal(across(u,y,side).length,0,`${label} open from threshold to head height`);
   assert.equal(across(0,d.height+.3,side)[0]?.object.name,'Asylum Plaster',`${label} masonry closes the space above the door`);
   for(const u of [-1.005,1.005]){
    const hits=across(u,d.height-.013,side),front=hits[0];
    assert.equal(front?.object.name,'Asylum DoorFrame');
    assert.equal(hits.filter(h=>Math.abs(h.distance-front.distance)<1e-6).length,1,`${label} frame/head joint has no competing faces`);
   }
   for(const u of [-1.2,1.2]){
    if(d.roomId==='R27'&&floor.id===1&&u<0){
     // The first-floor L-shaped enclosure turns beside this jamb. The old
     // broad-front probe starts inside that return from the room side;
     // inspect both exposed faces of the new frontage instead.
     ray.set(new THREE.Vector3(48.62+side*.4,1.65,7.65),new THREE.Vector3(-side,0,0));ray.far=.8;
     assert.equal(ray.intersectObjects(scene.children,false)[0]?.object.name,'Asylum Plaster',`${label} retains solid frontage along its new return`);
     assert(!flatWalkable(floor,48.62,7.65),`${label} return blocks movement`);
     continue;
    }
    assert.equal(across(u,1.65,side)[0]?.object.name,'Asylum Plaster',`${label} retains its room front beside the doorway`);
    assert(!flatWalkable(floor,point(u,0,0).x,point(u,0,0).z),`${label} visible frontage blocks movement`);
   }
   for(const u of [-.45,0,.45]){
    const start=point(u,side*(d.depth/2+.5),floor.elevation),end=point(u,-side*(d.depth/2+.5),floor.elevation),actor={x:start.x,z:start.z,y:floor.elevation,floor:floor.id};
    assert(flatWalkable(floor,actor.x,actor.z),`${label} approachable`);
    moveAsylumActor(floors,actor,end.x-start.x,end.z-start.z);
    assert(Math.hypot(actor.x-end.x,actor.z-end.z)<1e-6,`${label} walkable both ways without use interaction`);walks++;
   }
   ray.set(point(0,0,1.65),new THREE.Vector3(d.dx*side,0,d.dz*side));ray.far=1.2;
   assert.equal(ray.intersectObjects(scene.children,false)[0]?.object.name,'Asylum DoorFrame',`${label} jamb covers the masonry end`);
  }
  openings++;
 }
}
console.log(`PASS: ${openings} framed room doorways, ${walks} bidirectional walking passes, solid frontage/header raycasts, clear thresholds and one frame batch per floor.`);
