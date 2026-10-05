import assert from 'node:assert/strict';
import * as T from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model,camera}=createEscapeExterior(T,1800/895);model.updateMatrixWorld(true);
const roof=model.getObjectByName('Entrance east recessed slate roof').material,parts=[],slate=[],ray=new T.Raycaster();
model.traverse(o=>{if(o.isMesh){parts.push(o);if(o.material===roof)slate.push(o);}});
camera.position.set(12,32,16);camera.lookAt(42,13,12);camera.fov=47;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
// Registered pixels from the supplied viewing direction. Vertical roof rays
// alone missed the brick visible through the original tiny canted seam.
let visible=0;
for(const [x,y] of [[780,385],[900,392],[1000,398],...[978,980,982].flatMap(x=>[688,690,692].map(y=>[x,y]))]){
 ray.setFromCamera(new T.Vector2(x/900-1,1-y/447.5),camera);
 const hit=ray.intersectObjects(parts,false)[0];
 assert(hit?.object.material===roof,'The marked roof pixel has slate ahead of brick: '+[x,y,hit?.object.name]);visible++;
}
const top=(x,z)=>{ray.set(new T.Vector3(x,30,z),new T.Vector3(0,-1,0));const h=ray.intersectObjects(slate,false)[0];assert(h&&h.face.normal.y>0,'Upward roof coverage at '+[x,z]);return h.point.y;};
let seams=0;
for(const z of [6.601,8,10,12,14,16,17.399]){
 assert(Math.abs(top(37.9999,z)-top(38.0001,z))<.001,'The extension meets the retained entrance pitches');seams++;
}
for(const x of [38,40,42,44,46,48])assert(Math.abs(top(x,12)-15.66)<.00001,'The retained entrance crown extends into the taller roof');
for(const x of [52,54,56])assert(Math.abs(top(x,12)-16.2)<.00001,'The taller range crown retains its height');
const end=[44.7+(15.66-14.55)*(51.257-44.7)/(16.2-14.55),12];
for(const [a,b] of [[[44.7,6.6],end],[end,[44.7,16.6]],[[44.7,16.6],[40.6,16.6]],[[40.6,16.6],[40.6,17.4]]]){
 const length=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=(b[1]-a[1])/length*.0001,nz=-(b[0]-a[0])/length*.0001;
 for(let t=.05;t<1;t+=.05){const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
  assert(Math.abs(top(x+nx,z+nz)-top(x-nx,z-nz))<.001,'Both roofs share their complete stepped seam: '+[x,z]);seams++;
 }
}
for(const x of [44.85,45.1])for(const z of [7,8,10,12,14,16]){
 ray.set(new T.Vector3(x,30,z),new T.Vector3(0,-1,0));
 assert(!ray.intersectObjects(slate,false).some(h=>h.point.y>14.3101&&h.point.y<14.5299),'Slate does not cross the taller cornice');
 assert(top(x,z)>14.53,'The previously exposed brick lies below slate');
}
console.log('PASS: '+visible+' formerly exposed viewing rays, '+seams+' shared roof contacts, retained crowns and clear upper cornice.');
