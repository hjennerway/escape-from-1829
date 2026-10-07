import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createWaterTower,ESCAPE_WATER_TOWER,WATER_TOWER_VIEWS} from './dist/water-tower.mjs';
import {ANNEXE} from './dist/annexe.mjs';
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){}})})};
const material=new THREE.MeshStandardMaterial(),tower=createWaterTower(THREE,{brick:material,roof:material,dark:material,worldUV:g=>g});
tower.updateMatrixWorld(true);
const faces=[1,2,3,4].map(n=>tower.children.find(o=>o.userData.photoSide===n));
assert(faces.every(Boolean));
for(const [i,target] of [[1,new THREE.Vector3(0,0,13)],[3,new THREE.Vector3(ANNEXE.x,0,ANNEXE.z)]]){
 const normal=new THREE.Vector3(0,0,1).transformDirection(faces[i].matrixWorld);
 assert(normal.dot(target.sub(tower.position).normalize())>.8,'Numbered face must point toward its registered building');
}
function hit(face,x,y){
 const origin=face.localToWorld(new THREE.Vector3(x,y,8));
 const direction=new THREE.Vector3(0,0,-1).transformDirection(face.matrixWorld);
 return new THREE.Raycaster(origin,direction,0,4).intersectObject(tower,true)[0];
}
for(const [i,face] of faces.entries()){
 assert.equal(hit(face,i===1?.18:0,3).object.name,i===0?'Black entrance door leaf':i===1?'1829-facing arched window':'Bricked ground doorway');
 if(i!==1){
  assert.equal(hit(face,0,9.5).object.name,'Large bricked upper opening');
  const scars=face.getObjectByName('Descending intersecting roof scars');
  assert(scars&&scars.children.length,'Former roof bands must survive detail batching');
  const scarX=i===0?3.8:-3.8,band=hit(face,scarX,11.1);assert(band.point.distanceTo(face.localToWorld(new THREE.Vector3(scarX,11.1,5.1)))<.2,'Roof traces stay shallow against masonry');
 }
 for(const y of [21.8,24.8,27.8])for(const x of [-.91,.91])assert.equal(hit(face,x,y).object.name,'Bricked slit recess','Upper slits must be visible rather than buried in the wall');
 face.traverse(o=>{if(o.geometry)for(const a of Object.values(o.geometry.attributes))assert([...a.array].every(Number.isFinite));});
 const shot=WATER_TOWER_VIEWS['tower-'+(i+1)];assert.equal(shot.position[1],1.8,'Reference cameras start at ground eye height');
 for(const aspect of [.8,16/9]){
  const camera=new THREE.PerspectiveCamera(shot.fov,aspect,.5,1000);camera.position.set(...shot.position);camera.lookAt(...shot.target);camera.updateMatrixWorld(true);
  for(const y of [0,33.9]){
   const p=face.localToWorld(new THREE.Vector3(0,y,5.1)).project(camera);
   assert(Math.abs(p.x)<1&&Math.abs(p.y)<1,'The photographed wall fits in each comparison view');
  }
 }
}
assert.equal(hit(faces[0],-.52,1.83).object.parent.name,'Entrance door handle','The door handle must project in front of the leaf');
assert.equal(hit(faces[0],0,.035).object.name,'Entrance door threshold','The threshold must sit flush at ground level');
assert.equal(hit(faces[0],0,.2).object.name,'Black entrance door leaf','No raised brick step may remain under the door');
assert.equal(hit(faces[0],1,.2).object.material,faces[0].getObjectByName('Painted entrance fanlight').material,'White side panels reach the ground without a brick step');
for(const [y,name] of [[4.1,'Lower bricked side window'],[8.3,'Upper bricked side window']]){
 const probe=hit(faces[0],-3.44,y);assert.equal(probe.object.name,name,'Both small brick-filled windows must remain exposed');
 assert(faces[0].worldToLocal(probe.point.clone()).z<5.05,'The infill must sit behind the shaft face');
}
assert.equal(hit(faces[0],.08,5.12).object.material.name,'Alternating red and yellow arch bricks','The semicircular entrance arch must have striped radial bricks');
assert.equal(hit(faces[0],.35,4.2).object.name,'Arched entrance','The fanlight stays distinct above the rectangular door');
const leaf=new THREE.Box3().setFromObject(faces[0].getObjectByName('Black entrance door leaf')).getSize(new THREE.Vector3());
const entranceHead=faces[0].getObjectByName('Arched entrance arch');entranceHead.geometry.computeBoundingBox();
const entranceCrown=entranceHead.position.y+entranceHead.geometry.boundingBox.max.y;
for(const face of [faces[2],faces[3]]){const head=face.getObjectByName('Bricked ground doorway arch');head.geometry.computeBoundingBox();assert(Math.abs(head.position.y+head.geometry.boundingBox.max.y-entranceCrown)<1e-6,'Blocked tower door heads follow the corrected entrance proportions');}
assert(leaf.y/leaf.x>2.5&&leaf.y/leaf.x<2.75,'Door proportions follow the approximately 2.6:1 rectified photo, rather than the former 3.9:1 slit');
const paleRepairs=[faces[0].getObjectByName('Pale lower right repair'),faces[3].getObjectByName('Pale lower left repair')].map(o=>new THREE.Box3().setFromObject(o));
assert(Math.abs(paleRepairs[0].max.y-paleRepairs[1].max.y)<1e-6,'The pale tiled repair must meet the same height on adjacent faces');
for(const [face,x] of [[faces[0],3.5],[faces[3],-3.5]])assert(hit(face,x,3.3).object.name.startsWith('Pale lower'),'Both tiled patches remain exposed at their shared upper courses');
// The user explicitly rules out ghosts on side 2 and its adjoining corners.
for(const [i,x] of [[0,-4.1],[2,3.8]])for(const y of [8,9,10,11.4])assert.equal(hit(faces[i],x,y).object.name,'Square brick shaft','Corners meeting side 2 must remain plain brick outside the inset windows');
for(const x of [-3,3])for(const y of [4.9,6,8,10])assert.equal(hit(faces[1],x,y).object.name,'Square brick shaft','Side 2 has no triangular infill or roof scars');
const bounds=new THREE.Box3().setFromObject(tower);assert(Math.abs(bounds.max.y-ESCAPE_WATER_TOWER.height)<.01);
assert.equal(material.map,null,'Tower brick refinement must not mutate shared estate materials');
console.log('PASS: tower side registration, exposed door and flush threshold, two recessed brick-filled windows, striped entrance arch, level tiled repairs, blind slits, shallow scars, finite geometry, photo framing and isolated materials.');

