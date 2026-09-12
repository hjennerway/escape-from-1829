// Real Three.js geometry/camera checks, without a WebGL context.
import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior,ESCAPE_MAST} from './dist/escape-exterior.mjs';
import {sampleEscape} from './dist/escape-cutscene.mjs';
import {sampleArrival} from './dist/arrival-cutscene.mjs';
import {ESCAPE_WATER_TOWER} from './dist/water-tower.mjs';
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){}})})};
const exterior=createEscapeExterior(THREE,16/9);
exterior.scene.updateMatrixWorld(true);
const towerBounds=new THREE.Box3().setFromObject(exterior.waterTower);
assert(Math.abs(towerBounds.max.y-17.75*2.2)<.01,'tower including finial must be 2.2 times the main pediment height');
assert(towerBounds.min.x>106&&towerBounds.max.z<-84,'tower must occupy the clearing beyond the rear-right campus block');
assert(exterior.mast.children.length>150,'mast must contain real lattice geometry');
const dragons=exterior.model.getObjectByName('Blue dragons and central coat of arms');
assert.equal(dragons.geometry.attributes.uv.count,3,'heraldic photo must map onto the triangular pediment');
const originalBay=exterior.model.getObjectByName('East curved bay');
const squareBay=exterior.model.getObjectByName('East square projecting bay');
assert(originalBay&&squareBay,'right frontage must retain the original curved bay and add a square projection');
assert.equal(exterior.model.getObjectByName('East curved bay duplicate'),undefined,'the added round bay must be removed');
const bayBounds=new THREE.Box3().setFromObject(squareBay),baySize=bayBounds.getSize(new THREE.Vector3());
assert.equal(squareBay.geometry.type,'BoxGeometry','replacement has flat walls and square corners');
assert.equal(baySize.x,baySize.z,'replacement footprint is square');
assert(bayBounds.max.z>24&&bayBounds.max.y>=14.3,'square bay projects outward at full three-storey height');
assert(bayBounds.min.x>originalBay.position.x+3.15&&bayBounds.max.x<72.65,'projection occupies the blue-marked section left of the removed round bay');
for(const aspect of [16/9,4/3,9/16])for(const seconds of [0,1,1.75,2.5]){
  const shot=sampleArrival(seconds,{aspect}),camera=exterior.camera;
  camera.aspect=aspect;camera.updateProjectionMatrix();camera.position.set(...shot.position);camera.lookAt(...shot.target);camera.updateMatrixWorld(true);
  const door=new THREE.Vector3(0,3.5,19.9).project(camera);
  assert(Math.abs(door.x)<1e-10&&Math.abs(door.y)<1e-10,'front door stays centred throughout the rush');
  if(seconds===0)for(const x of [-61,97])for(const z of [-46,45]){
    const p=new THREE.Vector3(x,15,z).project(camera);
    assert(Math.abs(p.x)<.95&&Math.abs(p.y)<.95,'arrival initially frames the whole building');
  }
}
const ray=new THREE.Raycaster(new THREE.Vector3(20,80,12),new THREE.Vector3(0,-1,0));
const roof=ray.intersectObject(exterior.model,true)[0];
assert(roof&&roof.point.y>12,'principal range must have a visible roof from above');
assert(roof.face.normal.y>0,'roof triangles must face the aerial camera');
for(const x of [-23,23])for(const z of [-17,-26,-30,-34,-40]){
  ray.set(new THREE.Vector3(x,80,z),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(exterior.model,true)[0].point.y<1,'both W-shaped gaps must open through to the rear road');
}
// The corrected east wing and L-shaped addition must have continuous roofs,
// while the parking court inside the addition remains uncovered.
for(const [x,z] of [[31,-20],[42,40],[53.1,12],[72.65,8],[89.2,-25],[89.2,0],[83.7,-38],[83.7,-44],[91.2,12]]){
  ray.set(new THREE.Vector3(x,80,z),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(exterior.model,true)[0].point.y>8,'corrected east footprint must contain roof geometry');
}
// Photo 20260912_172141: the service link has a low roof, with the taller
// range set behind it. Check the actual geometry as well as the sash schedule.
ray.set(new THREE.Vector3(76,80,16),new THREE.Vector3(0,-1,0));
const linkRoof=ray.intersectObject(exterior.model,true)[0].point.y;
assert(linkRoof>4.5&&linkRoof<8,'link roof must sit below the square pavilion first-floor heads');
const photoOpenings=exterior.model.userData.eastPhotoOpenings;
const frontWindows=photoOpenings.filter(o=>o.face==='square-front');
assert.equal(frontWindows.length,6,'square front has exactly two windows on each of three storeys');
for(const y of [2,6.5,11])assert.equal(frontWindows.filter(o=>o.y===y).length,2);
const wingWindows=photoOpenings.filter(o=>o.face==='forward-wing-east');
assert.equal(wingWindows.length,16,'nine wing positions on each floor include one door instead of a sash');
assert(!wingWindows.some(o=>o.z===38.1),'upper stair and ground door must not have superimposed windows');
assert.equal(photoOpenings.filter(o=>o.face==='polygonal-bay').length,9,'three visible facets carry windows on all three floors');
ray.set(new THREE.Vector3(63.65,2,30),new THREE.Vector3(0,0,-1));
assert(ray.intersectObject(exterior.model,true)[0].object.isInstancedMesh,'ground-floor sash must be visible in front of the white wall');
// img2.jpg observes the opposite side: a real projecting polygonal bay and
// two close pairs plus one sash on every floor of the courtyard wall.
const courtBay=exterior.model.getObjectByName('East courtyard polygonal bay');
assert(courtBay,'rear courtyard must have its own projecting bay');
assert(new THREE.Box3().setFromObject(courtBay).min.z<0,'courtyard bay must project beyond the rear wall');
const paired=exterior.model.userData.courtyardPhotoOpenings.filter(o=>o.face==='courtyard-paired-wall');
assert.equal(paired.length,15,'courtyard paired wall has five sashes on each of three floors');
for(const y of [2,6.5,11]){
  const xs=paired.filter(o=>o.y===y).map(o=>o.x).sort((a,b)=>a-b);
  assert.equal(xs.length,5);
  assert(Math.abs(xs[2]-xs[1]-1.5)<.01&&Math.abs(xs[4]-xs[3]-1.5)<.01,'windows must form two close pairs');
  for(const x of xs){
    ray.set(new THREE.Vector3(x,y,-5),new THREE.Vector3(0,0,1));
    const visible=ray.intersectObject(exterior.model,true)[0];
    assert(visible.point.z>4&&visible.point.z<4.5,'each paired sash must remain exposed, not buried in the projecting bay');
  }
}
assert(exterior.model.getObjectByName('East courtyard two-flight fire escape').children.length>12,'courtyard stair must have structural flights and rails');
// img8.jpg: explicit windows replace the generic rear-return grid. Verify
// the five upper openings remain visible and the stair door has no sash on it.
const rearOpenings=exterior.model.userData.rearCourtPhotoOpenings;
const rearUpper=rearOpenings.filter(o=>o.face==='rear-return-upper');
assert.equal(rearUpper.length,5,'rear return has five upper sashes plus its stair door');
assert(!rearUpper.some(o=>Math.abs(o.x-66.4)<.1),'upper door must not be overlaid by a window');
for(const o of rearUpper){
  ray.set(new THREE.Vector3(o.x,o.y,-27),new THREE.Vector3(0,0,-1));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.point.z<-32.6&&hit.point.z>-33,'each upper return sash must be exposed in front of the rear wall');
}
assert.equal(exterior.model.children.filter(o=>o.name==='Rear court blue gabled porch').length,2,'both blue entrance porches must be present');
assert.equal(exterior.model.children.filter(o=>o.name==='Rear court tall chimney').length,2,'the east wing has two tall chimney stacks');
const rightGround=rearOpenings.filter(o=>o.face==='rear-court-wing-ground');
assert(!rightGround.some(o=>o.z===-4.8),'right porch must replace the ground-floor sash');
for(const x of [42,49,55]){
  ray.set(new THREE.Vector3(x,80,-38),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(exterior.model,true)[0].point.y<1,'wider return must leave the rear approach open');
}
// A roof-free route enters from the rear-left and turns into the side court.
for(const [x,z] of [[27,-39],[33,-39],[40,-39],[40,-34],[40,-30],[46,-29]]){
  ray.set(new THREE.Vector3(x,80,z),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(exterior.model,true)[0].point.y<1,'rear-left courtyard entrance must remain open');
}
for(const z of [-23,-12,-4]){
  ray.set(new THREE.Vector3(48,80,z),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(exterior.model,true)[0].point.y<1,'east extension must preserve its open-air side court');
}
for(const aspect of [16/9,4/3,9/16])for(const seconds of [0,5,10]){
  const shot=sampleEscape(seconds,{aspect}),camera=exterior.camera;camera.aspect=aspect;camera.updateProjectionMatrix();camera.position.set(...shot.position);camera.lookAt(...shot.target);camera.updateMatrixWorld(true);
  const tip=new THREE.Vector3(ESCAPE_MAST.x,ESCAPE_MAST.height,ESCAPE_MAST.z).project(camera);
  assert(tip.x<0&&tip.y>0,'mast must read as upper-left from the aerial perspective');
  assert(Math.abs(tip.x)<.95&&Math.abs(tip.y)<.95,'mast must stay in frame');
  for(const y of [0,ESCAPE_WATER_TOWER.height]){
    const p=new THREE.Vector3(ESCAPE_WATER_TOWER.x,y,ESCAPE_WATER_TOWER.z).project(camera);
    assert(p.x>0&&Math.abs(p.x)<.95&&Math.abs(p.y)<.95,'water tower must stay visible on the right throughout the pan');
  }
  for(const x of [-61,97])for(const z of [-46,45]){
    const p=new THREE.Vector3(x,15,z).project(camera);
    assert(Math.abs(p.x)<.95&&Math.abs(p.y)<.95,'building must stay in frame throughout the pan');
  }
}
delete globalThis.document;
console.log('PASS: real estate geometry, upward-facing roofs, W-shaped openings to the rear, rear-left lattice mast, building/mast framing throughout landscape and portrait pans.');
