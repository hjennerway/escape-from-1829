import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
import {LAUNDRY,LAUNDRY_VIEWS} from './dist/laundry.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior),group=exterior.laundry;
exterior.model.updateMatrixWorld(true);
const bounds=name=>new THREE.Box3().setFromObject(group.getObjectByName(name));
const body=bounds('Laundry white rendered walls'),link=bounds('Laundry connecting corridor brick walls');
const host=new THREE.Box3().setFromObject(exterior.adminCorridor.getObjectByName('Redesmere connector building walls'));
assert(Math.abs(link.min.z-host.max.z)<1e-5,'Brick link must touch the existing range');
assert(link.min.x>=host.min.x&&link.max.x<=host.max.x,'Entire rear link must meet its host wall');
assert(link.max.z>=body.min.z&&link.max.z-body.min.z<.1,'Link must meet the white block without a gap');
assert(link.max.y<body.max.y,'Flat-roof corridor must remain lower than the main block');
assert(body.min.x>99.8&&body.min.z>22,'Keep the new block in front of and east of the retained ivy range');
assert(body.max.z-body.min.z>1.8*(body.max.x-body.min.x),'Long axis must follow the marked north/south footprint');
const ray=new THREE.Raycaster();
function roofAt(x,z){ray.set(new THREE.Vector3(x,20,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(group,true)[0];}
const centre=body.getCenter(new THREE.Vector3());
const high=roofAt(centre.x,centre.z).point.y;
for(const [x,z] of [[body.min.x+.3,centre.z],[body.max.x-.3,centre.z],[centre.x,body.min.z+.3],[centre.x,body.max.z-.3]]){
 const hit=roofAt(x,z);assert.equal(hit.object.name,'Laundry hipped slate roof');
 assert(hit.point.y>LAUNDRY.eaves&&hit.point.y<high-1,'Each of four sides must fall away from the ridge');
 assert(hit.face.normal.y>0,'All hip slopes must face upwards');
}
const linkTop=[];
for(const x of [link.min.x+.4,link.max.x-.4])for(const z of [link.min.z+1,link.max.z-1]){
 const hit=roofAt(x,z);assert.equal(hit.object.name,'Laundry corridor flat roof');assert(hit.face.normal.y>.999);linkTop.push(hit.point.y);
}
assert(Math.max(...linkTop)-Math.min(...linkTop)<1e-5,'Corridor roof must be level');
for(const o of group.userData.openings){
 const normal=new THREE.Vector3(Math.sin(o.r),0,Math.cos(o.r));
 ray.set(new THREE.Vector3(o.x,o.y,o.z).addScaledVector(normal,.7),normal.negate());
 assert(ray.intersectObject(group,true)[0]?.object.isInstancedMesh,'Window glazing must be exposed on its wall: '+o.label);
}
group.traverse(o=>{if(!o.isMesh)return;for(const attribute of Object.values(o.geometry.attributes))assert([...attribute.array].every(Number.isFinite));});
const visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
for(const historic of [true,false])for(const modern of [true,false]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
 assert.equal(visible(group),historic);
 const obstacles=exteriorObstacles(THREE,exterior.model);
 for(const [x,z] of [[centre.x,centre.z],[(link.min.x+link.max.x)/2,(link.min.z+link.max.z)/2]])assert.equal(obstacles.some(o=>obstacleContains(o,x,z)),historic,'Hidden laundry must not leave walking collisions');
}
layouts.setVisible('historic',true);layouts.setVisible('modern',false);
const obstacles=exteriorObstacles(THREE,exterior.model),walker=createWalker(exterior.camera,obstacles);
walker.setView({position:[100.7,1.8,58],target:[100.7,1.8,24]});walker.keys.add('KeyW');
for(let i=0;i<68;i++)walker.update(.1);
assert(exterior.camera.position.z<24.1,'The garden-side route must remain open alongside the block');
walker.setView({position:[98,1.8,40],target:[110,1.8,40]});walker.keys.add('KeyW');
for(let i=0;i<35;i++)walker.update(.1);
assert(exterior.camera.position.x<body.min.x,'Walking into the rendered block must stop at its west wall');
for(const shot of Object.values(LAUNDRY_VIEWS).filter(shot=>shot.position[1]<3))assert(!obstacles.some(o=>obstacleContains(o,shot.position[0],shot.position[2])),'Inspection cameras must start outside building footprints');
console.log('PASS: Laundry hipped roof, flat brick link, continuous contacts, exposed glazing, garden access and Historic-only visibility/collisions.');
