import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,moveAsylumActor,flatWalkable,insidePolygon} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture,asylumWallSurfaces} from './dist/asylum-architecture.mjs';
const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
const floors=buildAsylumLayout(plan).floors,floor=floors[2],scene=new THREE.Scene();
buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
assert.equal(scene.getObjectByName('Asylum Glass').count,12,'Six basement sashes on each side');
const ray=new THREE.Raycaster();let panes=0;
for(const [pair,zs] of [[1,[-22,-18.1]],[3,[-14.2,-10.3]],[5,[-6.4]],[7,[-2.5]]])for(const side of [0,1]){
 const id='B'+(pair+side),room=floor.rooms.find(r=>r.id===id),windows=floor.windows.filter(w=>w.roomId===id);
 assert.deepEqual(windows.map(w=>w.z),zs,`${id} follows the rear-to-front 2,2,1,1 schedule`);
 const direction=side?1:-1,wallX=side?-24.7:-37,door=floor.doorways.find(d=>d.roomId===id);
 const actor={x:-31.1,z:door.z,y:floor.elevation,floor:2};
 moveAsylumActor(floors,actor,(side?-28.7:-33.5)-actor.x,0);
 assert(Math.abs(actor.x-(side?-28.7:-33.5))<1e-5,'Every room retains a traversable corridor doorway');
 for(const w of windows){
  assert.equal(w.x,wallX,'Sashes remain on the outer room wall');
  for(const dz of [-.65,0,.65])assert(insidePolygon(w.x-direction*.2,w.z+dz,room.points),'Whole sash lies inside its assigned room span');
  for(const zOffset of [-.46,0,.46])for(let row=0;row<6;row++){
   ray.set(new THREE.Vector3(actor.x,w.sill+w.height*(row+.5)/6,w.z+zOffset),new THREE.Vector3(direction,0,0));ray.far=8;
   assert.equal(ray.intersectObjects(scene.children,false)[0]?.object.name,'Asylum Glass',`${id} has an unobstructed pane from inside`);panes++;
  }
  for(const [y,kind] of [[.13,'Skirting'],[.4,'Brick'],[2.75,'Plaster']]){
   ray.set(new THREE.Vector3(w.x-direction*.5,y,w.z),new THREE.Vector3(direction,0,0));ray.far=.7;
   assert.equal(ray.intersectObjects(scene.children,false)[0]?.object.name,'Asylum '+kind,'Masonry above/below and continuous skirting frame the opening');
  }
  assert(!flatWalkable(floor,w.x,w.z),'Window wall still blocks walking');
  assert(!asylumWallSurfaces(floor).some(s=>!s.window&&Math.hypot(s.x-w.x,s.z-w.z)<.8),'Artwork cannot cover the room windows');
 }
}
assert.deepEqual(plan,JSON.parse(await readFile(new URL('../Research/1829-interior-proposal/plan-data.json',import.meta.url))),'Browser and reviewed plans agree');
console.log(`PASS: 12 basement sashes, 2/2/1/1 per side from rear to front, ${panes} visible panes, all eight room doors, solid surrounds/skirting and collision.`);
