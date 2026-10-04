import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFile} from 'node:fs/promises';
import {createMedicalFurnitureModels} from './dist/medical-furniture-models.mjs';
import {FURNITURE_CATALOG,furnishAsylum} from './dist/asylum-furniture.mjs';
import {buildAsylumLayout,flatWalkable} from './dist/asylum-layout.mjs';
import {routeBetweenFloors} from './dist/floors.mjs';

const assignments={hydroBath:'R1',hydroShower:'R12',operatingTable:'R6',electrotherapy:'R29',apothecary:'R7',bloodletting:'R7',ectMachine:'R8'};
const models=createMedicalFurnitureModels(THREE,{labels:false});
assert.deepEqual(Object.keys(models).sort(),Object.keys(assignments).sort());
let triangles=0;
for(const [kind,parts] of Object.entries(models)){
 const bounds=new THREE.Box3();assert(parts.length>=5,`${kind}: separate timber, metal, glass/cloth and paper finishes`);
 for(const {geometry,material} of parts){
  const positions=geometry.attributes.position;triangles+=positions.count/3;
  for(const key of ['position','normal'])assert(Array.from(geometry.attributes[key].array).every(Number.isFinite),`${kind}: finite ${key}`);
  assert(material.isMeshStandardMaterial);bounds.union(geometry.boundingBox);
 }
 const c=FURNITURE_CATALOG[kind];assert(Math.abs(bounds.min.y)<1e-6,`${kind}: base rests on its support`);
 for(const [i,size] of bounds.getSize(new THREE.Vector3()).toArray().entries())assert(Math.abs(size-[c.width,c.height,c.depth][i])<1e-5,`${kind}: actual geometry agrees with collision box`);
}
assert(triangles<35000,'Seven detailed additions remain below 35k triangles combined');
const showerSize=FURNITURE_CATALOG.hydroShower;
for(const [key,previous] of Object.entries({width:1.22,depth:1.10,height:2.28}))assert(Math.abs(showerSize[key]/previous-1.3)<1e-12,'Cold-water apparatus is 130% in every dimension, including its collision footprint');
// Probe the visible shaft from several directions: two coincident metal surfaces
// at the first hit reproduce the original iron/brass depth conflict.
const showerMetals=models.hydroShower.filter(p=>['Medical iron','Medical brass'].includes(p.material.name)).map(p=>new THREE.Mesh(p.geometry,p.material));
for(const [height,material] of [[.10,'Medical iron'],[.22,'Medical brass'],[.35,'Medical brass'],[.50,'Medical brass'],[.65,'Medical brass'],[.86,'Medical iron']])for(const angle of [-.9,-.4,.2,.7,1.2]){
 const center=new THREE.Vector3(-.48*showerSize.width/1.22,height*showerSize.height,-.38*showerSize.depth/1.10),direction=new THREE.Vector3(Math.sin(angle),0,Math.cos(angle));
 const ray=new THREE.Raycaster(center.clone().addScaledVector(direction,.25),direction.negate(),0,.25),hits=ray.intersectObjects(showerMetals,false);
 assert(hits.length,'Left pole retains a continuous metal shaft');
 assert.deepEqual([...new Set(hits.filter(h=>Math.abs(h.distance-hits[0].distance)<1e-5).map(h=>h.object.material.name))],[material],'Left pole has one visible metal surface with no coincident iron/brass geometry');
}
const surgicalSize=FURNITURE_CATALOG.operatingTable;
for(const [key,previous] of Object.entries({width:.82,depth:2.08,height:1.02}))assert(Math.abs(surgicalSize[key]/previous-1.3)<1e-12,'Surgical table is 130% in every dimension, including its collision footprint');
// Isolate the head cushion from the merged cloth mesh using its head-end vertices.
const cushionVertices=[],cloth=models.operatingTable.find(p=>p.material.name==='Medical cloth').geometry.attributes.position;
for(let i=0;i<cloth.count;i+=3)if([0,1,2].every(n=>cloth.getZ(i+n)<-surgicalSize.depth*.25))for(let n=0;n<3;n++)cushionVertices.push(cloth.getX(i+n),cloth.getY(i+n),cloth.getZ(i+n));
assert(cushionVertices.length,'Head cushion geometry is present');
const cushionGeometry=new THREE.BufferGeometry();cushionGeometry.setAttribute('position',new THREE.Float32BufferAttribute(cushionVertices,3));cushionGeometry.computeBoundingBox();
const cushion=new THREE.Mesh(cushionGeometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide})),headboard=new THREE.Mesh(models.operatingTable.find(p=>p.material.name==='Medical lightWood').geometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
const cushionBox=cushionGeometry.boundingBox,cushionCenter=cushionBox.getCenter(new THREE.Vector3()),cushionSize=cushionBox.getSize(new THREE.Vector3());
for(const u of [-.3,0,.3])for(const v of [-.25,0,.25]){
 const ray=new THREE.Raycaster(new THREE.Vector3(cushionCenter.x+u*cushionSize.x,surgicalSize.height+1,cushionCenter.z+v*cushionSize.z),new THREE.Vector3(0,-1,0));
 const bottom=ray.intersectObject(cushion,false).at(-1)?.point.y,surface=ray.intersectObject(headboard,false)[0]?.point.y;
 assert(bottom!==undefined&&surface!==undefined&&Math.abs(bottom-surface)<1e-5,'Tilted cushion underside rests on the actual headboard across its width and depth');
}
cushionGeometry.dispose();cushion.material.dispose();headboard.material.dispose();
const bath=new THREE.Group();for(const part of models.hydroBath)bath.add(new THREE.Mesh(part.geometry,part.material));bath.updateMatrixWorld(true);
const down=(x,z)=>new THREE.Raycaster(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0)).intersectObject(bath,true)[0]?.point.y;
const bottom=down(0,0),rim=down(.50,0);assert(bottom>.15&&bottom<.4,'Bath has a recessed basin rather than a solid top');assert(rim>.65&&rim>bottom+.35,'Rolled rim faces upwards around the open bath');
const floors=buildAsylumLayout(JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)))).floors;
let medicalBaseline;
for(const seed of [1829,1,42,4294967295]){
 furnishAsylum(floors,{seed});const medical=floors.flatMap(f=>f.furniture.filter(i=>i.kind in assignments));
 assert.equal(medical.length,7,'Exactly one of every requested addition');
 if(medicalBaseline)assert.deepEqual(medical,medicalBaseline,'Medical equipment stays fixed across new games');else medicalBaseline=structuredClone(medical);
 for(const [kind,roomId] of Object.entries(assignments)){
  const item=floors[0].furniture.find(i=>i.kind===kind);assert(item&&!item.variable&&item.roomId===roomId);
  const room=floors[0].rooms.find(r=>r.id===roomId);assert(flatWalkable(floors[0],...room.label,.5));
  assert(routeBetweenFloors(floors,{x:0,z:17.5,floor:0},{x:room.label[0],z:room.label[1],floor:0}).length);
  if(kind==='bloodletting'){
   const table=floors[0].furniture.find(i=>i.id===item.supportId);assert.equal(table.kind,'table');
   assert(Math.abs(item.y-(table.y+table.height+.008))<1e-6,'Kit rests on the visible table top');
   assert(item.width<table.width&&item.depth<table.depth,'Entire case and jar fit on the table');
  }else assert(floors[0].furnitureObstacles.includes(item),'Freestanding medical equipment contributes to walking/navigation');
 }
 assert.match(floors[0].rooms.find(r=>r.id==='R8').name,/later hospital era/,'ECT is identified as a later-period room');
}
console.log(`PASS: seven original medical models (${triangles} triangles), matching collision dimensions, 130% cold-water apparatus with no left-pole depth conflict, 130% surgical table and supported head cushion, open bath basin/rim, fixed appropriate rooms, reachable routes and supported cupping/leech set.`);
