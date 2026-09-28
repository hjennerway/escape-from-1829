import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
import {WEST_SIDE_BASEMENT as basement} from './dist/west-side-basement.mjs';

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
    assert(Math.abs(hit.point.z+1)<1e-5);
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
  for(const [x,z] of [[-60,-30],[-43.1,-34.7],[-40.5,-30],[-73.6,-15]])
    assert.equal(surface(x,z).object.name,'Estate terrain','the lawn outside the paved outline stays intact');
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
delete globalThis.document;
console.log('PASS: west-side stairs, fully excavated passage, low wall, end door, both walking directions and layout visibility.');
