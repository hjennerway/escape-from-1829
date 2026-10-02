import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,insidePolygon} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
import {stairOpening} from './dist/asylum-stairs.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))),floors=buildAsylumLayout(plan).floors;
const ray=new THREE.Raycaster();let faces=0,rims=0,openings=0;
function cast(meshes,origin,direction,distance){
 ray.set(new THREE.Vector3(...origin),new THREE.Vector3(...direction).normalize());ray.far=distance;
 return ray.intersectObjects(meshes,false);
}
for(const floor of floors){
 const scene=new THREE.Scene();buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
 const above=floors.filter(f=>f.elevation>floor.elevation).sort((a,b)=>a.elevation-b.elevation)[0];
 const ceilingHeight=floor.id===2?2.9:3.8;
 for(const [name,bottom,top,connection] of [
  ['Asylum floor',-.2,.002,1],
  ['Asylum ceiling',ceilingHeight,above?above.elevation-floor.elevation-.2:ceilingHeight+.2,0],
 ]){
  const meshes=scene.children.filter(m=>m.name===name);
  const holes=floor.stairs.filter(s=>s.connections.some(c=>c[connection]===floor.id)).map(stairOpening);
  for(const mesh of meshes)for(const material of [mesh.material].flat()){
   assert.equal(material.side,THREE.FrontSide,'Closed solids have outward-facing surfaces without disabling back-face culling');
   assert(!material.transparent&&material.opacity===1&&material.depthWrite,`${name} is opaque and writes depth`);
  }
  // A grid across every storey catches missing caps and reversed normals,
  // including room corners and the ground-only wings outside the first floor.
  for(let x=-72.13;x<70;x+=2.3)for(let z=-39.17;z<43;z+=2.1){
   if(!floor.outline.loops.some(loop=>insidePolygon(x,z,loop)))continue;
   const hole=holes.some(h=>x>h.minX&&x<h.maxX&&z>h.minZ&&z<h.maxZ);
   for(const [y,dy,surface] of [[bottom-.3,1,bottom],[top+.3,-1,top]]){
    const hits=cast(meshes,[x,y,z],[0,dy,0],top-bottom+.6);
    if(hole){assert.equal(hits.length,0,'Stair shafts remain open through both caps');openings++;}
    else{assert(hits.length,`Floor ${floor.id} ${name} covers ${x},${z} from ${dy>0?'below':'above'}`);assert(Math.abs(hits[0].point.y-surface)<1e-5,`${name} retains its exposed height`);faces++;}
   }
  }
  for(const h of holes){
   const cx=(h.minX+h.maxX)/2,cz=(h.minZ+h.maxZ)/2;
   for(const [x,z,nx,nz] of [[h.minX,cz,-1,0],[h.maxX,cz,1,0],[cx,h.minZ,0,-1],[cx,h.maxZ,0,1]]){
    for(const t of [.01,.25,.5,.75,.99])for(const angle of [-.7,0,.7]){
     const y=bottom+(top-bottom)*t,origin=[x-nx*.15+nz*angle*.15,y,z-nz*.15-nx*angle*.15];
     const hits=cast(meshes,origin,[x-origin[0],0,z-origin[2]],.4);
     assert(hits.length,`Floor ${floor.id} ${name} seals the shaft edge at ${x},${y},${z}, angle ${angle}`);
     assert(hits[0].face.normal.dot(ray.ray.direction)<-.5,'Shaft reveal faces into the opening');rims++;
    }
   }
  }
  // Perimeter edges also need closed sides, even on levels of different sizes.
  for(const loop of floor.outline.loops)for(let i=0;i<loop.length;i++){
   const a=loop[i],b=loop[(i+1)%loop.length],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
   let nx=-dz/length,nz=dx/length;
   const x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;
   if(insidePolygon(x+nx*.001,z+nz*.001,loop)){nx=-nx;nz=-nz;}
   const hits=cast(meshes,[x+nx*.001,(bottom+top)/2,z+nz*.001],[-nx,0,-nz],.002);
   assert(hits.length,`Floor ${floor.id} ${name} closes outer edge ${i}`);rims++;
  }
 }
}
console.log(`PASS: ${faces} floor/ceiling cap views from both sides, ${rims} oblique shaft/perimeter edge views, ${openings} clear shaft samples across all four floors.`);
