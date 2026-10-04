import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
import {WEST_SIDE_BASEMENT as basement} from './dist/west-side-basement.mjs';
import {WEST_RANGE_PLAN} from './dist/west-range-plan.mjs';
import {prepareEstateTimeline} from './dist/estate-timeline.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
const e=createEscapeExterior(THREE,16/9),layouts=createAerialLayouts(THREE,e);
const group=e.model.getObjectByName('West side semi-basement'),ray=new THREE.Raycaster();
function surface(x,z){
  e.model.updateMatrixWorld(true);const meshes=[];
  e.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o)});
  ray.set(new THREE.Vector3(x,.9,z),new THREE.Vector3(0,-1,0));
  return ray.intersectObjects(meshes,false)[0];
}
for(const modern of [false,true]){
  layouts.setVisible('historic',!modern);layouts.setVisible('modern',modern);
  for(let i=0;i<basement.steps;i++){
    const hit=surface(basement.stairX+(i+.5)*basement.tread,basement.entry+1);
    assert.equal(hit.object.name,'West side basement step '+(i+1)+' tread');
    const height=basement.grade-(basement.grade-basement.level)*(i+1)/basement.steps+.001;
    assert(Math.abs(hit.point.y-height)<1e-5,'each visible stair descends by one equal riser');
  }
  for(let z=-33.5;z<-1.4;z+=.25)for(const x of [-38.65,-38.3,-37.95]){
    const hit=surface(x,z);
    assert.equal(hit.object.name,'West side basement lower passage','no terrain or courtyard paving may cover the excavated passage');
    assert(Math.abs(hit.point.y-basement.level)<1e-5);
  }
  const coping=surface(-39.9,-18),court=surface(-41,-18);
  assert.equal(coping.object.name,'West side basement retaining coping');
  assert(coping.point.y>court.point.y&&coping.point.y-court.point.y<.4,'coping is only slightly above the courtyard');
  assert.equal(surface(-40.5,-35.8).object.name,'West side basement rear stair cheek coping','stair cheek closes the former lengthwise stair mouth');
  const obstacles=exteriorObstacles(THREE,e.model),walk=createWalker(e.camera,obstacles);
  function leg(from,to){
    walk.setView({position:[from[0],1.8,from[1]],target:[to[0],1.8,to[1]]});walk.keys.add('KeyW');
    const distance=Math.hypot(to[0]-from[0],to[1]-from[1]);
    for(let left=distance;left>1e-7;left-=.5)walk.update(Math.min(left,.5)/5);
    assert(Math.hypot(e.camera.position.x-to[0],e.camera.position.z-to[1])<1e-5,'player-width route reaches '+to);
  }
  leg([-42.6,-34.7],[-38.7,-34.7]);
  assert(Math.abs(e.camera.position.y-(1.8+basement.level-basement.grade))<1e-5,'eye level follows the descended stairs');
  walk.keys.add('KeyW');for(let i=0;i<10;i++)walk.update(.1);
  assert(e.camera.position.x<-38.35,'the relocated closed door stops walking towards the gallery');
  leg([-38.7,-34.7],[-38.7,-25]);leg([-38.7,-25],[-38.1,-25]);leg([-38.1,-25],[-38.1,-1.8]);
  walk.keys.add('KeyW');for(let i=0;i<10;i++)walk.update(.1);
  assert(e.camera.position.z<-1.4,'the blank far-end wall stops walking');
  assert(obstacles.some(o=>obstacleContains(o,-39.9,-18,0)),'retaining wall blocks crossing from the sunken path');
  leg([-38.1,-1.8],[-38.1,-25]);leg([-38.1,-25],[-38.7,-25]);leg([-38.7,-25],[-38.7,-34.7]);leg([-38.7,-34.7],[-42.6,-34.7]);
  assert.equal(e.camera.position.y,1.8,'climbing the stairs restores ground eye level');
  ray.set(new THREE.Vector3(-39,.1,-34.7),new THREE.Vector3(1,0,0));
  const visible=[];e.model.traverseVisible(o=>{if(o.isMesh)visible.push(o)});
  assert.equal(ray.intersectObjects(visible,false)[0]?.object.name,'West side basement end door','the door is visible directly at the foot of the crosswise stairs');
  ray.set(new THREE.Vector3(-38.05,.35,-3),new THREE.Vector3(0,0,1));
  assert.notEqual(ray.intersectObjects(visible,false)[0]?.object.material.color.getHex(),0x172e50,'there is no blue door beside the lean-to');
  for(const x of [-37.9,-37.7])for(const y of [13.3,13.7,13.95]){
    ray.set(new THREE.Vector3(x,y,-1.5),new THREE.Vector3(0,0,1));
    const hit=ray.intersectObjects(visible,false)[0];
    assert.equal(hit?.object.name,'West courtyard upper link infill','the marked upper corner is closed by masonry');
    assert(Math.abs(hit.point.z-WEST_RANGE_PLAN.courtZ)<1e-5,'the upper corner follows the narrowed courtyard face');
  }
  const door=new THREE.Box3().setFromObject(group.getObjectByName('West side basement end door'));
  assert(Math.abs(door.min.y-basement.level)<1e-6,'door threshold meets the basement level');
  for(const x of [-40.5,-43,-50]){
    const lawn=surface(x,-26.05),paving=surface(x,-25.95);
    assert(Math.abs(lawn.point.y-paving.point.y)<.01,'the courtyard meets the lawn without a visible step');
    assert(Math.abs(paving.point.y-basement.grade)<1e-5,'the old access slab cannot cover the lowered courtyard');
  }
  // At aerial distances the five-millimetre court/lawn separation is smaller
  // than depth-buffer precision. There must be no terrain under this paving.
  for(const [x,z] of [[-60,-15],[-72.5,-37],[-72.5,-27],[-72.5,-.1],[-72.5,.02],[-72.5,3.9],[-42.5,-34.7]]){
    ray.set(new THREE.Vector3(x,.9,z),new THREE.Vector3(0,-1,0));
    const hits=ray.intersectObjects(visible,false);
    assert(hits.length>0,'the lowered court, road link, transition and stair approach stay surfaced');
    assert(!hits.some(hit=>hit.object.name==='Estate terrain'),`no near-coplanar lawn under west paving at ${x}, ${z}`);
  }
  for(const [x,z] of [[-60,-30],[-43.1,-34.7],[-40.5,-30],[-73.6,-15]]){
    ray.set(new THREE.Vector3(x,.9,z),new THREE.Vector3(0,-1,0));
    assert(ray.intersectObject(e.terrain,false).length>0,'terrain outside the paved outline stays intact');
  }
  ray.set(new THREE.Vector3(-39,.5,-33),new THREE.Vector3(1,0,0));
  const galleryMaterial=ray.intersectObjects(visible,false)[0].object.material;
  const foundationMaterial=group.getObjectByName('West side basement exposed foundation -35.7 -37.79').material;
  assert.equal(foundationMaterial.color.getHex(),galleryMaterial.color.getHex(),'foundation colour matches the gallery brick above');
  assert.equal(foundationMaterial.map,galleryMaterial.map,'foundation uses the same brick texture');
}
layouts.setVisible('historic',false);layouts.setVisible('modern',false);
assert.equal(surface(-38.3,-18).object.parent.name,'Unexcavated frontage terrain','hiding the estate fills the excavation with terrain');
for(const [x,z] of [[-60,-15],[-72.5,-37],[-72.5,2],[-42.5,-34.7]]){
  const hit=surface(x,z);
  assert.equal(hit.object.parent.name,'Unexcavated frontage terrain','hiding the estate restores lawn across the courtyard and approach');
  assert(Math.abs(hit.point.y+.15)<1e-5);
}
assert.equal(exteriorObstacles(THREE,e.model).walkSurfaces.length,0,'hidden passages do not retain walking heights');

const timeline=prepareEstateTimeline(THREE,e,layouts);
for(const year of [1829,1849,2021,1829]){
  timeline.setPeriod(year);
  // Generated gravel skirts used to share x=-37 with the brick wall, creating
  // the reported flickering strip beneath the six long-wall basement sashes.
  e.model.updateMatrixWorld(true);const facade=[];e.model.traverseVisible(o=>{if(o.isMesh)facade.push(o);});
  // The short return between the gallery and main-wing foundations is brick
  // down to the passage. No cream backing or gravel skirt shares its face.
  for(const x of [-37.81,-37.72,-37.65,-37.55])for(const y of [-.9,-.4,.07,.16,.21,.29]){
    ray.set(new THREE.Vector3(x,y,-30),new THREE.Vector3(0,0,-1));ray.far=.7;
    const hits=ray.intersectObjects(facade,false),hit=hits[0];
    assert.equal(hit?.object.name,'West side basement gallery foundation return','The marked lower return is continuous brick');
    assert.equal(hit.object.material.color.getHex(),0xc5a38d);
    assert.equal(hit.object.material.map,group.getObjectByName('West side basement exposed foundation -35.7 -37.79').material.map);
    assert(Math.abs(hit.point.z+30.5)<1e-5,'The brick closes the existing gallery end');
    assert.equal(new Set(hits.filter(h=>Math.abs(h.distance-hit.distance)<1e-4).map(h=>h.object.uuid+':'+h.instanceId)).size,1,'Only one surface occupies the visible return');
  }
  ray.set(new THREE.Vector3(-38,.16,-30.56),new THREE.Vector3(1,0,0));ray.far=.3;
  const returnSide=ray.intersectObjects(facade,false);
  assert.equal(new Set(returnSide.map(h=>h.object.uuid+':'+h.instanceId)).size,1,'The return replaces the end of the foundation without overlapping its side');
  ray.set(new THREE.Vector3(-37.65,.35,-30),new THREE.Vector3(0,0,-1));ray.far=.7;
  assert.equal(ray.intersectObjects(facade,false)[0]?.object.material.color.getHex(),0xded7bb,'The gallery frame above the repaired foundation is retained');
  for(const z of [-28.7,-27.3,-26.1,-23.4,-20.7,-17.3,-13.8,-9.6,-6.9,-2.7])for(const y of [.07,.16,.21]){
    const x=z<-24.5?-37.5:-37;
    ray.set(new THREE.Vector3(x-.7,y,z),new THREE.Vector3(1,0,0));ray.far=.71;
    const hits=ray.intersectObjects(facade,false).filter(h=>Math.abs(h.point.x-x)<1e-5);
    assert(hits.length,'The basement facade remains solid below the sills');
    assert(!hits.some(h=>h.object.userData.groundContact),'Gravel contact faces must remain inside the masonry');
    assert.equal(new Set(hits.map(h=>h.object.uuid+':'+h.instanceId)).size,1,'Only one exposed surface below each sash');
  }
  ray.far=Infinity;
  for(const [x,z] of [[-60,-15],[-72.5,-37],[-72.5,2]]){
    const hit=surface(x,z);
    assert(hit,'removing later paving never leaves a hole in the early landscape');
    const lawns=[];e.terrain.traverseVisible(o=>{if(o.isMesh)lawns.push(o)});
    ray.set(new THREE.Vector3(x,.9,z),new THREE.Vector3(0,-1,0));
    const lawn=ray.intersectObjects(lawns,false)[0];
    assert.equal(Boolean(lawn),year<1849,'grass fills only the absent later paving');
    if(lawn)assert(Math.abs(lawn.point.y+.15)<1e-5,'restored lawn stays at the original terrain height');
    // The northern tip passes underneath the retained rear approach road.
    if(z!==-37)assert.equal(Boolean(hit.object.material.userData.estateGrass),year<1849);
  }
}
layouts.setVisible('historic',true);layouts.setVisible('modern',false);
assert(!e.terrain.getObjectByName('West courtyard undeveloped terrain').visible,'layout toggles clear the early-period lawn before restoring paving');
delete globalThis.document;
console.log('PASS: west-side stairs, fully excavated passage, low wall, end door, both walking directions and layout visibility.');
