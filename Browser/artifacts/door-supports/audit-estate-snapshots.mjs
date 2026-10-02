import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../../dist/vendor/three.module.js';
import {jarmanProtected} from '../jarman-scope.mjs';
import {leightonProtected} from '../leighton-scope.mjs';
const edited=['entrance-west-photo-detail.mjs','annexe.mjs','churton-ward.mjs','main-kitchen.mjs','garages-mortuary.mjs'];
const wallChanges=['front-basement.mjs','west-side-basement.mjs','front-steps.mjs','irby-ashley.mjs','main-admin-building.mjs','tower-buildings.mjs','laundry.mjs'];
registerHooks({
 resolve(specifier,context,next){const r=next(specifier,context);if(context.parentURL?.endsWith('?door-before')&&r.url.includes('/dist/')&&!r.url.includes('/vendor/'))r.url+='?door-before';return r;},
 load(url,context,next){const r=next(url,context);if(!url.endsWith('?door-before'))return r;const name=new URL(url).pathname.split('/').at(-1);
  if(edited.includes(name))return {...r,source:readFileSync(new URL('before-'+name,import.meta.url),'utf8')};
  if(wallChanges.includes(name))return {...r,source:readFileSync(new URL('../wall-mitres/before/'+name,import.meta.url),'utf8')};
  if(name==='redesmere-passage.mjs')return {...r,source:String(r.source).replace('box(cornice,x,eaves-.02,z,width+.8,.28,depth+.8);','box(cornice,x,eaves-.08,z,width+.18,.16,depth+.18);')};
  if(name==='escape-exterior.mjs')return {...r,source:String(r.source).replace('  // Close the ten-centimetre sill above the portico landing.\n  box(stone,0,1.845,20.01,2.15,.11,.46);\n','')};
  return r;
 }
});
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const before=(await import('../../dist/escape-exterior.mjs?door-before')).createEscapeExterior(THREE,1.6);
const after=(await import('../../dist/escape-exterior.mjs')).createEscapeExterior(THREE,1.6);
const fingerprint=e=>({jarman:jarmanProtected(THREE,e.model),leighton:leightonProtected(THREE,e.model)});
const old=fingerprint(before),updated=fingerprint(after);
assert.equal(updated.jarman.primitives,old.jarman.primitives+21,'Only 19 garage/mortuary sills, Reception sill and kitchen step are added');
assert.equal(updated.leighton.count,old.leighton.count+21);
const jURL=new URL('../../../Research/jarman/protected-geometry.json',import.meta.url),lURL=new URL('../../../Research/leighton-newton/protected-before.json',import.meta.url);
const j=JSON.parse(readFileSync(jURL)),l=JSON.parse(readFileSync(lURL));
const report={old,updated,expected:{jarman:j,leighton:l.geometry},doorSourceChanges:edited.concat('escape-exterior.mjs'),concurrentWallJoinChanges:wallChanges,concurrentEavesChange:'redesmere-passage.mjs: one eaves-band instance'};
writeFileSync(new URL('estate-snapshot-audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
assert.deepEqual(old,{jarman:j,leighton:l.geometry},'Saved door and wall-join sources reproduce the existing estate snapshots exactly');
if(process.argv.includes('--write')){writeFileSync(jURL,JSON.stringify(updated.jarman,null,2)+'\n');writeFileSync(lURL,JSON.stringify({...l,geometry:updated.leighton},null,2)+'\n');}
console.log('PASS: original door, wall-join and single eaves-band geometry reproduce both estate snapshots exactly; updated fingerprints retain the separately tested corrections.');
