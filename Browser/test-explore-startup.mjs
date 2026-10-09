import assert from 'node:assert/strict';
import {deferExploreInterior} from './dist/deferred-explore-interior.mjs';

let createCount=0,release,prepared=[],background=0,updates=0,ready=false;
const to={x:0,z:17,floor:0,outside:false},outside={outside:true};
const real={scene:{name:'rooms'},loading:{
 prepare:async actor=>{prepared.push(actor);},startBackground:()=>background++,
 allowMove:()=>ready,holding:false,failed:false,retry(){this.failed=false;}
},update:()=>updates++};
const deferred=deferExploreInterior(()=>{createCount++;return new Promise(resolve=>{release=()=>resolve(real);});});
assert.equal(createCount,0,'Construction does not load furniture or rooms');
deferred.update(outside,0);assert.equal(updates,0);
assert(deferred.loading.allowMove(to,outside),'Leaving a building never waits');
assert(!deferred.loading.allowMove(outside,to),'An unprepared door cannot reveal empty rooms');
assert(deferred.loading.holding);
const preparing=deferred.loading.prepare(to);deferred.loading.startBackground();
await Promise.resolve();assert.equal(createCount,1,'Door and background requests share initialization');
release();await preparing;assert.equal(background,1);assert.deepEqual(prepared,[to]);
assert.equal(deferred.scene,real.scene);deferred.update(outside,.1);assert.equal(updates,1);
assert(!deferred.loading.allowMove(outside,to),'Creating the scene does not bypass section readiness');
ready=true;assert(deferred.loading.allowMove(outside,to));
real.loading.holding=true;real.loading.failed=true;
assert(deferred.loading.holding&&deferred.loading.failed);deferred.loading.retry();assert(!deferred.loading.failed);

let tries=0;
const failure=deferExploreInterior(async()=>{if(++tries===1)throw Error('Download interrupted');return real;});
await assert.rejects(failure.loading.prepare(to),/Download interrupted/);
assert(failure.loading.failed);assert(!failure.loading.allowMove(outside,to));
assert(failure.loading.holding);assert.equal(tries,1,'Failed downloads do not retry every animation frame');
assert(failure.loading.allowMove(to,outside),'Failed interiors leave outdoor movement available');
failure.loading.retry();await failure.loading.prepare(to);
assert.equal(tries,2);assert(!failure.loading.failed);
console.log('PASS: deferred room creation, shared requests, gated entry, outdoor availability and retry after failure.');
