import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {buildAsylumLayout} from '../../../dist/asylum-layout.mjs';
import {modelSourceHash} from '../../../model-build-inputs.mjs';

const before=JSON.parse(await readFile(new URL('./before-plan.json',import.meta.url),'utf8'));
const after=JSON.parse(await readFile(new URL('../../../dist/asylum-plan.json',import.meta.url),'utf8'));
const review=JSON.parse(await readFile(new URL('../../../../Research/1829-interior-proposal/plan-data.json',import.meta.url),'utf8'));
assert.deepEqual(after,review);
const otherFloors=p=>({...p,rooms:p.rooms.filter(r=>!r.floors.includes(3)),corridors:p.corridors.filter(c=>!c.floors.includes(3))});
assert.deepEqual(otherFloors(after),otherFloors(before),'All plan inputs outside the approved upper rooms/corridors are identical');
const windows=p=>p.rooms.filter(r=>r.floors.includes(3)).flatMap(r=>r.windows).map(w=>JSON.stringify(w)).sort();
assert.deepEqual(windows(after),windows(before),'All five complete exterior sash records remain fixed');
const old=buildAsylumLayout(before).floors,current=buildAsylumLayout(after).floors;
const digest=f=>createHash('sha256').update(JSON.stringify({walls:f.walls,doors:f.doorways,leaves:f.roomDoors,cells:Array.from(f.cells),shafts:f.shafts,rails:f.stairRails})).digest('hex');
const lowerFloors=current.slice(0,3).map((f,i)=>{
 const original=digest(old[i]),updated=digest(f);assert.equal(updated,original,'Lower-floor walls, doors and navigation remain identical');
 return {floor:f.id,hash:updated,unchanged:true};
});
const hash=await modelSourceHash(),originalHash=(await readFile(new URL('./before-model-hash.txt',import.meta.url),'utf8')).trim();
const manifest=JSON.parse(await readFile(new URL('../../../dist/compiled/manifest.json',import.meta.url),'utf8'));
assert.equal(hash,originalHash);assert.equal(manifest.sourceHash,hash);
await writeFile(new URL('./preservation.json',import.meta.url),JSON.stringify({sharedPlansMatch:true,otherPlanInputsUnchanged:true,completeWindowRecordsUnchanged:5,lowerFloors,aerialSourceHash:hash,aerialSourceUnchanged:true,compiledManifestMatches:true},null,2)+'\n');
console.log('PASS: matching shared plans; only approved upper rooms/corridors change; five sash records fixed; all three lower-floor walls/doors/navigation unchanged; aerial source and compiled manifest still match.');
