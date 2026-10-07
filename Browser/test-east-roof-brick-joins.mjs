import assert from 'node:assert/strict';
import * as T from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
let exterior;
if(process.argv.includes('--compiled')){
 const {readFile}=await import('node:fs/promises'),{gunzipSync}=await import('node:zlib');
 const {decodeModel}=await import('./dist/model-binary.mjs'),{restoreAerialScene}=await import('./dist/aerial-scene.mjs'),{modelSourceHash}=await import('./model-build-inputs.mjs');
 const manifest=JSON.parse(await readFile(new URL('./dist/compiled/manifest.json',import.meta.url),'utf8'));
 assert.equal(manifest.sourceHash,await modelSourceHash(),'Rebuild the compiled roof after source edits');
 const raw=gunzipSync(await readFile(new URL('./dist/compiled/'+manifest.file,import.meta.url)));
 ({exterior}=restoreAerialScene(T,decodeModel(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength)),1800/895));
}else exterior=createEscapeExterior(T,1800/895);
const {model,camera}=exterior;model.updateMatrixWorld(true);
const roof=model.getObjectByName('Entrance east recessed slate roof').material,parts=[],slate=[],ray=new T.Raycaster();
model.traverse(o=>{if(o.isMesh){parts.push(o);if(o.material===roof)slate.push(o);}});
camera.position.set(12,32,16);camera.lookAt(42,13,12);camera.fov=47;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
// Registered pixels from the supplied viewing direction. Vertical roof rays
// alone missed the brick visible through the original tiny canted seam.
let visible=0;
for(const [x,y] of [[780,385],[900,392],[1000,398],...[978,980,982].flatMap(x=>[688,690,692].map(y=>[x,y]))]){
 ray.setFromCamera(new T.Vector2(x/900-1,1-y/447.5),camera);
 const hit=ray.intersectObjects(parts,false)[0];
 if(x===780&&y===385){
  // The later orange cut deliberately exposes its closed vertical abutment.
  assert.equal(hit?.object.name,'East court stepped abutment brick');
  assert(Math.abs(hit.point.x-44.7)<.00001);
 }else assert(hit?.object.material===roof,'The marked roof pixel has slate ahead of brick: '+[x,y,hit?.object.name]);visible++;
}
const top=(x,z)=>{ray.far=Infinity;ray.set(new T.Vector3(x,30,z),new T.Vector3(0,-1,0));const h=ray.intersectObjects(slate,false)[0];assert(h&&h.face.normal.y>0,'Upward roof coverage at '+[x,z]);return h.point.y;};
let seams=0;
for(const z of [6.601,8,10,12,14,16,17.399]){
 assert(Math.abs(top(37.9999,z)-top(38.0001,z))<.001,'The extension meets the retained entrance pitches');seams++;
}
for(const x of [38,40,42,44,46,48])assert(Math.abs(top(x,12)-15.66)<.00001,'The retained entrance crown extends into the taller roof');
// October 7 supersedes the taller disconnected crown: all marked branches
// continue the existing red ridge at one level.
for(const x of [49,52,54,56,59.8,62,65,66.7])assert(Math.abs(top(x,12)-15.66)<.00001,'The entrance crown continues through the eastern cross-range');
for(const [x,a,b] of [[53.1,12,20.1],[59.8,2.6,12],[66.7,6.6,22.3]])for(let z=a+.01;z<b;z+=.2){
 assert(Math.abs(top(x,z)-15.66)<.00001,'Yellow branch ridges share the red ridge height');
 assert(top(x-.01,z)<15.66&&top(x+.01,z)<15.66,'Both sides fall away from each ridge');
}
for(const [a,b] of [[[44.7,6.6],[49.5,12]],[[44.7,4.1],[49.5,12]],[[40.6,17.4],[46,12]],[[40.6,19.9],[49.5,12]],[[49.5,12],[66.7,12]],[[53.1,12],[50.532,19.9]],[[59.8,12],[56.1085,4.1]],[[59.8,12],[63.65,4.1]],[[66.7,12],[61.85,19.9]]]){
 const length=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=(b[1]-a[1])/length*.0001,nz=-(b[0]-a[0])/length*.0001;
 for(let t=.05;t<1;t+=.05){const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
  assert(Math.abs(top(x+nx,z+nz)-top(x-nx,z-nz))<.001,'Roof pitches share their whole seam: '+[x,z]);seams++;
 }
}
for(const x of [44.85,45.1])for(const z of [7,8,10,12,14,16]){
 ray.set(new T.Vector3(x,30,z),new T.Vector3(0,-1,0));
 assert(!ray.intersectObjects(slate,false).some(h=>h.point.y>14.3101&&h.point.y<14.5299),'Slate does not cross the taller cornice');
 assert(top(x,z)>14.53,'The previously exposed brick lies below slate');
}
// Horizontal rays from outside must hit the complete rising walls, including
// their upper render strip. A roof backing above a hole cannot satisfy these.
let walls=0;
for(const [z,sign,end] of [[17.4,1,40.6]])for(let x=38.15;x<end-.05;x+=.13){
 const roofY=top(x,z-sign*.00001);
 for(const y of [13.04+(roofY-13.04)*.5,roofY-.025]){
  ray.set(new T.Vector3(x,y,z+sign*.3),new T.Vector3(0,0,-sign));ray.far=.301;
  const hits=ray.intersectObjects(parts,false),h=hits[0];
  assert(h?.object.name.startsWith('East entrance rising '),'Opaque outward-facing wall/render below each rising eave: '+[x,y,z]);walls++;
  assert(hits.filter(other=>Math.abs(other.distance-h.distance)<.00001).every(other=>other.object.material===h.object.material),
   'No competing white fascia over the brick/render closure at '+[x,y,z]);
 }
}
ray.far=Infinity;
// Orange-cut correction: the lower patch is exactly coplanar with the purple
// entrance face, while the retained upper triangle keeps its previous plane.
const lowerY=z=>13.06+(z-6.6)*2.6/5.4;
const upperY=(x,z)=>13.06+(x-38)*1.49/6.7+(z-6.6)*(2.6-11.5*1.49/6.7)/5.4;
let lowerSamples=0,upperSamples=0,stepSamples=0;
for(let x=38.05;x<44.7;x+=.21)for(let z=6.61;z<11.99;z+=.19){
 assert(Math.abs(top(x,z)-lowerY(z))<.00002,'The lowered patch matches the adjoining entrance pitch: '+[x,z]);lowerSamples++;
}
for(let x=44.75;x<49.5;x+=.17){
 const near=6.6+(x-44.7)*5.4/4.8,far=6.6+(x-38)*5.4/11.5;
 for(const t of [.05,.25,.5,.75,.95]){
  const z=near+(far-near)*t;
  assert(Math.abs(top(x,z)-upperY(x,z))<.00002,'Upper side of the orange cut retains its original slope and height');upperSamples++;
 }
}
for(let z=6.65;z<9.74;z+=.07){
 const low=lowerY(z),high=upperY(44.7,z);
 for(const t of [.02,.25,.5,.75,.98]){
  ray.set(new T.Vector3(44.4,low+(high-low)*t,z),new T.Vector3(1,0,0));ray.far=.3001;
  const hits=ray.intersectObjects(parts,false),h=hits[0];
  assert(h?.object.name.startsWith('East court stepped abutment '),'The whole split has opaque brick/render down to the lower roof: '+JSON.stringify({z,t,name:h?.object.name,distance:h?.distance}));
  assert(hits.filter(other=>Math.abs(other.distance-h.distance)<.00001).every(other=>other.object.material===h.object.material),'No competing trim along the split');stepSamples++;
 }
}
ray.far=Infinity;
// Timeline splitting can retain several fragments with the same source name.
const rebuiltNames=['Entrance east recessed slate roof','Redesmere aligned frontage slate roof','East courtyard polygonal bay slate roof','East curved bay slate roof','Garden pavilion slate roof','East courtyard fire-exit corner slate roof'];
const rebuilt=parts.filter(o=>rebuiltNames.includes(o.name));
let coverage=0;
for(let x=44.713;x<70.14;x+=.173)for(let z=.91;z<25.39;z+=.179){
 ray.set(new T.Vector3(x,30,z),new T.Vector3(0,-1,0));const hits=ray.intersectObjects(rebuilt,false);
 const levels=hits.map(h=>h.point.y).filter((h,i,a)=>!i||Math.abs(h-a[i-1])>.0001);
 assert(levels.length<2,'No overlapping roof pitches at '+[x,z]);
 if(x<62&&z>4.15&&z<19.85)assert(hits.length,'Continuous cross-range roof coverage at '+[x,z]);
 coverage++;
}
console.log('PASS: '+visible+' viewing rays, '+seams+' shared roof contacts, '+walls+' garden wall/render contacts, '+coverage+' coverage/overlap probes, '+lowerSamples+' matched lower pitches, '+upperSamples+' retained upper pitches and '+stepSamples+' closed step contacts.');
