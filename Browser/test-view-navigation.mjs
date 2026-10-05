import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createAerialControls} from './dist/aerial-controls.mjs';
import {readViewLocation,cameraLocation,viewLocationURL,aerialLocationView,groundLocationView,viewLighting} from './dist/view-navigation.mjs';

const base='https://example.test/game/aerial.html?view=church&intro=1';
for(const heading of [0,Math.PI/2,-Math.PI/2,Math.PI,-2.4])for(const aspect of [16/9,390/844]){
  const location={x:123.456789,z:-42.125,heading};
  const url=viewLocationURL('./explore.html',location,{base,period:2021,lighting:'night'});
  assert.equal(url.pathname,'/game/explore.html');
  assert.deepEqual(readViewLocation(url.search),location);
  assert.equal(url.searchParams.get('period'),'2021');assert.equal(url.searchParams.get('lighting'),'night');
  assert(!url.searchParams.has('view')&&!url.searchParams.has('intro'),'A preset/intro cannot override the live location');
  const shot=aerialLocationView(location,{aspect}),camera=new THREE.PerspectiveCamera(shot.fov,aspect,.1,2000);
  camera.position.set(...shot.position);camera.lookAt(...shot.target);
  camera.updateMatrixWorld();
  const groundPoint=new THREE.Vector3(location.x,0,location.z).project(camera);
  assert(Math.abs(groundPoint.y)<.9,'The current ground location remains visible after rising');
  const controls=createAerialControls(camera);controls.sync(shot.target);
  const start=camera.position.clone();controls.orbit(0,0);
  assert(camera.position.distanceTo(start)<1e-8,'Aerial control handoff retains the location');
  const next=cameraLocation(camera);
  assert(Math.abs(next.x-location.x)<1e-8&&Math.abs(next.z-location.z)<1e-8);
  assert(Math.abs(Math.sin(next.heading-heading))<1e-8,'Facing survives the aerial tilt');
  const ground=groundLocationView(next,{heightAt:()=>-2,clear:()=>true});
  assert(Math.abs(ground.position[0]-location.x)<1e-8&&Math.abs(ground.position[2]-location.z)<1e-8);
  assert(Math.abs(ground.position[1]+.2)<1e-8,'The drop uses the destination ground support');
}
for(const at of ['', '1,2', '1,2,', ' ,2,0', 'NaN,2,0', 'Infinity,2,0', '100001,2,0', '1,2,0,4'])assert.equal(readViewLocation('?at='+at),null);
assert.equal(viewLighting('?lighting=night','day'),'night');assert.equal(viewLighting('?lighting=unknown','dusk'),'dusk');
const outside={heightAt:()=>0,clear:(x,z)=>Math.hypot(x,z)>2};
const nearby=groundLocationView({x:0,z:0,heading:0},outside);
assert(nearby&&Math.hypot(nearby.position[0],nearby.position[2])>2&&Math.hypot(nearby.position[0],nearby.position[2])<=2.5,'Blocked drops find nearby clearance');
assert.equal(groundLocationView({x:0,z:0,heading:0},{heightAt:()=>0,clear:()=>false}),null,'No clear point is reported as a valid landing');
console.log('PASS: live-location URLs, facing, aerial handoff, ground support, blocked drops and invalid links.');
