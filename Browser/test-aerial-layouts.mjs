import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts,bindLayoutToggles,fitAerialLayouts,visibleLayoutBounds} from './dist/aerial-layouts.mjs';
import {MODERN_ROAD_PATHS} from './dist/modern-road-data.mjs';
import {updateRoadLabels} from './dist/road-labels.mjs';
import {earthToScene} from './dist/earth-registration.mjs';
import {ESTATE_CHIMNEY} from './dist/estate-chimney.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
const drawnRoadNames=[];
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(text){return {width:text.length*16}},strokeText(){},fillText(text){drawnRoadNames.push(text)}})})};
const exterior=createEscapeExterior(THREE,16/9);
const before=new Map();exterior.model.updateMatrixWorld(true);exterior.model.traverse(o=>before.set(o,o.matrixWorld.clone()));
const layouts=createAerialLayouts(THREE,exterior);
assert.equal(createAerialLayouts(THREE,exterior),layouts,'Repeated setup must not duplicate scene groups or roads');
exterior.model.updateMatrixWorld(true);for(const [o,matrix]of before)assert(o.matrixWorld.equals(matrix),'Grouping must preserve all existing transforms');
assert.equal(exterior.terrain.parent,exterior.model);
assert.deepEqual(layouts.historic.children,[exterior.mainAdmin,exterior.adminCorridor,exterior.estateChimney,exterior.annexe,layouts.historicRoads]);
assert.equal(exterior.chapel.parent,layouts.shared);assert.equal(exterior.waterTower.parent,layouts.shared);assert.equal(exterior.churtonWard.parent,layouts.shared);
const frontage=layouts.shared.getObjectByName('Blue dragons and central coat of arms');assert(frontage,'1829 must remain in the common estate');
assert(layouts.shared.getObjectByName('Redesmere canted bay'),'Redesmere must remain in the common estate');
assert.equal(exterior.planters.visible,false,'Grouping must preserve the separate planter preference');
const visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true};
for(const historic of [true,false])for(const modern of [true,false]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
 for(const o of [frontage,exterior.chapel,exterior.waterTower,exterior.churtonWard])assert.equal(visible(o),historic||modern);
 for(const o of [exterior.annexe,exterior.mainAdmin,exterior.adminCorridor,exterior.estateChimney])assert.equal(visible(o),historic);
 for(const o of layouts.roads.children)assert.equal(visible(o),o.name==='Vivienne Smith Lane'?(historic||modern):modern);
 assert.equal(visible(exterior.terrain),true);
 assert.equal(exteriorObstacles(THREE,exterior.model).some(o=>obstacleContains(o,ESTATE_CHIMNEY.x,ESTATE_CHIMNEY.z)),historic,'A hidden chimney must not leave a collision obstacle');
 for(const aspect of [16/9,4/3,9/16]){
  exterior.camera.aspect=aspect;const target=fitAerialLayouts(THREE,exterior,layouts);
  if(!historic&&!modern){assert.equal(target,null);continue;}
  assert(target);updateRoadLabels(THREE,layouts.roads,exterior.camera,aspect*1000,1000);assert.equal(exterior.scene.fog.density,0,'Fit must clear distance fog so the road network is visible');exterior.camera.updateMatrixWorld(true);
  for(const group of [layouts.shared,layouts.historic,layouts.modern].filter(g=>g.visible)){
   const b=visibleLayoutBounds(THREE,group);if(b.isEmpty())continue;
   for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){
    const p=new THREE.Vector3(x,y,z).project(exterior.camera);assert(Math.abs(p.x)<1&&Math.abs(p.y)<1&&Math.abs(p.z)<1,'Fit must contain visible estate and complete road paths in every aspect');
   }
  }
 }
}
layouts.setVisible('historic',true);layouts.setVisible('modern',false);
const sharedLane=layouts.roads.getObjectByName('Vivienne Smith Lane');
assert.equal(layouts.roads.children.filter(r=>r.name==='Vivienne Smith Lane').length,1,'Both layouts must use one copy of Vivienne Smith Lane');
const historicRoadBounds=visibleLayoutBounds(THREE,layouts.roads),laneBounds=visibleLayoutBounds(THREE,sharedLane);assert(historicRoadBounds.equals(laneBounds),'Historic fitting must exclude every Modern-only road');
fitAerialLayouts(THREE,exterior,layouts);updateRoadLabels(THREE,layouts.roads,exterior.camera,900,1600);
assert(visible(sharedLane.getObjectByName('Road label · Vivienne Smith Lane')),'The shared lane name must render in Historic');
assert(!visible(layouts.roads.getObjectByName('Warren Lane')),'Warren Lane is Modern-only');
layouts.setVisible('historic',false);

assert.deepEqual(MODERN_ROAD_PATHS.map(r=>[r.name,r.coordinates.length]),[['Upton grange',12],['Gerrard Crescent',10],['Frost drive',9],['Vivienne Smith Lane',14],['Ross Avenue',2],['Ross Avenue (Part 2)',7],['Upton Grange (Part 2)',19],['Lockwood View',6],['Warren Lane',15],['Parsons Lane',9],['Parsons Lane (Upton Lea)',7],['Parsons Lane (1829 Central)',6],['Valley drive',8]]);
assert.deepEqual(earthToScene(53.2116032,-2.8988043),[0,19.5]);
const tower=earthToScene(53.21234432581698,-2.900961415659128);assert(Math.hypot(tower[0]-148,tower[1]+55.2)<.06,'Road registration must match the verified tower pin');
for(let i=0;i<MODERN_ROAD_PATHS.length;i++){
 const path=MODERN_ROAD_PATHS[i],road=layouts.roads.children[i];assert.equal(road.name,path.name);
 assert.deepEqual(road.userData.centerline,path.coordinates.map(p=>earthToScene(...p)),'Every saved path vertex must be preserved in order');
 road.traverse(o=>{if(!o.isMesh)return;const normals=o.geometry.attributes.normal;for(let n=0;n<normals.count;n++)assert(normals.getY(n)>.99,'Roads must face upwards');const b=new THREE.Box3().setFromObject(o);assert(b.min.y>.3&&b.max.y<.4,'Road overlays must clear terrain without becoming walking obstacles');});
}
// Each path gets its own text texture; labels are actual road children and inherit Modern visibility.
assert.deepEqual(drawnRoadNames,MODERN_ROAD_PATHS.map(p=>p.name));
for(const road of layouts.roads.children){
 const label=road.getObjectByName('Road label · '+road.name);assert(label?.isSprite);assert.equal(label.userData.roadName,road.name);assert.equal(label.parent,road);assert.equal(label.material.sizeAttenuation,false);
 for(const [x,y,z] of label.userData.candidates){
  assert.equal(y,1);let nearest=Infinity;
  for(let i=1;i<road.userData.centerline.length;i++){
   const a=road.userData.centerline[i-1],b=road.userData.centerline[i],dx=b[0]-a[0],dz=b[1]-a[1],length2=dx*dx+dz*dz;
   const t=length2?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/length2)):0;
   nearest=Math.min(nearest,Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz));
  }
  assert(nearest<1e-7,'Every alternate label anchor must remain on its road');
 }
}
layouts.setVisible('modern',true);
for(const [width,height] of [[1440,1000],[390,844]]){
 exterior.camera.aspect=width/height;fitAerialLayouts(THREE,exterior,layouts);updateRoadLabels(THREE,layouts.roads,exterior.camera,width,height);
 for(const road of layouts.roads.children){const label=road.getObjectByName('Road label · '+road.name);assert(label.visible,'Every road must have a visible label when fitted');const pixelHeight=label.scale.y/(2*Math.tan(exterior.camera.fov*Math.PI/360))*height;assert(Math.abs(pixelHeight-20)<1e-6,'Text must retain a readable screen size in desktop and mobile');}
}
layouts.setVisible('modern',false);

// Check actual change handlers, including all-off and re-enabling either layout.
const elements=Object.fromEntries(['historicLayout','modernLayout','fitLayouts','modernRoadList'].map(id=>[id,{addEventListener(type,fn){this[type]=fn}}]));
bindLayoutToggles(layouts,{querySelector:s=>elements[s.slice(1)]});
assert(elements.fitLayouts.disabled);elements.modernLayout.checked=true;elements.modernLayout.change();assert(layouts.modern.visible&&layouts.shared.visible&&!layouts.historic.visible);assert(!elements.modernRoadList.hidden&&!elements.fitLayouts.disabled);
elements.historicLayout.checked=true;elements.historicLayout.change();elements.modernLayout.checked=false;elements.modernLayout.change();assert(layouts.historic.visible&&layouts.shared.visible&&!layouts.modern.visible);assert(elements.modernRoadList.hidden);
console.log('PASS: independent Historic/Modern controls, shared buildings, preserved transforms, hidden collisions, thirteen exact custom paths, camera-facing road names, upward road surfaces and full landscape/portrait framing.');
