import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const before=process.argv.includes('before');
if(before)registerHooks({load(url,context,next){return url.endsWith('/dist/outhouse.mjs')?{format:'module',source:readFileSync(new URL('outhouse-contact-before-source.mjs',import.meta.url),'utf8'),shortCircuit:true}:next(url,context);}});
const THREE=await import('../dist/vendor/three.module.js');
const {createEscapeExterior}=await import('../dist/escape-exterior.mjs');
const {jarmanProtected}=await import('./jarman-scope.mjs');
const {leightonProtected}=await import('./leighton-scope.mjs');
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const e=createEscapeExterior(THREE,1.6);e.model.updateMatrixWorld(true);
const geometry={jarman:jarmanProtected(THREE,e.model),leighton:leightonProtected(THREE,e.model)};
const owner=e.outhouse.parent;owner.remove(e.outhouse);
const outside={jarman:jarmanProtected(THREE,e.model),leighton:leightonProtected(THREE,e.model)};owner.add(e.outhouse);
const inside=e.outhouse.children.filter(o=>o.isMesh).map(o=>{
 const hash=createHash('sha256');for(const [k,a] of Object.entries(o.geometry.attributes).sort()){hash.update(k);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer));
 return {name:o.name,color:o.material.color.getHex(),geometry:hash.digest('hex'),matrix:o.matrix.toArray(),instances:o.instanceMatrix?Array.from(o.instanceMatrix.array):null};
});
const ranges=e.annexe.userData.wards['leighton-newton'].userData.ranges;
const result={geometry,outside,inside,ranges};
const jPath=new URL('../../Research/jarman/protected-geometry.json',import.meta.url),lPath=new URL('../../Research/leighton-newton/protected-before.json',import.meta.url);
const j=JSON.parse(readFileSync(jPath)),l=JSON.parse(readFileSync(lPath));
if(before){assert.deepEqual(geometry.jarman,j);assert.deepEqual(geometry.leighton,l.geometry);}
else{
 const old=JSON.parse(readFileSync(new URL('outhouse-contact-scope-before.json',import.meta.url)));
 assert.deepEqual(old.geometry.jarman,j,'Original outhouse reproduces the saved Jarman baseline');assert.deepEqual(old.geometry.leighton,l.geometry,'Original outhouse reproduces the saved Leighton baseline');
 assert.deepEqual(outside,old.outside,'All geometry outside the outhouse stays exact');assert.deepEqual(ranges,old.ranges);assert.deepEqual(ranges,l.ranges);
 assert.equal(inside.length,old.inside.length);
 let changed=0;
 for(let i=0;i<inside.length;i++)if(JSON.stringify(inside[i])!==JSON.stringify(old.inside[i])){
  const a=old.inside[i],b=inside[i];changed++;assert.equal(a.name,b.name);assert.equal(a.color,b.color);assert.deepEqual(a.matrix,b.matrix);
  if(b.name==='Outhouse projecting brick plinth')assert.deepEqual(a.instances,b.instances);
  else {assert.equal(b.color,0x536446);assert.equal(a.geometry,b.geometry);assert.equal(a.instances.length,b.instances.length);for(let k=0;k<b.instances.length;k++)if(k%16===14)assert(Math.abs(Math.abs(b.instances[k])-Math.abs(a.instances[k])-.01)<1e-6);else assert.equal(a.instances[k],b.instances[k]);}
 }
 assert.equal(changed,2,'Only the foundation and moss batch change');
 assert.equal(geometry.jarman.primitives,old.geometry.jarman.primitives);assert.equal(geometry.leighton.count,old.geometry.leighton.count);
 if(process.argv.includes('--write')){writeFileSync(jPath,JSON.stringify(geometry.jarman,null,2)+'\n');writeFileSync(lPath,JSON.stringify({...l,geometry:geometry.leighton},null,2)+'\n');}
}
writeFileSync(new URL(`outhouse-contact-scope-${before?'before':'after'}.json`,import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log('PASS: '+(before?'original outhouse reproduces saved snapshots':'only outhouse moss transforms and foundation geometry change; surroundings and ward ranges preserved'));
