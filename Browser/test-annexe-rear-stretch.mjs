import {ANNEXE_REAR_WEST_SHIFT,ANNEXE_REAR_HEAD_SHIFT} from './dist/annexe-rear-side-alignment.mjs';
import assert from 'node:assert/strict';
import {ANNEXE_EAST_FRONT_SHIFT,isAnnexeEastFrontRange} from './dist/annexe-front-links.mjs';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {ANNEXE_MAP_SCALE,ANNEXE_VIEWS,annexePoint,ANNEXE} from './dist/annexe.mjs';
import {rearStretchSnapshot} from './artifacts/annexe-rear-stretch-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const before=JSON.parse(readFileSync(new URL('../Research/annexe-kitchen/rear-stretch-before.json',import.meta.url)));
const annexe=createEscapeExterior(THREE,1.5).annexe,after=rearStretchSnapshot(THREE,annexe);
assert.deepEqual(after.front,before.front,'All front geometry and unaffected wards remain unchanged');
assert.deepEqual(after.root.map(n=>n===0?0:n),before.root,'The front and current whole-building centring stay fixed');
assert.deepEqual(after.wings,before.wings,'The two rear blocks translate without changing their geometry');
const anchor=-20*ANNEXE_MAP_SCALE,shift=-24*.43125*ANNEXE_MAP_SCALE;
for(const original of before.ranges){
 if(original.name==='Rear service court link'){assert(!after.ranges.some(b=>b.name===original.name));continue;}
 const b=after.ranges.find(b=>b.name===original.name),sideShift=b.name==='Rear court west range'?[ANNEXE_REAR_WEST_SHIFT,0]:['Rear west angled service range','Rear service head'].includes(b.name)?ANNEXE_REAR_HEAD_SHIFT:[0,0];
 assert(b,original.name);assert.equal(b.w,original.w,original.name+' width');assert.equal(b.h,original.h,original.name+' height');assert.equal(b.x,original.x+sideShift[0]*ANNEXE_MAP_SCALE+(isAnnexeEastFrontRange(b.name)?ANNEXE_EAST_FRONT_SHIFT*ANNEXE_MAP_SCALE:0),original.name+' sideways position after the later corridor restoration');
 const court=b.name.startsWith('Rear court '),moved=['Rear west angled service range','Rear service head','Rear east connecting range','Rear east end pavilion','Rear service court link'].includes(b.name);
 assert(Math.abs(b.d-original.d*(court?1.43125:1))<1e-9,b.name+' depth');
 const expectedZ=court?anchor+(original.z-anchor)*1.43125:original.z+(moved?shift:0);
 assert(Math.abs(b.z-expectedZ-sideShift[1]*ANNEXE_MAP_SCALE)<1e-9,b.name+' rearward position');
}
const west=annexe.userData.ranges.find(b=>b.name==='Rear court west range'),link=annexe.userData.ranges.find(b=>b.name==='Rear service court link');
assert(!link,'Later green-circle correction removes the connector');
assert(Math.abs(west.z+west.d/2-anchor)<1e-9,'Court-to-spine join stays fixed');
const view=ANNEXE_VIEWS['annexe-rear-court'],camera=new THREE.PerspectiveCamera(view.fov,1099/841,.1,2000);
// Compare the historical pixel guide in its original plan scale. The later
// whole-annexe road fit changes the site scale, not this accepted rear geometry.
const referenceScale=.648;
camera.position.set(-1.631612*referenceScale,107.569876,-67.68697*referenceScale);
camera.lookAt(-2.071306*referenceScale,0,-51.17476*referenceScale);camera.updateMatrixWorld();
const rearEdge=new THREE.Vector3(-ANNEXE_MAP_SCALE*referenceScale,8.4*ANNEXE.verticalScale,(west.z-west.d/2)*referenceScale).project(camera);
const pixelY=(1-rearEdge.y)*841/2;
assert(Math.abs(pixelY-642)<4,'Rear eave aligns with the yellow guide at about y=642 in the 1099 x 841 reference');
assert(Math.abs((west.z-west.d/2)/ANNEXE_MAP_SCALE+54.35)<1e-9,'Reference sets the rear wall at map z=-54.35');
console.log('PASS: rear wall aligned with the yellow guide, fixed widths/heights/front/centring, unchanged rear block shapes, later connector removal; rear shift '+(-shift*ANNEXE.scale).toFixed(3)+' m.');
