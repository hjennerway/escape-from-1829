import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
import {CHURCH_PERIMETER,CHURCH_LANE_LINKS} from './dist/church-grounds.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.6),layouts=createAerialLayouts(THREE,exterior);
exterior.model.updateMatrixWorld(true);
const grounds=exterior.churchGrounds,main=layouts.roads.getObjectByName('Parsons Lane'),side=layouts.roads.getObjectByName('Parsons Lane (Upton Lea)');
const laneZ=main.userData.centerline.at(-1)[1];
// Compare the lane to the actual facing masonry, rather than repeating its
// authoring constant. The six-unit carriageway has equal clearance on each side.
const wardEdge=new THREE.Box3().setFromObject(exterior.churtonWard.getObjectByName('Church-side lawn bay walls')).min.z;
const churchEdge=new THREE.Box3().setFromObject(exterior.chapel.getObjectByName('Church front corner stone foot')).max.z;
assert(Math.abs((wardEdge-laneZ)-(laneZ-churchEdge))<.15,'Lane is halfway between the facing masonry');
assert.equal(side.userData.centerline[0][1],laneZ,'The Upton T-junction follows the moved lane');
const obstacles=[...exteriorObstacles(THREE,exterior.chapel),...exteriorObstacles(THREE,exterior.churtonWard)];
assert.deepEqual(CHURCH_PERIMETER[0],CHURCH_PERIMETER.at(-1),'Church walk forms a closed loop');
let clearanceSamples=0;
for(let i=1;i<CHURCH_PERIMETER.length;i++){
 const a=CHURCH_PERIMETER[i-1],b=CHURCH_PERIMETER[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
 for(let j=0;j<=4;j++)for(const offset of [-1.09,0,1.09]){
  const p=grounds.localToWorld(new THREE.Vector3(a[0]+dx*j/4-dz/length*offset,0,a[1]+dz*j/4+dx/length*offset));
  assert(!obstacles.some(o=>obstacleContains(o,p.x,p.z,.4)),'Complete footpath and edging clear the church at '+p.toArray());clearanceSamples++;
 }
}
for(const name of ['Church curved perimeter walk','Church curved perimeter walk edging']){
 const mesh=grounds.getObjectByName(name),p=mesh.geometry.attributes.position;
 for(const side of [0,1])for(const axis of ['getX','getY','getZ'])assert.equal(p[axis](side),p[axis](p.count-2+side),'Paving and edging meet across the full seam width');
 for(const attribute of Object.values(mesh.geometry.attributes))assert(attribute.array.every(Number.isFinite));
 for(let i=0;i<mesh.geometry.attributes.normal.count;i++)assert(mesh.geometry.attributes.normal.getY(i)>.99,'Loop faces upwards');
}
const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0),meshes=[];
for(const root of [layouts.roads,layouts.historicRoads])root.traverse(o=>{if(o.isMesh)meshes.push(o);});
const asphaltAt=(x,z)=>{ray.set(new THREE.Vector3(x,2,z),down);return ray.intersectObjects(meshes,false).some(h=>h.object.material.userData?.estateSurface==='asphalt');};
for(const x of [-55,-44,-28,-5,8])for(const offset of [-2.5,0,2.5])assert(asphaltAt(x,laneZ+offset),'Moved carriageway remains paved across its full width');
for(const x of [-55,-50,-44,-33])assert(!asphaltAt(x,-102.5),'Vacated road and old junction patch return to grass');
const join=side.userData.centerline[0];
for(const x of [-2.5,0,2.5])for(const z of [-2.5,0,2.5])assert(asphaltAt(join[0]+x,join[1]+z),'No gap through the moved T-junction');
for(const link of CHURCH_LANE_LINKS){
 const end=grounds.localToWorld(new THREE.Vector3(link.points.at(-1)[0],0,link.points.at(-1)[1]));
 assert(asphaltAt(end.x,end.z),link.name+' meets the current asphalt');
}
const walk=new THREE.Box3().setFromObject(exterior.churtonWard.getObjectByName('Lawn entrance walk'));
assert(Math.abs(walk.min.z-(laneZ+3))<1e-5,'Churton entrance walk ends at the moved road edge');
const report={laneZ,facingMasonry:[wardEdge,churchEdge],masonryClearance:[wardEdge-laneZ,laneZ-churchEdge],clearanceSamples,closedLoop:true,joinedSeam:true,oldRoadRemoved:true};
writeFileSync(new URL('artifacts/church-road-loop/geometry.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log('PASS: centred road, connected junction and approaches, old road removed, full-width closed church loop and '+clearanceSamples+' local walking-clearance samples.');
