import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {protectedWindowGeometry} from './artifacts/oakmere-window-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {annexe}=createEscapeExterior(THREE,1.5);
annexe.updateMatrixWorld(true);
const spine=annexe.userData.oakmereElevation,west=annexe.userData.oakmereWestElevation;
const path=new URL('../Research/oakmere/window-protected-geometry.json',import.meta.url);
const fingerprint=protectedWindowGeometry(THREE,annexe);
if(process.argv.includes('--save-baseline')){
 assert.equal(spine.userData.openings.filter(o=>o.y===3).length,13,'Capture the pre-correction model');
 assert.equal(west.userData.openings.filter(o=>o.blind).length,2,'Capture the original blocked openings');
 writeFileSync(path,JSON.stringify(fingerprint,null,2)+'\n');
 console.log('Saved window correction preservation baseline:',fingerprint);
}else{
 assert.deepEqual(fingerprint,JSON.parse(readFileSync(path)),'Everything except the three marked sets of sash parts stays unchanged');
 const opposite=annexe.userData.annexeOpenings.filter(o=>o.name==='Central rear spine'&&o.rotation>0);
 for(const [y,oppositeY] of [[3,2.15],[9.2,6.5]]){
  const windows=spine.userData.openings.filter(o=>o.y===y),reference=opposite.filter(o=>o.y===oppositeY);
  assert.equal(reference.length,6,'Yellow-arrow face has six windows per floor');
  assert.equal(windows.length,reference.length,'Green face matches the opposite window count');
  for(let i=0;i<windows.length;i++){
   const p=annexe.worldToLocal(spine.localToWorld(new THREE.Vector3(windows[i].x,y,windows[i].z)));
   assert(Math.abs(p.z-reference[i].z)<1e-8,'Window columns align across the spine');
   assert(Math.abs(windows[i].w*spine.scale.x-reference[i].w)<1e-8,'Sashes match the opposite width');
   assert(!windows[i].blind,'Green windows are glazed');
  }
 }
 assert.equal(west.userData.openings.filter(o=>o.z===1.125).length,3,'Red low hall link has three windows');
 for(const x of [9.3,16])assert(!west.userData.openings.find(o=>o.x===x&&o.y===7.85).blind,'Blue upper openings use standard glazed sashes');
 const ray=new THREE.Raycaster();
 for(const detail of [spine,west])for(const o of detail.userData.openings.filter(o=>detail===spine?o.z<1:o.z===1.125||o.y===7.85&&[9.3,16].includes(o.x))){
  const outward=new THREE.Vector3(0,0,1).transformDirection(detail.matrixWorld);
  ray.set(detail.localToWorld(new THREE.Vector3(o.x,o.y+.22,o.z+20)),outward.negate());
  const hit=ray.intersectObject(annexe,true)[0];
  assert(hit?.object.parent===detail&&hit.object.isInstancedMesh,'Sash remains exposed: '+JSON.stringify(o));
 }
 console.log('PASS: six spine windows per floor, three red-link windows, matching blue sashes; '+fingerprint.primitives+' protected primitives unchanged.');
}
