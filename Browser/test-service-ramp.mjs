import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from './dist/estate-timeline.mjs';
import {createExploreWalker} from './dist/explore-walker.mjs';
import {createExploreWorkshops} from './dist/explore-workshops.mjs';
import {buildAsylumLayout} from './dist/asylum-layout.mjs';
import {batchAerialMeshes,cacheAerialTransforms} from './dist/aerial-performance.mjs';
import {exteriorObstacles,walkSurfaceHeight,obstacleContains} from './dist/explore-controls.mjs';
import {probeServiceRamp} from './test-support/service-ramp-probes.mjs';
const context=new Proxy({},{get:(_,key)=>key==='measureText'?text=>({width:text.length*16}):/Gradient$/.test(key)?()=>({addColorStop(){}}):()=>{}});
globalThis.document={createElement:()=>({getContext:()=>context})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior);
const timeline=prepareEstateTimeline(THREE,exterior,layouts);
function check(label){
 const r=probeServiceRamp(THREE,exterior);
 assert(r.base<exterior.terrain.position.y,label+' retaining faces reach beneath the ground');
 assert.equal(r.probes,64);assert.deepEqual(r.leaks,[],label+' ramp has closed sides and ends');
 for(const w of r.walks){assert.deepEqual(w.errors,[],label+' lower approach and ascent');assert(w.upper.x<r.bounds.min[0]+.5,label+' reaches the high end');assert(w.end.x>r.bounds.max[0]+.9,label+' descends and exits');}
 assert(r.jump.started&&!r.jump.airborne&&Math.abs(r.jump.y-r.jump.expected)<1e-5,label+' jump lands on the slope');
 console.log('PASS: '+label+' ramp enclosure, three complete ascents/descents and jump landing.');
}
check('Unbatched estate');batchAerialMeshes(THREE,exterior.model);cacheAerialTransforms(exterior.scene);check('Batched estate');
const floors=buildAsylumLayout(JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)))).floors;
const walker=createExploreWalker(THREE,exterior,floors),controller=createExploreWorkshops(THREE,exterior,walker,timeline);
controller.refresh();check('Fitted Explore');controller.workshops.dispose();check('Restored estate');
// Sloped support must follow arbitrary parent placement, beyond the existing
// translated service group. Flat basement path behavior is covered separately.
const model=new THREE.Group(),parent=new THREE.Group();model.add(parent);
parent.position.set(11,2,-9);parent.rotation.y=.73;parent.scale.set(1.2,.8,1.5);
const ramp=exterior.model.getObjectByName('Sloping service ramp').clone();ramp.visible=true;parent.add(ramp);
const surfaces=exteriorObstacles(THREE,model).walkSurfaces;
const local=new THREE.Vector3(200,1.3+(200-185.9)/33.5*(.28-1.3),-5);
const point=ramp.localToWorld(local),surface=surfaces.find(s=>obstacleContains(s,point.x,point.z,1e-7));
assert(surface);assert(Math.abs(walkSurfaceHeight(surface,point.x,point.z)-point.y)<1e-5,'Sloped support follows rotation, scale and translation');
console.log('PASS: transformed ramp support matches its actual world plane.');
