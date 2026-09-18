import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createSecurityGuard,updateSecurityGuard,resetSecurityGuard} from './dist/security-guard.mjs';

const guard=createSecurityGuard(THREE),rig=guard.userData.guardRig;
let meshes=0,triangles=0;
guard.traverse(o=>{if(o.isMesh){meshes++;triangles+=o.geometry.index.count/3;}});
assert(meshes<85,'Uniform details must stay batched within a modest draw budget');
assert(triangles<20000,'One guard must remain suitable for the browser game');
const bounds=new THREE.Box3().setFromObject(guard);
assert(bounds.max.y>1.9&&bounds.max.y<2.15,'Keep the existing human-scale silhouette');
assert(Math.abs(bounds.min.y)<1e-6,'Standing soles rest on the floor');
const vector=new THREE.Vector3();
function checkFeet(floor=0){
 guard.updateMatrixWorld(true);
 for(const leg of rig.legs){
  const bootBounds=new THREE.Box3().setFromObject(leg.boot);
  assert(bootBounds.min.y>=floor-1e-6,`Boot clips through floor: ${bootBounds.min.y-floor}`);
  assert(bootBounds.min.y<floor+.17,'Swing clearance stays plausible');
  leg.ankle.getWorldPosition(vector);
  assert(Math.abs(vector.x-leg.hip.position.x)<1e-6,'Knees bend forward without drifting sideways');
  assert(Math.abs(leg.hip.rotation.x+leg.knee.rotation.x+leg.ankle.rotation.x)<1e-10,'Planted boots stay level');
  assert(leg.knee.rotation.x>=0&&leg.knee.rotation.x<1.7,'Knees never bend backwards');
 }
}
checkFeet();
for(const speed of [2.4,3.85]){
 resetSecurityGuard(guard);let leftLift=false,rightLift=false,differentLegs=false;
 for(let frame=0;frame<180;frame++){
  updateSecurityGuard(guard,speed/60,1/60);checkFeet();
  leftLift ||=new THREE.Box3().setFromObject(rig.legs[0].boot).min.y>.06;
  rightLift ||=new THREE.Box3().setFromObject(rig.legs[1].boot).min.y>.06;
  differentLegs ||=Math.abs(rig.legs[0].hip.rotation.x-rig.legs[1].hip.rotation.x)>.3;
 }
 assert(leftLift&&rightLift&&differentLegs,'Both legs must alternate lifted steps');
}
const phase=rig.phase;
for(let frame=0;frame<90;frame++){updateSecurityGuard(guard,0,1/60);checkFeet();}
assert.equal(rig.phase,phase,'Stationary guards must not keep marching');
assert.equal(rig.amount,0,'Stopping settles to a standing pose');
assert(Math.abs(rig.pelvis.position.y-.97)<1e-9);
for(const leg of rig.legs)assert(Math.abs(leg.hip.rotation.x)<1e-6&&Math.abs(leg.knee.rotation.x)<1e-6);
resetSecurityGuard(guard);for(let i=0;i<60;i++)updateSecurityGuard(guard,2.4/60,1/60);const phase60=rig.phase;
resetSecurityGuard(guard);for(let i=0;i<25;i++)updateSecurityGuard(guard,2.4/25,1/25);
assert(Math.abs(phase60-rig.phase)<1e-10,'Equal travel has the same stride phase at different frame rates');
guard.position.y=4.3;checkFeet(4.3);
resetSecurityGuard(guard);assert.equal(rig.phase,0);assert.equal(rig.amount,0);checkFeet(4.3);
console.log(`PASS: detailed guard (${meshes} batched meshes, ${triangles} triangles), alternating patrol/chase legs, floor contact, forward knees, stationary settle, frame-rate-independent stride and reset.`);
