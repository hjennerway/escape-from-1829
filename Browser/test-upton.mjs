import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {UPTON_FOOTPRINT,UPTON_VIEWS} from './dist/upton-frith-oscroft.mjs';
import {historicOSPoint,pointInFootprint} from './dist/historic-footprints.mjs';
import {OS_FOOTPRINTS} from './dist/historic-footprint-data.mjs';
import {ESCAPE_CHAPEL} from './dist/chapel.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(t){return {width:t.length*16}},strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,16/9),building=exterior.uptonFrithOscroft;
const layouts=createAerialLayouts(THREE,exterior);exterior.scene.updateMatrixWorld(true);
assert.equal(building.name,'Upton/Frith/Oscroft');assert.equal(building.userData.storeys,2);
assert.equal(building.parent,layouts.shared);
const os=OS_FOOTPRINTS[0].loops[0].map(p=>historicOSPoint(...p));
// The explicit symmetry correction supersedes the unequal OS east wing.
const axis=ESCAPE_CHAPEL.x,sourceCentre=(os[114][0]+os[115][0])/2;
assert.deepEqual(exterior.chapel.position.toArray(),[-4.9,0,-119.2],'The church must not move');
assert.equal(exterior.chapel.rotation.y,0,'The church must not rotate');
assert.equal(building.position.x,axis,'Building centre line must align exactly with the church');
for(const [x,z] of UPTON_FOOTPRINT)assert(UPTON_FOOTPRINT.some(p=>Math.abs(p[0]-(2*axis-x))<1e-8&&Math.abs(p[1]-z)<1e-8),'Each OS-derived corner needs its reflected counterpart');
for(let x=axis-52;x<axis;x+=.8)for(let z=-209;z<-180;z+=.8){
  assert.equal(pointInFootprint([x,z],UPTON_FOOTPRINT),pointInFootprint([x-axis+sourceCentre,z],os),'Western half preserves OS dimensions');
  assert.equal(pointInFootprint([x,z],UPTON_FOOTPRINT),pointInFootprint([2*axis-x,z],UPTON_FOOTPRINT),'Footprint must be exactly mirrored');
}
const bounds=new THREE.Box3().setFromObject(building);
assert(Math.abs((bounds.min.x+bounds.max.x)/2-axis)<1e-5,'All architectural detail bounds must share the church centre line');
for(const o of building.userData.openings)assert(building.userData.openings.some(p=>Math.abs(p.x+o.x)<1e-8&&p.y===o.y&&p.z===o.z),'Both storeys must have exactly mirrored windows');
assert(new THREE.Box3().setFromObject(building).max.z<new THREE.Box3().setFromObject(exterior.chapel).min.z-20,'Building must stand behind the chapel with a clear lawn');
const ray=new THREE.Raycaster(),obs=exteriorObstacles(THREE,exterior.model);
for(const [x,z] of [[-20,-198],[-4.9,-185],[30,-201],[44,-186]])assert(obs.some(b=>obstacleContains(b,x,z)),'Mapped masonry must stop a walker');
for(const [x,z] of [[-20,-186],[1,-185],[-55,-198]]){
  assert(!obs.some(b=>obstacleContains(b,x,z)),'OS recess must stay walkable');
  ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));assert.equal(ray.intersectObject(building,true).length,0,'Recess must remain open to the sky');
}
// Compare rendered roof heights on a dense mirrored grid, including the hips
// and central junctions, rather than checking configuration values alone.
for(let x=axis-51;x<axis;x+=1.1)for(let z=-209;z<-179;z+=1.1){
  const heights=[x,2*axis-x].map(px=>{ray.set(new THREE.Vector3(px,30,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(building,true).find(h=>h.object.name.endsWith('slate hip roof'))?.point.y??0;});
  assert(Math.abs(heights[0]-heights[1])<1e-4,'Rendered roofs must mirror exactly');
}
for(const o of building.userData.openings){
  const world=building.localToWorld(new THREE.Vector3(o.x,o.y,o.z)),normal=new THREE.Vector3(Math.sin(o.rotation),0,Math.cos(o.rotation));
  ray.set(world.clone().addScaledVector(normal,.6),normal.clone().negate());assert(ray.intersectObject(building,true)[0]?.object.isInstancedMesh,'Sash must be exposed on both storeys');
}
for(const roof of building.userData.roofs){
  ray.set(new THREE.Vector3((roof.x1+roof.x2)/2+.1,30,(roof.z1+roof.z2)/2+.1),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObject(building,true).find(h=>h.object.name.endsWith('slate hip roof'));
  assert(hit&&hit.face.normal.y>0,'Slate roof must face upwards');
}
const walker=createWalker(exterior.camera,obs);walker.setView(UPTON_VIEWS['upton-ground']);walker.keys.add('KeyW');for(let i=0;i<55;i++)walker.update(.1);
assert(exterior.camera.position.z<-178,'Walking must reach the new range beyond the former north limit');
const visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true};
for(const historic of [true,false])for(const modern of [true,false]){layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);assert.equal(visible(building),historic||modern);}
console.log('PASS: Upton mirrored OS footprint, fixed church alignment, church clearance, two storeys, exposed sashes, slate roof normals, open recesses, walking access and shared layout visibility.');
