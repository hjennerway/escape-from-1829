import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.5);model.updateMatrixWorld(true);
const roof=model.getObjectByName('West end continuous slate roof').material;
const slate=[],ray=new THREE.Raycaster();
model.traverse(o=>{if(o.isMesh&&o.material===roof)slate.push(o);});
const top=(x,z)=>{
  ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));
  return ray.intersectObjects(slate,false)[0];
};
const mainPitch=(x,z)=>{
  const h=top(x,14.6),n=h.face.normal;
  return h.point.y-n.z/n.y*(z-14.6);
};
// Compare the blue patch with the unaffected yellow pitch above it.
// Height and normals catch both a projecting step and a replacement face
// with a different angle, even when its boundary happens to be continuous.
let contacts=0;
for(const x of [-34.599,-34.5,-34.2,-33.9,-33.7,-33.65,-33.6,-33.55,-33.5,-33.2,-32.8,-32.4,-32,-31.5,-31]){
  const reference=top(x,14.6),normal=reference.face.normal;
  for(const z of [14.85,15,15.2,15.35,15.3849]){
    const expected=reference.point.y-normal.z/normal.y*(z-14.6),h=top(x,z);
    assert(h&&Math.abs(h.point.y-expected)<.0001,'The blue patch continues the yellow roof plane: '+[x,z,h?.point.y,expected]);
    assert(h.face.normal.dot(normal)>1-1e-8,'The blue patch has the yellow roof angle: '+[x,z]);contacts++;
  }
}
for(const x of [-33.65,-33.55]){
  assert(Math.abs(top(x-.0001,15.3849).point.y-top(x+.0001,15.3849).point.y)<.001,'The marked slate has no abrupt step');
  const coping=model.getObjectByName('West inside corner continuous coping '+(x===-33.65?5:2));
  ray.set(new THREE.Vector3(x-.00001,30,15.55),new THREE.Vector3(0,-1,0));
  const h=ray.intersectObject(coping,false)[0],edge=top(x-.00001,15.3849);
  assert(h&&Math.abs(h.point.y-edge.point.y)<.002,'White trim meets the retained pitch without a raised block');
}
// The red-circled side return now shares the projection's front eave.
// Probe both sides of its actual inner mitre, including the formerly open bend.
const trim=model.getObjectByName('Entrance west mitred cornice layer 3');
for(const z of [17.2251,17.3,17.42,17.8,18.2,18.8,19.2]){
  const h=top(-22.6751,z);
  ray.set(new THREE.Vector3(-22.6749,30,z),new THREE.Vector3(0,-1,0));
  const edge=ray.intersectObject(trim,false)[0];
  assert(h&&edge&&Math.abs(h.point.y-edge.point.y)<.001,'The red bend has no slit or height step: '+[z,h?.point.y,edge?.point.y]);
  assert(Math.abs(h.point.y-13.69)<.001,'The red return meets the level projection eave');contacts++;
}
const cornice=model.getObjectByName('Entrance west mitred cornice layer 3');
const terminal=cornice.userData.roofRenderBoundary.inner.at(-1);
const end=[-30.8273654403271,mainPitch(-30.8273654403271,15.385),15.385];
for(const t of [.1,.25,.4,.6,.8,.95]){
  const p=new THREE.Vector3(...terminal).lerp(new THREE.Vector3(...end),t);
  // Move a fraction into the slate rather than raycasting its zero-area edge.
  const h=top(p.x+.0001,p.z-.0001);
  assert(h&&Math.abs(h.point.y-p.y)<.002,'The side return descends directly to the entrance cornice: '+[p.toArray(),h?.point.y]);contacts++;
}
let renderSamples=0;
for(const i of [1,2,5]){
  const o=model.getObjectByName('West inside corner continuous coping '+i),g=o.geometry,p=g.attributes.position;
  for(let j=0;j<p.count;j+=3){
    const v=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,j+k).applyMatrix4(o.matrixWorld));
    if(v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).y<=1e-8)continue;
    for(const weights of [[1/3,1/3,1/3],[.1,.2,.7],[.2,.7,.1],[.7,.1,.2]]){
      const q=v.reduce((p,v,k)=>p.addScaledVector(v,weights[k]),new THREE.Vector3());
      ray.set(new THREE.Vector3(q.x,30,q.z),new THREE.Vector3(0,-1,0));
      assert(!ray.intersectObjects(slate,false).some(h=>h.point.y<q.y-.0001&&h.point.y>q.y-.0999),'No slate crosses the middle of the marked white trim: '+[i,q.toArray()]);
      renderSamples++;
    }
  }
}
// The adjacent pavilion and entrance crowns stay at their established heights.
for(const z of [10,12,14,15,16,17,18])assert(Math.abs(top(-37.5,z).point.y-17.08)<.00001);
for(const z of [12.1,14,16,18])assert(Math.abs(top(-25.8,z).point.y-15.66)<.00001);
for(const x of [-36,-34,-32])assert(Math.abs(top(x,9.25).point.y-17.08)<.00001);
console.log('PASS: '+contacts+' continuous-pitch/bend contacts, '+renderSamples+' physical trim samples and retained adjoining roof crowns.');
