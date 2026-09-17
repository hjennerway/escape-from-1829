import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {OUTHOUSE,OUTHOUSE_VIEWS,outhousePoint} from './dist/outhouse.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const e=createEscapeExterior(THREE,1.5),site=e.outhouse,layouts=createAerialLayouts(THREE,e);
e.scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0),roof=site.getObjectByName('Outhouse continuous slate roof');let samples=0;
ray.camera=e.camera;
for(let x=.05;x<OUTHOUSE.length;x+=.2)for(let z=-OUTHOUSE.width/2+.05;z<OUTHOUSE.width/2;z+=.2){
 ray.set(new THREE.Vector3(...outhousePoint(x,15,z)),down);
 assert(ray.intersectObject(roof).length,'Roof covers the entire rotated footprint');samples++;
}
const h=JSON.parse(readFileSync(new URL('../Research/outhouse/junction-fit.json',import.meta.url))).groundHomography;
for(const x of [0,OUTHOUSE.length])for(const z of [-OUTHOUSE.width/2,OUTHOUSE.width/2]){
 const [wx,,wz]=outhousePoint(x,0,z),d=h[6]*wx+h[7]*wz+h[8],u=(h[0]*wx+h[1]*wz+h[2])/d,v=(h[3]*wx+h[4]*wz+h[5])/d;
 assert(((u-565)/53)**2+((v-410)/40)**2<1,'Footprint is inside the latest red circle beside the junction');
}
const heightAt=z=>{ray.set(new THREE.Vector3(...outhousePoint(4,15,z)),down);return ray.intersectObject(roof)[0]?.point.y;};
const ridgeHeight=heightAt(OUTHOUSE.width*.25),middleHeight=heightAt(0);
assert(Math.abs(ridgeHeight-(OUTHOUSE.eave+OUTHOUSE.rise+.08))<.001,'Peak is three-quarters from the 1829 side towards the windowed wall');
assert(ridgeHeight-middleHeight>.7,'Roof apex is offset from the middle');
for(const o of site.userData.openings){
 const p=new THREE.Vector3(...outhousePoint(o.face==='front'?0:o.u,o.y,o.face==='front'?o.u:OUTHOUSE.width/2));
 const normal=new THREE.Vector3(o.face==='front'?-1:0,0,o.face==='front'?0:1).transformDirection(site.matrixWorld);
 ray.set(p.clone().addScaledVector(normal,.6),normal.clone().negate());
 assert(ray.intersectObject(site,true)[0]?.object.isInstancedMesh,'Boarded opening is exposed in front of masonry');
}
const gable=site.getObjectByName('Outhouse brick gables');
assert(gable.geometry.attributes.normal.getX(0)<0,'Front gable normal points out, matching the wall lighting');
site.traverse(o=>{if(o.isMesh)for(const a of Object.values(o.geometry.attributes))assert([...a.array].every(Number.isFinite),'Finite geometry');});
assert.equal(site.userData.openings.filter(o=>o.face==='side').length,2);
const obstacles=exteriorObstacles(THREE,e.model),blocked=(x,z)=>obstacles.some(o=>obstacleContains(o,x,z));
const centre=outhousePoint(4,0,0);assert(blocked(centre[0],centre[2]),'Solid walking collision');
for(const key of ['outhouse-1','outhouse-2','outhouse-3']){const p=OUTHOUSE_VIEWS[key].position;assert(!blocked(p[0],p[2]),key+' camera starts on accessible ground');}
for(let x=-16;x<-.6;x+=.25){const p=outhousePoint(x,0,-3.25);assert(!blocked(p[0],p[2]),'Narrow approach remains walkable');}
for(const side of [-1,1])for(let x=-.6;x<OUTHOUSE.length+.7;x+=.25){const p=outhousePoint(x,0,side*(OUTHOUSE.width/2+.9));assert(!blocked(p[0],p[2]),'Clear walk around both long walls');}
for(const road of [layouts.roads,layouts.historicRoads,e.greenhouses.getObjectByName('Greenhouse access road and yard')]){
 for(const x of [0,2,4,6,8.1])for(const z of [-2.9,2.9]){ray.set(new THREE.Vector3(...outhousePoint(x,25,z)),down);assert(!ray.intersectObject(road,true).some(hit=>hit.point.y<.6),'Building clears road surfaces');}
}
const walker=createWalker(e.camera,obstacles);walker.setView({position:outhousePoint(-3,1.8,.8),target:outhousePoint(2,1.8,.8)});walker.keys.add('KeyW');for(let i=0;i<30;i++)walker.update(.1);
const local=site.worldToLocal(e.camera.position.clone());assert(local.x<0,'Walking stops at the closed door');
const visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
for(const historic of [false,true])for(const modern of [false,true]){layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);assert.equal(visible(site),historic||modern,'Outhouse follows shared estate visibility');assert.equal(exteriorObstacles(THREE,e.model).some(o=>obstacleContains(o,centre[0],centre[2])),historic||modern,'Collisions follow visibility');}
console.log('PASS: '+samples+' roof samples, red-circle registration, exposed boarding, gable lighting, road clearance, three camera starts, walkable approach and shared-layout collisions.');
