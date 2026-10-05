import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.5);model.updateMatrixWorld(true);
const roof=model.getObjectByName('West end continuous slate roof').material;
const roofs=[],render=[];model.traverse(o=>{
 if(o.isMesh&&o.material===roof)roofs.push(o);
 if(o.isMesh&&/^West outer corner joined cornice|^West (court|garden) descending roof render return|^West court roof corner render riser/.test(o.name))render.push(o);
});
const ray=new THREE.Raycaster();
function top(x,z){
 ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));
 const h=ray.intersectObjects(roofs,false)[0];assert(h?.face.normal.y>0,'An upward slate face covers each ridge sample');return h.point.y;
}
for(const [x,z,y] of [[-65.6,6.6,15.47],[-63.6,13.425,15.47]]){
 const dx=x+68,dz=z-9.25,length=Math.hypot(dx,dz);
 for(let t=.02;t<=1;t+=.035){
  const px=-68+dx*t,pz=9.25+dz*t;
  assert(Math.abs(top(px,pz)-(17.08+(y-17.08)*t))<.00001,'The descending ridge reaches the tall render');
  assert(Math.abs(top(px+dz/length*.0001,pz-dx/length*.0001)-top(px-dz/length*.0001,pz+dx/length*.0001))<.001,'Both pitches share the descending ridge');
 }
}
assert.equal(render.length,6,'Both outer cornices and the three solid returns are surveyed');
let intersections=0;
for(const o of render){
 const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry,p=g.attributes.position,bottom=new THREE.Box3().setFromObject(o).min.y;
 for(let i=0;i<p.count;i+=3){
  const vertices=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,i+j).applyMatrix4(o.matrixWorld)),[a,b,c]=vertices;
  if(b.clone().sub(a).cross(c.clone().sub(a)).y<1e-8)continue;
  for(const weights of [[1/3,1/3,1/3],[.1,.2,.7],[.2,.7,.1],[.7,.1,.2]]){
   const sample=vertices.reduce((v,p,j)=>v.addScaledVector(p,weights[j]),new THREE.Vector3());
   ray.set(new THREE.Vector3(sample.x,30,sample.z),new THREE.Vector3(0,-1,0));
   assert(!ray.intersectObjects(roofs,false).some(h=>h.point.y>bottom+.0001&&h.point.y<sample.y-.0001),'Slate cannot cross the middle of '+o.name);
   intersections++;
  }
 }if(g!==o.geometry)g.dispose();
}
for(const side of ['court','garden'])for(const t of [.15,.35,.55,.75,.9]){
 const y=(14.31+15.47+(14.53-15.47)*t)/2,start=side==='court'?[-65.6+.3*t,y,6.1]:[-63.25,y,13.425+.475*t];
 ray.set(new THREE.Vector3(...start),new THREE.Vector3(...(side==='court'?[0,0,1]:[-1,0,0])));ray.far=.6;
 assert(ray.intersectObject(model,true)[0]?.object.material.color.getHex()===0xe1e3dc,'White render faces outward on the '+side+' return');ray.far=Infinity;
}
ray.set(new THREE.Vector3(-65.58,14.62,6.1),new THREE.Vector3(0,0,1));ray.far=.7;
assert(ray.intersectObject(model,true)[0]?.object.material.color.getHex()===0xe1e3dc,'The recessed gutter clears the render riser');
console.log('PASS: both outer descending ridges, continuous pitches, '+intersections+' physical roof/render probes, ten exposed white faces and gutter clearance.');
