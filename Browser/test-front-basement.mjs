import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {FRONT_BASEMENT} from './dist/front-basement.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from './dist/estate-timeline.mjs';
import {createWalker,exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
const e=createEscapeExterior(THREE,1.6),ray=new THREE.Raycaster(),{grade,depth,steps,tread}=FRONT_BASEMENT;
assert.equal(depth,1.215);assert.equal(steps,6);
const near=(a,b,message)=>assert(Math.abs(a-b)<1e-5,message+': '+a+' versus '+b);
function hit(x,z){
  e.model.updateMatrixWorld(true);const meshes=[];e.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
  ray.set(new THREE.Vector3(x,.6,z),new THREE.Vector3(0,-1,0));
  return ray.intersectObjects(meshes,false)[0];
}
// Whole-scene rays catch uncut terrain, old paving or the legacy access slab
// concealing the excavation. Sample the complete dogleg, beyond mesh names.
for(const side of [-1,1]){
  const route=[[26.15,20.7],[21.6,20.7],[21.6,18.3],[8.1,18.3],[8.1,20.6],[5.24,20.6]];
  for(let i=1;i<route.length;i++)for(let j=0;j<=20;j++){
    const t=j/20,x=side*(route[i-1][0]*(1-t)+route[i][0]*t),z=route[i-1][1]*(1-t)+route[i][1]*t;
    near(hit(x,z)?.point.y,grade-depth,'unobstructed lower walk');
  }
  for(let i=0;i<steps;i++){
    near(hit(side*(28.35+(i+.5)*tread),20.7)?.point.y,grade-depth+(i+1)*depth/steps,'six outer treads along the facade');
    near(hit(side*5.24,21.6+(i+.5)*tread)?.point.y,grade-depth+(i+1)*depth/steps,'six inner treads');
  }
  near(hit(side*26.15,22.5)?.point.y,.06,'removed stair projection leaves the original lawn footprint');
  near(hit(side*17,20.5)?.point.y,.06,'existing legacy ground height retained');
  // The outer stair backing meets the white facade below its corner sash.
  // Probe both surfaces: a coincident brown face flickers through the render.
  const label=side<0?'West':'East';
  for(const x of [28.4,28.6,28.8])for(const y of [.04,.1,.16]){
    ray.set(new THREE.Vector3(side*x,y,20.5),new THREE.Vector3(0,0,-1));
    const hits=ray.intersectObject(e.model,true);
    assert.equal(hits[0].object.name,'Entrance '+label.toLowerCase()+' three-bay projection white lower storey','white facade remains exposed below the sill');
    const backing=hits.find(h=>h.object.name===label+' semi-basement retaining wall 7');
    assert(backing&&backing.distance-hits[0].distance>.025,'stair backing must clear the facade plane on both sides');
  }
  for(const x of [28.4,28.8,29.5,30.5]){
    ray.set(new THREE.Vector3(side*x,-.15,20.5),new THREE.Vector3(0,0,-1));
    const backing=ray.intersectObject(e.model,true)[0];
    assert.equal(backing.object.name,label+' semi-basement retaining wall 7 foundation');
    near(backing.point.z,19.7,'lower backing continues to conceal the unexcavated terrain');
  }
}
const obstacles=exteriorObstacles(THREE,e.model),walker=createWalker(e.camera,obstacles);
function leg(a,b){
  walker.setView({position:[a[0],1.8,a[1]],target:[b[0],1.8,b[1]]});walker.keys.add('KeyW');
  const distance=Math.hypot(b[0]-a[0],b[1]-a[1]);
  for(let remaining=distance;remaining>1e-6;remaining-=.25)walker.update(Math.min(.25,remaining)/5);
  near(e.camera.position.x,b[0],'walk reaches x');near(e.camera.position.z,b[1],'walk reaches z');
}
for(const side of [-1,1]){
  const path=[[31.6,20.7],[26.15,20.7],[21.6,20.7],[21.6,18.3],[8.1,18.3],[8.1,20.6],[5.24,20.6],[5.24,24.5]].map(([x,z])=>[side*x,z]);
  for(const points of [path,[...path].reverse()])for(let i=1;i<points.length;i++){
    leg(points[i-1],points[i]);near(e.camera.position.y,points[i][1]===24.5||Math.abs(points[i][0])===31.6?1.8:1.8-depth,'eye level follows stairs and lower walk');
  }
  assert(obstacles.some(o=>obstacleContains(o,side*17,19.38,0)),'retaining edge prevents crossing from the lawn');
  leg([side*17,21],[side*17,20]);
  walker.keys.add('KeyW');for(let i=0;i<20;i++)walker.update(.1);
  assert(e.camera.position.z>19.7,'walker cannot walk through the retaining wall');
  for(let i=0;i<steps;i++){
    leg([side*(28.35+(i+.6)*tread),20.7],[side*(28.35+(i+.4)*tread),20.7]);
    near(e.camera.position.y,1.8-depth+(i+1)*depth/steps,'eye level follows each outer tread');
    leg([side*5.24,21.6+(i+.6)*tread],[side*5.24,21.6+(i+.4)*tread]);
    near(e.camera.position.y,1.8-depth+(i+1)*depth/steps,'eye level follows each tread');
  }
}
const layouts=createAerialLayouts(THREE,e),timeline=prepareEstateTimeline(THREE,e,layouts);
// Ground-contact skirts are generated only after the complete timeline is
// assembled. The apron used to place a second outward face on the stair wall.
const meshes=[];e.model.updateMatrixWorld(true);e.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
for(const side of [-1,1])for(const x of [30.12,30.3,30.5,30.7])for(const y of [-.12,-.04,.04,.1,.16]){
  ray.set(new THREE.Vector3(side*x,y,21.68),new THREE.Vector3(0,0,1));ray.far=.04;
  const hits=ray.intersectObjects(meshes,false);
  assert.equal(hits.length,1,'one exposed retaining face beside the outer stair: '+JSON.stringify({side,x,y,hits:hits.map(h=>({name:h.object.name,z:h.point.z}))}));
  assert.equal(hits[0].object.name,(side<0?'West':'East')+' semi-basement retaining wall 6');
  near(hits[0].point.z,21.7,'retaining wall retains its visible plane');
}
ray.far=Infinity;
for(const year of [1829,1849,1916,2021]){
  timeline.setPeriod(year);
  for(const side of [-1,1])near(hit(side*17,18.3)?.point.y,grade-depth,'sunken frontage belongs to the original building');
}
for(const historic of [true,false])for(const modern of [true,false]){
  layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
  walker.setObstacles(exteriorObstacles(THREE,e.model));
  for(const side of [-1,1])near(hit(side*17,18.3)?.point.y,historic||modern?grade-depth:-.15,'visible ground follows layouts');
}
timeline.setPeriod(1829);walker.setObstacles(exteriorObstacles(THREE,e.model));
near(hit(17,18.3)?.point.y,grade-depth,'restoring a timeline period reopens the excavation after hiding both layouts');
assert.equal(e.scene.children.find(o=>o.isDirectionalLight).shadow.needsUpdate,true);
console.log('PASS: 50% deeper frontage, six risers at all four entrances, outer stairs along the facade, 40 single retaining-face probes, clear doglegs, walking heights, retaining collisions, original-building timeline and layout visibility.');
