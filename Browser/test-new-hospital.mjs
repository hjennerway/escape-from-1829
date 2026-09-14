import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {NEW_HOSPITAL,NEW_HOSPITAL_GROUND_VIEW,HOSPITAL_COURTS,hospitalMapPoint} from './dist/new-hospital.mjs';
import {createWalker,exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
import {createAerialControls} from './dist/aerial-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const exterior=createEscapeExterior(THREE,16/9),hospital=exterior.newHospital;
exterior.scene.updateMatrixWorld(true);
for(const [map,world] of [[[654,504],[0,13]],[[608,302],[-6,-120]],[[787,373],[150,-53]]]){
 const p=hospitalMapPoint(...map);assert(Math.hypot(p[0]-world[0],p[1]-world[1])<1e-8,'map registration must retain each existing landmark');
}
assert(hospital.position.x>350,'larger map places the new hospital farther east than the initial model');
assert.equal(hospital.getObjectByName('Central hall brick walls').material,exterior.model.getObjectByName('Redesmere outer brick elevation').material);
assert.equal(hospital.getObjectByName('Central hall slate roof').material,exterior.model.getObjectByName('Entrance west recessed slate roof').material);
const obstacles=exteriorObstacles(THREE,hospital),walls=obstacles.filter(b=>b.corners);
// Flood the actual rendered masonry footprint. Exactly three substantial empty
// regions must be enclosed, while each of the four U courts reaches outside.
const minX=Math.floor(Math.min(...walls.map(b=>b.minX)))-10,minZ=Math.floor(Math.min(...walls.map(b=>b.minZ)))-10;
const width=Math.ceil(Math.max(...walls.map(b=>b.maxX)))-minX+11,height=Math.ceil(Math.max(...walls.map(b=>b.maxZ)))-minZ+11;
const cells=new Int32Array(width*height);
for(let z=0;z<height;z++)for(let x=0;x<width;x++)if(walls.some(b=>obstacleContains(b,minX+x,minZ+z,0)))cells[z*width+x]=-1;
let component=0;const sizes=[];
for(let start=0;start<cells.length;start++){
 if(cells[start]!==0)continue;component++;const queue=[start];cells[start]=component;
 for(let i=0;i<queue.length;i++){
  const p=queue[i],x=p%width,z=Math.floor(p/width);
  for(const [nx,nz] of [[x-1,z],[x+1,z],[x,z-1],[x,z+1]])if(nx>=0&&nx<width&&nz>=0&&nz<height){const q=nz*width+nx;if(cells[q]===0){cells[q]=component;queue.push(q);}}
 }
 sizes[component]=queue.length;
}
const outside=cells[0],enclosed=sizes.map((size,id)=>({size,id})).filter(c=>c.id!==outside&&c.size>15);
assert.equal(enclosed.length,3,'rendered footprint must contain exactly three enclosed courtyard voids');
const ray=new THREE.Raycaster();
for(const court of HOSPITAL_COURTS){
 const avg=court.points.reduce((s,p)=>[s[0]+p[0]/4,s[1]+p[1]/4],[0,0]),[x,z]=hospitalMapPoint(...avg);
 const id=cells[Math.round(z-minZ)*width+Math.round(x-minX)];
 assert(id>0,court.name+' centre must be empty');
 assert.equal(id!==outside,court.closed,court.name+' must have the specified enclosure');
 ray.set(new THREE.Vector3(x,40,z),new THREE.Vector3(0,-1,0));
 const hits=ray.intersectObject(hospital,true).filter(h=>h.object.name.endsWith('slate roof'));
 assert.equal(hits.length,0,court.name+' must remain open to the sky');
}
for(const o of hospital.userData.newHospitalOpenings){
 const dx=Math.sin(o.rotation),dz=Math.cos(o.rotation);
 ray.set(new THREE.Vector3(o.x+NEW_HOSPITAL.x+dx*.7,o.y,o.z+NEW_HOSPITAL.z+dz*.7),new THREE.Vector3(-dx,0,-dz));
 assert(ray.intersectObject(hospital,true)[0]?.object.isInstancedMesh,'all windows must be exposed ahead of the angled masonry');
}
for(const b of hospital.userData.ranges){
 const px=b.x+Math.sin(b.rotation)*b.d*.25+NEW_HOSPITAL.x,pz=b.z+Math.cos(b.rotation)*b.d*.25+NEW_HOSPITAL.z;
 ray.set(new THREE.Vector3(px,40,pz),new THREE.Vector3(0,-1,0));const hit=ray.intersectObject(hospital,true).find(h=>h.object.name.endsWith('slate roof'));
 assert(hit&&hit.face.normal.y>0,'every range must have an upward-facing slate roof');
}
const walk=createWalker(exterior.camera,exteriorObstacles(THREE,exterior.model));
walk.setView(NEW_HOSPITAL_GROUND_VIEW);const before=exterior.camera.position.clone();walk.keys.add('KeyW');walk.update(.1);
assert(exterior.camera.position.distanceTo(before)>.45,'western approach must permit movement');
// Walk into a long oblique wall from outside: stop at its actual face.
const b=hospital.userData.ranges.find(b=>b.name==='South west wing range 2'),nx=Math.sin(b.rotation),nz=Math.cos(b.rotation);
const wx=b.x+NEW_HOSPITAL.x,wz=b.z+NEW_HOSPITAL.z;
walk.setView({position:[wx+nx*(b.d/2+8),1.8,wz+nz*(b.d/2+8)],target:[wx,1.8,wz]});walk.keys.add('KeyW');for(let i=0;i<40;i++)walk.update(.1);
const distance=(exterior.camera.position.x-wx)*nx+(exterior.camera.position.z-wz)*nz;
assert(distance>b.d/2&&distance<b.d/2+1,'walking must stop close to the actual rotated wall');
// Find an empty point inside a wall AABB to guard against blocking whole courts.
const rotated=walls.find(b=>{for(let x=b.minX+1;x<b.maxX-1;x++)for(let z=b.minZ+1;z<b.maxZ-1;z++)if(!obstacleContains(b,x,z))return true;return false;});
assert(rotated,'diagonal footprints retain empty corners within their bounding boxes');
exterior.camera.position.set(450,140,177);exterior.camera.lookAt(NEW_HOSPITAL.x,0,0);
const controls=createAerialControls(exterior.camera);controls.sync([NEW_HOSPITAL.x,0,0]);controls.panPixels(-2,0);
assert(controls.target.x>NEW_HOSPITAL.x,'hospital aerial navigation must not snap to the previous eastern limit');
console.log('PASS: map landmark alignment; exactly three enclosed and four open courtyard regions; roofs, glazing, oblique wall collisions and eastern navigation.');
