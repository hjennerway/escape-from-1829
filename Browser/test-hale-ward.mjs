import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {HALE_WARD,HALE_WARD_FOOTPRINT,HALE_WARD_VIEWS} from './dist/hale-daresbury-huxley-dunham.mjs';
import {pointInFootprint} from './dist/historic-footprints.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),ward=exterior.haleWard;
assert.equal(ward.name,'Hale/Daresbury/Huxley/Dunham');assert.equal(ward.userData.storeys,2);
assert.equal(HALE_WARD.eave,exterior.irbyAshley.userData.source.eave);
assert.deepEqual(exterior.waterTower.position.toArray(),[148,0,-55.2]);
assert.deepEqual(exterior.irbyAshley.position.toArray(),[234,0,-118]);
const footprint=HALE_WARD_FOOTPRINT;
for(let i=0;i<footprint.length;i++){
 const a=footprint[i],b=footprint[(i+1)%footprint.length],c=footprint[(i+2)%footprint.length];
 assert(Math.abs((b[0]-a[0])*(c[0]-b[0])+(b[1]-a[1])*(c[1]-b[1]))<1e-9,'Every turn must be 90 degrees in ground plan');
}
// Independently chosen interior picks in every green stroke, and its open courts.
const solids=[[89,-85],[143,-85],[117,-96],[131,-107],[117,-118],[127,-127],[104,-136],[117,-138]];
const clear=[[104,-107],[134,-96],[133,-117],[146,-125],[132,-138],[87,-135],[149,-85],[141,-107],[136,-127]];
for(const p of solids)assert(pointInFootprint(p,footprint),'Green ward range must be solid: '+p);
for(const p of clear)assert(!pointInFootprint(p,footprint),'Open court must remain outside the walls: '+p);
const layouts=createAerialLayouts(THREE,exterior);exterior.scene.updateMatrixWorld(true);
assert.equal(ward.parent,layouts.historic);
const ray=new THREE.Raycaster();
function down(x,z){ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(ward,true)[0];}
for(const p of solids){down(...p);assert(ray.intersectObject(ward,true).some(hit=>hit.object.name.endsWith('slate roof')),'Roof must cover every ward wing: '+p);}
for(const p of clear)assert(!down(...p),'Roof must leave court open: '+p);
// Sample the connected roof at its re-entrant junctions as well as wing centres.
for(let x=84.5;x<153.5;x+=1.7)for(let z=-140.2;z<-81.3;z+=1.7){
 if(pointInFootprint([x,z],footprint))assert(down(x,z)?.point.y>=HALE_WARD.eave,'No roof holes at '+[x,z]);
}
ward.traverse(o=>{
 if(!o.isMesh)return;
 for(const attr of Object.values(o.geometry.attributes))assert([...attr.array].every(Number.isFinite));
 if(o.name.endsWith('slate roof')){const n=o.geometry.attributes.normal;for(let i=0;i<n.count;i++)assert(n.getY(i)>0,'All slate surfaces face upwards');}
});
for(const o of ward.userData.openings){
 assert.equal(o.w,1.3);assert.equal(o.h,o.y<4?2.65:2.75);
 const n=new THREE.Vector3(Math.sin(o.r),0,Math.cos(o.r));
 const p=new THREE.Vector3(o.x,o.y,o.z).add(ward.position);
 ray.set(p.clone().addScaledVector(n,.6),n.negate());
 assert(ray.intersectObject(ward,true)[0]?.object.isInstancedMesh,'Sash glazing must face out of the wall');
}
const start=HALE_WARD_VIEWS['hale-daresbury-huxley-dunham-ground'].position;
for(const historic of [true,false])for(const modern of [true,false]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
 const obstacles=exteriorObstacles(THREE,exterior.model);
 for(const p of solids)assert.equal(obstacles.some(o=>obstacleContains(o,...p)),historic,'Walking follows visible ward walls: '+p);
 for(const p of [[134,-96],[133,-117],[104,-107],[start[0],start[2]]])assert(!obstacles.some(o=>obstacleContains(o,...p)),'Courtyard and walking start must remain accessible: '+p);
}
const outline=layouts.historicRoads.userData.missingFootprints.segments;
assert(!outline.some(s=>s.points.some(([x,z])=>x>84&&x<152&&z>-141&&z<-71)),'Superseded outlines must not cross the new courts');
for(const page of ['aerial.html','explore.html']){
 const html=await readFile(new URL('./dist/'+page,import.meta.url),'utf8');
 assert(html.includes('href="?view=hale-daresbury-huxley-dunham"'),'Ward must be accessible from Locations in '+page);
}
console.log('PASS: Hale/Daresbury/Huxley/Dunham right-angle footprint, two storeys, matching sash style, complete roofs, open courts, walking access, Historic visibility and location links.');
