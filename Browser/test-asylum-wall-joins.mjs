import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,flatWalkable,segmentDistance} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
import {joinAsylumWalls} from './dist/asylum-wall-joins.mjs';

const wall=(a,b)=>({a,b,exterior:false});
for(const walls of [
 [wall([0,0],[1,0]),wall([1.22,0],[3,0])],
 [wall([0,0],[1,0]),wall([1.22,-1],[1.22,1])],
 [wall([0,0],[1,0]),wall([1.22,.1],[3,.1])],
 [wall([0,0],[1,0]),wall([1.22,-1],[1.22,-.2]),wall([2,0],[1.15,0])],
]){
 const snapshot=JSON.stringify(walls),joined=joinAsylumWalls(walls);
 assert.equal(JSON.stringify(walls),snapshot,'Joining leaves the sampled source intact');
 assert.notDeepEqual(joined,walls,'Short gaps must close');
 assert.deepEqual(joinAsylumWalls(joined),joined,'Joins must be stable');
 for(let i=0;i<walls.length;i++)for(const end of ['a','b'])assert(Math.hypot(joined[i][end][0]-walls[i][end][0],joined[i][end][1]-walls[i][end][1])<=.300001,'Repairs stay within the sampling tolerance');
}
const doorway=[wall([-3,0],[-.95,0]),wall([.95,0],[3,0])];
assert.deepEqual(joinAsylumWalls(doorway),doorway,'Intentional openings stay open');
const parallel=[wall([0,0],[1,0]),wall([1.2,.2],[3,.2])];
assert.deepEqual(joinAsylumWalls(parallel),parallel,'Separate parallel walls are not joined');
const collinear=joinAsylumWalls([wall([0,0],[1,0]),wall([1.2,0],[3,0])]);
assert.equal(collinear[0].b[0],collinear[1].a[0],'Straight repairs do not create overlapping faces');

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
const floors=buildAsylumLayout(plan).floors;
// Fixed survey of the reported Reception seam and equivalent sampled gaps,
// retained independently of the joining algorithm for rendered regression tests.
// Bay-room corner probes follow the aligned z=19.5 frontage. Ground R30's
// outer pier is beyond D8's retained doorway opening, starting at z=19.74.
const fixtures=JSON.parse(await readFile(new URL('./fixtures/asylum-wall-joins.json',import.meta.url)));
const ray=new THREE.Raycaster();let joins=0,samples=0;
for(const fixture of fixtures){
 const floor=floors[fixture.floor],scene=new THREE.Scene();buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
 if(floor.id!==2)for(const side of [-1,1])for(const [kind,y] of [['Brick',.55],['Plaster',1.65]]){
  ray.set(new THREE.Vector3(-7.1,y,17.3+side*.5),new THREE.Vector3(0,0,-side));ray.far=.7;
  assert.equal(ray.intersectObject(scene.getObjectByName('Asylum '+kind),false).length,0,'Reception masonry has no internal caps or hairline butt seams');
 }
 for(const {from,to} of fixture.gaps){
  const length=Math.hypot(to[0]-from[0],to[1]-from[1]),dx=(to[0]-from[0])/length,dz=(to[1]-from[1])/length;
  for(const t of [.2,.5,.8]){
   const x=from[0]+(to[0]-from[0])*t,z=from[1]+(to[1]-from[1])*t;
   assert(!flatWalkable(floor,x,z,.01),'Collision includes repaired masonry');
   for(const side of [-1,1])for(const [kind,y] of [['Brick',.55],['Plaster',1.65],['Plaster',2.8]]){
    ray.set(new THREE.Vector3(x-dz*side*.45,y,z+dx*side*.45),new THREE.Vector3(dz*side,0,-dx*side));ray.far=.65;
    // A joined T/corner has no internal end cap to hit from inside another
    // wall. Verify the solid at the target vertically for those buried probes.
    const solids=[...floor.walls,...(floor.exitHeaders??[]).filter(w=>y>w.height)];
    if(solids.some(w=>segmentDistance(ray.ray.origin.x,ray.ray.origin.z,w.a,w.b)<.09)){
     ray.set(new THREE.Vector3(x,1.2,z),new THREE.Vector3(0,-1,0));ray.far=.2;
     assert(ray.intersectObject(scene.getObjectByName('Asylum Brick'),false).length,'Buried join has a continuous solid footprint');continue;
    }
    const window=floor.windows?.find(w=>Math.abs(x-w.x)<.01&&Math.abs(z-w.z)<w.width/2&&y>w.sill&&y<w.sill+w.height),finish=window?'Glass':kind;
    assert(ray.intersectObject(scene.getObjectByName('Asylum '+finish),false).length,`Sealed ${finish} join on floor ${floor.id} at ${x},${z}, side ${side}`);samples++;
   }
  }
  joins++;
 }
}
// Independently survey convex corners from the reviewed centre lines. The
// bisector intersects the two offset faces at r / cos(half-angle). Square
// boxes stop short of that point, even though their centre lines connect.
let corners=0,cornerSamples=0;
for(const floor of floors){
 const scene=new THREE.Scene();buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
 const nextElevation=Math.min(...floor.levelElevations.filter(y=>y>floor.elevation));
 const wallTop=Math.max(floor.id===2?2.92:3.82,Number.isFinite(nextElevation)?nextElevation-floor.elevation+.001:0);
 const nodes=new Map();
 for(const w of floor.walls)for(const [p,q] of [[w.a,w.b],[w.b,w.a]]){
  const key=p.map(v=>v.toFixed(6)).join(','),length=Math.hypot(q[0]-p[0],q[1]-p[1]),d=[(q[0]-p[0])/length,(q[1]-p[1])/length];
  if(!nodes.has(key))nodes.set(key,{p,ends:[]});
  const node=nodes.get(key);if(!node.ends.some(e=>Math.hypot(e[0]-d[0],e[1]-d[1])<1e-6))node.ends.push(d);
 }
 for(const {p,ends} of nodes.values()){
  ends.sort((a,b)=>Math.atan2(a[1],a[0])-Math.atan2(b[1],b[0]));
  for(let i=0;i<ends.length;i++){
   const a=ends[i],b=ends[(i+1)%ends.length];if(a[0]*b[1]-a[1]*b[0]>=-1e-6)continue;
   const n=[-a[1]+b[1],a[0]-b[0]],length=Math.hypot(...n);n[0]/=length;n[1]/=length;
   const cosine=-n[0]*a[1]+n[1]*a[0],mitreReach=.09/cosine;
   // At extremely acute duplicate ends, the finite bevel is the line between
   // the two offset endpoints, rather than the unbounded line intersection.
   const reach=mitreReach>.36?.09*cosine:mitreReach;
   for(const fraction of [.80,.93,.99]){
    const x=p[0]+n[0]*reach*fraction,z=p[1]+n[1]*reach*fraction;
    for(const [kind,bottom,top] of [['Brick',0,1.125],['Plaster',1.125,wallTop]]){
     ray.set(new THREE.Vector3(x,top+.3,z),new THREE.Vector3(0,-1,0));ray.far=.4;
     const hit=ray.intersectObject(scene.getObjectByName('Asylum '+kind),false)[0];
     assert(hit&&Math.abs(hit.point.y-top)<1e-5,`No recessed ${kind} corner at floor ${floor.id}: ${p}, sample ${fraction}`);
     // A filled mitre must have outward side faces at both finish heights.
     const ox=x+n[0]*.4,oz=z+n[1]*.4;
     ray.set(new THREE.Vector3(ox,top+.3,oz),new THREE.Vector3(0,-1,0));ray.far=.4;
     const buried=ray.intersectObject(scene.getObjectByName('Asylum '+kind),false).length>0;
     if(!buried){
      ray.set(new THREE.Vector3(ox,(bottom+top)/2,oz),new THREE.Vector3(-n[0],0,-n[1]));ray.far=.5;
      const face=ray.intersectObject(scene.getObjectByName('Asylum '+kind),false)[0];
      assert(face&&face.distance<=.40001,`Exposed ${kind} corner is closed with outward normals at ${p}`);
     }
     cornerSamples++;
    }
    assert(!flatWalkable(floor,x,z),`Filled corner remains blocked to the player: ${JSON.stringify({floor:floor.id,p,ends,reach,x,z})}`);
   }
   corners++;
  }
 }
}
console.log(`PASS: ${joins} surveyed wall joins, ${samples} exposed masonry rays, ${corners} mitred corners / ${cornerSamples} brick and plaster probes across all floors, collision and preserved doorways.`);
