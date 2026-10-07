import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
import {stairRoute} from './dist/asylum-stairs.mjs';
import {asylumStairSigns,STAIR_SIGN_DEPTH} from './dist/asylum-stair-signs.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))),before=JSON.stringify(plan),floors=buildAsylumLayout(plan).floors;
let mounts=0,landings=0;
for(const floor of floors){
 const signs=asylumStairSigns(floor),scene=new THREE.Group();buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
 const mesh=scene.getObjectByName('Asylum StairFloorSigns');assert.deepEqual(mesh.userData.labels,signs);
 assert.equal(signs.length,[4,5,2,2][floor.id]);assert(signs.every(s=>s.text===['Ground Floor','First Floor','Basement','Second Floor'][floor.id]));
 for(const stair of floor.stairs)for(const pair of stair.connections.filter(c=>c.includes(floor.id))){
  const route=stairRoute(stair,floors[pair[0]].elevation,floors[pair[1]].elevation,...pair),portal=pair[0]===floor.id?route[0]:route.at(-1);
  assert(signs.some(s=>s.stairId===stair.id&&Math.hypot(portal[0]-s.x,portal[2]-s.z)<3.4),'Every actual stair landing has a nearby current-floor sign');landings++;
 }
 const plaster=scene.getObjectByName('Asylum Plaster');
 for(const sign of signs){
  const normal=new THREE.Vector3(Math.sin(sign.rotation),0,Math.cos(sign.rotation)),tangent=new THREE.Vector3(Math.cos(sign.rotation),0,-Math.sin(sign.rotation));
  for(const u of [-.45,0,.45])for(const v of [-.4,0,.4]){
   const center=new THREE.Vector3(sign.x,sign.y+v*sign.height,sign.z).addScaledVector(tangent,u*sign.width);
   const front=center.clone().addScaledVector(normal,STAIR_SIGN_DEPTH/2+.05),ray=new THREE.Raycaster(front,normal.clone().negate(),0,.07),hit=ray.intersectObject(mesh)[0];
   assert(hit,'Readable face exists across the whole plaque');assert(Math.abs(hit.distance-.05)<1e-5);assert(hit.face.normal.dot(normal)>.99);
   ray.set(center.clone().addScaledVector(normal,-STAIR_SIGN_DEPTH/2),normal.clone().negate());ray.far=.005;
   assert(ray.intersectObject(plaster)[0],'The complete board is fixed to masonry with a small physical clearance');mounts++;
  }
  assert(sign.y-sign.height/2>1.52,'Boards sit above the handrails and dado');
 }
}
assert.equal(JSON.stringify(plan),before,'The shared walking and stair plans remain unchanged');
console.log(`PASS: 13 aged current-floor plaques cover ${landings} landing approaches on all four floors; ${mounts} readable-face and masonry-mount probes; unchanged navigation plan.`);
