import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import * as THREE from '../../dist/vendor/three.module.js';
import {jarmanProtected} from '../jarman-scope.mjs';
import {leightonProtected} from '../leighton-scope.mjs';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const names=['escape-exterior.mjs','west-side-basement.mjs','west-wing-photo-detail.mjs'];
const saved=Object.fromEntries(names.map(n=>[n,readFileSync(new URL('./before-'+n,import.meta.url),'utf8')]));
const sourceHash=await modelSourceHash();
registerHooks({
 resolve(specifier,context,next){const r=next(specifier,context);if(context.parentURL?.endsWith('?gallery-before')&&[...names,'east-photo-detail.mjs'].includes(r.url.split('/').at(-1)))r.url+='?gallery-before';return r},
 load(url,context,next){const source=saved[new URL(url).pathname.split('/').at(-1)];if(url.endsWith('?gallery-before')&&source)return {format:'module',source,shortCircuit:true};return next(url,context)}
});
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const before=(await import('../../dist/escape-exterior.mjs?gallery-before')).createEscapeExterior(THREE,1.6);
const after=(await import('../../dist/escape-exterior.mjs')).createEscapeExterior(THREE,1.6);
const fingerprint=e=>({jarman:jarmanProtected(THREE,e.model),leighton:leightonProtected(THREE,e.model)});
const jURL=new URL('../../../Research/jarman/protected-geometry.json',import.meta.url),lURL=new URL('../../../Research/leighton-newton/protected-before.json',import.meta.url);
const j=JSON.parse(readFileSync(jURL)),l=JSON.parse(readFileSync(lURL));
const old=fingerprint(before),updated=fingerprint(after);
assert.deepEqual(old,{jarman:j,leighton:l.geometry},'Saved pre-edit source reproduces both existing estate snapshots');
assert.equal(updated.jarman.primitives,old.jarman.primitives+1);
assert.equal(updated.leighton.count,old.leighton.count+1);
const added=after.model.getObjectByName('West side basement gallery foundation return');
assert(added);added.removeFromParent();
const foundation='West side basement exposed foundation -35.7 -37.79';
const oldFoundation=before.model.getObjectByName(foundation),newFoundation=after.model.getObjectByName(foundation);
assert(Math.abs(new THREE.Box3().setFromObject(newFoundation).max.z+30.62)<1e-5);
newFoundation.geometry=oldFoundation.geometry;newFoundation.position.copy(oldFoundation.position);
const paving='West rear approach beside basement';
const oldPaving=before.model.getObjectByName(paving),newPaving=after.model.getObjectByName(paving);
const a=oldPaving.geometry.attributes.position,b=newPaving.geometry.attributes.position;
assert.equal(a.count,b.count);let moved=0;
for(let i=0;i<a.count;i++){
 const inset=Math.abs(a.getY(i)-30.5)<1e-5?.2:0;
 assert.equal(a.getX(i),b.getX(i));assert.equal(a.getZ(i),b.getZ(i));assert(Math.abs(b.getY(i)-a.getY(i)-inset)<1e-5);
 if(inset)moved++;
}
assert.equal(moved,2);newPaving.geometry=oldPaving.geometry;
function cream(e){return e.model.getObjectByName('West wing mirrored from east').children.find(o=>o.isInstancedMesh&&o.material.color.getHex()===0xded7bb)}
const oldCream=cream(before),newCream=cream(after),am=new THREE.Matrix4(),bm=new THREE.Matrix4();
assert.equal(oldCream.count,newCream.count);let changed=0;
for(let i=0;i<oldCream.count;i++){
 oldCream.getMatrixAt(i,am);newCream.getMatrixAt(i,bm);
 if(am.equals(bm))continue;
 assert(Math.abs(am.elements[12]-37.62)<1e-5&&Math.abs(am.elements[13]-4.2)<1e-5&&am.elements[14]===-33);
 assert(Math.abs(bm.elements[13]-4.275)<1e-5&&Math.abs(bm.elements[5]-7.95)<1e-5);
 newCream.setMatrixAt(i,am);changed++;
}
assert.equal(changed,1);
assert.deepEqual(fingerprint(after),old,'Restoring only the four reviewed primitives leaves every other estate primitive exact');
assert.equal(sourceHash,await modelSourceHash());
const report={sourceHash,old,updated,added:'gallery foundation return',changed:[foundation,paving,'one gallery cream backing instance'],pavingVerticesMoved:moved,allOtherPrimitivesExact:true};
writeFileSync(new URL('./snapshot-audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
if(process.argv.includes('--write')){writeFileSync(jURL,JSON.stringify(updated.jarman,null,2)+'\n');writeFileSync(lURL,JSON.stringify({...l,geometry:updated.leighton},null,2)+'\n')}
console.log(JSON.stringify(report,null,2));
