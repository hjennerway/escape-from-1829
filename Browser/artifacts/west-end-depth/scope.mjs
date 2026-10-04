import * as THREE from '../../dist/vendor/three.module.js';
import {registerHooks} from 'node:module';
import {createHash} from 'node:crypto';
import {writeFileSync,readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const stage=process.argv[2];
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
if(stage==='before'){
 const sources=JSON.parse(readFileSync(new URL('./before-sources.json',import.meta.url),'utf8'));
 registerHooks({load(url,context,next){const name=url.split('/').pop();return sources[name]?{format:'module',source:sources[name],shortCircuit:true}:next(url,context);}});
}
const {createEscapeExterior}=await import('../../dist/escape-exterior.mjs');
const e=createEscapeExterior(THREE,16/9);e.model.updateMatrixWorld(true);
const scope=new THREE.Box3(new THREE.Vector3(-74,-1,-2),new THREE.Vector3(-29,20,24));
const rows=[],local=new THREE.Matrix4(),world=new THREE.Matrix4(),bounds=new THREE.Box3();let inside=0;
function geometryHash(g){
 const hash=createHash('sha256');
 for(const [key,a] of Object.entries(g.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
 if(g.index)hash.update(Buffer.from(g.index.array.buffer,g.index.array.byteOffset,g.index.array.byteLength));
 return hash.digest('hex');
}
e.model.traverse(o=>{
 if(!o.isMesh)return;
 o.geometry.computeBoundingBox();
 const geometry=geometryHash(o.geometry),materials=[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]);
 const record=m=>{
  bounds.copy(o.geometry.boundingBox).applyMatrix4(m);
  if(scope.containsBox(bounds)){inside++;return;}
  rows.push(JSON.stringify([o.name,geometry,materials,m.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow,o.userData.collisionFootprint,o.userData.collisionFootprints,!!o.userData.orientedCollision]));
 };
 if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,local);world.multiplyMatrices(o.matrixWorld,local);record(world);}else record(o.matrixWorld);
});
const bays={};
for(const [name,face] of [['West curved bay','west-front-bay'],['West courtyard polygonal bay','west-court-bay']]){
 const o=e.model.getObjectByName(name);
 bays[name]={geometry:geometryHash(o.geometry),footprint:o.userData.collisionFootprint,
  windows:e.model.userData.eastPhotoOpenings.filter(w=>w.face===face).map(w=>({x:+(w.x-o.position.x).toFixed(5),z:+(w.z-o.position.z).toFixed(5),y:w.y,w:w.w,h:w.h}))};
}
const result={outside:{primitives:rows.length,sha256:createHash('sha256').update(rows.sort().join('\n')).digest('hex')},inside,bays};
writeFileSync(new URL(stage+'-scope.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
if(stage==='after'){
 const before=JSON.parse(readFileSync(new URL('before-scope.json',import.meta.url),'utf8'));
 assert.deepEqual(result.outside,before.outside,'Every primitive outside the marked cross range stays exact');
  assert.deepEqual(JSON.parse(JSON.stringify(result.bays)),before.bays,'Both octagonal wall profiles, collision outlines and all eighteen windows retain their full dimensions');
 console.log('PASS: '+result.outside.primitives+' outside primitives unchanged; both octagonal bay profiles and eighteen windows retained.');
}else console.log('Saved pre-change outside geometry and both octagonal bay profiles.');
