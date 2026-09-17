import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {HALE_WARD,HALE_WARD_FOOTPRINT,HALE_WARD_VIEWS,HALE_WARD_CORNERS} from './dist/hale-daresbury-huxley-dunham.mjs';
import {pointInFootprint} from './dist/historic-footprints.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
import {HALE_CORRIDOR_RUNS} from './dist/hale-corridors.mjs';
import {FARNDON_CORRIDOR,FARNDON_CORRIDOR_RUNS} from './dist/farndon-corridor.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),ward=exterior.haleWard;
const offset=ward.userData.placement.offset,placed=([x,z])=>[x+offset.x,z+offset.z];
assert.equal(ward.name,'Hale/Daresbury/Huxley/Dunham');assert.equal(ward.userData.storeys,2);
assert.equal(HALE_WARD.eave,exterior.irbyAshley.userData.source.eave);
assert.deepEqual(exterior.waterTower.position.toArray(),[148,0,-55.2]);
assert.deepEqual(exterior.irbyAshley.position.toArray(),[234,0,-93.4]);
const footprint=HALE_WARD_FOOTPRINT;
for(let i=0;i<footprint.length;i++){
 const a=footprint[i],b=footprint[(i+1)%footprint.length],c=footprint[(i+2)%footprint.length];
 assert(Math.abs((b[0]-a[0])*(c[0]-b[0])+(b[1]-a[1])*(c[1]-b[1]))<1e-9,'Every turn must be 90 degrees in ground plan');
}
// Independently chosen interior picks in every green stroke, and its open courts.
const solids=[[97,-85],[143,-85],[117,-96],[131,-107],[117,-118],[127,-127],[104,-136],[117,-138]];
const clear=[[89,-85],[94.5,-85],[104,-107],[134,-96],[133,-117],[146,-125],[132,-138],[87,-135],[149,-85],[141,-107],[136,-127]];
for(const p of solids)assert(pointInFootprint(p,footprint),'Green ward range must be solid: '+p);
for(const p of clear)assert(!pointInFootprint(p,footprint),'Open court must remain outside the walls: '+p);
const layouts=createAerialLayouts(THREE,exterior);exterior.scene.updateMatrixWorld(true);
assert.equal(ward.parent,layouts.historic);
const ray=new THREE.Raycaster();
function down(x,z){ray.set(new THREE.Vector3(x+offset.x,30,z+offset.z),new THREE.Vector3(0,-1,0));return ray.intersectObject(ward,true)[0];}
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
 assert([1.3,.58].includes(o.w));assert.equal(o.h,o.y<4?2.65:2.75);
 const n=new THREE.Vector3(Math.sin(o.r),0,Math.cos(o.r));
 const p=new THREE.Vector3(o.x,o.y,o.z).add(ward.position);
 ray.set(p.clone().addScaledVector(n,.6),n.negate());
 assert(ray.intersectObject(ward,true)[0]?.object.isInstancedMesh,'Sash glazing must face out of the wall');
}
for(const [i,a]of ward.userData.openings.entries())for(const b of ward.userData.openings.slice(i+1)){
 if(Math.abs(a.y-b.y)>.1||Math.abs(a.r-b.r)>.001)continue;
 const dx=b.x-a.x,dz=b.z-a.z;
 if(Math.abs(dx*Math.sin(a.r)+dz*Math.cos(a.r))>.02)continue;
 assert(Math.abs(dx*Math.cos(a.r)-dz*Math.sin(a.r))>(a.w+b.w)/2+.43,'Adjacent sash heads must not overlap');
}
const start=HALE_WARD_VIEWS['hale-daresbury-huxley-dunham-ground'].position;
assert.deepEqual(HALE_WARD_CORNERS.map(c=>c.index),[2,5,6,9,10,15,16],'All seven inward turns receive the photo treatment');
assert.equal(ward.userData.cornerDetails.length,7);
for(const c of ward.userData.cornerDetails){
 const centre=c.footprint.reduce((sum,p)=>sum.map((v,i)=>v+p[i]/c.footprint.length),[0,0]);
 assert(down(centre[0]+HALE_WARD.x,centre[1]+HALE_WARD.z)?.object.name.includes('bay slate roof'),'Every bay has a closed roof');
 const [x,z]=c.door,n=new THREE.Vector3(c.normal[0],0,c.normal[1]);
 ray.set(new THREE.Vector3(x+ward.position.x,1.5,z+ward.position.z).addScaledVector(n,1.5),n.clone().negate());
 const hit=ray.intersectObject(ward,true)[0];
 assert(hit?.object.isInstancedMesh&&hit.distance>1,'Entrance remains visible below its canopy');
}
const links=exterior.adminCorridor.getObjectByName('Hale connecting corridors');
assert.equal(links.children.length,2,'Only the two red-marked wings get corridor links');
for(const [i,contact] of [[145,-85.155],[137,-107.705]].entries()){
 assert(Math.abs(HALE_CORRIDOR_RUNS[i].wardFaceX-contact[0]-offset.x)<1e-9);
 assert(Math.abs(HALE_CORRIDOR_RUNS[i].start[1]-contact[1]-offset.z)<1e-9);
}
for(const run of HALE_CORRIDOR_RUNS){
 assert(pointInFootprint(run.start,ward.userData.footprint),'Link starts within the moved ward wall');
 assert.equal(run.end[0],FARNDON_CORRIDOR.x,'Link reaches the straight gallery ridge');
 assert.equal(run.start[1],run.end[1],'Link continues the wing axis at a right angle to the gallery');
 const branch=links.getObjectByName(run.name);
 assert.equal(branch.userData.width,FARNDON_CORRIDOR.width);
 for(let x=run.wardFaceX+.05;x<=run.end[0];x+=.25)for(const offset of [-2.5,0,2.5]){
  ray.set(new THREE.Vector3(x,20,run.start[1]+offset),new THREE.Vector3(0,-1,0));
  const roof=ray.intersectObject(exterior.adminCorridor,true).find(hit=>hit.object.name.endsWith('slate roof'));
  assert(roof&&roof.point.y>=3.6&&roof.point.y<4.4,'No gap or tall roof at the corridor joins');
 }
 const faceWindows=ward.userData.openings.filter(o=>Math.abs(o.x+ward.position.x-run.wardFaceX)<.1);
 assert.equal(faceWindows.filter(o=>o.y<4).length,0,'Covered ground-floor sashes become the corridor contact');
 assert.equal(faceWindows.filter(o=>o.y>4).length,2,'Both upper sashes remain above each new link');
 branch.traverse(o=>{if(o.isMesh&&o.name.endsWith('slate roof')){
  const normal=o.geometry.attributes.normal;for(let i=0;i<normal.count;i++)assert(normal.getY(i)>0);
 }});
}
for(const run of HALE_CORRIDOR_RUNS){
 const galleryRun=FARNDON_CORRIDOR_RUNS.find(segment=>segment.start[0]===run.end[0]&&segment.end[0]===run.end[0]);
 const gallery=exterior.adminCorridor.getObjectByName(galleryRun.name);
 const joinedLights=gallery.userData.openings.filter(o=>Math.abs(galleryRun.start[1]-o.x-run.end[1])<FARNDON_CORRIDOR.width/2+.8);
 assert(!joinedLights.some(o=>o.side===-1),'No gallery glazing inside the new junctions');
 if(run.end[1]<-74.1)assert(joinedLights.some(o=>o.side===1),'Opposite exposed gallery windows stay in place');
}
ray.set(new THREE.Vector3(135,20,-127),new THREE.Vector3(0,-1,0));
assert.equal(ray.intersectObject(links,true).length,0,'The unmarked third wing has no new corridor');
for(const historic of [true,false])for(const modern of [true,false]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
 const obstacles=exteriorObstacles(THREE,exterior.model);
 for(const c of ward.userData.cornerDetails){
  const centre=c.footprint.reduce((sum,p)=>sum.map((v,i)=>v+p[i]/c.footprint.length),[0,0]);
  assert.equal(obstacles.some(o=>obstacleContains(o,centre[0]+ward.position.x,centre[1]+ward.position.z)),historic,'New bay collisions follow Historic visibility');
  const [x,z]=c.door;
  assert(!obstacles.some(o=>obstacleContains(o,x+ward.position.x,z+ward.position.z+c.normal[1]*1.6)),'Approach below each canopy stays accessible');
 }
 for(const p of solids)assert.equal(obstacles.some(o=>obstacleContains(o,...placed(p))),historic,'Walking follows visible ward walls: '+p);
 for(const run of HALE_CORRIDOR_RUNS)assert.equal(obstacles.some(o=>obstacleContains(o,(run.start[0]+run.end[0])/2,run.start[1])),historic,'The two corridor links follow Historic collisions');
 for(const p of [...[[89,-85],[94.5,-85],[134,-96],[133,-117],[104,-107]].map(placed),[start[0],start[2]]])assert(!obstacles.some(o=>obstacleContains(o,...p)),'Cleared end, courtyard and walking start must remain accessible: '+p);
}
const outline=layouts.historicRoads.userData.missingFootprints.segments;
assert(!outline.some(s=>s.points.some(([x,z])=>x>84&&x<152&&z>-141&&z<-71)),'Superseded outlines must not cross the new courts');
for(const page of ['aerial.html','explore.html']){
 const html=await readFile(new URL('./dist/'+page,import.meta.url),'utf8');
 for(const id of ['hale-daresbury','huxley-dunham'])assert(html.includes('href="?view='+id+'"'),id+' must be accessible from Locations in '+page);
}
console.log('PASS: Hale/Daresbury/Huxley/Dunham right-angle footprint, two storeys, matching sashes, two red-marked corridor links, continuous roofs, exposed junction windows, open courts, walking access and Historic visibility.');
