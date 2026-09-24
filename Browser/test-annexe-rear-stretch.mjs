import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {ANNEXE_MAP_SCALE,ANNEXE} from './dist/annexe.mjs';
import {rearStretchSnapshot} from './artifacts/annexe-rear-stretch-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const before=JSON.parse(readFileSync(new URL('../Research/annexe-kitchen/rear-stretch-before.json',import.meta.url)));
const annexe=createEscapeExterior(THREE,1.5).annexe,after=rearStretchSnapshot(THREE,annexe);
assert.deepEqual(after.front,before.front,'All front geometry and unaffected wards remain unchanged');
assert.deepEqual(after.root.map(n=>n===0?0:n),before.root,'The front and current whole-building centring stay fixed');
assert.deepEqual(after.wings,before.wings,'The two rear blocks translate without changing their geometry');
const anchor=-20*ANNEXE_MAP_SCALE,shift=-24*.15*ANNEXE_MAP_SCALE;
for(const original of before.ranges){
 const b=after.ranges.find(b=>b.name===original.name);
 assert(b,original.name);assert.equal(b.w,original.w,original.name+' width');assert.equal(b.h,original.h,original.name+' height');assert.equal(b.x,original.x,original.name+' sideways position');
 const court=b.name.startsWith('Rear court '),moved=['Rear west angled service range','Rear service head','Rear east connecting range','Rear east end pavilion','Rear service court link'].includes(b.name);
 assert(Math.abs(b.d-original.d*(court?1.15:1))<1e-9,b.name+' depth');
 const expectedZ=court?anchor+(original.z-anchor)*1.15:original.z+(moved?shift:0);
 assert(Math.abs(b.z-expectedZ)<1e-9,b.name+' rearward position');
}
const west=annexe.userData.ranges.find(b=>b.name==='Rear court west range'),link=annexe.userData.ranges.find(b=>b.name==='Rear service court link');
assert(Math.abs(west.z-west.d/2-link.z-link.d/2)<1e-9,'Moved connector still meets the stretched court');
assert(Math.abs(west.z+west.d/2-anchor)<1e-9,'Court-to-spine join stays fixed');
console.log('PASS: exact 15% court depth increase, fixed widths/heights/front/centring, unchanged rear block shapes, joined connector; rear shift '+(-shift*ANNEXE.scale).toFixed(3)+' m.');
