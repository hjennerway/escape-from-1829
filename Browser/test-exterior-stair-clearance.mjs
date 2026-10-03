import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from './dist/estate-timeline.mjs';
import {createAsylumOutside} from './dist/asylum-outside.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const compiled=process.argv.includes('--compiled');
let exterior,layouts;
if(compiled){
 const {readFile}=await import('node:fs/promises'),{gunzipSync}=await import('node:zlib');
 const {decodeModel}=await import('./dist/model-binary.mjs'),{restoreAerialScene}=await import('./dist/aerial-scene.mjs');
 const {modelSourceHash}=await import('./model-build-inputs.mjs');
 const manifest=JSON.parse(await readFile(new URL('./dist/compiled/manifest.json',import.meta.url)));
 assert.equal(manifest.sourceHash,await modelSourceHash(),'Rebuild the compiled model before checking stairs');
 const packed=await readFile(new URL('./dist/compiled/'+manifest.file,import.meta.url)),raw=gunzipSync(packed);
 ({exterior,layouts}=restoreAerialScene(THREE,decodeModel(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.length)),1.5));
 exterior.timeline.setPeriod(1916);
 // Inspect the retained originals used by walking, not duplicated render batches.
 exterior.model.traverse(o=>{if(o.userData.aerialBatch||o.userData.aerialBatchSource)o.visible=!!o.userData.aerialBatchSource;});
}else{
 exterior=createEscapeExterior(THREE,1.5);layouts=createAerialLayouts(THREE,exterior);
 prepareEstateTimeline(THREE,exterior,layouts).setPeriod(1916);
}
exterior.model.updateMatrixWorld(true);
const walker=createAsylumOutside(THREE,exterior),edges=[],landingEdges=[],solids=[];
const instance=new THREE.Matrix4(),world=new THREE.Matrix4();
exterior.model.traverseVisible(o=>{
 if(o.userData.stairGuard){
  const {a,b}=o.userData.stairGuard,p=new THREE.Vector3(...a).applyMatrix4(o.matrixWorld),q=new THREE.Vector3(...b).applyMatrix4(o.matrixWorld);
  if(Math.abs(p.y-q.y)>.3)edges.push({a:p,b:q,name:o.parent.name});
  else if(Math.abs(p.y-q.y)<.01)landingEdges.push({a:p,b:q,name:o.parent.name});
 }
});
// Derive every flight from its two visible, sloping side guards. This covers
// reflected/scaled builders without another hand-maintained stair geometry.
const flights=[],used=new Set();
for(let i=0;i<edges.length;i++){
 if(used.has(i))continue;
 const a=edges[i],delta=a.b.clone().sub(a.a),length=Math.hypot(delta.x,delta.z);
 const candidates=[];
 for(let j=i+1;j<edges.length;j++){
  if(used.has(j))continue;
  const e=edges[j];
  for(const [p,q] of [[e.a,e.b],[e.b,e.a]]){
   if(Math.abs(p.y-a.a.y)>.001||Math.abs(q.y-a.b.y)>.001||delta.distanceTo(q.clone().sub(p))>.001)continue;
   const offset=p.clone().sub(a.a),width=Math.hypot(offset.x,offset.z);
   if(width<.6||width>2.6||Math.abs(offset.x*delta.x+offset.z*delta.z)>length*.01)continue;
   candidates.push({j,p,q,width});
  }
 }
 const pair=candidates.sort((a,b)=>a.width-b.width)[0];assert(pair,'Flight must have two side guards: '+JSON.stringify(a));
 used.add(i);used.add(pair.j);
 flights.push({name:a.name,a:a.a.clone().lerp(pair.p,.5),b:a.b.clone().lerp(pair.q,.5),width:pair.width});
}
assert(flights.length>=20,'Audit all main-wing, annexe and pharmacy flights: '+flights.length);
const regions=flights.map(f=>new THREE.Box3().setFromPoints([f.a,f.b]).expandByVector(new THREE.Vector3(f.width/2+.2,2.2,f.width/2+.2)));
exterior.model.traverseVisible(o=>{
 if(!o.isMesh||o.userData.noWalkingCollision)return;
 if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
 function add(transform){
  const bounds=o.geometry.boundingBox.clone().applyMatrix4(transform);
  if(!regions.some(r=>r.intersectsBox(bounds)))return;
  const mesh=new THREE.Mesh(o.geometry,o.material);mesh.matrixWorld.copy(transform);mesh.name=o.name;
  solids.push({mesh,bounds});
 }
 if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);world.multiplyMatrices(o.matrixWorld,instance);add(world);}
 else add(o.matrixWorld);
});
const ray=new THREE.Raycaster(),up=new THREE.Vector3(0,1,0),down=up.clone().negate();
let samples=0;const failures=[];
for(const flight of flights){
 const delta=flight.b.clone().sub(flight.a),length=Math.hypot(delta.x,delta.z),normal=new THREE.Vector3(-delta.z/length,0,delta.x/length);
 for(let i=1;i<40;i++)for(const offset of [-.2,0,.2]){
  const p=flight.a.clone().lerp(flight.b,i/40).addScaledVector(normal,offset);
  for(const other of flights){
   if(other===flight)continue;
   const d=other.b.clone().sub(other.a),t=((p.x-other.a.x)*d.x+(p.z-other.a.z)*d.z)/(d.x*d.x+d.z*d.z);
   if(t<.02||t>.98)continue;
   const q=other.a.clone().lerp(other.b,t);
   if(Math.hypot(p.x-q.x,p.z-q.z)<other.width/2-.04)assert(Math.abs(p.y-q.y)>1.84,'Separate flight sections need full headroom: '+JSON.stringify({flight,other,point:p.toArray()}));
  }
  const nearby=solids.filter(({bounds:b})=>p.x>=b.min.x-.001&&p.x<=b.max.x+.001&&p.z>=b.min.z-.001&&p.z<=b.max.z+.001&&b.max.y>=p.y-.4&&b.min.y<=p.y+2.2).map(s=>s.mesh);
  ray.set(new THREE.Vector3(p.x,p.y+.12,p.z),down);ray.far=.5;
  const support=ray.intersectObjects(nearby,false)[0];
  if(!support){if(!failures.some(f=>f.flight===flight))failures.push({flight,name:flight.name,point:p.toArray(),missingSupport:true});continue;}
  ray.set(support.point.clone().addScaledVector(up,.04),up);ray.far=1.8;
  // Adjacent tread nosings overlap by a few centimetres in plan. Walking
  // selects their reachable upper surface; they are not another flight.
  function smallTread(mesh){
   const b=mesh.geometry.boundingBox;
   // Compilation stores final vertex buffers, so a cuboid no longer carries
   // the procedural BoxGeometry class name. Recognize its actual corners.
   if(mesh.geometry.type!=='BoxGeometry'){
    const positions=mesh.geometry.attributes.position;
    for(let i=0;i<positions.count;i++)for(const axis of ['x','y','z']){
     const value=axis==='x'?positions.getX(i):axis==='y'?positions.getY(i):positions.getZ(i);
     if(Math.min(Math.abs(value-b.min[axis]),Math.abs(value-b.max[axis]))>1e-5)return false;
    }
   }
   const corners=[[b.min.x,b.min.z],[b.max.x,b.min.z],[b.max.x,b.max.z],[b.min.x,b.max.z]].map(([x,z])=>new THREE.Vector3(x,0,z).applyMatrix4(mesh.matrixWorld));
   const along=corners.map(c=>(c.x*delta.x+c.z*delta.z)/length),height=(b.max.y-b.min.y)*mesh.matrixWorld.getMaxScaleOnAxis();
   return Math.max(...along)-Math.min(...along)<.55&&height<.16;
  }
  const supportIsTread=smallTread(support.object);
  const blocker=ray.intersectObjects(nearby,false).find(hit=>!(supportIsTread&&hit.distance<.35&&smallTread(hit.object)));
  if(blocker&&!failures.some(f=>f.flight===flight))failures.push({flight,name:flight.name,point:support.point.toArray(),overhead:blocker.object.name,clearance:blocker.distance,bounds:solids.find(s=>s.mesh===blocker.object).bounds});
  samples++;
 }
}
assert.equal(failures.length,0,'Stair flights intersect overhead geometry: '+JSON.stringify(failures));
let landingSamples=0;const landingFailures=[];
for(const edge of landingEdges){
 const delta=edge.b.clone().sub(edge.a),length=Math.hypot(delta.x,delta.z);if(length<.3)continue;
 const normal=new THREE.Vector3(-delta.z/length,0,delta.x/length);
 for(let i=1;i<10;i++)for(const side of [-1,1]){
  const p=edge.a.clone().lerp(edge.b,i/10).addScaledVector(normal,.38*side);
  let height=walker.heightAt(p.x,p.z,p.y);
  if(compiled){
   const below=solids.filter(({bounds:b})=>p.x>=b.min.x&&p.x<=b.max.x&&p.z>=b.min.z&&p.z<=b.max.z&&b.max.y>=p.y-.35&&b.min.y<=p.y+.35).map(s=>s.mesh);
   ray.set(new THREE.Vector3(p.x,p.y+.35,p.z),down);ray.far=.7;
   const support=ray.intersectObjects(below,false)[0];if(!support)continue;height=support.point.y;
  }
  if(Math.abs(height-p.y)>.35||!walker.clear(p.x,p.z,height))continue;
  const nearby=solids.filter(({bounds:b})=>p.x>=b.min.x&&p.x<=b.max.x&&p.z>=b.min.z&&p.z<=b.max.z&&b.max.y>height+.04&&b.min.y<height+1.84).map(s=>s.mesh);
  ray.set(new THREE.Vector3(p.x,height+.04,p.z),up);ray.far=1.8;
  const blocker=ray.intersectObjects(nearby,false)[0];landingSamples++;
  if(blocker&&!landingFailures.some(f=>f.edge===edge))landingFailures.push({edge,point:[p.x,height,p.z],clearance:blocker.distance,overhead:blocker.object.name});
 }
}
assert.equal(landingFailures.length,0,'Stair landings need standing headroom: '+JSON.stringify(landingFailures));
// Both inner courts must climb and descend with no retained movement trend,
// including stops on treads and turns. Opposite flights need separate lanes.
let moves=0;
// Visitors walk the procedural Explore/Escape scene. Compiled aerial buffers
// are checked geometrically above; they are not a separate walking mode.
for(const side of compiled?[]:[-1,1]){
 const route=[[20.3,-30.5],[20.3,-25.8],[21.9,-25.8],[21.9,-30.9],[20.3,-30.9],[20.3,-25.8],[23.4,-25.8]].map(([x,z])=>[side*x,z]);
 const actor={x:route[0][0],y:.3,z:route[0][1]};
 actor.y=walker.heightAt(actor.x,actor.z,actor.y);
 function follow(points){
  for(const [x,z] of points){
   for(let i=0;i<1500&&Math.hypot(actor.x-x,actor.z-z)>.02;i++){
    const dx=x-actor.x,dz=z-actor.z,d=Math.hypot(dx,dz),step=Math.min(.025,d),prior=actor.y;
    actor.verticalTrend=0;walker.update(actor,dx/d*step,dz/d*step,.01);moves++;
    assert(walker.clear(actor.x,actor.z,actor.y),'Each U-shaped stair move clears the visible barriers');
    assert(Math.abs(actor.y-prior)<.3,'No overlapping tread can cause a sudden height change: '+JSON.stringify({prior,actor}));
    if(i%17===0){const height=actor.y;walker.update(actor,0,0,.1);assert(Math.abs(actor.y-height)<.01,'Stopping on a tread keeps its height');}
   }
   assert(Math.hypot(actor.x-x,actor.z-z)<.03,'U-shaped stair route is open: '+JSON.stringify({actor,target:[x,z]}));
  }
 }
 follow(route.slice(1));assert(actor.y>5.85,'Climb reaches the upper doorway deck');
 follow([...route].reverse().slice(1));assert(actor.y<.5,'Descent returns to the grounds');
}
console.log(`PASS: ${flights.length} exterior flights / ${samples} tread and headroom samples, ${landingSamples} landing-edge samples; ${compiled?'compiled aerial geometry':moves+' stopped/restarted U-shaped stair moves across both wings'}.`);
