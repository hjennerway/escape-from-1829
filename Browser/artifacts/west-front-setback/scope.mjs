import * as THREE from '../../dist/vendor/three.module.js';
import {registerHooks} from 'node:module';
import {createHash} from 'node:crypto';
import {writeFileSync,readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {jarmanProtected} from '../jarman-scope.mjs';
import {leightonProtected} from '../leighton-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
if(process.argv[2]==='before'){
 const sources=JSON.parse(readFileSync(new URL('./before-sources.json',import.meta.url),'utf8'));
 registerHooks({load(url,context,next){const name=url.split('/').pop();return sources[name]?{format:'module',source:sources[name],shortCircuit:true}:next(url,context);}});
}
const {createEscapeExterior}=await import('../../dist/escape-exterior.mjs');
const e=createEscapeExterior(THREE,16/9);e.model.updateMatrixWorld(true);
const scope=new THREE.Box3(new THREE.Vector3(-65,-1,15),new THREE.Vector3(-29,20,43.5));
const rows=[],local=new THREE.Matrix4(),world=new THREE.Matrix4(),bounds=new THREE.Box3();let inside=0;
e.model.traverse(o=>{
 if(!o.isMesh)return;
 o.geometry.computeBoundingBox();
 const hash=createHash('sha256');
 for(const [key,a] of Object.entries(o.geometry.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
 if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer,o.geometry.index.array.byteOffset,o.geometry.index.array.byteLength));
 const geometry=hash.digest('hex'),materials=[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]);
 const record=m=>{
  bounds.copy(o.geometry.boundingBox).applyMatrix4(m);
  if(scope.containsBox(bounds)){inside++;return;}
  rows.push(JSON.stringify([o.name,geometry,materials,m.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow,o.userData.collisionFootprint,o.userData.collisionFootprints,!!o.userData.orientedCollision]));
 };
 if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,local);world.multiplyMatrices(o.matrixWorld,local);record(world);}
 else record(o.matrixWorld);
});
const result={outside:{primitives:rows.length,sha256:createHash('sha256').update(rows.sort().join('\n')).digest('hex')},inside,jarman:jarmanProtected(THREE,e.model),leighton:leightonProtected(THREE,e.model)};
writeFileSync('Browser/artifacts/west-front-setback/'+process.argv[2]+'-scope.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
if(process.argv[2]==='after'){
 const before=JSON.parse(readFileSync('Browser/artifacts/west-front-setback/before-scope.json','utf8'));
 assert.deepEqual(result.outside,before.outside,'Every primitive outside the facade correction bounds stays exact');
 console.log('PASS: '+result.outside.primitives+' outside primitives unchanged; '+(result.inside-before.inside)+' net local primitives.');
}
