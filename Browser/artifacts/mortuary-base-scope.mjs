import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
const before=process.argv.includes('before');
if(before)registerHooks({load(url,context,next){return url.endsWith('/dist/garages-mortuary.mjs')?{format:'module',source:readFileSync(new URL('mortuary-base-before-source.mjs',import.meta.url),'utf8'),shortCircuit:true}:next(url,context);}});
const THREE=await import('../dist/vendor/three.module.js');
const {createEscapeExterior}=await import('../dist/escape-exterior.mjs');
const {jarmanProtected}=await import('./jarman-scope.mjs');
const {leightonProtected}=await import('./leighton-scope.mjs');
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const e=createEscapeExterior(THREE,1.6);e.model.updateMatrixWorld(true);
const geometry={jarman:jarmanProtected(THREE,e.model),leighton:leightonProtected(THREE,e.model)};
const walls=e.garagesMortuary.userData.mortuary.getObjectByName('Mortuary T-shaped brick walls'),owner=walls.parent;
owner.remove(walls);
const outside={jarman:jarmanProtected(THREE,e.model),leighton:leightonProtected(THREE,e.model)};
owner.add(walls);walls.geometry.computeBoundingBox();
const positions=Array.from(walls.geometry.attributes.position.array);
const wall={name:walls.name,color:walls.material.color.getHex(),matrix:walls.matrix.toArray(),footprint:walls.userData.collisionFootprint,positions};
const result={geometry,outside,wall};
const jPath=new URL('../../Research/jarman/protected-geometry.json',import.meta.url),lPath=new URL('../../Research/leighton-newton/protected-before.json',import.meta.url);
const j=JSON.parse(readFileSync(jPath)),l=JSON.parse(readFileSync(lPath));
if(before){assert.deepEqual(geometry.jarman,j,'Original mortuary matches saved Jarman snapshot');assert.deepEqual(geometry.leighton,l.geometry,'Original mortuary matches saved Leighton snapshot');}
else{
 const old=JSON.parse(readFileSync(new URL('mortuary-base-scope-before.json',import.meta.url)));
 assert.deepEqual(outside,old.outside,'Every primitive outside the mortuary wall stays exact');
 assert.deepEqual({...wall,positions:null},{...old.wall,positions:null},'Wall material, transform and collision footprint stay exact');
 assert.equal(positions.length,old.wall.positions.length);
 for(let i=0;i<positions.length;i++){
  const expected=i%3===1&&Math.abs(old.wall.positions[i])<1e-6?.23:old.wall.positions[i];
  assert(Math.abs(positions[i]-expected)<1e-6,'Only the lower wall vertices rise to the plinth top');
 }
 assert.equal(geometry.jarman.primitives,old.geometry.jarman.primitives);
 assert.equal(geometry.leighton.count,old.geometry.leighton.count);
 if(process.argv.includes('--write')){
  assert.deepEqual(old.geometry.jarman,j);assert.deepEqual(old.geometry.leighton,l.geometry);
  writeFileSync(jPath,JSON.stringify(geometry.jarman,null,2)+'\n');
  writeFileSync(lPath,JSON.stringify({...l,geometry:geometry.leighton},null,2)+'\n');
 }
}
writeFileSync(new URL(`mortuary-base-scope-${before?'before':'after'}.json`,import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log('PASS: '+(before?'original mortuary reproduces saved estate snapshots':'only the mortuary wall lower vertices change; surrounding estate and collision footprint remain exact'));
