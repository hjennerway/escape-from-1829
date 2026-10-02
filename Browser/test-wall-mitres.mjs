import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
import {mitreRightAngleWalls} from './dist/wall-mitres.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16};}})})};
const exterior=createEscapeExterior(THREE,1.6);createAerialLayouts(THREE,exterior);
exterior.model.updateMatrixWorld(true);
const obstacles=exteriorObstacles(THREE,exterior.model),ray=new THREE.Raycaster(),runs=[];
// Survey the assembled estate, including thin box walls that have not opted in
// to the repair. This catches new uses of the original square-ended pattern.
exterior.model.traverse(mesh=>{
  if(!mesh.isMesh||mesh.isInstancedMesh||!/wall|foundation|parapet|coping/i.test(mesh.name))return;
  const m=mesh.userData.wallMitre,p=mesh.geometry.parameters;
  if(!m&&(mesh.geometry.type!=='BoxGeometry'||Math.min(p.width,p.depth)>.65))return;
  const alongX=m?.alongX??p.width>=p.depth,width=m?.width??Math.min(p.width,p.depth),length=m?.length??Math.max(p.width,p.depth);
  if(length<width*2)return;
  const axis=new THREE.Vector3(alongX?1:0,0,alongX?0:1).transformDirection(mesh.matrixWorld);
  if(Math.abs(axis.y)>1e-6)return; // Sloping stair cheeks are separate profiles.
  const center=mesh.getWorldPosition(new THREE.Vector3()),bounds=new THREE.Box3().setFromObject(mesh);
  runs.push({mesh,width,axis,center,bottom:bounds.min.y,top:bounds.max.y,ends:[-1,1].map(s=>({p:center.clone().addScaledVector(axis,s*length/2),out:axis.clone().multiplyScalar(-s)}))});
});
let corners=0,probes=0,collisionProbes=0;const families=new Set();
for(let i=0;i<runs.length;i++)for(let j=i+1;j<runs.length;j++){
  const a=runs[i],b=runs[j];
  if(a.mesh.material!==b.mesh.material||Math.abs(a.top-b.top)>1e-5||Math.abs(a.bottom-b.bottom)>1e-5||Math.abs(a.axis.dot(b.axis))>1e-5)continue;
  for(const ea of a.ends)for(const eb of b.ends){
    if(ea.p.distanceTo(eb.p)>1e-5)continue;
    const p=ea.p,u=ea.out,v=eb.out,meshes=[a.mesh,b.mesh],label=a.mesh.name+' / '+b.mesh.name;
    for(const sign of [-1,1])for(const f of [.27,.68,.96])for(const g of [.36,.79,.98]){
      // Negative directions are the formerly missing outer square. Positive
      // directions are the formerly overlapping inner square; exactly one top.
      const sample=p.clone().addScaledVector(u,sign*b.width*f/2).addScaledVector(v,sign*a.width*g/2);
      ray.set(new THREE.Vector3(sample.x,a.top+.2,sample.z),new THREE.Vector3(0,-1,0));ray.far=.3;
      const hits=ray.intersectObjects(meshes,false);
      assert.equal(hits.length,1,`Single continuous corner top (${sign}, ${f}, ${g}): ${label} at ${sample.x},${sample.z}`);
      assert(Math.abs(hits[0].point.y-a.top)<1e-5,'Corner top retains its height');probes++;
      if(sign<0&&a.mesh.userData.walkBarrier){
        assert(obstacles.some(o=>obstacleContains(o,sample.x,sample.z,0)),'Filled corner must block walking: '+label);collisionProbes++;
      }
    }
    // Both exposed faces reach the theoretical outside corner, at two heights.
    for(const [direction,across,half,otherHalf] of [[u,v,b.width/2,a.width/2],[v,u,a.width/2,b.width/2]])for(const t of [.2,.8]){
      const start=p.clone().addScaledVector(direction,-half-.2).addScaledVector(across,-otherHalf*.9);
      start.y=a.bottom+(a.top-a.bottom)*t;ray.set(start,direction);ray.far=.3;
      const hits=ray.intersectObjects(meshes,false);
      assert(hits[0]&&Math.abs(hits[0].distance-.2)<1e-5,'Outward-facing closed corner: '+label);probes++;
    }
    corners++;families.add(a.mesh.parent.name);
  }
}
for(const family of ['West semi-basement walk','East semi-basement walk','Front entrance split staircase','West side semi-basement','Irby/Ashley','Main/admin building','Tower service buildings','Laundry and brick connecting corridor'])assert(families.has(family),'Survey includes '+family);
assert.equal(corners,76,'Retain the full exterior corner survey');

// An isolated right-angle pair proves the survey rejects the original boxes,
// including after rotation. Different widths exercise the entrance-stair join.
for(const rotation of [0,.63,Math.PI]){
  const group=new THREE.Group(),material=new THREE.MeshBasicMaterial();group.rotation.y=rotation;
  const a=new THREE.Mesh(new THREE.BoxGeometry(2,1,.2),material),b=new THREE.Mesh(new THREE.BoxGeometry(.4,1,2),material);
  a.position.x=-1;b.position.z=1;group.add(a,b);group.updateMatrixWorld(true);
  const sample=new THREE.Vector3(.18,1,-.067).applyMatrix4(group.matrixWorld);
  ray.set(sample,new THREE.Vector3(0,-1,0));ray.far=2;
  assert.equal(ray.intersectObjects([a,b],false).length,0,'Original boxes reproduce the corner notch');
  mitreRightAngleWalls(THREE,[a,b]);group.updateMatrixWorld(true);
  assert.equal(ray.intersectObjects([a,b],false).length,1,'Mitre fills the original missing corner');
  // Rays along the centre line must cross no hidden internal end cap.
  const start=new THREE.Vector3(-.3,0,0).applyMatrix4(group.matrixWorld),direction=new THREE.Vector3(1,0,0).transformDirection(group.matrixWorld);
  ray.set(start,direction);ray.far=.49;
  assert.equal(ray.intersectObjects([a,b],false).length,0,'Joined runs have no internal cap');
}
console.log(`PASS: ${corners} exterior right-angle wall/coping joins, ${probes} coverage/overlap/normal probes, ${collisionProbes} filled-corner collision probes; rotated unequal-width and original-defect regressions.`);
