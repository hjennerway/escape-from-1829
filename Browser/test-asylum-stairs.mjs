import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,moveAsylumActor,stairRoute} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
import {routeBetweenFloors} from './dist/floors.mjs';
import {stairShape,stairOpening,stairConnection,stairFlights,landingRails,stairWellHeight,STAIR_WIDTH,STAIR_SLAB_THICKNESS,STAIR_WELL_WALL_THICKNESS} from './dist/asylum-stairs.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))),floors=buildAsylumLayout(plan).floors;
assert.deepEqual(plan.stairs.find(s=>s.id==='S1').connections,[[2,0],[0,1],[1,3]],'Reception connects basement through second floor');
const scene=new THREE.Scene();
for(const floor of floors){const group=new THREE.Group();buildAsylumArchitecture(THREE,group,floor);group.position.y=floor.elevation;scene.add(group);}
scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster(),solids=[],rails=[];
scene.traverse(m=>{if(['Asylum floor','Asylum ceiling','Asylum Stone','Asylum Carpet'].includes(m.name))solids.push(m);if(m.name==='Asylum Handrails')rails.push(m);});
function cast(meshes,x,y,z,dy){ray.set(new THREE.Vector3(x,y,z),new THREE.Vector3(0,dy,0));ray.far=20;return ray.intersectObjects(meshes,false);}
const concrete=solids.filter(m=>m.name==='Asylum Stone');
for(const mesh of concrete){
 assert.equal(mesh.material.side,THREE.FrontSide,'Concrete flights are closed solids with outward faces');
 assert(!mesh.material.transparent&&mesh.material.depthWrite,'Concrete flights remain opaque');
}
let supports=0,guards=0,soffits=0,sides=0,wellFaces=0;
const masonry=[];scene.traverse(m=>{if(['Asylum Brick','Asylum Plaster'].includes(m.name))masonry.push(m);});
for(const floor of floors)for(const well of floor.stairWells){
 const {minX,maxX,minZ,maxZ}=well,height=stairWellHeight(floor);
 for(const mesh of masonry){assert.equal(mesh.material.side,THREE.FrontSide);assert(!mesh.material.transparent&&mesh.material.depthWrite);}
 for(const t of [.001,.1,.5,.9,.999])for(const y of [.05,.8,1.09,1.11,2.1,(floor.id===2?2.9:3.8)+.01,height-.005]){
  for(const [x,z,nx,nz] of [[minX,minZ+(maxZ-minZ)*t,-1,0],[maxX,minZ+(maxZ-minZ)*t,1,0],[minX+(maxX-minX)*t,minZ,0,-1],[minX+(maxX-minX)*t,maxZ,0,1]]){
   ray.set(new THREE.Vector3(x+nx*.25,floor.elevation+y,z+nz*.25),new THREE.Vector3(-nx,0,-nz));ray.far=.5;
   const hit=ray.intersectObjects(masonry,false)[0];
   assert(hit&&Math.abs(hit.distance-.25)<1e-5,`Floor ${floor.id}: full-height well wall at ${[x,y,z]}`);
   assert(hit.face.normal.dot(ray.ray.direction)<-.999,'Well walls face the flights and landings');wellFaces++;
   if(t<.1||t>.9)continue;
   ray.set(new THREE.Vector3(x-nx*.4,floor.elevation+y,z-nz*.4),new THREE.Vector3(nx,0,nz));ray.far=.5;
   const reverse=ray.intersectObjects(masonry,false)[0];
   assert(reverse&&Math.abs(reverse.distance-(.4-STAIR_WELL_WALL_THICKNESS))<1e-5,'Well masonry has closed inward faces and its thickness stays inside the void');wellFaces++;
  }
 }
}
for(const stair of plan.stairs){
 const [[x0,z0],[x1],,[,z1]]=stair.points;
 assert(Math.abs(x1-x0-(z1-z0))<1e-6,stair.id+' has a square footprint');
 for(const [lower,upper] of stair.connections){
  const route=stairRoute(stair,floors[lower].elevation,floors[upper].elevation,lower,upper);
  const shape=stairShape(stair),lo=floors[lower].elevation,hi=floors[upper].elevation,mid=(lo+hi)/2;
  for(const [a,b] of stairFlights(stairConnection(stair,lower,upper),lo,hi)){
   const [x,y0,z0]=a,[x1,y1,z1]=b,dx=x1-x,dz=z1-z0,run=Math.hypot(dx,dz),nx=dz/run,nz=-dx/run;
   const normal=new THREE.Vector3(dx*(y1-y0)/run**2,-1,dz*(y1-y0)/run**2).normalize();
   for(let i=1;i<40;i++){
    // Sample across every tread boundary and the full width from below. Thin
    // independent tread boxes cannot match this continuous sloping surface.
    const t=i/40,cx=x+dx*t,z=z0+dz*t,y=y0+(y1-y0)*t-STAIR_SLAB_THICKNESS;
    for(const offset of [-STAIR_WIDTH/2+.015,0,STAIR_WIDTH/2-.015]){
     const hit=cast(concrete,cx+nx*offset,y-.3,z+nz*offset,1)[0];
     assert(hit&&Math.abs(hit.point.y-y)<1e-5,`${stair.id}/${lower}-${upper}: planar concrete underside at ${[cx+nx*offset,y,z+nz*offset]}`);
     assert(hit.face.normal.dot(normal)>.99999,'The underside normal follows the flight slope');soffits++;
    }
    // The concrete side faces fill the space between the soffit and treads.
    for(const side of [-1,1]){
     ray.set(new THREE.Vector3(cx+nx*side*(STAIR_WIDTH/2+.1),y+.09,z+nz*side*(STAIR_WIDTH/2+.1)),new THREE.Vector3(-nx*side,0,-nz*side));ray.far=.2;
     const hit=ray.intersectObjects(concrete,false)[0];
     assert(hit&&Math.abs(hit.distance-.1)<1e-5,'Concrete closes both sides of each flight');sides++;
    }
   }
   if(dx===0&&!stairConnection(stair,lower,upper).straightFlight)for(const z of [shape.back-.001,shape.back+.001]){
    const expected=(z<shape.back?y0+(z-z0)/(z1-z0)*(y1-y0):mid)-STAIR_SLAB_THICKNESS;
    const hit=cast(concrete,x,expected-.1,z,1)[0];
    assert(hit&&Math.abs(hit.point.y-expected)<1e-5,'The sloping soffit meets the flat return-landing underside');soffits++;
   }
  }
  for(let j=1;j<route.length;j++)for(let i=0;i<=20;i++){
   const a=route[j-1],b=route[j],t=i/20,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,z=a[2]+(b[2]-a[2])*t;
   const floorHit=cast(solids,x,y+.22,z,-1)[0];
   assert(floorHit&&Math.abs(floorHit.point.y-y)<=.195,`${stair.id}: continuous visible support at ${[x,y,z]}: ${floorHit?.object.name}/${floorHit?.point.y}`);
   assert(!cast(solids,x,y+.25,z,1).some(hit=>hit.distance<1.4),stair.id+' has clear headroom');supports++;
  }
  // Try walking through both sides of each flight and the rear landing.
  for(const index of stairConnection(stair,lower,upper).straightFlight?[1]:[1,3,5]){
   const a=route[index],b=route[index+1],x=(a[0]+b[0])/2,y=(a[1]+b[1])/2,z=(a[2]+b[2])/2;
   const run=Math.hypot(b[0]-a[0],b[2]-a[2]),nx=-(b[2]-a[2])/run,nz=(b[0]-a[0])/run;
   for(const sign of [-1,1]){
    const actor={x,y,z,floor:lower,stair:{id:stair.id,lower,upper,route}};
    for(let n=0;n<40;n++)moveAsylumActor(floors,actor,nx*sign*.08,nz*sign*.08);
    assert(Math.hypot(actor.x-x,actor.z-z)<.34,stair.id+' railing blocks a sideways fall');guards++;
   }
  }
 }
 // Every upper exposed shaft rim has a visible rail and a physical barrier.
 for(const floor of floors.filter(f=>stair.connections.some(([,b])=>b===f.id))){
  const incoming=stairConnection(stair,...stair.connections.find(([,b])=>b===floor.id));
  if(incoming.straightFlight){
   // Only the new opening remains on the Library storey, with both sides
   // and the bottom edge guarded. The arrival mouth stays open.
   for(const rail of landingRails(stair,floor.id))for(let i=1;i<rail.length;i++){
    const a=rail[i-1],b=rail[i],x=(a[0]+b[0])/2,z=(a[2]+b[2])/2;
    assert(cast(rails,x,floor.elevation+1.2,z,-1).some(h=>Math.abs(h.point.y-floor.elevation-1.085)<1e-4),'Single-flight opening has visible guards');
   }
   const h=stairOpening(incoming);
   for(const [x,z,dx,dz] of [[h.minX-.7,(h.minZ+h.maxZ)/2,.08,0],[h.maxX+.7,(h.minZ+h.maxZ)/2,-.08,0],[(h.minX+h.maxX)/2,h.maxZ+.7,0,-.08]]){
    const actor={x,z,y:floor.elevation,floor:floor.id};for(let n=0;n<30;n++)moveAsylumActor(floors,actor,dx,dz);
    assert(!actor.stair&&Math.hypot(actor.x-x,actor.z-z)<.4,'Single-flight landing blocks a fall');guards++;
   }
   continue;
  }
  for(const [x,z,dx,dz] of [[x0-.7,(z0+z1)/2,.08,0],[x1+.7,(z0+z1)/2,-.08,0],[(x0+x1)/2,z1+.7,0,-.08],[(x0+x1)/2,z0+.6,0,.08]]){
   const actor={x,z,y:floor.elevation,floor:floor.id};
   for(let n=0;n<30;n++)moveAsylumActor(floors,actor,dx,dz);
   assert(!actor.stair,stair.id+' rim cannot drop onto another flight');
   assert(Math.hypot(actor.x-x,actor.z-z)<.4,stair.id+' rim blocks the opening');guards++;
  }
  for(const [x,z] of [[x0,(z0+z1)/2],[x1,(z0+z1)/2],[(x0+x1)/2,z1]]){
   assert(cast(rails,x,floor.elevation+1.2,z,-1).some(h=>Math.abs(h.point.y-floor.elevation-1.085)<1e-4),stair.id+' visible landing guard');
  }
 }
 // The enclosed shaft has a floor at the lowest level. Only the relocated
 // Library continuation caps the old well above; its flight remains clear.
 const x=(x0+x1)/2,z=(z0+z1)/2,low=Math.min(...stair.floors.map(f=>floors[f].elevation)),top=Math.max(...stair.floors.map(f=>floors[f].elevation));
 const capped=stair.connections.some(([a,b])=>stairConnection(stair,a,b).straightFlight);
 assert(Math.abs(cast(solids,x,top+.2,z,-1)[0].point.y-(capped?top+.002:low))<.02,stair.id+' well is capped only where the upper continuation moved');
}
// Walk the full generated navigation routes, including the basement door next
// to Reception, rather than merely checking that the pathfinder returns points.
for(const floor of floors)for(const exit of floor.exits){
 const actor={x:0,z:14,y:0,floor:0},route=routeBetweenFloors(floors,actor,{...exit.inside,floor:floor.id});assert(route.length);
 for(const target of route){
  for(let n=0;n<400&&Math.hypot(target.x-actor.x,target.z-actor.z)>.025;n++){
   const dx=target.x-actor.x,dz=target.z-actor.z,d=Math.hypot(dx,dz),step=Math.min(.05,d);moveAsylumActor(floors,actor,dx/d*step,dz/d*step);
  }
  assert(Math.hypot(target.x-actor.x,target.z-actor.z)<.04,`Walk to ${exit.id}/${floor.id} at ${JSON.stringify({target,actor})}`);
 }
 assert.equal(actor.floor,floor.id);
}
console.log(`PASS: ${wellFaces} full-height well-wall faces, Reception/Library upper connections, ${soffits} planar soffit/landing samples, ${sides} closed flight sides, ${supports} visible support/headroom samples, ${guards} fall barriers, all 24 door routes physically walked.`);
