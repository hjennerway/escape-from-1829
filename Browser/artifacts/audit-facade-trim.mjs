import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../dist/aerial-layouts.mjs';
import {exteriorObstacles,obstacleContains} from '../dist/explore-controls.mjs';
import {writeFile} from 'node:fs/promises';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16};}})})};
const e=createEscapeExterior(THREE,1.6);createAerialLayouts(THREE,e);e.model.updateMatrixWorld(true);
const obstacles=exteriorObstacles(THREE,e.model),runs=[],matrix=new THREE.Matrix4(),box=new THREE.Box3();
e.model.traverse(o=>{
 if(!o.isMesh||o.geometry.type!=='BoxGeometry'||!o.material?.color)return;
 const c=o.material.color;if(Math.min(c.r,c.g,c.b)<.3)return;
 const n=o.isInstancedMesh?o.count:1;
 o.geometry.computeBoundingBox();
 for(let i=0;i<n;i++){
  if(o.isInstancedMesh){o.getMatrixAt(i,matrix);matrix.premultiply(o.matrixWorld);}else matrix.copy(o.matrixWorld);
  if(Math.abs(matrix.elements[1])+Math.abs(matrix.elements[9])+Math.abs(matrix.elements[4])+Math.abs(matrix.elements[6])>1e-6)continue;
  box.copy(o.geometry.boundingBox).applyMatrix4(matrix);const s=box.getSize(new THREE.Vector3());
  if(s.y>.6||s.y<.08||Math.min(s.x,s.z)>.65||Math.max(s.x,s.z)<1.5||Math.max(s.x,s.z)<Math.min(s.x,s.z)*3)continue;
  runs.push({object:o,index:i,name:o.name||o.parent.name,min:box.min.clone(),max:box.max.clone(),axis:s.x>s.z?'x':'z'});
 }
});
const findings=[];
for(let i=0;i<runs.length;i++)for(let j=i+1;j<runs.length;j++){
 const a=runs[i],b=runs[j];if(a.axis===b.axis||Math.abs(a.max.y-b.max.y)>.055||Math.abs(a.min.y-b.min.y)>.055)continue;
 const loX=Math.max(a.min.x,b.min.x),hiX=Math.min(a.max.x,b.max.x),loZ=Math.max(a.min.z,b.min.z),hiZ=Math.min(a.max.z,b.max.z);
 if(hiX-loX<.002||hiZ-loZ<.002)continue;
 const x=(loX+hiX)/2,z=(loZ+hiZ)/2;
 if(obstacles.some(o=>obstacleContains(o,x,z,0)))continue;
 findings.push({a:{name:a.name,index:a.index,min:a.min.toArray(),max:a.max.toArray()},b:{name:b.name,index:b.index,min:b.min.toArray(),max:b.max.toArray()},overlap:[x,z],topOffset:a.max.y-b.max.y});
}
await writeFile(new URL('./facade-trim/estate-audit.json',import.meta.url),JSON.stringify({runs:runs.length,findings},null,2));
console.log(JSON.stringify({runs:runs.length,remainingOverlaps:findings.length},null,2));
