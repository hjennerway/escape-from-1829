import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.5);model.updateMatrixWorld(true);
const material=model.getObjectByName('West end continuous slate roof').material;
const roofs=[];model.traverse(o=>{if(o.isMesh&&o.material===material)roofs.push(o);});
const ray=new THREE.Raycaster();
// The owner's clarified circle is the courtyard bay's west shoulder.
// The former return hip left slate outside the joined roof outline, while
// its separate white strip extended beyond the bay's own cornice.
for(const x of [-62.02,-61.98,-61.9])for(const z of [4.51,4.55,4.59]){
  ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));
  assert(!ray.intersectObjects(roofs,false).some(h=>h.point.y>14.5),'No stray slate tongue beside the courtyard bay: '+[x,z]);
}
ray.far=.075;
for(const z of [5,5.4,5.8,6.2]){
  ray.set(new THREE.Vector3(-61.86,14.35,z),new THREE.Vector3(1,0,0));
  assert.equal(ray.intersectObject(model,true).length,0,'The obsolete return strip does not protrude past the courtyard cornice: '+z);
}
ray.far=Infinity;
const join=model.getObjectByName('West cross-range continuous roof join');
assert(new THREE.Box3().setFromObject(join).min.y>13,'The roof joins the lower Reception pitches without reaching the separate stair-bay deck');
const lowBay=model.getObjectByName('West court low bay flat roof');
assert.equal(lowBay.geometry.type,'BoxGeometry','The independent low roof retains its complete original solid deck');
function top(x,z){
  ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObjects(roofs,false)[0];
  assert(hit?.face.normal.y>0,'Every roof-join probe has upward-facing slate: '+[x,z,hit?.object.name]);return hit.point.y;
}
// These are the actual tall masonry contacts marked yellow, independent of
// the new roof's triangulation: the outer pavilion and court bay's rear edge.
for(const x of [-64.25,-64.1,-63.9])for(const z of [12,12.5,13])
  assert(top(x,z)>14.53,'The lower shoulder covers the main wall up to its cornice');
for(const x of [-61,-60,-59,-58,-57,-56])for(const z of [4.85,5.1])
  assert(top(x,z)>14.53,'The bay rear masonry and cornice sit beneath the joined slate');
for(let x=-67.9;x< -30.6;x+=.37){
  assert(Math.abs(top(x,9.25)-17.08)<.00001,'The full yellow cross-range ridge is level');
  assert(Math.abs(top(x,9.249)-top(x,9.251))<.003,'Both pitches meet without an open ridge or vertical step');
}
// Independent coordinates from the owner's four yellow branches. The former
// patched hips fail here even though they passed the two earlier strip checks.
for(const [x,end] of [[-68,17],[-58.4,3.7],[-52.5,14.5],[-37.5,18.5]]){
  for(let t=.02;t<=1;t+=.035){
    const z=9.25+(end-9.25)*t;
    assert(Math.abs(top(x,z)-17.08)<.00001,'Every yellow branch meets the main ridge at the same height: '+[x,z,top(x,z)]);
    for(const side of [-1,1]){
      if(t>=.3)assert(top(x+side*.7,z)<top(x+side*.2,z),'Slate pitches down on both sides of each branch beyond the meeting valleys');
      assert(Math.abs(top(x+side*.001,z)-top(x,z))<.002,'Both branch pitches share the ridge');
    }
  }
  assert(top(x,end+Math.sign(end-9.25)*.2)<17.08,'Each branch finishes with a pitched hip');
}
// Valleys are shared edges from the T junctions to the re-entrant corners.
for(const [a,b] of [
  [[-68,9.25],[-63.6,13.9]],[[-58.4,9.25],[-61.8775,4.6]],
  [[-58.4,9.25],[-54.9225,4.6]],[[-52.5,9.25],[-55.817,13.9]],
  [[-52.5,9.25],[-49.183,13.9]],[[-37.5,9.25],[-40.4,13.9]],
  [[-37.5,9.25],[-34.6,15.5]]
])for(let t=.05;t<1;t+=.05){
  const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
  const length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[1]-a[1])/length*.0001,dz=-(b[0]-a[0])/length*.0001;
  const left=top(x-dx,z-dz),right=top(x+dx,z+dz);
  assert(Math.abs(left-right)<.001,'Joined valley pitches leave no triangular opening or step: '+[x,z,left,right]);
}
for(const z of [6.601,8,9.25,11,12,14,15.499])
  assert(Math.abs(top(-27.0001,z)-top(-26.9999,z))<.001,'The new east hip meets the retained lower roof planes');
// Raised corners need solid brick beneath the eaves, rather than the former
// open triangular strips between slate and the level facade cornices.
const edgeBrick=model.getObjectByName('West courtyard upper link infill').material;
for(const [x,y,z,direction] of [[-54.6,13.9,4.3,1],[-58,13.9,14.3,-1],[-35.5,14.2,4.3,1]]){
  ray.set(new THREE.Vector3(x,y,z),new THREE.Vector3(0,0,direction));
  const hit=ray.intersectObject(model,true)[0];
  assert(hit?.object.material===edgeBrick,'Raised roof edges meet matching solid masonry: '+hit?.object.name);
}
// The later blue guide fixes the long eaves at the actual wall-top trim.
// These probes fail the former rising roof edges, despite its passing ridges.
for(const [left,right] of [[-63.5,-55.9],[-49.1,-40.5]])for(let x=left;x<right;x+=.17)
  assert(Math.abs(top(x,13.8999)-14.53)<.001,'Both marked slate edges reach the level main cornice');
// The blue-circled correction lowers every roof perimeter to the red wall.
// Independent surface probes catch the formerly higher pavilion and bay rims.
for(const [a,b] of [
  [[-72.4,4.6],[-72.4,20.9]],[[-72.4,20.9],[-63.6,20.9]],
  [[-63.6,20.9],[-63.6,13.9]],[[-65.6,4.6],[-72.4,4.6]],
  [[-65.6,4.6],[-65.6,6.6]],[[-65.6,6.6],[-61.8775,6.6]],
  [[-61.8775,6.6],[-61.8775,3.802]],[[-61.8775,3.802],[-60.13875,1.39]],
  [[-60.13875,1.39],[-56.66125,1.39]],[[-56.66125,1.39],[-54.9225,3.802]],
  [[-54.9225,3.802],[-54.9225,4.6]],
  [[-55.817,13.9],[-55.817,15.944]],[[-55.817,15.944],[-53.7305,17.96]],
  [[-53.7305,17.96],[-51.2695,17.96]],[[-51.2695,17.96],[-49.183,15.944]],
  [[-49.183,15.944],[-49.183,13.9]],
  [[-40.4,13.9],[-40.4,21.6]],[[-40.4,21.6],[-34.6,21.6]],[[-34.6,21.6],[-34.6,15.5]]
])for(const t of [.1,.3,.5,.7,.9]){
  const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
  // Float32 roof edges are sampled a few microns inboard of their perimeter.
  const inside=a[0]< -63?[-68,9.25]:a[1]<7?[-58.4,9.25]:a[0]< -45?[-52.5,9.25]:[-37.5,9.25];
  const distance=Math.hypot(inside[0]-x,inside[1]-z);
  const px=x+(inside[0]-x)/distance*.00001,pz=z+(inside[1]-z)/distance*.00001;
  assert(Math.abs(top(px,pz)-14.53)<.0001,'Every circled roof-to-wall edge matches the red wall: '+[x,z,top(px,pz)]);
}
for(const name of ['West front square pavilion','West end continuous wall','West front middle arm','West curved bay','West courtyard polygonal bay']){
  const box=new THREE.Box3().setFromObject(model.getObjectByName(name));
  assert(Math.abs(box.max.y-14.3)<.00001,'Supporting wall tops follow the shared eave: '+name);
}
assert(!model.getObjectByName('West court roof corner render riser'),'Level eaves remove the old corner riser');
const renderParts=[];
model.traverse(o=>{if(o.isMesh&&/^West outer corner joined cornice|^West middle arm joined cornice|^West courtyard polygonal bay stone band|^West garden inner pavilion cornice/.test(o.name))renderParts.push(o);});
let renderProbes=0;
for(const o of renderParts){
  const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry,p=g.attributes.position;
  const box=new THREE.Box3().setFromObject(o);
  if(box.max.y<14){if(g!==o.geometry)g.dispose();continue;}
  assert(box.max.y<=14.53001,'No circled cornice projects above the common roof edge: '+o.name);
  for(let i=0;i<p.count;i+=3){
    const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,i+j).applyMatrix4(o.matrixWorld)),[a,b,c]=v;
    if(b.clone().sub(a).cross(c.clone().sub(a)).y<=1e-8)continue;
    for(const w of [[1/3,1/3,1/3],[.1,.2,.7],[.2,.7,.1],[.7,.1,.2]]){
      const q=v.reduce((q,v,j)=>q.addScaledVector(v,w[j]),new THREE.Vector3());
      ray.set(new THREE.Vector3(q.x,30,q.z),new THREE.Vector3(0,-1,0));
      assert(!ray.intersectObjects(roofs,false).some(h=>h.point.y<q.y-.0001&&h.point.y>box.min.y+.0001),'No slate crosses the level render: '+o.name+' '+q.toArray());
      renderProbes++;
    }
  }if(g!==o.geometry)g.dispose();
}
for(let z=12.05;z<=18.3;z+=.13){
  assert(Math.abs(top(-25.8,z)-15.66)<.00001,'The relocated blue entrance-bay ridge continues at the retained main roof height');
  for(const dx of [-.4,.4])assert(top(-25.8+dx,z)<15.66,'Both relocated ridge sides descend');
  if(z>13)assert(top(-27.3,z)<15.66,'Remove the former orange ridge');
}
for(let x=-25.5;x< -22.9;x+=.13){
  assert(Math.abs(top(x,12)-15.66)<.00001,'The existing yellow entrance ridge stays level');
  const z=12+(x+25.8)*2.26/3.6*5.4/2.6;
  assert(Math.abs(top(x,z-.0001)-top(x,z+.0001))<.001,'The new branch joins the retained pitch without a vertical step');
}
assert(top(-25.8,19.5)<15,'The relocated ridge ends in a descending hip');
// Check the actual cornice solids against every slate mesh. The old roof
// crosses both the horizontal front moulding and the rising side return.
for(const [layer,height] of [[0,.58],[1,.1],[2,.1],[3,.1]]){
  const o=model.getObjectByName('Entrance west mitred cornice layer '+layer),g=o.geometry.index?o.geometry.toNonIndexed():o.geometry,p=g.attributes.position;
  for(let i=0;i<p.count;i+=3){
    const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,i+j).applyMatrix4(o.matrixWorld)),[a,b,c]=v;
    if(b.clone().sub(a).cross(c.clone().sub(a)).y<=1e-8)continue;
    for(const w of [[1/3,1/3,1/3],[.1,.2,.7],[.2,.7,.1],[.7,.1,.2]]){
      const q=v.reduce((q,v,j)=>q.addScaledVector(v,w[j]),new THREE.Vector3());
      ray.set(new THREE.Vector3(q.x,30,q.z),new THREE.Vector3(0,-1,0));
      assert(!ray.intersectObjects(roofs,false).some(h=>h.point.y<q.y-.0001&&h.point.y>q.y-height+.0001),'No entrance slate crosses the render: '+o.name+' '+q.toArray());
      renderProbes++;
    }
  }if(g!==o.geometry)g.dispose();
}
for(let x=-28.7;x< -22.8;x+=.17){
  assert(Math.abs(top(x,19.6249)-13.69)<.002,'The front hip stops at the inner top edge of the render');
  ray.set(new THREE.Vector3(x,30,19.8),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(model,true)[0]?.object.name==='Entrance west mitred cornice layer 3','The exposed cornice has no slate fringe');
}
console.log('PASS: retained yellow ridges, relocated blue entrance ridge, descending pitches, closed valleys, uniform 14.53 eaves, '+renderProbes+' physical roof/render probes, circled contacts and retained low deck.');
