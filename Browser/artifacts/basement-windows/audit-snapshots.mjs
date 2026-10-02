import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {registerHooks} from 'node:module';
import * as THREE from '../../dist/vendor/three.module.js';
import {jarmanProtected} from '../jarman-scope.mjs';
import {leightonProtected} from '../leighton-scope.mjs';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const beforeSource=await readFile(new URL('./before-escape-exterior.mjs',import.meta.url),'utf8');
const source=await readFile(new URL('../../dist/escape-exterior.mjs',import.meta.url),'utf8'),sourceHash=await modelSourceHash();
// Allow exactly the reviewed inset and its comment; no other source changes.
const restored=source.replace(`      // covered its side stairs. Keep the paving edge inside the masonry:
      // the generated vertical ground-contact face must not coincide with
      // the exposed brick below the basement sills.`,`      // covered its side stairs. Trace the excavation at this slab's edge.`).replace(`[-39,-1],[-36.8,-1],[-36.8,-24.5],[-37.3,-24.5],[-37.3,-30.5],
        [-37.64,-30.5],[-37.64,-36],[-39,-36]]);`,`[-39,-1],[-37,-1],[-37,-24.5],[-37.5,-24.5],[-37.5,-30.5],
        [-37.84,-30.5],[-37.84,-36],[-39,-36]]);`);
assert.equal(restored.replaceAll('\r\n','\n'),beforeSource.replaceAll('\r\n','\n'));
registerHooks({load(url,context,next){const result=next(url,context);return url.endsWith('escape-exterior.mjs?basement-before')?{...result,source:beforeSource}:result;}});
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const before=(await import('../../dist/escape-exterior.mjs?basement-before')).createEscapeExterior(THREE,1.6);
const after=(await import('../../dist/escape-exterior.mjs')).createEscapeExterior(THREE,1.6);
const oldJarman=jarmanProtected(THREE,before.model),oldLeighton=leightonProtected(THREE,before.model);
const jarmanURL=new URL('../../../Research/jarman/protected-geometry.json',import.meta.url),leightonURL=new URL('../../../Research/leighton-newton/protected-before.json',import.meta.url);
const jarman=JSON.parse(await readFile(jarmanURL,'utf8')),leighton=JSON.parse(await readFile(leightonURL,'utf8'));
assert.deepEqual(oldJarman,jarman,'Restoring only the paving edge reproduces the saved Jarman snapshot');
assert.deepEqual(oldLeighton,leighton.geometry,'Restoring only the paving edge reproduces the saved Leighton snapshot');
const newJarman=jarmanProtected(THREE,after.model),newLeighton=leightonProtected(THREE,after.model);
const name='West rear approach beside basement',a=before.model.getObjectByName(name),b=after.model.getObjectByName(name);
assert(a&&b);assert.deepEqual(a.position.toArray(),b.position.toArray());assert.deepEqual(a.quaternion.toArray(),b.quaternion.toArray());
const p=a.geometry.attributes.position,q=b.geometry.attributes.position;assert.equal(p.count,q.count);
let moved=0;
for(let i=0;i<p.count;i++){
 const inset=[-37,-37.5,-37.84].some(x=>Math.abs(p.getX(i)-x)<1e-5)?.2:0;
 assert(Math.abs(q.getX(i)-p.getX(i)-inset)<1e-5);assert.equal(p.getY(i),q.getY(i));assert.equal(p.getZ(i),q.getZ(i));
 if(inset)moved++;
}
assert.equal(moved,6,'Only six hidden boundary vertices move inward');
assert.deepEqual(a.geometry.index.array,b.geometry.index.array,'Triangle topology is retained');
a.removeFromParent();b.removeFromParent();
assert.deepEqual(jarmanProtected(THREE,before.model),jarmanProtected(THREE,after.model),'Every other Jarman-protected primitive stays exact');
assert.deepEqual(leightonProtected(THREE,before.model),leightonProtected(THREE,after.model),'Every other Leighton-protected primitive stays exact');
assert.equal(sourceHash,await modelSourceHash(),'Model source stays unchanged during the audit');
const report={changedObject:name,movedVertices:moved,inset:.2,sourceHash,oldJarman,newJarman,oldLeighton,newLeighton,allOtherPrimitivesExact:true};
await writeFile(new URL('./snapshot-audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
if(process.argv.includes('--write')){
 await writeFile(jarmanURL,JSON.stringify(newJarman,null,2)+'\n');
 await writeFile(leightonURL,JSON.stringify({...leighton,geometry:newLeighton},null,2)+'\n');
}
console.log(JSON.stringify(report,null,2));
