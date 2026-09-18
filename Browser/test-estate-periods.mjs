import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {PERIODS,WARD_DATES,BUILDING_SECTIONS,existsInYear,periodForYear,roadSection} from './dist/estate-periods.mjs';
import {BUILDING_CATALOG} from './dist/building-catalog.mjs';
import {ESTATE_CHIMNEY} from './dist/estate-chimney.mjs';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {prepareEstateTimeline,clipTimelineGeometry} from './dist/estate-timeline.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
import {createBuildingSelection,isBuildingVisible} from './dist/building-selection.mjs';
import {batchAerialMeshes,cacheAerialTransforms} from './dist/aerial-performance.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(text){return {width:text.length*16};},strokeText(){},fillText(){}})})};

assert.deepEqual(PERIODS.map(p=>p.year),[1829,1849,1856,1860,1870,1896,1912,1915,1916,1938,2010,2016,2021]);
assert.deepEqual(PERIODS[0],{year:1829,title:'Opening',description:'Cheshire Lunatic Asylum opens August 1829'});
assert.equal(WARD_DATES.length,22);
for(const row of WARD_DATES){assert(!existsInYear(row.section,row.built-1));assert(existsInYear(row.section,row.built));if(row.demolished){assert(existsInYear(row.section,row.demolished-1));assert(!existsInYear(row.section,row.demolished));}else assert(existsInYear(row.section,2100));}
assert.equal(periodForYear('nonsense').year,1916);assert.equal(periodForYear('2010').year,2010);
assert(!existsInYear(roadSection('Ross Avenue (Part 2)'),2010));
for(const entry of BUILDING_CATALOG)assert(BUILDING_SECTIONS[entry.id],entry.id+' has a dated section');

// Clipping preserves surface area and texture coordinates at the boundary.
const geometry=new THREE.BoxGeometry(8,4,6),matrix=new THREE.Matrix4().makeTranslation(22,3,0);
function area(g){const p=g.attributes.position,index=g.index;let sum=0;for(let i=0;i<(index?.count??p.count);i+=3){const [a,b,c]=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,index?index.getX(i+j):i+j));sum+=b.sub(a).cross(c.sub(a)).length()/2;}return sum;}
const parts=[-1,1].map(sign=>clipTimelineGeometry(THREE,geometry,matrix,22,sign));
assert(Math.abs(parts.reduce((n,g)=>n+area(g),0)-area(geometry))<1e-6);
for(const part of parts)assert.equal(part.attributes.uv.count,part.attributes.position.count);

const exterior=createEscapeExterior(THREE,16/9),layouts=createAerialLayouts(THREE,exterior);
const timeline=prepareEstateTimeline(THREE,exterior,layouts),selection=createBuildingSelection(THREE,exterior);
// Raycast the visible ground, including instanced gravel and paths crossing
// period boundaries, so an undeveloped wing cannot leave a paved footprint.
const groundSamples=[
 [-64,-10,1849],[60,-10,1849],[35,46,1849],[-35,46,1849],
 [-17,29,1849],[17,29,1849],[60,-30.5,1870],[100,15,1870],[76,20,1870]
];
const groundRay=new THREE.Raycaster();
function checkGround(year){
 exterior.model.updateMatrixWorld(true);
 const surfaces=[];exterior.model.traverseVisible(object=>{if(object.isMesh)surfaces.push(object);});
 function groundHitAt(x,z){
  groundRay.set(new THREE.Vector3(x,.49,z),new THREE.Vector3(0,-1,0));
  return groundRay.intersectObjects(surfaces,false)[0];
 }
 const groundAt=(x,z)=>groundHitAt(x,z)?.object.material;
 for(const [x,z,built] of groundSamples){
  const material=groundAt(x,z);assert(material,`Ground remains at ${x}, ${z} in ${year}`);
  assert.equal(Boolean(material.userData.estateGrass),year<built,`Grass before construction, paving after, at ${x}, ${z} in ${year}`);
  if(year<built){
   assert.equal(material.map,exterior.terrain.material.map,'Revealed ground uses the terrain texture');
   assert(material.color.equals(exterior.terrain.material.color));
   assert.equal(material.customProgramCacheKey(),exterior.terrain.material.customProgramCacheKey(),'The grass keeps the same world projection');
  }
 }
 for(const [x,z,built] of [[90,32,1870],[68,36,1849],[-64,37,1849],[80,46,1870],[55,-34,1870]]){
  const hit=groundHitAt(x,z);
  assert(hit?.object.material.userData.estateGrass,'Lawn remains grass in every period');
  assert.equal(hit.object===exterior.terrain,year<built,`No raised lawn outline at ${x}, ${z} before ${built}`);
 }
 for(const [x,z] of [[0,32],[0,60],[-23,-25],[23,-25]])assert(!groundAt(x,z)?.userData.estateGrass,'Original Reception approach and inner courts remain paved');
}
const passage=exterior.model.getObjectByName('1829 Redesmere passage head');
const openingWall=exterior.model.getObjectByName('1829 east end wall');
const entranceProjections=[];
exterior.model.traverse(object=>{
 if(/^Entrance (west|east) (three-bay projection|projection slate roof)/.test(object.name))entranceProjections.push(object);
});
assert(entranceProjections.length>=6,'Both projections retain masonry, white lower storeys and slate roofs');
function frontageHits(){
 exterior.model.updateMatrixWorld(true);
 const meshes=[];exterior.model.traverseVisible(object=>{if(object.isMesh)meshes.push(object);});
 return [-1,1].flatMap(side=>[1.45,5.6,10,13.3].flatMap(y=>[24.25,26.15,28.1].map(x=>{
  groundRay.set(new THREE.Vector3(side*x,y,23),new THREE.Vector3(0,0,-1));
  const hit=groundRay.intersectObjects(meshes,false)[0];
  assert(hit&&hit.point.z>19.65,'Projection doors, glazing and cornice face the lawn');
  return [hit.point.z,hit.object.material.uuid];
 })));
}
timeline.setPeriod(1849);const completeFrontage=frontageHits();
assert(openingWall,'The exposed opening-period end has a closing wall');
assert(passage,'The passage head is retained as a complete section');
const passageBounds=new THREE.Box3().setFromObject(passage);
assert(passageBounds.min.x<70&&passageBounds.max.x>79.5,'Both sides of the lintel survive the timeline boundary');
assert.deepEqual(selection.entries.map(e=>e.id),BUILDING_CATALOG.map(e=>e.id),'All building selections survive partitioning');
const position=exterior.camera.position.clone(),quaternion=exterior.camera.quaternion.clone();
for(const period of PERIODS){
 timeline.setPeriod(period.year);selection.refresh();
 checkGround(period.year);
 for(const object of entranceProjections)assert(isBuildingVisible(object),object.name+' is complete from 1829');
 assert.deepEqual(frontageHits(),completeFrontage,'Both complete projection facades persist in '+period.year);
 passage.traverse(object=>assert.equal(isBuildingVisible(object),period.year>=1870,'Complete passage head, trim and supports in '+period.year));
 assert.equal(isBuildingVisible(openingWall),period.year===1829,'The end wall is replaced by the 1849 wing');
 for(const road of layouts.roads.children)assert.equal(isBuildingVisible(road),existsInYear(roadSection(road.name),period.year),road.name+' in '+period.year);
 for(const [key,section] of Object.entries({mainAdmin:'The Main',annexe:'Annexe',chapel:'Church',uptonFrithOscroft:'Upton Lea',churtonWard:'Kelsall',willows:'The Willows',waterTower:'Water tower'}))assert.equal(isBuildingVisible(exterior[key]),existsInYear(section,period.year),key+' in '+period.year);
 for(const entry of selection.entries)assert.equal(entry.mesh.visible,existsInYear(BUILDING_SECTIONS[entry.id],period.year),entry.id+' selection in '+period.year);
 assert(exterior.camera.position.equals(position)&&exterior.camera.quaternion.equals(quaternion));
}
timeline.setPeriod(1829);let obstacles=exteriorObstacles(THREE,exterior.model);
assert(isBuildingVisible(exterior.waterTower),'Water tower is present at opening');
for(const [x,z] of [[0,13],[-31,-10],[31,-10]])assert(obstacles.some(o=>obstacleContains(o,x,z)),'The marked original block and both rear ranges exist in 1829');
for(const x of [-26.15,26.15])assert(obstacles.some(o=>obstacleContains(o,x,19.5)),'Both entrance projections have collision from 1829');
for(const [x,z] of [[-48,12],[-35,35],[35,35],[65.5,15],[89,-14]])assert(!obstacles.some(o=>obstacleContains(o,x,z)),'Later wings must not collide in 1829');
selection.refresh();const east=selection.entries.find(entry=>entry.id==='1829-east');
const originalCount=east.mesh.geometry.attributes.position.count;
assert(east.mesh.geometry.boundingBox.max.z<22,'1829 photo highlight excludes the unbuilt south arm');
timeline.setPeriod(1849);selection.refresh();assert(east.mesh.geometry.attributes.position.count>originalCount,'Photo outline grows with the built wing');
assert.equal(exteriorObstacles(THREE,openingWall).length,0,'The replacement wing hides the closing wall and its collision');
obstacles=exteriorObstacles(THREE,exterior.model);
for(const name of ['Redesmere chimney cap step','Redesmere rear stepped parapet'])assert(!isBuildingVisible(exterior.model.getObjectByName(name)),name+' must not float above an unbuilt wing');
assert(obstacles.some(o=>obstacleContains(o,35,35)),'The front arm is added at the 1849 new-wings stop');
assert(obstacles.some(o=>obstacleContains(o,65.5,15)),'The circled east pavilion is built in 1849');
for(const name of ['East garden pavilion','Garden pavilion east wall','Garden pavilion slate roof'])assert(isBuildingVisible(exterior.model.getObjectByName(name)),name+' belongs to the circled 1849 additions');
assert.equal(exteriorObstacles(THREE,passage).length,0,'The passage supports have no collision before 1870');
assert(!obstacles.some(o=>obstacleContains(o,89,-14)),'The outer Barmere range still waits until 1870');
assert(!obstacles.some(o=>obstacleContains(o,ESTATE_CHIMNEY.x,ESTATE_CHIMNEY.z)),'Unbuilt chimney has no walking collision');
timeline.setPeriod(1870);obstacles=exteriorObstacles(THREE,exterior.model);
assert(exteriorObstacles(THREE,passage).some(o=>obstacleContains(o,69.91,8.5)),'The passage support becomes solid in 1870');
assert(!obstacles.some(o=>obstacleContains(o,74.65,8.5)),'The lane under the complete lintel stays walkable');
timeline.setPeriod(1938);obstacles=exteriorObstacles(THREE,exterior.model);
assert(obstacles.some(o=>obstacleContains(o,35,35)),'East ward becomes solid');
assert(obstacles.some(o=>obstacleContains(o,ESTATE_CHIMNEY.x,ESTATE_CHIMNEY.z)),'Main chimney becomes solid');
timeline.setPeriod(2010);obstacles=exteriorObstacles(THREE,exterior.model);
assert(!obstacles.some(o=>obstacleContains(o,ESTATE_CHIMNEY.x,ESTATE_CHIMNEY.z)),'Demolished chimney loses collision');
exterior.trees.visible=false;timeline.setPeriod(1849);assert(!exterior.trees.visible,'Changing years preserves the tree preference');
exterior.trees.visible=true;
// Build batches with all dated parts enabled, as in the source compiler. A
// period switch must never reveal a batch from an unbuilt section.
for(const rule of timeline.rules)rule.visible=true;
batchAerialMeshes(THREE,exterior.model,{exclude:[exterior.trees,exterior.terrain,...layouts.visibilityObjects]});cacheAerialTransforms(exterior.scene);
for(const year of [1829,1849,1938,2021,1870]){
 timeline.setPeriod(year);
 checkGround(year);
 assert.deepEqual(frontageHits(),completeFrontage,'Batched projection facades persist in '+year);
 exterior.model.traverse(object=>{if(!object.userData.aerialBatch)return;let ancestor=object;while(ancestor&&!ancestor.userData.estateSection)ancestor=ancestor.parent;if(ancestor)assert.equal(isBuildingVisible(object),existsInYear(ancestor.userData.estateSection,year));});
}
assert(exterior.scene.children.find(o=>o.isDirectionalLight).shadow.needsUpdate);
console.log('PASS: all 13 periods, all 22 date rows, original 1829 ranges and tower, later wings, selection, collisions, tree preference, camera and batch visibility.');
