import assert from 'node:assert/strict';
import * as T from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(T,1.5);model.updateMatrixWorld(true);
const roof=model.getObjectByName('Entrance east projection slate roof').material,slate=[],ray=new T.Raycaster();
model.traverse(o=>{if(o.isMesh&&o.material===roof)slate.push(o);});
const top=(objects,x,z)=>{ray.set(new T.Vector3(x,30,z),new T.Vector3(0,-1,0));return ray.intersectObjects(objects,false)[0];};
// Independent front/side landmarks from the circled projection. The old
// eastern roof extends through the white moulding instead of ending on it.
const cornice=model.getObjectByName('Entrance east mitred cornice layer 3');
let contacts=0;
const returnOnly=process.argv.includes('--return-only');
for(const x of returnOnly?[]:[23,24,25,26,27,28]){
 const a=top(slate,x,19.6249),b=top([cornice],x,19.6251);
 assert(a&&b&&Math.abs(a.point.y-b.point.y)<.001,'Slate meets the front cornice cap at '+x);contacts++;
 assert(!top(slate,x,19.85),'No slate projects across the exposed front moulding');
}
for(const z of returnOnly?[]:[17.3,17.42,17.8,18.2,18.8,19.2]){
 const a=top(slate,22.6751,z),b=top([cornice],22.6749,z);
 assert(a&&b&&Math.abs(a.point.y-b.point.y)<.001,'Slate meets the side moulding at '+z);contacts++;
}
// The blue return closes at the retained main fascia, before the drop to the
// lower roof. Both its cap and outward white face must reach that join.
const returnTrim=model.getObjectByName('East inside corner continuous coping 3');
for(const z of [17.2,17.22,17.2399]){
 const hit=top([returnTrim],33.69,z);
 assert(hit&&hit.point.y<13.06&&hit.point.y>12.99,'The high cornice continues to the main fascia: '+[z,hit?.point.y]);contacts++;
}
// Survey the actual white solids, including reflected entrance geometry.
// Dense triangle samples catch a narrow fringe missed by a few cap centres.
const render=[...model.children.filter(o=>/^Entrance east mitred cornice/.test(o.name)),
 ...[1,2,3].map(i=>model.getObjectByName('East inside corner continuous coping '+i))];
let probes=0;
for(const o of render){
 const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry,p=g.attributes.position;
 for(let j=0;j<p.count;j+=3){
  const v=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,j+k).applyMatrix4(o.matrixWorld));
  // Reflection reverses vertex winding while the renderer retains outward
  // face normals. Classify the actual top, including the mirrored moulding.
  const up=v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).y*Math.sign(o.matrixWorld.determinant());
  if(up<=1e-8)continue;
  for(let a=1;a<7;a++)for(let b=1;b<8-a;b++){
   const q=v[0].clone().multiplyScalar(a/8).addScaledVector(v[1],b/8).addScaledVector(v[2],1-(a+b)/8);
   if(o===returnTrim&&q.y<12.8)continue; // The blue mark concerns the upper main-roof join.
   ray.set(new T.Vector3(q.x,30,q.z),new T.Vector3(0,-1,0));
   const thickness=o.name.endsWith('layer 0') ? .58 : .1;
   assert(!ray.intersectObjects(slate,false).some(h=>h.point.y<q.y-.0001&&h.point.y>q.y-thickness+.0001),
     'No slate crosses '+o.name+' at '+q.toArray());probes++;
  }
 }
 if(g!==o.geometry)g.dispose();
}
console.log('PASS: '+contacts+' eastern entrance boundary/return contacts and '+probes+' physical slate/render samples.');
