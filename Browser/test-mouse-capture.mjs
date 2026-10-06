import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';
import {createMouseCapture} from './dist/mouse-capture.mjs';

function fixture(){
 const target=new EventTarget();target.hasFocus=()=>true;target.hidden=false;
 const canvas={};let exits=0,lost=0;
 target.exitPointerLock=()=>{exits++;target.pointerLockElement=null;target.dispatchEvent(new Event('pointerlockchange'));};
 const capture=createMouseCapture(canvas,{document:target,onLost:()=>lost++});
 const lock=()=>{target.pointerLockElement=canvas;target.dispatchEvent(new Event('pointerlockchange'));};
 return {target,canvas,capture,lock,get exits(){return exits;},get lost(){return lost;}};
}
const denied=()=>new DOMException('Capture requires engagement or the Escape cooldown has not ended.','NotAllowedError');

// Resolving the Promise alone cannot resume gameplay without actual capture.
{
 const f=fixture();let ready=0;
 f.canvas.requestPointerLock=()=>Promise.resolve();f.capture.request(()=>ready++);
 await delay(0);assert.equal(ready,0);assert(f.capture.pending);
 f.target.dispatchEvent(new Event('pointerlockchange'));assert.equal(f.lost,0);
 f.lock();assert.equal(ready,1);assert(!f.capture.pending);
 f.target.exitPointerLock();assert.equal(f.lost,1);
}
// Both modern rejections and legacy error events retry, without duplicate requests.
for(const legacy of [false,true]){
 const f=fixture();let attempts=0,ready=0;
 f.canvas.requestPointerLock=()=>{
  attempts++;
  if(attempts<3){
   queueMicrotask(()=>f.target.dispatchEvent(new Event('pointerlockerror')));
   return legacy?undefined:Promise.reject(denied());
  }
  queueMicrotask(f.lock);return legacy?undefined:Promise.resolve();
 };
 await new Promise(resolve=>{
  f.capture.request(()=>{ready++;resolve();});
  f.capture.request(()=>assert.fail('A duplicate resume must not replace the pending request'));
 });
 assert.equal(attempts,3);assert.equal(ready,1);assert.equal(f.lost,0);f.capture.release();
}
// A cancelled request cannot resume or leave the pointer captured later.
{
 const f=fixture();let ready=0,resolve;
 f.canvas.requestPointerLock=()=>new Promise(r=>resolve=r);
 f.capture.request(()=>ready++);f.capture.release();f.lock();resolve();await delay(0);
 assert.equal(ready,0);assert.equal(f.target.pointerLockElement,null);assert.equal(f.exits,1);
}
// Cancelling a queued retry stops further attempts.
{
 const f=fixture();let attempts=0;
 f.canvas.requestPointerLock=()=>{attempts++;return Promise.reject(denied());};
 f.capture.request(()=>assert.fail('Cancelled capture must not resume'));await delay(0);
 f.capture.release();await delay(1500);assert.equal(attempts,1);
}
// Persistent denial has a finite deadline, then waits for a fresh user request.
{
 const f=fixture();let attempts=0,failures=0;
 f.canvas.requestPointerLock=()=>{attempts++;return Promise.reject(denied());};
 await new Promise(resolve=>f.capture.request(()=>assert.fail('Denied capture must not resume'),()=>{failures++;resolve();}));
 const stopped=attempts;assert(stopped>1&&stopped<=3);assert.equal(failures,1);assert(!f.capture.pending);
 await delay(1500);assert.equal(attempts,stopped);
 f.canvas.requestPointerLock=()=>{queueMicrotask(f.lock);return Promise.resolve();};
 await new Promise(resolve=>f.capture.request(resolve));assert.equal(f.target.pointerLockElement,f.canvas);f.capture.release();
}
// Permanent errors and inactive documents do not trigger retries.
for(const reason of ['security','hidden','focus']){
 const f=fixture();let attempts=0,failed=0;
 if(reason==='hidden')f.target.hidden=true;
 if(reason==='focus')f.target.hasFocus=()=>false;
 f.canvas.requestPointerLock=()=>{attempts++;throw new DOMException('Blocked','SecurityError');};
 f.capture.request(()=>assert.fail('Unavailable capture must not resume'),()=>failed++);
 assert.equal(failed,1);assert.equal(attempts,reason==='security'?1:0);assert(!f.capture.pending);
}
// Touch controls and environments without this API preserve their drag controls.
for(const enabled of [true,false]){
 const f=fixture();let ready=0;
 if(!enabled)f.canvas.requestPointerLock=()=>assert.fail('Touch must not request pointer lock');
 const capture=createMouseCapture(f.canvas,{enabled,document:f.target});capture.request(()=>ready++);
 assert.equal(ready,1);assert(!capture.pending);
}
console.log('PASS: confirmed capture, transient/legacy retries, duplicate resume, late/cancelled requests, finite denial, fresh retry and touch/API fallback.');
