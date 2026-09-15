import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createAerialControls,bindAerialGestures,sampleLanding} from './dist/aerial-controls.mjs';

class Canvas extends EventTarget {
  captured=new Set();
  setPointerCapture(id){this.captured.add(id);}
  hasPointerCapture(id){return this.captured.has(id);}
  releasePointerCapture(id){this.captured.delete(id);this.send('lostpointercapture',id);}
  send(type,pointerId,x=0,y=0,options={}){
    const e=new Event(type,{cancelable:true});
    Object.assign(e,{pointerId,clientX:x,clientY:y,button:0,shiftKey:false,...options});
    this.dispatchEvent(e);if(['pointerup','pointercancel','lostpointercapture'].includes(type))this.captured.delete(pointerId);return e;
  }
}
function setup(){
  const camera=new THREE.PerspectiveCamera(46,.5,.5,2000),shot=sampleLanding(0,{aspect:.5});
  camera.position.set(...shot.position);camera.lookAt(...shot.target);
  const controls=createAerialControls(camera);controls.sync(shot.target);
  const canvas=new Canvas(),gestures=bindAerialGestures(canvas,controls);
  const distance=()=>camera.position.distanceTo(new THREE.Vector3(...Object.values(controls.target)));
  return {camera,controls,canvas,gestures,distance};
}
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
{
  const {camera,canvas,distance}=setup(),initial=distance();
  canvas.send('pointerdown',1,100,200);
  canvas.send('pointerdown',2,200,200);
  canvas.send('pointermove',2,300,200);
  near(distance(),initial/2); // Spread fingers = zoom in, never orbit.
  const direction=camera.getWorldDirection(new THREE.Vector3());
  canvas.send('pointermove',2,200,200);
  near(distance(),initial);
  assert(camera.getWorldDirection(new THREE.Vector3()).distanceTo(direction)<1e-8);
  const before=camera.position.clone();
  canvas.send('pointerup',1);
  canvas.send('pointermove',2,200,200);
  assert(camera.position.distanceTo(before)<1e-8,'Lifting the first finger must not jump');
  canvas.send('pointermove',2,210,200);
  assert(camera.position.distanceTo(before)>1,'Remaining finger resumes orbit');
}
{
  const {camera,controls,canvas,gestures,distance}=setup(),initial=distance(),target=controls.target;
  canvas.send('pointerdown',1,100,100);canvas.send('pointerdown',2,100,200);
  canvas.send('pointermove',1,130,100);canvas.send('pointermove',2,130,200);
  near(distance(),initial);assert.notDeepEqual(controls.target,target,'Two fingers pan');
  canvas.send('pointerdown',3,50,50);
  const before=camera.position.clone();canvas.send('pointermove',3,500,500);
  assert(camera.position.equals(before),'Extra fingers must not disturb the pair');
  canvas.send('pointercancel',1);canvas.send('pointermove',2,130,200);
  assert(camera.position.distanceTo(before)<1e-8,'Cancellation must rebase remaining pair');
  gestures.clear();assert.equal(canvas.captured.size,0);
  const stopped=camera.position.clone();canvas.send('pointermove',2,1000,1000);
  assert(camera.position.equals(stopped),'Blur/visibility reset must stop dragging');
}
{
  const {camera,canvas,distance}=setup(),initial=distance();
  canvas.send('pointerdown',1,100,100);canvas.send('pointerdown',2,100,100);
  canvas.send('pointermove',2,200,100);
  assert(Number.isFinite(distance()),'Coincident fingers cannot cause invalid zoom');
  canvas.send('pointerup',2);
  const before=camera.position.clone();canvas.send('pointermove',1,100,100);
  assert(camera.position.distanceTo(before)<1e-8,'Lifting the second finger must not jump');
  near(distance(),initial);
  canvas.send('lostpointercapture',1);canvas.send('pointermove',1,500,500);
  assert(camera.position.distanceTo(before)<1e-8);
}
for(const options of [{button:2},{shiftKey:true}]){
  const {camera,controls,canvas,distance}=setup(),initial=distance(),target=controls.target;
  canvas.send('pointerdown',1,100,100,options);canvas.send('pointermove',1,120,110);
  assert.notDeepEqual(controls.target,target);near(distance(),initial);
  assert(Number.isFinite(camera.position.x));
}
console.log('PASS: pinch in/out, two-finger pan, finger handoff, cancellation, capture loss, blur cleanup, coincident/extra fingers, desktop pan.');
