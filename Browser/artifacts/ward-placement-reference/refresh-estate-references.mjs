// Review the original historical reconstruction against the previous audited
// refresh and the later documented repairs before advancing estate snapshots.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {jarmanProtected} from '../jarman-scope.mjs';
import {leightonProtected} from '../leighton-scope.mjs';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const read=url=>JSON.parse(readFileSync(url));
const audit=read(new URL('snapshot-audit.json',import.meta.url));
const previous=read(new URL('../test-repair/reviewed-snapshot-audit.json',import.meta.url));
const jURL=new URL('../../../Research/jarman/protected-geometry.json',import.meta.url),lURL=new URL('../../../Research/leighton-newton/protected-before.json',import.meta.url);
const saved={jarman:read(jURL),leighton:read(lURL)};
assert.equal(audit.historicalRef,previous.historicalRef);
assert.equal(audit.sourceHash,await modelSourceHash());
const inside=(row,min,max)=>row.bounds.min.every((v,i)=>v>=min[i])&&row.bounds.max.every((v,i)=>v<=max[i]);
for(const [scope,result] of Object.entries(audit.scopes)){
 assert.deepEqual(result.before,previous.scopes[scope].before,'Historical model reproduces the ancestor of the saved reference exactly');
 assert.deepEqual(scope==='jarman'?saved.jarman:saved.leighton.geometry,previous.scopes[scope].after,'Saved reference is the previously reviewed 5 October snapshot');
 assert.equal((result.after.primitives??result.after.count)-(previous.scopes[scope].after.primitives??previous.scopes[scope].after.count),-65,'Reviewed net count change since 5 October');
 for(const group of result.changed){
  const rows=[...group.structuralRemoved,...group.structuralAdded];if(!rows.length)continue;
  const name=group.name.replace(/^1829 estate · aerial reconstruction \/ /,'');
  if(/downpipe|pipe bracket|rainwater offset/i.test(name)){
   group.reason='Approved 7 October pipe grouping and window clearance; current pre/post-clearance primitive audit retains all architectural records.';
  }else if(name.startsWith('Estates department / Estates glazing')){
   assert.equal(group.structuralRemoved.length,4);assert.equal(group.structuralAdded.length,4);
   for(const row of rows){const size=row.bounds.max.map((v,i)=>v-row.bounds.min[i]);assert(size[0]<.18&&size[2]<.18,'Only the Estates pipe and three bracket records');}
   group.reason='The relocated Estates downpipe and its three brackets.';
  }else if(name.startsWith('The annexe / Larkton/Jodrell / Larkton recessed ward entrance / ')){
   assert(['Recess terracotta band','Recess sash sill'].includes(name.split(' / ').at(-1)));
   assert(rows.every(r=>inside(r,[405,0,-55],[415,1.6,-48])));
   group.reason='Previously reviewed Larkton door-band and sill clearance, retained from the 5 October audit.';
  }else if(name.startsWith('Water tower · rear-right clearing / ')){
   assert(name.endsWith('Square brick shaft')||name.includes('/ Water tower side 1 · Entrance / ')||/\/ Water tower side [34] · (Bricked doorway|Annexe) \/ (Bricked ground doorway(?: reveal| arch)?|Pale lower left repair|Batched masonry details)$/.test(name));
   assert(rows.every(r=>inside(r,[142,-.1,-61],[154,34,-49])));
   group.reason='Research/water-tower/README.md: photographed entrance opening, blocked lights, doorway proportions and corresponding shaft cutout.';
  }else if(name.startsWith('Church grounds · curved lawns and four approaches / ')||name.startsWith('Churton Ward / ')){
   if(name.startsWith('Churton'))assert(['Ward perimeter gravel','Lawn entrance walk'].includes(name.split(' / ').at(-1)));
   assert(rows.every(r=>r.bounds.max[1]<.21));
   group.reason='Research/church/README.md: completed perimeter walk and shortened Churton approaches to the centred Parsons Lane.';
  }else if(/^(Estate terrain|Earlier estate access tracks)/.test(name)){
   assert(rows.every(r=>r.bounds.max[1]<.5));
   group.reason='Documented basement excavation, timeline ground and continuous west garden/access surfaces.';
  }else if(name==='West end entrance path'){
   const [old,next]=[group.structuralRemoved[0],group.structuralAdded[0]];
   assert.equal(group.structuralRemoved.length,1);assert.equal(group.structuralAdded.length,1);
   assert.deepEqual(old.position,[-84.85,.2,11.5]);assert.deepEqual(next.position,[-84.85,.2,12.75]);
   for(const end of ['min','max'])for(let i=0;i<3;i++)assert.equal(next.bounds[end][i]-old.bounds[end][i],i===2?1.25:0);
   group.reason='Previously reviewed 1.25-unit entrance-path translation; exact size and height retained.';
  }else{
   assert(name==='1829 estate · aerial reconstruction'||/^(West|East|Entrance|Redesmere|Garden pavilion|Front inside corner|Rear court|Central back|Estate joined stone courses)\b/.test(name),'Unreviewed changed feature: '+name);
   assert(rows.every(r=>inside(r,[-76,-2,-47],[100,20,49])),'Architectural differences stay in the documented 1829 repair region: '+name);
   group.reason='Documented 1829 roof, cornice, facade, basement and ground repairs in DEVELOPMENT.md, Research/west, Research/east-roof-ridges and Research/redesmere-roof-cleanup; focused geometry assertions remain active.';
  }
 }
}
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),fillText(){},strokeText(){}})})};
const e=createEscapeExterior(THREE,1.5);
assert.deepEqual(e.annexe.userData.wards['leighton-newton'].userData.ranges,saved.leighton.ranges);
assert.deepEqual(jarmanProtected(THREE,e.model),audit.scopes.jarman.after);
assert.deepEqual(leightonProtected(THREE,e.model),audit.scopes.leighton.after);
assert.equal(await modelSourceHash(),audit.sourceHash);
writeFileSync(new URL('reviewed-estate-audit.json',import.meta.url),JSON.stringify(audit,null,2)+'\n');
if(process.argv.includes('--write')){
 writeFileSync(jURL,JSON.stringify(audit.scopes.jarman.after,null,2)+'\n');
 writeFileSync(lURL,JSON.stringify({...saved.leighton,geometry:audit.scopes.leighton.after},null,2)+'\n');
}
console.log('PASS: historical audit chain, bounded documented changes, stable model inputs and original L dimensions; both estate references reviewed.');
