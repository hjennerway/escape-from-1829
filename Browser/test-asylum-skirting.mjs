import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,segmentDistance,asylumExitCenter} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
import {asylumSkirtingGeometry} from './dist/asylum-skirting.mjs';
import {asylumWallShapes,extrudeAsylumWalls} from './dist/asylum-wall-geometry.mjs';

const ray=new THREE.Raycaster(),material=new THREE.MeshBasicMaterial(),wall=(a,b)=>({a,b});
let windows=0,surfaces=0,clearances=0;
function cast(mesh,origin,direction){
 ray.set(new THREE.Vector3(...origin),new THREE.Vector3(...direction));ray.far=2;
 return ray.intersectObject(mesh,false);
}
function top(mesh,x,z){
 const hits=cast(mesh,[x,.7,z],[0,-1,0]);
 assert(hits.length,'Skirting must cover the wall footprint');
 assert(Math.abs(hits[0].point.y-.25)<1e-5);
 // Ignore a ray exactly on a triangulation edge, but reject coplanar overlap
 // with distinct triangle interiors (the source of the original shimmer).
 const interior=hits.filter(h=>{
  const p=mesh.geometry.attributes.position,f=h.face,a=new THREE.Vector3().fromBufferAttribute(p,f.a),b=new THREE.Vector3().fromBufferAttribute(p,f.b),c=new THREE.Vector3().fromBufferAttribute(p,f.c);
  const bary=THREE.Triangle.getBarycoord(h.point,a,b,c,new THREE.Vector3());
  return Math.min(bary.x,bary.y,bary.z)>1e-5;
 });
 assert(interior.length<=1,'Skirting top faces must not overlap');surfaces++;
}

// Outside/inside mitres, angled bends, T and crossing junctions, and partially
// duplicated partitions all need one continuous exposed surface.
for(const runs of [
 [wall([-2,0],[0,0]),wall([0,0],[0,2])],
 [wall([-2,0],[0,0]),wall([0,0],[1.7,1.3])],
 [wall([-2,0],[2,0]),wall([0,0],[0,2])],
 [wall([-2,0],[2,0]),wall([0,-2],[0,2]),wall([1.8,0],[-1.3,0])],
]){
 const mesh=new THREE.Mesh(asylumSkirtingGeometry(THREE,runs),material);mesh.updateMatrixWorld(true);
 for(let x=-.039;x<=.039;x+=.013)for(let z=-.039;z<=.039;z+=.017)top(mesh,x,z);
}
const corner=new THREE.Mesh(asylumSkirtingGeometry(THREE,[wall([-2,0],[0,0]),wall([0,0],[0,2])]),material);
corner.updateMatrixWorld(true);top(corner,.098,-.097); // Convex mitre beyond both original square ends.
const caps=new THREE.Mesh(asylumSkirtingGeometry(THREE,[wall([0,0],[2,0])]),material);caps.updateMatrixWorld(true);
assert(Math.abs(cast(caps,[-.5,.13,0],[1,0,0])[0].point.x+.012)<1e-5,'Free caps clear the brick end plane');
// Near-parallel sampled room boundaries share a start at the west end. Their
// theoretical mitre must not become a long spike outside the collision wall.
const acute=[wall([0,0],[8,0]),wall([0,0],[8,-.35])];
for(const geometry of [asylumSkirtingGeometry(THREE,acute),extrudeAsylumWalls(THREE,asylumWallShapes(THREE,acute),0,1.1)]){
 geometry.computeBoundingBox();
 assert(geometry.boundingBox.min.x>-.02,'An acute duplicate-wall join has a short closed bevel, never a projecting spike');
 geometry.dispose();
}

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))),floors=buildAsylumLayout(plan).floors;
for(const floor of floors){
 const snapshot=JSON.stringify(floor.walls),scene=new THREE.Scene();buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
 const mesh=scene.getObjectByName('Asylum Skirting');assert(mesh&&!mesh.isInstancedMesh);
 assert.equal(scene.children.filter(m=>m.name==='Asylum Skirting').length,1,'One draw call per floor');
 for(const w of floor.walls){
  const dx=w.b[0]-w.a[0],dz=w.b[1]-w.a[1],length=Math.hypot(dx,dz),nx=-dz/length,nz=dx/length;
  for(const t of [.173,.519,.827])for(const side of [-1,1])top(mesh,w.a[0]+dx*t+nx*side*.101,w.a[1]+dz*t+nz*side*.101);
  if(!w.exterior||length<3.5||floor.id===2)continue;
  const count=Math.floor(length/4.2);
  for(let i=0;i<count;i++)for(const along of [-.43,.013,.41])for(const side of [-1,1]){
   const t=(i+.5)/count,x=w.a[0]+dx*t+dx/length*along,z=w.a[1]+dz*t+dz/length*along;
   if(floor.walls.some(other=>other!==w&&segmentDistance(x+nx*side*.5,z+nz*side*.5,other.a,other.b)<.12))continue;
   ray.set(new THREE.Vector3(x+nx*side*.5,.137,z+nz*side*.5),new THREE.Vector3(-nx*side,0,-nz*side));ray.far=.7;
   const hits=ray.intersectObjects([mesh,scene.getObjectByName('Asylum Brick')],false);
   assert.equal(hits[0]?.object.name,'Asylum Skirting',`Continuous skirting beneath window at ${x},${z} on floor ${floor.id}`);
   const brick=hits.find(h=>h.object.name==='Asylum Brick');
   assert(!brick||brick.distance-hits[0].distance>.01,'Skirting clears masonry');windows++;
  }
 }
 for(const exit of floor.exits){
  const d=exit.axis==='x'?[1,0]:[0,1],centre=asylumExitCenter(exit);
  for(const offset of [-.55,.017,.55]){
   assert.equal(cast(mesh,[centre.x-d[0]+d[1]*offset,.13,centre.z-d[1]+d[0]*offset],[d[0],0,d[1]]).length,0,'Door thresholds stay clear');clearances++;
  }
 }
 assert.equal(JSON.stringify(floor.walls),snapshot,'Skirting leaves navigation walls unchanged');
}
console.log(`PASS: ${windows} window skirting samples, ${surfaces} single-surface top samples, convex/concave/angled mitres, intersecting/duplicate partitions, ${clearances} clear door samples, unchanged navigation.`);
