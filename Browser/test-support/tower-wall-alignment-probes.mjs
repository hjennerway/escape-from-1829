import {TOWER_WORKSHOPS} from '../dist/tower-workshops.mjs';

// Inspect submitted geometry, including material batches, rather than trusting
// the plan or named source meshes hidden behind those batches.
export function probeTowerWallAlignment(THREE,model){
 model.updateMatrixWorld(true);const meshes=[],walls=[],base=[],roof=[],windows=[];
 model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
 const {westX}=TOWER_WORKSHOPS;
 const southBase=new THREE.Raycaster(new THREE.Vector3(westX-.2,.3,-48.3),new THREE.Vector3(1,0,0),0,.4).intersectObjects(meshes,false)[0]?.object.material;
 for(const z of [-73.8,-72,-70,-68,-66,-64.7,-63,-61,-60.5])for(const y of [-.12,.3,.59,.61,2,5.14,5.16,8.8]){
  const hits=new THREE.Raycaster(new THREE.Vector3(westX-.02,y,z),new THREE.Vector3(1,0,0),0,.06).intersectObjects(meshes,false);
  if(hits.length!==1||Math.abs(hits[0]?.point.x-westX)>1e-4)walls.push({z,y,hits:hits.map(h=>({name:h.object.name,x:h.point.x}))});
  if(y<.6&&hits[0]?.object.material!==southBase)base.push({z,y,name:hits[0]?.object.name});
 }
 for(const z of [-73.8,-70,-65,-61]){
  const hits=new THREE.Raycaster(new THREE.Vector3(westX+.2,9.3,z),new THREE.Vector3(0,-1,0),0,.6).intersectObjects(meshes,false);
  if(!hits.some(h=>Math.abs(h.point.y-9)<1e-4))roof.push({z,hits:hits.map(h=>({name:h.object.name,y:h.point.y}))});
 }
 // The plinth must keep the original north/end enclosure when its front face
 // changes material. A facade-only strip leaves the other lower faces open.
 for(const y of [-.12,.3,.59,.61])for(const x of [westX+.3,westX+.8]){
  const hit=new THREE.Raycaster(new THREE.Vector3(x,y,-74.3),new THREE.Vector3(0,0,1),0,.3).intersectObjects(meshes,false)[0];
  if(!hit||Math.abs(hit.point.z+74.1)>1e-4)walls.push({return:true,x,y,name:hit?.object.name,z:hit?.point.z});
 }
 const ward=model.getObjectByName('Hale/Daresbury/Huxley/Dunham');
 if(!ward)windows.push({missingWard:true});
 if(ward){
  const bays=ward.userData.openings.filter(o=>Math.abs(o.r)<1e-6).map(o=>({...o,p:ward.localToWorld(new THREE.Vector3(o.x,o.y,o.z))})),right=Math.max(...bays.map(o=>o.p.x));
  for(const o of bays.filter(o=>Math.abs(o.p.x-right)<1e-6))for(const dx of [-.4,0,.4])for(const dy of [-.7,0,.7]){
   const ray=new THREE.Raycaster(new THREE.Vector3(o.p.x+dx,o.p.y+dy,o.p.z+.6),new THREE.Vector3(0,0,-1),0,.8),hit=ray.intersectObjects(meshes,false)[0];
   if(!hit||Math.abs(hit.point.z-(o.p.z-.035))>1e-4)windows.push({x:o.p.x+dx,y:o.p.y+dy,name:hit?.object.name,z:hit?.point.z});
  }
  const neighbour=Math.max(...bays.filter(o=>o.p.x<right-1).map(o=>o.p.x));
  for(const o of bays.filter(o=>Math.abs(o.p.x-neighbour)<1e-6)){
   const hit=new THREE.Raycaster(new THREE.Vector3(o.p.x+.16,o.p.y+.24,o.p.z+.6),new THREE.Vector3(0,0,-1),0,.8).intersectObjects(meshes,false)[0];
   if(!hit||hit.point.z<o.p.z+.02)windows.push({retained:true,x:o.p.x,y:o.p.y,name:hit?.object.name,z:hit?.point.z});
  }
 }
 return {walls,base,roof,windows};
}
