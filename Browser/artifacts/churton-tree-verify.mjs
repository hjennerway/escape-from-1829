import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import {createHash} from 'node:crypto';
import * as THREE from '../dist/vendor/three.module.js';
import {jarmanProtected} from './jarman-scope.mjs';
import {leightonProtected} from './leighton-scope.mjs';
import {exteriorObstacles,obstacleContains} from '../dist/explore-controls.mjs';

const original=readFileSync(new URL('./churton-tree-before-source.txt',import.meta.url),'utf8');
registerHooks({load(url,context,nextLoad){
 if(url.endsWith('/escape-exterior.mjs?tree-before'))return {format:'module',source:original,shortCircuit:true};
 return nextLoad(url,context);
}});
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
const {createEscapeExterior:buildBefore}=await import('../dist/escape-exterior.mjs?tree-before');
const {createEscapeExterior:buildAfter}=await import('../dist/escape-exterior.mjs');
const before=buildBefore(THREE,1.5),after=buildAfter(THREE,1.5);
const find=(e,x,z)=>e.trees.children.find(o=>o.userData.broadleafTree?.x===x&&o.userData.broadleafTree?.z===z);
const oldTree=find(before,-90,-44),newTree=find(after,-82,-54);
assert(oldTree&&newTree);assert(!find(after,-90,-44));
const oldSpec=oldTree.userData.broadleafTree,newSpec=newTree.userData.broadleafTree;
assert.equal(oldSpec.size,newSpec.size);assert.equal(oldTree.position.y,newTree.position.y);
for(let i=0;i<oldSpec.crowns.length;i++)for(const key of ['x','y','z','s']){
 const delta=key==='x'?8:key==='z'?-10:0;
 assert(Math.abs(newSpec.crowns[i][key]-oldSpec.crowns[i][key]-delta)<1e-10,'Only translate crown '+i+' '+key);
}
function surroundings(e,tree){
 e.model.updateMatrixWorld(true);const hash=createHash('sha256'),geometryCache=new WeakMap(),matrix=new THREE.Matrix4();let primitives=0,excluded=0;
 e.model.traverse(o=>{
  if(!o.isMesh)return;
  let geometry=geometryCache.get(o.geometry);
  if(!geometry){const h=createHash('sha256');for(const [key,a] of Object.entries(o.geometry.attributes).sort()){h.update(key);h.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}if(o.geometry.index)h.update(Buffer.from(o.geometry.index.array.buffer));geometry=h.digest('hex');geometryCache.set(o.geometry,geometry);}
  const materials=[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]);
  const record=(transform,skip)=>{if(skip){excluded++;return;}primitives++;hash.update(JSON.stringify([o.name,geometry,materials,transform.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow,!!o.userData.orientedCollision]));};
  if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);record(matrix.clone().premultiply(o.matrixWorld),o.userData.treeIds?.[i]===tree.uuid);}else record(o.matrixWorld,o===tree);
 });
 return {primitives,excluded,sha256:hash.digest('hex')};
}
const protectedBefore=surroundings(before,oldTree),protectedAfter=surroundings(after,newTree);
assert.equal(protectedBefore.excluded,6);assert.deepEqual(protectedAfter,protectedBefore,'All geometry outside the single trunk and five crowns stays exact');
const beforeObs=exteriorObstacles(THREE,before.model),afterObs=exteriorObstacles(THREE,after.model);
const blocked=(obs,x,z)=>obs.some(o=>obstacleContains(o,x,z,.1));
assert(blocked(beforeObs,-90,-44));assert(!blocked(beforeObs,-82,-54));
assert(!blocked(afterObs,-90,-44));assert(blocked(afterObs,-82,-54));
after.trees.visible=false;assert(!blocked(exteriorObstacles(THREE,after.model),-82,-54));after.trees.visible=true;
const jarmanPath=new URL('../../Research/jarman/protected-geometry.json',import.meta.url),leightonPath=new URL('../../Research/leighton-newton/protected-before.json',import.meta.url);
const oldJarman=JSON.parse(readFileSync(new URL('./churton-tree-jarman-before.json',import.meta.url))),oldLeighton=JSON.parse(readFileSync(new URL('./churton-tree-leighton-before.json',import.meta.url)));
assert.deepEqual(jarmanProtected(THREE,before.model),oldJarman,'Before scene reproduces saved Jarman snapshot');
assert.deepEqual(leightonProtected(THREE,before.model),oldLeighton.geometry,'Before scene reproduces saved Leighton snapshot');
const newJarman=jarmanProtected(THREE,after.model),newLeighton={...oldLeighton,geometry:leightonProtected(THREE,after.model)};
assert.equal(newJarman.primitives,oldJarman.primitives);assert.equal(newLeighton.geometry.count,oldLeighton.geometry.count);
if(process.argv.includes('--refresh')){
 assert.deepEqual(JSON.parse(readFileSync(jarmanPath)),oldJarman,'No concurrent snapshot changes');
 assert.deepEqual(JSON.parse(readFileSync(leightonPath)),oldLeighton,'No concurrent snapshot changes');
 writeFileSync(jarmanPath,JSON.stringify(newJarman,null,2)+'\n');writeFileSync(leightonPath,JSON.stringify(newLeighton,null,2)+'\n');
}else{
 assert.deepEqual(JSON.parse(readFileSync(jarmanPath)),newJarman);assert.deepEqual(JSON.parse(readFileSync(leightonPath)),newLeighton);
}
writeFileSync(new URL('./churton-tree-preservation.json',import.meta.url),JSON.stringify({from:oldTree.position.toArray(),to:newTree.position.toArray(),surroundings:protectedAfter,oldPositionClear:true,newPositionBlocked:true,hiddenTreeClear:true},null,2)+'\n');
console.log('PASS: only the selected trunk and five crowns moved; all '+protectedAfter.primitives+' other primitives are exact, crown shapes are preserved, collisions follow the tree and both snapshots retain their counts.');
