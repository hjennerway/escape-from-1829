import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {buildAsylumLayout} from './dist/asylum-layout.mjs';
import {furnishAsylum} from './dist/asylum-furniture.mjs';

const fixtures=JSON.parse(await readFile(new URL('./fixtures/escape-transition-furniture.json',import.meta.url)));
const floors=buildAsylumLayout(JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)))).floors;
const snapshot=floors=>({furniture:floors.map(f=>f.furniture),cells:floors.map(f=>Array.from(f.cells)),spawns:floors.map(f=>f.safeSpawns)});
for(const {seed,sha256} of fixtures){
 furnishAsylum(floors,{seed});
 assert.equal(createHash('sha256').update(JSON.stringify(snapshot(floors))).digest('hex'),sha256,`Seed ${seed}: every placement, navigation cell and safe spawn matches the original implementation`);
}
// A changed door must invalidate static clearance results. Compare a reused
// floor with a fresh copy that has never populated the placement cache.
const fresh=structuredClone(floors);
for(const model of [floors,fresh])model[0].roomDoors[0].x+=.02;
furnishAsylum(floors,{seed:42});furnishAsylum(fresh,{seed:42});
assert.deepEqual(snapshot(floors),snapshot(fresh));
console.log('PASS: eight original complete furniture/navigation/spawn fixtures, randomized replay and cache invalidation after a door moves.');
