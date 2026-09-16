import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {FARNDON_FOOTPRINT,FARNDON_VIEWS} from './dist/farndon-ward.mjs';
import {pointInFootprint} from './dist/historic-footprints.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),ward=exterior.farndonWard;
const layouts=createAerialLayouts(THREE,exterior);exterior.scene.updateMatrixWorld(true);
assert.equal(ward.userData.storeys,1);
assert.equal(ward.parent,layouts.historic);
const solids=[[190,-176],[190,-144],[179,-157],[153,-175],[154,-150],[171,-144],[172,-150],[196,-157]];
const courts=[[177,-172],[182,-146],[162,-144],[165,-182],[199,-170]];
const ray=new THREE.Raycaster();
function down(x,z){ray.set(new THREE.Vector3(x,20,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(ward,true).find(hit=>hit.object.name.endsWith('slate roof'));}
for(const p of solids){
 assert(pointInFootprint(p,FARNDON_FOOTPRINT),'Blue-selected solid: '+p);
 assert(down(...p)?.object.name.includes('roof'),'Every wing/room/link must have a roof: '+p);
}
for(const p of courts){assert(!pointInFootprint(p,FARNDON_FOOTPRINT));assert(!down(...p),'Roof must leave the court open: '+p);}
// A dense interior sample catches uncovered strips at stepped wing/roof joins.
let checked=0;
for(let x=150;x<198;x+=1.3)for(let z=-180.5;z<-140.5;z+=1.3){
 if(!pointInFootprint([x,z],FARNDON_FOOTPRINT))continue;
 assert(down(x,z)?.object.name.includes('roof'),'Uncovered roof sample: '+[x,z]);checked++;
}
ward.traverse(o=>{
 if(!o.isMesh)return;
 for(const a of Object.values(o.geometry.attributes))assert([...a.array].every(Number.isFinite));
 if(o.name.endsWith('slate roof'))for(let i=0;i<o.geometry.attributes.normal.count;i++)assert(o.geometry.attributes.normal.getY(i)>0,'Upward roof normal: '+o.name);
});
for(const o of ward.userData.openings){
 assert(o.y+o.h/2<4.2,'Only one tall window storey');
 const n=new THREE.Vector3(Math.sin(o.r),0,Math.cos(o.r)),p=new THREE.Vector3(o.x,o.y,o.z).add(ward.position);
 ray.set(p.clone().addScaledVector(n,.6),n.negate());
 assert(ray.intersectObject(ward,true)[0]?.object.isInstancedMesh,'Sash must sit outside the wall: '+JSON.stringify(o));
}
const obstacles=exteriorObstacles(THREE,exterior.model);
for(const p of solids)assert(obstacles.some(o=>obstacleContains(o,...p)),'Solid collisions: '+p);
for(const p of [...courts,FARNDON_VIEWS['farndon-2'].position.filter((_,i)=>i!==1)])assert(!obstacles.some(o=>obstacleContains(o,...p)),'Open courtyard/photo camera: '+p);
const segments=layouts.historicRoads.userData.missingFootprints.segments;
assert(segments.some(s=>s.points.every(p=>Math.abs(p[0]-159.04)<.02)&&s.points.some(p=>p[1]>-140)),'Adjacent northern OS corridor must remain');
assert(!segments.some(s=>s.points.some(([x,z])=>x>149&&x<198&&z<-163&&z>-182)),'Superseded Farndon OS outline must retire');
const visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
for(const historic of [false,true])for(const modern of [false,true]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
 assert.equal(visible(ward),historic);
 assert.equal(exteriorObstacles(THREE,exterior.model).some(o=>obstacleContains(o,190,-176)),historic);
}
console.log('PASS: corrected Farndon footprint, '+checked+' roof samples, single-storey glazing, open garden, walking collisions, OS corridor retention and Historic visibility.');


