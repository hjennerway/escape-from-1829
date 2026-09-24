import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createWalker} from './dist/explore-controls.mjs';
import {bindExploreInput} from './dist/explore-input.mjs';

class Element extends EventTarget{
  dataset={};classes=new Set();
  classList={add:name=>this.classes.add(name),contains:name=>this.classes.has(name),toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name)};
  focus(){} setPointerCapture(){}
  send(type,options={}){const event=new Event(type,{cancelable:true});Object.assign(event,{button:0,pointerId:1,clientX:0,clientY:0,...options});this.dispatchEvent(event);return event;}
}
const canvas=new Element(),hint=new Element(),look=new Element(),nav=new Element(),timeline=new Element();
const buttons=['KeyW','KeyA','KeyS','KeyD'].map(key=>{const button=new Element();button.dataset.key=key;return button;});
globalThis.window=new Element();globalThis.document=new Element();document.body=new Element();
document.querySelectorAll=()=>[nav,timeline];
globalThis.matchMedia=()=>Object.assign(new Element(),{matches:true});
const camera=new THREE.PerspectiveCamera(),walker=createWalker(camera);
const input=bindExploreInput(walker,{canvas,hint,look,touchControls:{querySelectorAll:()=>buttons}});
assert(document.body.classList.contains('explore-touch'),'touch controls are detected');
assert(!input.active);
buttons[0].send('pointerdown');walker.update(.1);
assert.equal(camera.position.z,39.5,'touch starts walking without pointer lock or the Start button');
canvas.send('pointerdown',{pointerId:2,clientX:200});
canvas.send('pointermove',{pointerId:2,clientX:300});
assert(camera.rotation.y<0,'a second finger can look while walking');
canvas.send('pointerup',{pointerId:9});
canvas.send('pointermove',{pointerId:2,clientX:400});
assert(camera.rotation.y<-.3,'unrelated pointers cannot end the look gesture');
canvas.send('pointercancel',{pointerId:2});
assert(walker.keys.has('KeyW'),'ending the look gesture preserves the movement finger');
buttons[0].send('pointerup');assert.equal(walker.keys.size,0);
walker.reset();
buttons[0].send('pointerdown');buttons[3].send('pointerdown',{pointerId:3});
const before=camera.position.clone();walker.update(.1);
assert(Math.abs(camera.position.distanceTo(before)-.5)<1e-10,'touch diagonals retain normal speed');
buttons[0].send('pointercancel');assert.deepEqual([...walker.keys],['KeyD']);
buttons[3].send('lostpointercapture',{pointerId:3});assert.equal(walker.keys.size,0);
buttons[0].send('pointerdown');document.send('keydown',{code:'KeyW'});
buttons[0].send('pointerup');assert(walker.keys.has('KeyW'),'touch release preserves a held physical key');
document.send('keyup',{code:'KeyW'});assert.equal(walker.keys.size,0);
for(const [target,event,options] of [[window,'blur',{}],[timeline,'pointerdown',{}],[nav,'focusin',{}],[document,'keydown',{code:'Escape'}]]){
  buttons[0].send('pointerdown');target.send(event,options);
  assert(!input.active);assert.equal(walker.keys.size,0);assert(!buttons[0].classList.contains('held'));
}
buttons[0].send('pointerdown');document.hidden=true;document.send('visibilitychange');
assert(!input.active);assert.equal(walker.keys.size,0);document.hidden=false;
canvas.send('pointerdown',{pointerType:'mouse'});document.send('keydown',{code:'KeyW'});walker.update(.1);
assert(input.active&&walker.keys.has('KeyW'),'desktop drag and keyboard movement still work');
console.log('PASS: touch movement, simultaneous look, normalized diagonals, pointer identity/cancellation/capture loss, keyboard coexistence and pause cleanup.');
