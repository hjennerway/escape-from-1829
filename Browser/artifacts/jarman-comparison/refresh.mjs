// Run audit.mjs first. Update only after historical reproduction, a reviewed
// primitive delta, stable source inputs and current production hashes agree.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {jarmanProtected} from '../jarman-scope.mjs';
import {leightonProtected} from '../leighton-scope.mjs';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const read=url=>JSON.parse(readFileSync(url));
const audit=read(new URL('audit.json',import.meta.url));
const jURL=new URL('../../../Research/jarman/protected-geometry.json',import.meta.url),lURL=new URL('../../../Research/leighton-newton/protected-before.json',import.meta.url);
const jarman=read(jURL),leighton=read(lURL);
assert.equal(audit.historicalRef,'16abbbb');
assert.deepEqual(audit.scopes.jarman.before,jarman,'Historical source must reproduce the saved Jarman reference');
assert.deepEqual(audit.scopes.leighton.before,leighton.geometry,'Historical source must reproduce the saved Leighton/Newton reference');
assert.equal(audit.sourceHash,await modelSourceHash(),'Exterior changed after the audit');

const root='1829 estate · aerial reconstruction',reviewed={
 [root]:'Main estate facade-course consolidation, stair ironwork, window clearances and low-roof underside repairs',
 [root+' / West wing mirrored from east']:'Reflected inner-court windows and stair repair',
 [root+' / Front inside corner trimmed existing detail']:'Front-corner band pieces replaced by the continuous facade course'
};
const courseHosts=new Set([
 'Upton/Frith/Oscroft / Upton sash windows, stone bands and rainwater goods',
 'Irby/Ashley / Irby/Ashley sashes, masonry bands and rainwater goods',
 'Grafton/Edge / Grafton/Edge sashes, masonry bands and rainwater goods',
 'Hale/Daresbury/Huxley/Dunham / Hale ward sashes, masonry bands and rainwater goods',
 'Farndon ward / Farndon sashes, doors, masonry and rainwater goods',
 'Witby Ward / Witby sashes, doors, masonry and rainwater goods',
 'Main/admin building / Admin sash and masonry details',
 'Laundry and brick connecting corridor / Laundry glazing and trim'
]);
const stairHosts=new Set([
 'West front iron return stair','West forward end masonry return stair',
 'East courtyard two-flight fire escape','Inner court iron stairs',
 'West wing mirrored from east / West mirrored Inner court iron stairs',
 'Central court rear iron stair','Rear return external stair'
]);
function reason(name){
 if(reviewed[name])return reviewed[name];
 const local=name.slice(root.length+3),host=local.replace(/ joined stone courses$/,'');
 if(courseHosts.has(host)||/^(Entrance continuous lower floor band|Reception continuous floor band (7\.1|10\.7)|West curved bay stone band|West outer pavilion continuous floor band (4\.05|8\.6|15\.2)|West outer corner joined cornice (-0\.18|0\.04|0\.22)|West middle bay continuous floor band (4\.05|8\.6)|West courtyard stepped floor band (4\.05|8\.6)|East courtyard stepped floor band (4\.06|8\.8|14\.3)|(East|West) lawn (continuous upper floor band|bay continuous floor band)|Estate joined stone courses|West wing mirrored from east \/ Estate joined stone courses)$/.test(local))return 'Documented continuous facade course and mitred trim consolidation';
 if(stairHosts.has(local.replace(/ \/ Exterior stair guard$/,''))||local==='East forward external stair guards / Exterior stair guard'||local==='Front entrance split staircase / Doorstep iron balustrade')return 'Documented stair guards and unobstructed flight/landing repair';
 if(/^(East wing continuous eaves|West wing mirrored from east \/ West wing continuous eaves)$/.test(local))return 'Documented full wing-roof soffit closure';
 if(/^The annexe \/ (East|West) mirrored side details \/ (Fire stair landing|Blue stair handrail|Blue stair baluster|Fire stair door walkway|Blue external stair guard)$/.test(local))return 'Documented annexe L landing and continuous guards';
}
for(const [scope,result] of Object.entries(audit.scopes)){
 assert.equal(result.changed.length,70,'Reviewed feature groups must remain exact');
 assert.equal(result.changed.reduce((sum,g)=>sum+g.removed,0),1897);
 assert.equal(result.changed.reduce((sum,g)=>sum+g.added,0),745);
 for(const group of result.changed){
  group.reason=reason(group.name);assert(group.reason,'Unreviewed changed feature: '+group.name);
  if(group.name===root||group.name===root+' / West wing mirrored from east')for(const row of [...group.removedPositions,...group.addedPositions]){
   const [x,y,z]=row.position;
   assert(x>=-73&&x<=98&&y>=0&&y<=16&&z>=-44&&z<=47,'Unnamed change outside the reviewed main-estate facade/stair region: '+row.position);
  }
 }
}
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const e=createEscapeExterior(THREE,1.6);
assert.deepEqual(e.annexe.userData.wards['leighton-newton'].userData.ranges,leighton.ranges,'Original L dimensions remain exact');
assert.deepEqual(jarmanProtected(THREE,e.model),audit.scopes.jarman.after,'Production Jarman comparison must match the audited model');
assert.deepEqual(leightonProtected(THREE,e.model),audit.scopes.leighton.after,'Production Leighton/Newton comparison must match the audited model');
assert.equal(await modelSourceHash(),audit.sourceHash,'Exterior changed during validation');
writeFileSync(new URL('reviewed-audit.json',import.meta.url),JSON.stringify(audit,null,2)+'\n');
if(process.argv.includes('--write')){
 writeFileSync(jURL,JSON.stringify(audit.scopes.jarman.after,null,2)+'\n');
 writeFileSync(lURL,JSON.stringify({...leighton,geometry:audit.scopes.leighton.after},null,2)+'\n');
}
console.log('PASS: both historical comparisons reproduced exactly; 1,897 removed and 745 added primitives belong to 70 documented repair groups. All original exclusions, architectural assertions and L ranges are retained. References updated: '+process.argv.includes('--write'));
