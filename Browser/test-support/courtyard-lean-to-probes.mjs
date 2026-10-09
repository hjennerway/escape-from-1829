import assert from 'node:assert/strict';
import {exteriorObstacles,obstacleContains} from '../dist/explore-controls.mjs';

export function checkCourtyardLeanTo(THREE,model,{walking=true}={}){
 model.updateMatrixWorld(true);
 const wall=model.getObjectByName('Courtyard glazed lean-to'),roofs=[],meshes=[];
 model.traverse(o=>{if(!o.isMesh)return;meshes.push(o);if(o.material.color?.getHex()===0xa2aea9)roofs.push(o);});
 assert(wall&&roofs.length,'Inspect the photographed lean-to masonry and glazing');
 const ray=new THREE.Raycaster(),up=new THREE.Vector3(0,1,0),down=up.clone().negate();
 const bounds=new THREE.Box3().setFromObject(wall),samples=[];
 // Survey the exposed sides and front independently of the builder's pitch.
 for(let i=0;i<=40;i++){
  const z=4.71+(6.99-4.71)*i/40;
  samples.push([38.755,z],[43.845,z],[38.76+(43.84-38.76)*i/40,4.705]);
 }
 for(const [x,z] of samples){
  ray.set(new THREE.Vector3(x,12,z),down);const top=ray.intersectObject(wall,false)[0];
  ray.set(new THREE.Vector3(x,.2,z),up);const underside=ray.intersectObjects(roofs,false)[0];
  assert(top&&underside,'Roof covers every exposed wall-top sample: '+[x,z]);
  assert(underside.point.y-top.point.y<=.005&&top.point.y-underside.point.y<.012,
   'Wall meets the roof underside without a gap or protruding through it: '+[x,z]);
 }
 // The original glass stopped in front of the actual z=7 backing wall.
 for(const x of [39,40,41,42,43]){
  ray.set(new THREE.Vector3(x,.2,7.005),up);
  assert(ray.intersectObjects(roofs,false).length,'Glazing reaches the inset building wall');
 }
 assert(bounds.max.z>=7,'Masonry also closes the rear attachment');
 assert(Math.abs(bounds.min.z-4.7)<1e-5&&Math.abs(bounds.min.x-38.75)<1e-5&&Math.abs(bounds.max.x-43.85)<1e-5,
  'The exposed ground-level footprint stays in place');
 // Walking uses the procedural exterior. The aerial binary has merged
 // render batches whose bounds are not individual collision footprints.
 const obstacles=walking?exteriorObstacles(THREE,model):null;
 for(const x of [47.4,47.9,48.4])for(const z of [3,3.3,3.6]){
  ray.set(new THREE.Vector3(x,1.2,z),down);
  assert(ray.intersectObjects(meshes,false)[0]?.point.y<.4,'Only courtyard ground remains beneath the removed grit bin');
  if(obstacles)assert(!obstacles.some(o=>obstacleContains(o,x,z,.05)),'The former bin footprint is walkable');
 }
 if(obstacles)assert(obstacles.some(o=>obstacleContains(o,41.3,5.7,.05)),'The enclosed lean-to still blocks walking');
 console.log('PASS: '+samples.length+' lean-to roof/wall contacts, rear attachment and cleared grit-bin footprint.');
}
