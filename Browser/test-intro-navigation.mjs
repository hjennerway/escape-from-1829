import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {sampleLanding,createAerialControls} from './dist/aerial-controls.mjs';
import {createWalker} from './dist/explore-controls.mjs';
import {createIntroFlight} from './dist/intro-navigation.mjs';

for(const aspect of [16/9,390/844])for(const mode of ['walk','aerial']){
  const camera=new THREE.PerspectiveCamera(46,aspect,.1,2000);
  const title=sampleLanding(17,{aspect,cinematic:true});
  camera.position.set(...title.position);camera.lookAt(...title.target);
  const source={position:camera.position.toArray(),quaternion:camera.quaternion.toArray(),fov:camera.fov,target:title.target};
  let walker;
  if(mode==='walk')walker=createWalker(camera);
  else{const shot=sampleLanding(0,{aspect});camera.position.set(...shot.position);camera.lookAt(...shot.target);}
  const end=camera.clone(),target=mode==='aerial'?[12,5,-12]:undefined,flight=createIntroFlight(camera,{source,target});
  assert.deepEqual(camera.position.toArray(),source.position,'Flight begins at the actual intro pose');
  const start=camera.position.clone();
  flight.update(0);assert(camera.position.equals(start),'First frame cannot jump');
  flight.update(.05);assert(camera.position.distanceTo(start)>0);assert(camera.position.distanceTo(start)<start.distanceTo(end.position)*.01,'Movement eases in');
  for(let n=0;n<23;n++)flight.update(.05);
  if(mode==='aerial'){
    const projected=new THREE.Vector3(0,10,19.8);camera.updateMatrixWorld();projected.project(camera);
    assert(Math.abs(projected.x)<.8&&Math.abs(projected.y)<.5,'The entrance stays in frame halfway through the aerial rise');
  }
  for(let n=0;n<100;n++)flight.update(.05);
  assert(!flight.active);assert(camera.position.distanceTo(end.position)<1e-9);assert(camera.quaternion.angleTo(end.quaternion)<1e-7);
  if(walker){const direction=camera.quaternion.clone();walker.look(0,0);assert(camera.quaternion.angleTo(direction)<1e-7,'Mouse look inherits the walking destination without snapping');}
  else{const controls=createAerialControls(camera);controls.sync([12,5,-12]);const position=camera.position.clone();controls.orbit(0,0);assert(camera.position.distanceTo(position)<1e-9,'Orbit inherits the aerial endpoint');}
  const reduced=createIntroFlight(camera,{source,reducedMotion:true});
  assert(camera.position.distanceTo(end.position)<1e-9,'Reduced motion skips camera travel');reduced.update(.05);assert(!reduced.active);
  const skip=createIntroFlight(camera,{source});skip.update(.1);skip.finish();assert(camera.position.distanceTo(end.position)<1e-9);assert(!skip.active);
  if(mode==='aerial'){
    const resize=createIntroFlight(camera,{source});resize.update(.1);
    const shot=sampleLanding(0,{aspect:1/aspect});camera.position.set(...shot.position);camera.lookAt(...shot.target);
    resize.retarget();assert.notDeepEqual(camera.position.toArray(),shot.position,'Resize retains the in-flight position');
    resize.finish();assert(camera.position.distanceTo(new THREE.Vector3(...shot.position))<1e-9,'Resize updates the aerial endpoint');
  }
}
console.log('PASS: desktop/portrait intro poses, smooth travel, exact walking/aerial handoffs, skip and reduced motion.');
