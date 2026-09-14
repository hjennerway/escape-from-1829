import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createWalker,exteriorObstacles} from './dist/explore-controls.mjs';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {EAST_PHOTO_VIEW} from './dist/east-photo-detail.mjs';
const camera=new THREE.PerspectiveCamera(),walker=createWalker(camera);
walker.keys.add('KeyW');walker.update(.1);assert.equal(camera.position.z,39.5);
walker.keys.add('KeyD');const before=camera.position.clone();walker.update(.1);assert(Math.abs(camera.position.distanceTo(before)-.5)<1e-10,'diagonal speed stays normalized');
walker.reset();walker.look(-Math.PI/2/.002,0);walker.keys.add('KeyW');walker.update(.1);assert(camera.position.x<-.49,'movement follows mouse yaw');
walker.look(0,1e6);assert.equal(camera.rotation.x,-1.45,'mouse pitch cannot flip the camera');
walker.setView(EAST_PHOTO_VIEW);
const photoForward=new THREE.Vector3();camera.getWorldDirection(photoForward);
const photoBefore=camera.position.clone();walker.keys.add('KeyW');walker.update(.1);
assert(camera.position.clone().sub(photoBefore).dot(photoForward)>0,'walking from the photo preset follows its viewing direction');
walker.look(0,0);assert(Math.abs(camera.rotation.y)>0.1,'first mouse movement must retain the preset direction');
walker.reset();assert.equal(camera.fov,50,'return to entrance restores the original field of view');
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const exterior=createEscapeExterior(THREE,16/9),obstacles=exteriorObstacles(THREE,exterior.model),walk=createWalker(exterior.camera,obstacles);
walk.keys.add('KeyW');for(let i=0;i<100;i++)walk.update(.1);
assert(exterior.camera.position.z>23,'walking toward the entrance stops at its steps');
walk.keys.add('KeyD');for(let i=0;i<10;i++)walk.update(.1);
assert(exterior.camera.position.x>.3&&exterior.camera.position.x<.8,'the stair cheeks stop sideways movement through the masonry');
walk.keys.clear();walk.keys.add('KeyS');for(let i=0;i<6;i++)walk.update(.1);
walk.keys.clear();walk.keys.add('KeyD');for(let i=0;i<10;i++)walk.update(.1);
assert(exterior.camera.position.x>4,'the player can back out of the stair approach and walk around it');
walk.setView({position:[6,1.8,25],target:[6,1.8,19]});walk.keys.add('KeyW');for(let i=0;i<20;i++)walk.update(.1);
walk.keys.add('KeyD');for(let i=0;i<10;i++)walk.update(.1);
assert(exterior.camera.position.x>7,'the player can slide sideways along the frontage');
walk.reset();assert.equal(exterior.camera.position.z,40);assert.equal(walk.keys.size,0);
walk.keys.add('KeyW');walk.update(60);assert(exterior.camera.position.z>=39.5,'long frame cannot teleport the player');
walk.reset();exterior.camera.position.set(76,1.8,28);walk.keys.add('KeyW');
for(let i=0;i<80;i++)walk.update(.1);
assert(exterior.camera.position.z<-10,'the ground-floor bridge passage must lead all the way into the courtyard');
walk.keys.clear();walk.keys.add('KeyS');for(let i=0;i<80;i++)walk.update(.1);
assert(exterior.camera.position.z>27,'the courtyard passage is traversable back to the front lawn');
// The route passes outside the rear stair, then beside the existing garden.
function walkLeg(from,to,steps){
  walk.setView({position:[from[0],1.8,from[1]],target:[to[0],1.8,to[1]]});
  walk.keys.add('KeyW');for(let i=0;i<steps;i++)walk.update(.1);
  assert(Math.hypot(exterior.camera.position.x-to[0],exterior.camera.position.z-to[1])<.1,'courtyard route must reach the next turn without colliding');
}
for(const [from,to,steps] of [[[11,-43],[11,-34.5],17],[[11,-34.5],[9,-34.5],4],[[9,-34.5],[9,-7],55],[[9,-7],[9,-34.5],55],[[9,-34.5],[11,-34.5],4],[[11,-34.5],[11,-43],17]])walkLeg(from,to,steps);
walk.setView({position:[-48,1.8,-29],target:[-48,1.8,5]});
walk.keys.add('KeyW');for(let i=0;i<56;i++)walk.update(.1);
assert(exterior.camera.position.z> -2,'west courtyard remains accessible to the entrance apron');
walk.setView({position:[-58.4,1.8,-20],target:[-58.4,1.8,5]});
walk.keys.add('KeyW');for(let i=0;i<55;i++)walk.update(.1);
assert(exterior.camera.position.z<1,'walking must stop at the new polygonal bay');
walk.setView({position:[-60,1.8,44],target:[-60,1.8,20]});
walk.keys.add('KeyW');for(let i=0;i<60;i++)walk.update(.1);
assert(exterior.camera.position.z>19.5&&exterior.camera.position.z<21,'west front square pavilion blocks walking at its new aligned facade');
walk.setView({position:[0,1.8,-55],target:[0,1.8,-30]});
walk.keys.add('KeyW');for(let i=0;i<50;i++)walk.update(.1);
assert(exterior.camera.position.z<-39.5&&exterior.camera.position.z>-41,'shortened centre blocks walking at its corrected rear wall');
for(const x of [-10,10]){
  walk.setView({position:[x,1.8,-70],target:[x,1.8,-38]});
  walk.keys.add('KeyW');for(let i=0;i<64;i++)walk.update(.1);
  assert(exterior.camera.position.z>-39,'both rear approaches remain walkable beside the corrected centre');
}
walk.setView({position:[-49,1.8,43],target:[-35,1.8,43]});
walk.keys.add('KeyW');for(let i=0;i<40;i++)walk.update(.1);
assert(exterior.camera.position.x<-45.4,'low glazed extension must block walking through its side');
walk.setView({position:[10,1.8,-14.5],target:[28,1.8,-14.5]});
walk.keys.add('KeyW');for(let i=0;i<40;i++)walk.update(.1);
assert(exterior.camera.position.x>17.5&&exterior.camera.position.x<18.8,'new inner-east enclosure must block walking through its projecting front');
walk.setView({position:[-10,1.8,-14.5],target:[-28,1.8,-14.5]});
walk.keys.add('KeyW');for(let i=0;i<40;i++)walk.update(.1);
assert(exterior.camera.position.x< -17.5&&exterior.camera.position.x> -18.8,'reflected west projection must have matching walking collisions');
walkLeg([-11,-43],[-11,-7],72);
walkLeg([-11,-7],[-11,-43],72);
// The img19 projection stops the walker; the gravel route to Reception
// and the gap between the new handrails remain accessible.
walkLeg([-28,24.5],[-5,24.5],46);
walkLeg([-11.55,24],[-11.55,18],12);
walk.setView({position:[-27,1.8,25],target:[-27,1.8,15]});
walk.keys.add('KeyW');for(let i=0;i<30;i++)walk.update(.1);
assert(exterior.camera.position.z>20&&exterior.camera.position.z<20.5,'img19 projecting white base must block walking through it');
// Redesmere's new entrance/bays block walking, while the outside drive and
// gap in its garden railing give a continuous approach from the marked lawn.
walkLeg([105,-34],[105,22],112);
walkLeg([105,-12],[99,-12],12);
walk.setView({position:[100,1.8,.1],target:[90,1.8,.1]});
walk.keys.add('KeyW');for(let i=0;i<20;i++)walk.update(.1);
assert(exterior.camera.position.x>97.4&&exterior.camera.position.x<98,'Redesmere bay must block walking at its projecting front');
walk.setView({position:[-31,1.8,-45],target:[-31,1.8,-30]});
walk.keys.add('KeyW');for(let i=0;i<40;i++)walk.update(.1);
assert(exterior.camera.position.z< -35.5&&exterior.camera.position.z> -37,'glazed west annex must block walking at its rear wall');
// img18: walk the new approach in both directions and stop at the bay.
walkLeg([-3,35.5],[-26,35.5],46);
walkLeg([-26,35.5],[-3,35.5],46);
walk.setView({position:[-24,1.8,35.5],target:[-30,1.8,35.5]});
walk.keys.add('KeyW');for(let i=0;i<20;i++)walk.update(.1);
assert(exterior.camera.position.x>-27.2&&exterior.camera.position.x<-26.5,'img18 bay must stop the walker at its projecting face');
// Matching east approach, door handrail gap, and solid reflected bay.
walkLeg([3,35.5],[26,35.5],46);
walkLeg([26,35.5],[3,35.5],46);
walkLeg([28,24.5],[5,24.5],46);
walkLeg([11.55,24],[11.55,18],12);
walk.setView({position:[24,1.8,35.5],target:[30,1.8,35.5]});
walk.keys.add('KeyW');for(let i=0;i<20;i++)walk.update(.1);
assert(exterior.camera.position.x<27.2&&exterior.camera.position.x>26.5,'east reflected bay must block walking at the matching position');
delete globalThis.document;
console.log('PASS: exterior WASD, normalized diagonals, mouse-relative movement, pitch limits, building collisions, wall sliding, reset and stalled frames.');
