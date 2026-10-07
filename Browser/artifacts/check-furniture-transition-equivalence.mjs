import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gunzipSync,gzipSync} from 'node:zlib';
import {buildAsylumLayout} from '../dist/asylum-layout.mjs';
import {furnishAsylum} from '../dist/asylum-furniture.mjs';
const out=new URL('./escape-transitions/',import.meta.url);await mkdir(out,{recursive:true});
const floors=buildAsylumLayout(JSON.parse(await readFile(new URL('../dist/asylum-plan.json',import.meta.url)))).floors;
const snapshots=[];for(const seed of [1829,1,2,3,42,65535,2147483648,4294967295]){const began=performance.now();furnishAsylum(floors,{seed});snapshots.push({seed,furniture:floors.map(f=>f.furniture),cells:floors.map(f=>Array.from(f.cells)),spawns:floors.map(f=>f.safeSpawns)});console.log(seed+' '+(performance.now()-began).toFixed(1)+' ms');}
const path=new URL('furniture-before.json.gz',out);if(process.argv.includes('--save'))await writeFile(path,gzipSync(JSON.stringify(snapshots)));else assert.deepEqual(snapshots,JSON.parse(gunzipSync(await readFile(path))));
console.log('PASS: complete furniture records, navigation cells and safe spawns agree for eight seeds.');
