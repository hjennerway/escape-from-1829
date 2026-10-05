import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,flatWalkable,moveAsylumActor,insidePolygon} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
import {furnishAsylum,FURNITURE_CATALOG} from './dist/asylum-furniture.mjs';
import {routeBetweenFloors} from './dist/floors.mjs';
import {createCellMattressModel,CELL_PAD_DEPTH} from './dist/padded-cell-models.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))),snapshot=JSON.stringify(plan),floors=buildAsylumLayout(plan).floors,ids=['B5','B6','B7','B8'],floor=floors[2];
const geometryBefore=JSON.stringify({walls:floor.walls,doors:floor.roomDoors,windows:floor.windows});
let baseline;
for(const seed of [1829,1,42]){
 furnishAsylum(floors,{seed});const mattresses=[];
 for(const id of ids){
  const room=floor.rooms.find(r=>r.id===id),items=floor.furniture.filter(i=>i.roomId===id);
  assert.equal(room.purpose,'paddedCell');assert.equal(room.name,'Padded cell · patient confinement');
  assert.equal(items.length,1,'Each cell has only its low mattress');assert.equal(items[0].kind,'cellMattress');assert(!items[0].variable);mattresses.push(items[0]);
  assert(flatWalkable(floor,...room.label,.5),'Cell centres remain free');
 }
 if(baseline)assert.deepEqual(mattresses,baseline,'Cell furnishings remain fixed across new games');else baseline=structuredClone(mattresses);
}
const model=createCellMattressModel(THREE)[0],bounds=model.geometry.boundingBox,catalog=FURNITURE_CATALOG.cellMattress;
assert(bounds.getSize(new THREE.Vector3()).distanceTo(new THREE.Vector3(catalog.width,catalog.height,catalog.depth))<1e-6,'Rendered mattress and collision bounds agree');
assert.equal(bounds.min.y,0);assert(baseline.every(i=>i.y>=.018),'Mattresses rest on the soft floor');
const scene=new THREE.Scene();buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
const padding=scene.getObjectByName('Asylum Cell Padding');assert(padding?.geometry.attributes.position.count>0);assert.deepEqual(padding.geometry.userData.rooms.sort(),ids);assert.equal(scene.children.filter(m=>m.name===padding.name).length,1,'All pads share one batch');
const ray=new THREE.Raycaster();let surfaces=0,apertures=0,walked=0;
function cast(x,y,z,direction,objects=scene.children,far=20){ray.set(new THREE.Vector3(x,y,z),new THREE.Vector3(...direction));ray.far=far;return ray.intersectObjects(objects,false)[0];}
for(const id of ids){
 const room=floor.rooms.find(r=>r.id===id),[x,z]=room.label;
 for(const direction of [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]]){assert.equal(cast(x,2.78,z,direction)?.object,padding,'All four room walls have actual soft lining');surfaces++;}
 const bottom=cast(x,.4,z,[0,-1,0]);assert.equal(bottom?.object,padding,'Cell floor has soft lining');assert(bottom.point.y>=.006-1e-6&&bottom.point.y<=.018+1e-6);surfaces++;
 const door=floor.doorways.find(d=>d.roomId===id),normal=[-door.dz,0,door.dx];
 assert(!cast(door.x-normal[0]*.4,1.6,door.z-normal[2]*.4,normal,[padding],.8),'Padding never crosses the entrance');apertures++;
 const window=floor.windows.find(w=>w.roomId===id),n=window.axis==='x'?[1,0,0]:[0,0,1];
 assert(!cast(window.x-n[0]*.4,window.sill+window.height/2,window.z-n[2]*.4,n,[padding],.8),'Padding leaves the window aperture clear');apertures++;
 const origin={x:0,z:17.5,floor:0,y:0},target={x,z,floor:2,y:floor.elevation};
 for(const [from,to] of [[origin,target],[target,origin]]){
  const route=routeBetweenFloors(floors,from,to);assert(route.length,'Every cell has a return route');const actor={...from};
  for(const point of route){let attempts=0;while(Math.hypot(actor.x-point.x,actor.z-point.z)>.025&&attempts++<100){const distance=Math.hypot(actor.x-point.x,actor.z-point.z),step=Math.min(.055,distance);moveAsylumActor(floors,actor,(point.x-actor.x)*step/distance,(point.z-actor.z)*step/distance);}assert(attempts<100,'Player can follow the furnished cell route');}
  assert.equal(actor.floor,to.floor);assert(Math.hypot(actor.x-to.x,actor.z-to.z)<.2);walked++;
 }
}
// Audit the actual padded triangles against the actual window timber boxes.
// This catches padding intruding into a jamb even when the central pane is clear.
const sash=scene.getObjectByName('Asylum Sash'),matrix=new THREE.Matrix4(),boxes=[];
for(let i=0;i<sash.count;i++){
 sash.getMatrixAt(i,matrix);const centre=new THREE.Vector3().setFromMatrixPosition(matrix);
 if(!floor.rooms.some(r=>ids.includes(r.id)&&insidePolygon(centre.x,centre.z,r.points)))continue;
 boxes.push(new THREE.Box3().setFromPoints(Array.from({length:8},(_,j)=>new THREE.Vector3(j&1?.5:-.5,j&2?.5:-.5,j&4?.5:-.5).applyMatrix4(matrix))));
}
const p=padding.geometry.attributes.position;let clearanceChecks=0;
for(let i=0;i<p.count;i+=3){
 const tri=new THREE.Triangle(...[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,i+j))),box=new THREE.Box3().setFromPoints([tri.a,tri.b,tri.c]);
 for(const timber of boxes)if(box.intersectsBox(timber)){assert(!timber.intersectsTriangle(tri),'Soft padding stays outside the complete window frame');clearanceChecks++;}
}
assert.equal(JSON.stringify({walls:floor.walls,doors:floor.roomDoors,windows:floor.windows}),geometryBefore,'Cells retain their walls, windows and playable door poses');assert.equal(JSON.stringify(plan),snapshot);
console.log(`PASS: four padded confinement cells, fixed soft mattresses, ${surfaces} lined surfaces, ${apertures} clear apertures, ${walked} physically walked return routes, ${clearanceChecks} nearby timber checks, one padding batch (${CELL_PAD_DEPTH}m relief), unchanged architectural plan.`);
