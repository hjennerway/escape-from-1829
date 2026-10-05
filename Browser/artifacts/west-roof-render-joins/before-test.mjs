import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.5);model.updateMatrixWorld(true);
const material=model.getObjectByName('West end continuous slate roof').material;
const roofs=[];model.traverse(o=>{if(o.isMesh&&o.material===material)roofs.push(o);});
const ray=new THREE.Raycaster();
const join=model.getObjectByName('West cross-range continuous roof join');
assert(new THREE.Box3().setFromObject(join).min.y>13,'The roof joins the lower Reception pitches without reaching the separate stair-bay deck');
const lowBay=model.getObjectByName('West court low bay flat roof');
assert.equal(lowBay.geometry.type,'BoxGeometry','The independent low roof retains its complete original solid deck');
function top(x,z){
  ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObjects(roofs,false)[0];
  assert(hit?.face.normal.y>0,'Every roof-join probe has upward-facing slate');return hit.point.y;
}
// These are the actual tall masonry contacts marked yellow, independent of
// the new roof's triangulation: the outer pavilion and court bay's rear edge.
for(const x of [-64.25,-64.1,-63.9])for(const z of [12,12.5,13])
  assert(top(x,z)>14.53,'The lower shoulder covers the main wall up to its cornice');
for(const x of [-61,-60,-59,-58,-57,-56])for(const z of [4.85,5.1])
  assert(top(x,z)>15.49,'The bay rear masonry and cornice sit beneath the joined slate');
for(let x=-67.9;x< -30.6;x+=.37){
  assert(Math.abs(top(x,9.25)-17.08)<.00001,'The full yellow cross-range ridge is level');
  assert(Math.abs(top(x,9.249)-top(x,9.251))<.003,'Both pitches meet without an open ridge or vertical step');
}
// Independent coordinates from the owner's four yellow branches. The former
// patched hips fail here even though they passed the two earlier strip checks.
for(const [x,end] of [[-68,17],[-58.4,3.7],[-52.5,14.5],[-37.5,18.5]]){
  for(let t=.02;t<=1;t+=.035){
    const z=9.25+(end-9.25)*t;
    assert(Math.abs(top(x,z)-17.08)<.00001,'Every yellow branch meets the main ridge at the same height');
    for(const side of [-1,1]){
      if(t>=.3)assert(top(x+side*.7,z)<top(x+side*.2,z),'Slate pitches down on both sides of each branch beyond the meeting valleys');
      assert(Math.abs(top(x+side*.001,z)-top(x,z))<.002,'Both branch pitches share the ridge');
    }
  }
  assert(top(x,end+Math.sign(end-9.25)*.2)<17.08,'Each branch finishes with a pitched hip');
}
// Valleys are shared edges from the T junctions to the re-entrant corners.
for(const [a,b] of [
  [[-68,9.25],[-63.6,13.9]],[[-58.4,9.25],[-61.8775,4.74]],
  [[-58.4,9.25],[-54.9225,4.74]],[[-52.5,9.25],[-55.817,13.9]],
  [[-52.5,9.25],[-49.183,13.9]],[[-37.5,9.25],[-40.4,13.9]],
  [[-37.5,9.25],[-34.6,15.5]]
])for(let t=.05;t<1;t+=.05){
  const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
  const length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[1]-a[1])/length*.0001,dz=-(b[0]-a[0])/length*.0001;
  assert(Math.abs(top(x-dx,z-dz)-top(x+dx,z+dz))<.001,'Joined valley pitches leave no triangular opening or step');
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
for(const z of [5.5,6,6.5,7,8])assert(top(-66,z)>15.2,'The projecting corner masonry stays below the repaired shoulder');
const viewCamera=new THREE.PerspectiveCamera(55,1400/950,.1,500);
viewCamera.position.set(-48,31,-18);viewCamera.lookAt(-54,12,10);viewCamera.updateMatrixWorld(true);
for(const [x,y] of [[1057,415],[1061,425],[1051,423],[1068,419],[765,485],[764,478],[760,490]]){
  ray.setFromCamera(new THREE.Vector2(x/1400*2-1,1-y/950*2),viewCamera);
  assert.equal(ray.intersectObject(model,true)[0]?.object.material,material,'Both circled corners present slate, with no brick wedge or exposed roof underside');
}
for(let z=12.05;z<=18.3;z+=.13){
  assert(Math.abs(top(-27.3,z)-15.66)<.00001,'The red entrance-bay ridge continues at the retained main roof height');
  for(const dx of [-.4,.4])assert(top(-27.3+dx,z)<15.66,'Both new ridge sides descend');
}
for(let x=-26.8;x< -22.3;x+=.13){
  assert(Math.abs(top(x,12)-15.66)<.00001,'The existing yellow entrance ridge stays level');
  const z=12+(x+27.3)*2.26/5.1*5.4/2.6;
  assert(Math.abs(top(x,z-.0001)-top(x,z+.0001))<.001,'The new branch joins the retained pitch without a vertical step');
}
assert(top(-27.3,19.5)<15,'The new red ridge ends in a descending hip');
console.log('PASS: continuous yellow main ridge and four branches, descending pitches, closed valleys, wall-top eaves, circled slate contacts, red entrance-bay ridge and retained low deck.');
