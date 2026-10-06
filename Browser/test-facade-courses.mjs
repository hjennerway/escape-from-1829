import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {WEST_RANGE_PLAN} from './dist/west-range-plan.mjs';
import {WEST_END_PROPORTIONS} from './dist/west-refinement.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.6);model.updateMatrixWorld(true);
const ray=new THREE.Raycaster();
// Probe the complete scene rather than just each sweep. The old end bars
// were individually solid but met at different heights, and the low roof
// support doubled the otherwise continuous garden band.
let westProbes=0;
function surface(x,z,y,side,reach=.04){
 ray.set(new THREE.Vector3(x,y+side*reach/2,z),new THREE.Vector3(0,-side,0));ray.far=reach/2+.02;
 const hits=ray.intersectObject(model,true);
 assert.equal(hits.length,1,`One west trim surface at ${x}, ${y}, ${z}, side ${side}: ${JSON.stringify(hits.map(h=>({name:h.object.name,point:h.point.toArray(),face:h.faceIndex})))}`);
 assert(Math.abs(hits[0].point.y-y)<1e-5,'West courses join at the same level without doubled surfaces');
 assert.equal(hits[0].object.material.color.getHex(),0xe1e3dc,'The complete join uses matching white render');
 westProbes++;
}
const {outerRearZ,outerFrontZ,innerLeft,innerFrontZ,gardenZ}=WEST_RANGE_PLAN;
const {doorZ,pierWidth}=WEST_END_PROPORTIONS;
for(const y of [4.05,8.6]){
 for(const [x,z] of [[-72.27,outerRearZ-.20],[-72.27,outerFrontZ+.10],
   [-72.51,doorZ-pierWidth/2+.13],[-72.51,doorZ+pierWidth/2-.13],
   [-72.25,doorZ-pierWidth/2-.13],[-72.25,doorZ+pierWidth/2+.13]])
  for(const side of [-1,1])surface(x,z,y+side*.09,side);
}
for(const z of [gardenZ+.4,15.8,17.6,19.6,innerFrontZ-.8]){
 // A long downward/upward probe also rejects a second higher/lower strip.
 for(const side of [-1,1])surface(innerLeft-.16,z,8.6+side*.09,side,.8);
}
// Test the complete model first, independently of the repair's metadata.
for(const x of [-7.17,7.17])for(const y of [3.15,7.1,10.7]){
 ray.set(new THREE.Vector3(x,y+.135,19.64),new THREE.Vector3(0,-1,0));ray.far=.04;
 assert.equal(ray.intersectObject(model,true).length,1,'No competing Reception corner surfaces');
}
for(const x of [-4,4]){
 ray.set(new THREE.Vector3(x,2.985,20.2),new THREE.Vector3(0,0,-1));ray.far=1;
 const hit=ray.intersectObject(model,true)[0];
 assert(hit&&hit.point.z<19.601,'No sill fragment hangs below the Reception band');
}
for(const side of [-1,1])surface(innerLeft-.16,innerFrontZ-.3,8.6+side*.09,side);
const courses=[];model.traverse(o=>{if(o.userData.facadeCourse)courses.push(o);});
// The reflected east bands formerly started at z=19.8, before their wall
// returns from the diagonal corner at x+z=53.05. Survey the actual solid,
// including its cap and collision footprint, rather than its centreline.
for(const name of ['East lawn continuous upper floor band','East lawn bay continuous floor band']){
 const course=model.getObjectByName(name);assert(course);
 const positions=course.geometry.attributes.position;
 for(let i=0;i<positions.count;i++){
  const p=new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(course.matrixWorld);
  assert(p.x+p.z>=53.05-1e-5,name+' ends flush with the diagonal masonry');
 }
 for(const footprint of course.userData.collisionFootprints)for(const [x,z] of footprint){
  const p=new THREE.Vector3(x,0,z).applyMatrix4(course.matrixWorld);
  assert(p.x+p.z>=53.05-1e-5,'Walking support follows the trimmed course cap');
 }
}
for(const y of [4.165,8.63]){
 ray.set(new THREE.Vector3(31.88,y+.04,20.4),new THREE.Vector3(0,-1,0));ray.far=.08;
 assert.equal(ray.intersectObject(model,true).length,0,'No render strip hangs over the open east recess');
 ray.set(new THREE.Vector3(31.88,y+.04,22),new THREE.Vector3(0,-1,0));
 const hits=ray.intersectObject(model,true);
 assert.equal(hits.length,1,'Retain one supported strip beyond the corner');
 assert(Math.abs(hits[0].point.y-y)<1e-5);
}
// The later eave-flicker repair uses the same solid-sweep helper for its iron
// gutter. Keep surveying the 22 render courses and include that extra sweep.
const gutter=courses.filter(o=>o.name==='West outer end continuous gutter');
assert.equal(gutter.length,1,'The repaired outer-end gutter remains one continuous sweep');
assert.equal(courses.filter(o=>!gutter.includes(o)).length,22,'Survey all repaired render courses, including west end/garden bands and middle-arm cornices');
let corners=0,probes=0;
for(const course of courses){
 const {line,y,height,width}=course.userData.facadeCourse;
 for(let i=1;i<line.length-1;i++){
  const p=new THREE.Vector3(line[i][0],y,line[i][1]);
  const u=new THREE.Vector3(line[i-1][0]-p.x,0,line[i-1][1]-p.z).normalize();
  const v=new THREE.Vector3(line[i+1][0]-p.x,0,line[i+1][1]-p.z).normalize();
  for(const sign of [-1,1])for(const f of [.13,.32])for(const g of [.19,.36]){
   const sample=p.clone().addScaledVector(u,sign*width*f).addScaledVector(v,sign*width*g);
   for(const side of [-1,1]){
    const origin=sample.clone();origin.y=y+side*(height/2+.1);origin.applyMatrix4(course.matrixWorld);
    ray.set(origin,new THREE.Vector3(0,-side,0));ray.far=.2;
    const hits=ray.intersectObject(course,false);
    assert.equal(hits.length,1,`${course.name}: exactly one ${side>0?'top':'underside'} at corner ${i}`);
    assert(Math.abs(hits[0].distance-.1)<1e-5,'The course stays level through the mitre');probes++;
   }
  }
  corners++;
 }
}
let batchCorners=0;
model.traverse(course=>{
 for(const join of course.userData.facadeBoxJoins??[]){
  const p=new THREE.Vector3(...join.point),u=new THREE.Vector3(...join.a),v=new THREE.Vector3(...join.b);
  for(const sign of [-1,1])for(const side of [-1,1]){
   const origin=p.clone().addScaledVector(u,sign*join.width*.13).addScaledVector(v,sign*join.width*.27);
   origin.y+=side*(join.height/2+.1);
   const target=origin.clone();target.y-=side*.1;target.applyMatrix4(course.matrixWorld);origin.applyMatrix4(course.matrixWorld);
   ray.set(origin,new THREE.Vector3(0,-side,0));ray.far=origin.distanceTo(target)+.03;
   const hits=ray.intersectObject(course,false);
   assert.equal(hits.length,1,'One exposed surface at '+course.name+' '+join.point+' '+JSON.stringify({sign,side,hits:hits.map(h=>({distance:h.distance,point:h.point.toArray(),face:h.faceIndex}))}));
   assert(hits[0].point.distanceTo(target)<2e-5,'Joined course retains its level and outward normals');probes++;
   const normal=hits[0].face.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(course.matrixWorld)).normalize();
   assert(normal.y*side>.99,'Both sides have outward normals, including double-sided stone');
  }
  batchCorners++;
 }
});
assert(batchCorners>90,'Survey remaining ward, courtyard and shop courses');
console.log(`PASS: ${courses.length} facade courses, ${corners} explicit and ${batchCorners} shared corner joins, ${probes} top/underside and ${westProbes} complete-scene west probes, plus Reception overlap and sill-lip regressions.`);
