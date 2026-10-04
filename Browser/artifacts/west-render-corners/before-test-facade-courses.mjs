import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.6);model.updateMatrixWorld(true);
const ray=new THREE.Raycaster();
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
const courses=[];model.traverse(o=>{if(o.userData.facadeCourse)courses.push(o);});
assert.equal(courses.length,25,'Survey every repaired course, including reflected lawn bays, the restored inner pavilion and the three west roof-return cornices');
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
console.log(`PASS: ${courses.length} facade courses, ${corners} explicit and ${batchCorners} shared corner joins, ${probes} top/underside probes, plus Reception overlap and sill-lip regressions.`);
