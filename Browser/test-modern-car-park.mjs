import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {bindTreeToggle} from './dist/tree-layer.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
import {KML_CAR_PARK_COORDINATES,CAR_PARK_OUTLINE} from './dist/kml-car-park-data.mjs';
import {earthToScene} from './dist/earth-registration.mjs';

const kml=readFileSync(new URL('../Research/car-park/1829-4.kml',import.meta.url),'utf8');
const placemark=[...kml.matchAll(/<Placemark\b[^>]*>([\s\S]*?)<\/Placemark>/g)]
  .find(match=>/<name>Car park<\/name>/.test(match[1]))[1];
const coordinates=placemark.match(/<Polygon>[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>/)[1]
  .trim().split(/\s+/).map(point=>point.split(',').map(Number));
assert.equal(coordinates.length,63);
assert.deepEqual(KML_CAR_PARK_COORDINATES,coordinates,'Import the polygon ring, not the saved camera');
assert.deepEqual(CAR_PARK_OUTLINE,coordinates.slice(0,-1).map(([lon,lat])=>earthToScene(lat,lon)));

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(text){return {width:text.length*16};},strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,16/9);
const originalTrees=[...exterior.trees.children].filter(tree=>!tree.isInstancedMesh);
function crownsByTree(){
  const result=new Map(),matrix=new THREE.Matrix4();
  exterior.model.traverseVisible(batch=>{
    if(!batch.userData.treeIds)return;
    for(let i=0;i<batch.count;i++){
      const id=batch.userData.treeIds[i];batch.getMatrixAt(i,matrix);
      if(!result.has(id))result.set(id,[]);
      result.get(id).push(matrix.toArray());
    }
  });
  return result;
}
const originalCrowns=crownsByTree(),layouts=createAerialLayouts(THREE,exterior);
const displaced=layouts.carParkTrees.children.filter(tree=>!tree.isInstancedMesh);
assert.equal(displaced.length,13,'Clear the thirteen remaining intersecting broadleaf trees');
assert(!originalTrees.some(tree=>tree.userData.broadleafTree?.x===107&&tree.userData.broadleafTree?.z===-98),
  'The yellow-circled bowling lawn tree is permanently removed');
assert(displaced.every(tree=>tree.userData.broadleafTree));
assert.equal(layouts.carPark.parent,layouts.modern);
assert(!exterior.model.getObjectByName('Modern rear hardstanding beside Parsons Lane'));

// The triangulation must preserve concave insets and the complete mapped area.
const geometry=layouts.carPark.geometry,positions=geometry.attributes.position,indices=geometry.index;
let area=0;
for(let i=0;i<indices.count;i+=3){
  const a=new THREE.Vector3().fromBufferAttribute(positions,indices.getX(i));
  const b=new THREE.Vector3().fromBufferAttribute(positions,indices.getX(i+1));
  const c=new THREE.Vector3().fromBufferAttribute(positions,indices.getX(i+2));
  area+=b.sub(a).cross(c.sub(a)).length()/2;
}
const expectedArea=Math.abs(CAR_PARK_OUTLINE.reduce((sum,a,i)=>{
  const b=CAR_PARK_OUTLINE[(i+1)%CAR_PARK_OUTLINE.length];return sum+a[0]*b[1]-b[0]*a[1];
},0))/2;
assert(Math.abs(area-expectedArea)<.01,'Concave triangulation must cover only the KML area');
exterior.model.updateMatrixWorld(true);
for(const [x,z,expected] of [[40,-140,true],[110,-150,false],[40,-100,true]]){
  const ray=new THREE.Raycaster(new THREE.Vector3(x,50,z),new THREE.Vector3(0,-1,0));
  assert.equal(ray.intersectObject(layouts.carPark).length>0,expected,'Keep the mapped surface and restore grass outside its boundary');
}

const visible=object=>{for(;object;object=object.parent)if(!object.visible)return false;return true;};
for(const historic of [true,false])for(const modern of [true,false]){
  layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
  assert.equal(visible(layouts.carPark),modern);
  assert.equal(visible(exterior.bowlingGreen),historic,'The bowling lawn belongs to the Historic grounds');
  const crowns=crownsByTree();
  for(const tree of originalTrees){
    const expected=(historic||modern)&&(!modern||!displaced.includes(tree));
    assert.equal(visible(tree),expected,'Whole trees must follow layout visibility');
    if(originalCrowns.has(tree.uuid))assert.deepEqual(crowns.get(tree.uuid),expected?originalCrowns.get(tree.uuid):undefined,
      'All five crown instances must follow their trunk without changing their shape');
  }
  const obstacles=visible(exterior.trees)?exteriorObstacles(THREE,exterior.trees):[];
  assert(!obstacles.some(obstacle=>obstacleContains(obstacle,107,-98,0)),
    'The removed lawn tree must leave no trunk collision');
  for(const tree of displaced){
    assert.equal(obstacles.some(obstacle=>obstacleContains(obstacle,tree.position.x,tree.position.z,0)),historic&&!modern,
      'Modern must remove hidden trunk collisions; Historic must restore them');
  }
}
layouts.setVisible('modern',true);
const oaks=originalTrees.filter(tree=>tree.userData.oakTree);
assert.equal(oaks.length,25);assert(oaks.every(visible),'Preserve every KML oak, including Oak1 and Oak2 beside the car park');
let toggle;
bindTreeToggle(exterior,{addEventListener(type,handler){toggle=handler;}});
toggle({code:'KeyT',preventDefault(){}});
assert(oaks.every(tree=>!visible(tree)));assert(visible(layouts.carPark));
layouts.setVisible('historic',true);layouts.setVisible('modern',false);
assert(originalTrees.every(tree=>!visible(tree)),'Layout switches must respect the hidden Trees layer');
toggle({code:'KeyT',preventDefault(){}});assert(originalTrees.every(visible));
delete globalThis.document;
console.log(`PASS: 62 exact KML vertices, ${area.toFixed(1)} square units, Modern-only car park, concave boundary, thirteen complete trees and collisions cleared only in Modern, bowling lawn tree removed, all oaks retained.`);
