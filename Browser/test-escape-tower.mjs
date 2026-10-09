import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {batchAerialMeshes,cacheAerialTransforms} from './dist/aerial-performance.mjs';
import {createAsylumOutside} from './dist/asylum-outside.mjs';
import {createEscapeGrounds} from './dist/escape-grounds.mjs';
import {createEscapeProgress} from './dist/escape-progress.mjs';
import {buildAsylumLayout} from './dist/asylum-layout.mjs';
import {TOWER_CLIMB as P,TOWER_WINDOWS,TOWER_FLIGHTS,TOWER_FACES} from './dist/escape-tower-plan.mjs';
import {WORKSHOP_DOOR_SECONDS} from './dist/tower-workshops.mjs';
import {createTowerAudio} from './dist/tower-audio.mjs';
// Muting/suspension creates no scheduled echoes; stopping cancels pending
// sounds as well as the first note when the notebook or pause opens.
let audible=true;const oscillators=[],parameter={setValueAtTime(){},exponentialRampToValueAtTime(){}};
const audioContext={state:'running',currentTime:0,destination:{},createGain:()=>({gain:parameter,connect(){},disconnect(){}}),createOscillator(){const o={frequency:parameter,connect(){},disconnect(){},start(){},stop(at){if(at===undefined)this.cancelled=true;}};oscillators.push(o);return o;}};
const audio=createTowerAudio({getContext:()=>audioContext,enabled:()=>audible});
audio.play('drip');assert(oscillators.length>1,'A drop has delayed echoes');audio.stop();assert(oscillators.every(o=>o.cancelled));
const soundsBefore=oscillators.length;audible=false;audio.play('yard');assert.equal(oscillators.length,soundsBefore);audible=true;audioContext.state='suspended';audio.play('step');assert.equal(oscillators.length,soundsBefore);
const context=new Proxy({},{get:(_,key)=>key==='measureText'?text=>({width:text.length*16}):/Gradient$/.test(key)?()=>({addColorStop(){}}):()=>{}});
globalThis.document={createElement:()=>({getContext:()=>context})};
const floors=buildAsylumLayout(JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)))).floors;
const exterior=createEscapeExterior(THREE,1.5);createAerialLayouts(THREE,exterior);batchAerialMeshes(THREE,exterior.model);cacheAerialTransforms(exterior.scene);
const walker=createAsylumOutside(THREE,exterior);
function snapshot(){const rows=[];exterior.model.traverse(o=>{if(!o.isMesh)return;const h=createHash('sha256');for(const a of [...Object.values(o.geometry.attributes),o.geometry.index,o.instanceMatrix].filter(Boolean))h.update(new Uint8Array(a.array.buffer,a.array.byteOffset,a.array.byteLength));rows.push([o.uuid,o.parent.uuid,o.visible,!!o.userData.aerialBatchSource,o.geometry.uuid,h.digest('hex'),o.matrix.toArray(),o.userData.noWalkingCollision]);});return rows.sort((a,b)=>a[0].localeCompare(b[0]));}
const original=snapshot();
function facade(side,u,y){
 const {ux,uz,nx,nz}=TOWER_FACES[side];
 const ray=new THREE.Raycaster(new THREE.Vector3(P.x+ux*u+nx*7,y,P.z+uz*u+nz*7),new THREE.Vector3(-nx,0,-nz),0,2.2),meshes=[];
 exterior.waterTower.traverse(o=>{if(o.isMesh&&o.visible&&!o.userData.aerialBatchSource)meshes.push(o);});
 const hit=ray.intersectObjects(meshes,false)[0];return hit?{point:hit.point.toArray(),material:(Array.isArray(hit.object.material)?hit.object.material[hit.face.materialIndex]:hit.object.material).uuid}:null;
}
const probes=[];
for(const side of Object.keys(TOWER_FACES))for(const y of [21.8,24.8,27.35,28.1,28.6,28.9,29.6])for(const u of [-2.3,-1.4,-.91,-.6,0,.6,.91,1.4,2.3]){
 if(TOWER_WINDOWS.some(w=>w.side===side&&Math.abs(u-w.u)<w.width/2&&y>=w.bottom&&y<=w.spring+w.radius))continue;
 const before=facade(side,u,y);assert(before);probes.push({side,u,y,before});
}
for(const oil of [false,true]){
 const notes=[],sounds=[],creaks=[],progress=createEscapeProgress({seed:1829,floors,journal:{recordEvidence:n=>notes.push(n)}}),run=progress.run;
 const grounds=createEscapeGrounds(THREE,exterior,walker,progress,{noise:(...n)=>{sounds.push(n);return true;},creak:n=>creaks.push(n)}),tower=grounds.tower;
 assert(tower);const hatch=tower.nodes.find(n=>n.id==='tower-hatch'),lookout=tower.nodes.find(n=>n.id==='tower-lookout');
 // Lighting must stay continuous at the former nearest-landing switch and
 // when physical treads change the player's height in discrete increments.
 const fills=tower.group.children.filter(o=>o.isPointLight),lightingActor={x:P.x,z:P.z,y:P.base,outside:true};
 assert.equal(fills.length,2);assert(fills.every(l=>l.visible&&!l.castShadow&&l.matrixAutoUpdate));
 const brightness=()=>fills.reduce((s,l)=>s+l.intensity,0);
 const lightingSnapshot=()=>fills.map(l=>({intensity:l.intensity,position:l.position.toArray()}));
 const settle=()=>{for(let i=0;i<180;i++)tower.update(1/60,lightingActor);};
 tower.update(1/60,lightingActor);assert(brightness()>0&&brightness()<2,'Entry begins with a fade');
 const entry=lightingSnapshot();tower.update(0,lightingActor);assert.deepEqual(lightingSnapshot(),entry,'Zero elapsed time freezes the fade');
 settle();assert(Math.abs(brightness()-14)<.001);
 for(let flight=0;flight<P.flights;flight++){
  lightingActor.y=P.base+(flight+.499)*P.rise;settle();const before=fills.map(l=>l.intensity);
  lightingActor.y=P.base+(flight+.501)*P.rise;settle();
  assert(fills.every((l,i)=>Math.abs(l.intensity-before[i])<.05),'No light switch at any flight midpoint');
  assert(fills.every(l=>l.intensity>6.9&&l.intensity<7.1),'Both adjacent lamps illuminate the middle of a flight');
 }
 lightingActor.y=P.base;settle();let previous=lightingSnapshot(),maxChange=0;
 for(const direction of [1,-1])for(let step=0;step<=P.flights*P.steps;step++){
  const tread=direction===1?step:P.flights*P.steps-step;lightingActor.y=P.base+tread*P.rise/P.steps;
  for(let frame=0;frame<8;frame++){
   tower.update(1/60,lightingActor);const next=lightingSnapshot();
   for(let i=0;i<fills.length;i++){
    maxChange=Math.max(maxChange,Math.abs(next[i].intensity-previous[i].intensity));
    if(next[i].position.some((v,j)=>v!==previous[i].position[j]))assert(Math.max(next[i].intensity,previous[i].intensity)<.1,'A recycled light is dark before changing fixtures');
   }
   assert(Math.abs(brightness()-14)<.001,'Handoffs retain the total light output');previous=next;
  }
 }
 assert(maxChange<.4,'No sudden brightness jump while ascending or descending: '+maxChange);
 lightingActor.y=P.top;settle();assert(Math.max(...fills.map(l=>l.intensity))>13.99,'Lookout lamp reaches full brightness');
 lightingActor.outside=false;tower.update(1/60,lightingActor);assert(brightness()>12&&brightness()<14,'Exit fades instead of switching off');settle();assert.equal(brightness(),0);
 // Equal elapsed time should give the same fade at 30 and 120 fps.
 const frameResults=[];
 for(const fps of [30,120]){lightingActor.outside=true;for(let i=0;i<fps*.5;i++)tower.update(1/fps,lightingActor);frameResults.push(brightness());lightingActor.outside=false;settle();}
 assert(Math.abs(frameResults[0]-frameResults[1])<1e-8);
 for(const {side,u,y,before} of probes){const after=facade(side,u,y);assert(after,'Existing masonry removed: '+JSON.stringify({side,u,y}));assert.equal(after.material,before.material);assert(new THREE.Vector3(...after.point).distanceTo(new THREE.Vector3(...before.point))<.0001,'Original facade position retained');}
 for(const side of Object.keys(TOWER_FACES)){
  const upper=TOWER_WINDOWS.filter(w=>w.side===side&&w.radius);assert.equal(upper.length,6,'Three pairs per face');assert.equal(new Set(upper.map(w=>w.bottom)).size,3);
 }
 for(const w of TOWER_WINDOWS){assert.equal(facade(w.side,w.u,w.bottom+.7),null,'Only the existing window infill opens');if(w.radius){assert.equal(facade(w.side,w.u,w.spring+.15),null,'Rounded head is open');assert(facade(w.side,w.u+.18,w.spring+.15),'Masonry beside rounded head remains');}}
 assert(!walker.clear(P.x,P.z+5.1,.2),'Hatch physically blocks entry');
 const pivot=tower.group.getObjectByName('Freed tower maintenance door');
 // Probe the former side gaps from straight on and from oblique angles.
 const rendered=[];tower.group.traverse(o=>{if(o.isMesh&&o.visible&&!o.userData.aerialBatchSource)rendered.push(o);});
 // Test the actual rendered faces inside every reveal, including where the
 // old wall-box caps overlapped the return. Each ray must hit one triangle.
 for(const w of TOWER_WINDOWS){
  const {ux,uz,nx,nz}=TOWER_FACES[w.side];
  for(const depth of [4.72,4.89,5.02])for(const [offset,y,du,dy] of [[.027,w.bottom+.31,1,0],[-.027,w.bottom+.37,-1,0],[.031,w.bottom+.23,0,-1],[.037,w.spring-.12,0,1]]){
   const origin=new THREE.Vector3(P.x+ux*(w.u+offset)+nx*depth,y,P.z+uz*(w.u+offset)+nz*depth),direction=new THREE.Vector3(ux*du,dy,uz*du);
   const hits=new THREE.Raycaster(origin,direction,.001,.5).intersectObjects(rendered,false);
   assert.equal(hits.length,1,'Single jamb/sill/head surface: '+JSON.stringify({side:w.side,bottom:w.bottom,depth,offset,dy,hits:hits.map(h=>h.distance)}));
  }
  const x=P.x+ux*w.u+nx*4.85,z=P.z+uz*w.u+nz*4.85;
  assert(walker.clearSight(x,z,w.bottom-.15),'Window transmits sight: '+JSON.stringify(w));
  assert(!walker.clear(x,z,w.bottom+.2),'Every window remains guarded against walking/jumping');
 }
 for(const side of [-1,1])for(const dx of [0,.35,-.35]){
  const target=new THREE.Vector3(P.x+side*.68,1.7,P.z+5.38),origin=target.clone().add(new THREE.Vector3(dx,0,1));
  assert(new THREE.Raycaster(origin,target.clone().sub(origin).normalize(),0,1.3).intersectObjects(rendered,false).length,'Door side gap sealed');
 }
 const down=new THREE.Raycaster(new THREE.Vector3(P.x+3.3,1,P.z+3.3),new THREE.Vector3(0,-1,0),0,1);
 const groundHits=down.intersectObjects(rendered,false).filter(h=>h.face.normal.y>.5&&Math.abs(h.point.y-P.base)<.001);
 assert.equal(new Set(groundHits.map(h=>h.object.uuid)).size,1,'Only one rendered surface at the first landing');
 tower.workOn(hatch,true,5);assert(!run.towerHatchOpen,'Requires the crowbar');
 run.crowbar=true;run.oil=oil;grounds.workOn(hatch,true,1);grounds.workOn(null,false,.1);assert.equal(grounds.work,0);
 grounds.workOn(hatch,true,2);assert(!run.towerHatchOpen);grounds.workOn(hatch,true,1);assert(run.towerHatchOpen);assert.equal(sounds.at(-1)[1],oil?24:280);
 assert.equal(pivot.rotation.y,0,'Freeing the bar must not snap the door open');
 assert(!walker.clear(P.x,P.z+5.1,.2),'The moving leaf still blocks the closed opening');
 assert.equal(creaks.at(-1).duration,WORKSHOP_DOOR_SECONDS);assert.equal(creaks.at(-1).volume,oil?.035:.16);
 const outside={...tower.route[0],outside:true};
 grounds.update(WORKSHOP_DOOR_SECONDS/2,outside);assert(Math.abs(pivot.rotation.y+Math.PI/4)<1e-8,'Halfway through the shared smooth swing');
 grounds.sync({snapDoors:false});assert(Math.abs(pivot.rotation.y+Math.PI/4)<1e-8,'Other interactions preserve the swing');
 const stuckAt=pivot.rotation.y;
 grounds.update(1,{outside:true,x:P.x+.62,z:P.z+4.55,y:.2});assert.equal(pivot.rotation.y,stuckAt,'Swept leaf waits for the player: '+JSON.stringify(tower.obstacles().at(-1)));
 grounds.update(WORKSHOP_DOOR_SECONDS/2,outside);assert.equal(pivot.rotation.y,-Math.PI/2);
 assert(!walker.clear(P.x+.64,P.z+4.7,.2),'Open leaf still has collision');
 assert(walker.clear(P.x,P.z+5.1,.2),'Open hatch has a real opening');
 const actor={...tower.route[0],outside:true};
 function walk(p){for(let i=0;i<2000&&Math.hypot(p.x-actor.x,p.z-actor.z)>.025;i++){const dx=p.x-actor.x,dz=p.z-actor.z,d=Math.hypot(dx,dz),step=Math.min(.04,d);walker.update(actor,dx/d*step,dz/d*step,.02,{jump:false});}assert(Math.hypot(p.x-actor.x,p.z-actor.z)<.03,'Walk blocked: '+JSON.stringify({p,actor}));if(p.y!==undefined)assert(Math.abs(actor.y-p.y)<.04,'Landing height '+JSON.stringify({p,actor}));}
 for(const p of tower.route.slice(1))walk(p);
 assert(Math.abs(actor.y-P.top)<.04,'Climbed using physical steps');
 walk({x:P.x+3.3,z:P.z-2,y:P.top});walk({x:lookout.x,z:P.z-2,y:P.top});walk(lookout);assert.equal(tower.near(actor),lookout);grounds.use(lookout);assert(run.towerSurveyed);assert.equal(progress.objective(actor).title,'Descend and choose your escape route');
 // Eye rays leave through the existing paired slits; the sill still contains
 // walking and jumping. A tower floor must not replace the entire world ground.
 for(const u of [-.91,.91]){assert(walker.clearSight(P.x-4.85,P.z+u,27));assert(!walker.clear(P.x-4.85,P.z+u,P.top));}
 assert(!walker.clearSight(P.x-4.85,P.z,28.25),'Wall between restored top pair stays solid');assert(!walker.clearSight(P.x,P.z-4.85,28.25),'North centre pier stays solid');
 walker.refresh();grounds.sync();assert(walker.clear(P.x,P.z+5.1,.2),'Tree refresh preserves open access');
 walk({x:lookout.x,z:P.z-2,y:P.top});walk({x:P.x+3.3,z:P.z-2,y:P.top});walk(tower.route.at(-1));for(const p of tower.route.slice(0,-1).reverse())walk(p);
 assert(actor.y<.3,'Returned to the vestibule');
 // Walk through the former wall-side gaps, including the outer corners,
 // and require every movement sample to remain supported by the stairs.
 walk(tower.route[1]);walk(tower.route[2]);
 const edgeRoute=[{x:P.x+4.34,z:P.z+4.34,y:P.base}];
 for(const f of TOWER_FLIGHTS)edgeRoute.push({x:P.x+Math.sign(f.b.x-P.x)*4.34,z:P.z+Math.sign(f.b.z-P.z)*4.34,y:f.endY});
 for(const p of edgeRoute)walk(p);
 for(const p of edgeRoute.slice(0,-1).reverse())walk(p);
 walk(tower.route[2]);walk(tower.route[1]);walk(tower.route[0]);
 for(const f of TOWER_FLIGHTS)for(let j=0;j<P.steps;j++){
  const t=P.landing/2+(j+.5)*(6.6-P.landing)/P.steps,y=f.startY+(j+1)*P.rise/P.steps;
  const x=f.a.x+f.dx*t-f.dz*1.04,z=f.a.z+f.dz*t+f.dx*1.04;
  assert(Math.abs(walker.heightAt(x,z,y)-y)<.001,'Support extends to the wall on every tread');
 }
 progress.capture();grounds.sync();assert(run.towerHatchOpen&&run.towerSurveyed,'Capture retains preparation and discoveries');assert(!run.crowbar&&!run.oil);assert(walker.clear(P.x,P.z+5.1,.2));
 grounds.dispose();assert.deepEqual(snapshot(),original,'Exact original estate restored');
 console.log('Tower '+(oil?'quiet':'noisy')+' route: smooth lighting, physical ascent/descent, lookout, capture and restoration pass.');
}
const fresh=createEscapeProgress({seed:1829,floors});assert(!fresh.run.towerHatchOpen&&!fresh.run.towerSurveyed,'Retry starts fresh');
