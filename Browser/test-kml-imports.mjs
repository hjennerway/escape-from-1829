import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {KML_TREE_POINTS,KML_TREES,KML_PINE_TREES,KML_OAK_TREES,KML_BEECH_TREES} from './dist/kml-tree-data.mjs';
import {FRONT_LAWN_TREES} from './dist/front-lawn-trees.mjs';
import {COUNTESS_ROUNDABOUT_COORDINATES,COUNTESS_ROUNDABOUT_OUTLINE} from './dist/countess-roundabout.mjs';
import {earthToScene} from './dist/earth-registration.mjs';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
import {bindTreeToggle} from './dist/tree-layer.mjs';
import {prepareEstateTimeline} from './dist/estate-timeline.mjs';
import {PERIODS} from './dist/estate-periods.mjs';
import {ROAD_STYLE} from './dist/road-style.mjs';

function placemarks(path){
  return [...readFileSync(new URL('../Research/'+path,import.meta.url),'utf8')
    .matchAll(/<Placemark\b[^>]*>([\s\S]*?)<\/Placemark>/g)].map(([,xml])=>({name:xml.match(/<name>(.*?)<\/name>/)?.[1]??'',xml}));
}
const points=[];
for(const [file,names] of [['1829.kml',/^(Pine\d+|Oak[12])$/],['1829-3.kml',/^Oak([3-9]|1[0-2])$/],
  ['1829-6.kml',/^(Oak(1[3-9]|2[0-2])|Beech[12])$/]]){
  for(const {name,xml} of placemarks('kml-trees/'+file).filter(p=>names.test(p.name))){
    const coordinates=xml.match(/<Point>[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>/)[1].trim().split(',').map(Number);
    points.push({name,coordinates});
  }
}
for(const {name,xml} of placemarks('kml-trees/1829-11.kml').filter(p=>/^Willow[1-8]$/.test(p.name)||p.name==='Oak21')){const coordinates=xml.match(/<Point>[\s\S]*?<coordinates>([^<]+)/)[1].trim().split(',').map(Number);if(!points.some(p=>p.name===name&&JSON.stringify(p.coordinates)===JSON.stringify(coordinates)))points.push({name,coordinates});}
// Match coordinates across exports: one old Oak16 is relabelled Oak23 in (12).
for(const {name,xml} of placemarks('kml-trees/1829-12.kml').filter(p=>/^(Oak(2[2-9]|30)|Pine14)$/.test(p.name))){
  const coordinates=xml.match(/<Point>[\s\S]*?<coordinates>([^<]+)/)[1].trim().split(',').map(Number);
  if(!points.some(p=>JSON.stringify(p.coordinates)===JSON.stringify(coordinates)))points.push({name,coordinates});
}
assert.deepEqual(KML_TREE_POINTS,points,'Preserve exact tree Point triples from each source export');
assert.equal(KML_TREES.length,58);assert.equal(KML_PINE_TREES.length,14);assert.equal(KML_OAK_TREES.length,34);assert.equal(KML_BEECH_TREES.length,2);
for(const duplicate of ['Oak8','Oak16','Oak21','Oak22']){
  const locations=KML_TREES.filter(t=>t.name===duplicate);assert.equal(locations.length,2);
  assert.notDeepEqual([locations[0].x,locations[0].z],[locations[1].x,locations[1].z]);
}
assert.equal(new Set(KML_TREES.map(t=>t.rotation)).size,58,'Each mapped tree has a distinct stable rotation');
const roundabout=placemarks('countess-roundabout/1829-8.kml').find(p=>p.name==='Countess Mini Roundabout');
const ring=roundabout.xml.match(/<Polygon>[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>/)[1]
  .trim().split(/\s+/).map(point=>point.split(',').map(Number));
assert.deepEqual(COUNTESS_ROUNDABOUT_COORDINATES,ring,'Use the polygon, not its saved camera');
assert.equal(ring.length,9);
assert.deepEqual(COUNTESS_ROUNDABOUT_OUTLINE,ring.slice(0,-1).map(([lon,lat])=>earthToScene(lat,lon)));

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(text){return {width:text.length*16};},strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,16/9),layouts=createAerialLayouts(THREE,exterior);
const mapped=exterior.trees.children.filter(t=>(t.userData.adminPineTree||t.userData.oakTree||t.userData.beechTree||t.userData.willowTree)?.species);
assert.equal(mapped.length,58);
for(const spec of KML_TREES){
  const matches=mapped.filter(t=>t.name===spec.name&&t.position.x===spec.x&&t.position.z===spec.z);
  assert.equal(matches.length,1,'One rendered tree per KML Point, even with both layouts enabled');
  assert.deepEqual([spec.x,spec.z],earthToScene(spec.latitude,spec.longitude));
  assert.equal(matches[0].rotation.y,spec.rotation);
  assert.equal(matches[0].parent,exterior.trees);
}
for(const spec of FRONT_LAWN_TREES){
  const tree=exterior.trees.getObjectByName(spec.name);assert(tree?.userData.frontLawnTree);
  assert.deepEqual([tree.position.x,tree.position.z],[spec.x,spec.z]);
}
assert.equal(layouts.countessRoundabout.parent,layouts.shared);
const approach=layouts.roads.getObjectByName('Valley drive');
assert(approach,'Modern must include the Valley drive approach');
assert.deepEqual(exteriorObstacles(THREE,approach),[],'The connecting road must stay walkable');
exterior.model.updateMatrixWorld(true);
approach.traverse(o=>{
  if(!o.isMesh)return;
  const normals=o.geometry.attributes.normal;
  for(let i=0;i<normals.count;i++)assert(new THREE.Vector3().fromBufferAttribute(normals,i).transformDirection(o.matrixWorld).y>.99,'Approach faces must point upward');
});
// Independent probes follow the single centred approach, then both outgoing
// arms. The old shortcut and near-side bypass must be returned to grass.
const markedRoutes=[
  [[-124.3,55.6],[-115,67],[-105,80],[-95,94]],
  [[-95,94],[-104.5,113.6]],
  [[-95,94],[-66.26,86.67]]
];
const asphalt=[];
for(const group of [layouts.roads,layouts.countessRoundabout])group.traverse(o=>{
  if(o.isMesh&&o.material.color.getHex()===ROAD_STYLE.asphalt)asphalt.push(o);
});
const ray=new THREE.Raycaster();
const roadAt=(x,z)=>{ray.set(new THREE.Vector3(x,5,z),new THREE.Vector3(0,-1,0));return ray.intersectObjects(asphalt.filter(visible),false).length>0;};
assert.equal(exterior.model.getObjectsByProperty('name','Countess Mini Roundabout').length,1);
assert.deepEqual(exteriorObstacles(THREE,layouts.countessRoundabout),[],'Flat road and paint must stay walkable');
const surface=layouts.countessRoundabout.getObjectByName('Countess roundabout asphalt');
surface.updateWorldMatrix(true,false);
const geometry=surface.geometry,position=geometry.attributes.position,index=geometry.index;
let area=0;
for(let i=0;i<index.count;i+=3){
  const [a,b,c]=[0,1,2].map(offset=>new THREE.Vector3().fromBufferAttribute(position,index.getX(i+offset)).applyMatrix4(surface.matrixWorld));
  const normal=b.sub(a).cross(c.sub(a));assert(normal.y>0,'Road triangles must face upward');area+=normal.length()/2;
}
const expectedArea=Math.abs(COUNTESS_ROUNDABOUT_OUTLINE.reduce((sum,[x,z],i)=>{
  const [nx,nz]=COUNTESS_ROUNDABOUT_OUTLINE[(i+1)%8];return sum+x*nz-nx*z;
},0))/2;
assert(Math.abs(area-expectedArea)<.001,'Triangulated asphalt preserves the saved footprint');
const visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
let toggle;bindTreeToggle(exterior,{addEventListener(type,handler){toggle=handler;}},()=>{});
for(const historic of [true,false])for(const modern of [true,false]){
  layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
  assert.equal(visible(layouts.countessRoundabout),historic||modern);
  assert.equal(visible(approach),modern,'The new approach follows Modern independently of the shared roundabout');
  assert.equal(roadAt(-115,67),modern,'The centred approach is asphalt only in Modern');
  for(const [x,z] of [[-90.92,81.05],[-102.7,104]])assert(!roadAt(x,z),'Removed fork and bypass must no longer skirt the roundabout');
  if(modern)for(const markedRoute of markedRoutes)for(let i=1;i<markedRoute.length;i++){
    const a=markedRoute[i-1],b=markedRoute[i],steps=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.5);
    for(let step=0;step<=steps;step++)assert(roadAt(a[0]+(b[0]-a[0])*step/steps,a[1]+(b[1]-a[1])*step/steps),'The marked route must connect continuously through the roundabout');
  }
  for(const showTrees of [true,false]){
    if(exterior.trees.visible!==showTrees)toggle({code:'KeyT',preventDefault(){}});
    const obstacles=exteriorObstacles(THREE,layouts.shared);
    for(const tree of mapped){
      assert.equal(visible(tree),(historic||modern)&&showTrees);
      if((historic||modern)&&showTrees)assert(obstacles.some(o=>obstacleContains(o,tree.position.x,tree.position.z,0)),tree.name+' trunk must block walking');
    }
    assert.equal(visible(layouts.countessRoundabout),historic||modern,'Tree toggle leaves the road visible');
  }
}
exterior.trees.visible=false;
assert.deepEqual(exteriorObstacles(THREE,exterior.trees),[],'Hidden tree layer leaves no trunk collisions');
exterior.trees.visible=true;
const timeline=prepareEstateTimeline(THREE,exterior,layouts);
for(const {year} of PERIODS){
  timeline.setPeriod(year);
  for(const tree of mapped)assert(visible(tree),tree.name+' must appear in '+year);
}
delete globalThis.document;
console.log(`PASS: 58 exact KML trees in all periods, duplicate Oak8/Oak16/Oak21/Oak22 points, preserved front beeches, shared visibility and collisions; eight-vertex Countess roundabout (${area.toFixed(1)} square units), upward roads, walkable centre and continuous Modern-only approach.`);
