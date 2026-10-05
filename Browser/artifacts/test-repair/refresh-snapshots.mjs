// Run audit-snapshots.mjs first. Only the two reviewed count/hash pairs advance.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {jarmanProtected} from '../jarman-scope.mjs';
import {leightonProtected} from '../leighton-scope.mjs';
import {modelSourceHash} from '../../model-build-inputs.mjs';

const read=url=>JSON.parse(readFileSync(url));
const audit=read(new URL('snapshot-audit.json',import.meta.url));
const jURL=new URL('../../../Research/jarman/protected-geometry.json',import.meta.url),lURL=new URL('../../../Research/leighton-newton/protected-before.json',import.meta.url);
const jarman=read(jURL),leighton=read(lURL);
assert.equal(audit.historicalRef,'db70a03');assert.equal(audit.historicalModules,134);
assert.deepEqual(audit.scopes.jarman.before,jarman,'Reconstructed historical model matches the saved Jarman reference');
assert.deepEqual(audit.scopes.leighton.before,leighton.geometry,'Reconstructed historical model matches the saved Leighton/Newton reference');
assert.equal(audit.sourceHash,await modelSourceHash(),'Model source is unchanged since the audit');
const changedSources=[
 'annexe-larkton-recess.mjs','courtyard-photo-detail.mjs','east-photo-detail.mjs',
 'entrance-symmetry.mjs','entrance-walks.mjs','entrance-west-photo-detail.mjs',
 'escape-exterior.mjs','facade-courses.mjs','front-inside-corners.mjs','outhouse.mjs',
 'photo-detail-primitives.mjs','rear-court-photo-detail.mjs','redesmere-garden-photo-detail.mjs',
 'west-court-photo-detail.mjs','west-front-photo-detail.mjs','west-lawn-photo-detail.mjs',
 'west-refinement.mjs','west-side-basement.mjs','west-wing-photo-detail.mjs'
].sort();
assert.deepEqual(audit.changedSources,changedSources,'Only the reviewed historical model inputs differ');
const root='1829 estate · aerial reconstruction';
for(const [scope,result] of Object.entries(audit.scopes)){
 const old=result.before.primitives??result.before.count,updated=result.after.primitives??result.after.count;
 assert.equal(updated-old,18,'Reviewed net primitive change');
 assert.equal(result.unchangedPrimitives,scope==='jarman'?816532:880576);
 assert.equal(result.uvOnlyPrimitives,scope==='jarman'?268:271);
 assert.equal(result.changed.reduce((n,g)=>n+g.structuralRemoved.length,0),2130);
 assert.equal(result.changed.reduce((n,g)=>n+g.structuralAdded.length,0),2148);
 for(const group of result.changed){
  const rows=[...group.structuralRemoved,...group.structuralAdded],local=group.name.slice(root.length+3);
  if(!rows.length){
   assert.equal(group.removed,group.added);assert.equal(group.uvOnly,group.removed);
   group.reason='Roof UV remapping: expanded vertex positions, normals, other attributes, materials, transforms, shadow and collision flags remain exact.';
  }else if(local==='Estate terrain'||local==='Earlier estate access tracks'){
   assert.equal(group.structuralRemoved.length,1);assert.equal(group.structuralAdded.length,1);
   for(const row of rows){assert(row.bounds.min[1]>=-.151&&row.bounds.max[1]<=.061,'Ground-plane-only repair');}
   group.reason='Documented west basement excavation/access gravel and period-dependent terrain restoration; ground-contact, basement and timeline checks retain physical coverage.';
  }else if(local==='West end entrance path'){
   assert.equal(group.structuralRemoved.length,1);assert.equal(group.structuralAdded.length,1);
   const old=group.structuralRemoved[0],updated=group.structuralAdded[0];
   assert.deepEqual(old.position,[-84.85,.2,11.5]);assert.deepEqual(updated.position,[-84.85,.2,12.75]);
   for(const end of ['min','max'])for(let axis=0;axis<3;axis++)assert.equal(updated.bounds[end][axis]-old.bounds[end][axis],axis===2?1.25:0);
   group.reason='Research/west/end-sections-2026-10-04/README.md: retained entrance path translates 1.25 units to the corrected door axis; its size and height stay exact.';
  }else if(local.startsWith('The annexe / Larkton/Jodrell / Larkton recessed ward entrance / ')){
   assert(['Recess terracotta band','Recess sash sill'].includes(local.split(' / ').at(-1)));
   for(const row of rows){const {min,max}=row.bounds;assert(min[0]>=405&&max[0]<=415&&min[1]>=0&&max[1]<=1.6&&min[2]>=-55&&max[2]<=-48,'Only the two documented recessed door strips');}
   group.reason='Research/larkton-jodrell/README.md: split base bands and omit the projecting sill from the two door leaves.';
  }else{
   assert(group.name===root||/^((West|East|Entrance|Redesmere|Garden pavilion|Front inside corner|Estate joined stone courses|Estate terrain)\b)/.test(local),'Unreviewed changed feature '+group.name);
   for(const row of rows){const {min,max}=row.bounds;assert(min[0]>=-76&&max[0]<=99&&min[1]>=-2&&max[1]<=20&&min[2]>=-44&&max[2]<=48,'Structural change leaves the reviewed 1829 building/court region: '+group.name+' '+JSON.stringify(row));}
   group.reason='Documented 1829 facade, glazing, stair, basement, render/cornice and west roof repairs in DEVELOPMENT.md, Research/west and Research/front-inside-corners; focused architectural/collision regressions retained.';
  }
 }
}
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const e=createEscapeExterior(THREE,1.6);
assert.deepEqual(e.annexe.userData.wards['leighton-newton'].userData.ranges,leighton.ranges,'Original L dimensions remain exact');
assert.deepEqual(jarmanProtected(THREE,e.model),audit.scopes.jarman.after);
assert.deepEqual(leightonProtected(THREE,e.model),audit.scopes.leighton.after);
assert.equal(await modelSourceHash(),audit.sourceHash,'Model source remains stable during reference validation');
writeFileSync(new URL('reviewed-snapshot-audit.json',import.meta.url),JSON.stringify(audit,null,2)+'\n');
if(process.argv.includes('--write')){
 writeFileSync(jURL,JSON.stringify(audit.scopes.jarman.after,null,2)+'\n');
 writeFileSync(lURL,JSON.stringify({...leighton,geometry:audit.scopes.leighton.after},null,2)+'\n');
}
console.log('PASS: historical reproduction, rendered UV-only comparison, all reviewed structural bounds, exact L ranges and fresh production fingerprints. References updated: '+process.argv.includes('--write'));
