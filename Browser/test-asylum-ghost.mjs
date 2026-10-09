import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createAsylumGhost,updateAsylumGhost,resetAsylumGhost} from './dist/asylum-ghost.mjs';

const ghost=createAsylumGhost(THREE),rig=ghost.userData.ghostRig;
let meshes=0,triangles=0,lights=0;
ghost.traverse(o=>{
 assert(!/sign|label/i.test(o.name),'The apparition carries no sign');
 if(o.isLight)lights++;
 if(!o.isMesh)return;meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;
 for(const attribute of Object.values(o.geometry.attributes))assert([...attribute.array].every(Number.isFinite),'Finite model geometry');
});
assert(meshes<35&&triangles<25000,'Keep the detailed ghost within a small character draw budget');
assert.equal(lights,1,'Reuse one local spectral light');
ghost.position.set(10,4.2,-3);ghost.rotation.y=.6;
for(let i=0;i<240;i++){
 updateAsylumGhost(ghost,1/30);
 const bounds=new THREE.Box3().setFromObject(ghost,true);
 assert(bounds.min.y>4.2&&bounds.max.y<6.5,'Floating shroud clears the floor and ordinary doorway lintels');
 assert(bounds.max.x-bounds.min.x<1.2,'Claws stay within the corridor silhouette');
}
assert.deepEqual(ghost.position.toArray(),[10,4.2,-3],'Animation cannot move the navigation root');
assert.equal(ghost.rotation.y,.6,'Animation preserves route heading');
const snapshot=()=>[...rig.head.rotation.toArray().slice(0,3),rig.body.position.y,...rig.arms.map(a=>a.hand.rotation.x)];
resetAsylumGhost(ghost);const initial=snapshot();
for(let i=0;i<60;i++)updateAsylumGhost(ghost,1/60);const sixty=snapshot();
resetAsylumGhost(ghost);for(let i=0;i<25;i++)updateAsylumGhost(ghost,1/25);
snapshot().forEach((n,i)=>assert(Math.abs(n-sixty[i])<1e-10,'Frame-rate-independent pose'));
assert.notDeepEqual(snapshot(),initial,'Head and hands animate');
resetAsylumGhost(ghost);assert.deepEqual(snapshot(),initial,'Retry restores the initial pose');
console.log(`PASS: sign-free ghost, ${meshes} meshes / ${triangles} triangles, floating clearance, stable navigation root, frame-rate-independent motion and reset.`);
