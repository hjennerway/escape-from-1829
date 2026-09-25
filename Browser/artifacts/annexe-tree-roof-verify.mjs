import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import * as THREE from '../dist/vendor/three.module.js';
import {KML_TREES} from '../dist/kml-tree-data.mjs';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
const source=execFileSync('git',['show','HEAD:Browser/dist/kml-tree-data.mjs'],{encoding:'utf8'}).replace(/from '(\.\/[^']+)'/g,(_,p)=>`from '${new URL(p,new URL('../dist/kml-tree-data.mjs',import.meta.url)).href}'`);
const before=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).KML_TREES;
for(let i=0;i<KML_TREES.length;i++){
 const expected={...before[i]};if(expected.name==='Oak24'){expected.height*=.55;expected.radius*=.55;}
 assert.deepEqual(KML_TREES[i],expected);
}
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(t){return {width:t.length*16};},strokeText(){},fillText(){}})})};
const e=createEscapeExterior(THREE,1),tree=e.trees.getObjectByName('Oak24');e.model.updateMatrixWorld(true);
assert.deepEqual(tree.scale.toArray(),[.55,.55,.55]);
const instance=new THREE.Matrix4(),matrix=new THREE.Matrix4(),box=new THREE.Box3();let roofs=0,primitives=0;
e.annexe.traverse(roof=>{
 if(!roof.isMesh||!roof.name.toLowerCase().includes('roof')||new THREE.Box3().setFromObject(roof).distanceToPoint(tree.position)>=25)return;
 roofs++;roof.geometry.computeBoundingBox();const inverse=roof.matrixWorld.clone().invert();
 tree.traverse(o=>{if(!o.isMesh)return;o.geometry.computeBoundingBox();
  for(let i=0;i<(o.isInstancedMesh?o.count:1);i++){
   matrix.multiplyMatrices(inverse,o.matrixWorld);if(o.isInstancedMesh){o.getMatrixAt(i,instance);matrix.multiply(instance);}
   box.copy(o.geometry.boundingBox).applyMatrix4(matrix);primitives++;
   assert(!box.intersectsBox(roof.geometry.boundingBox),o.name+' clears '+roof.name);
  }
 });
});
console.log(`PASS: only Oak24 height/radius changed; every tree position, rotation and other attribute preserved; uniform 55% scale; ${primitives} branch/foliage bounds across all detail levels clear ${roofs} nearby roofs.`);
