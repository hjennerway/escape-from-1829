import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,flatWalkable,segmentDistance} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
const floors=buildAsylumLayout(plan).floors,ray=new THREE.Raycaster();
let doors=0,masonry=0,leaves=0;
for(const floor of floors){
 const scene=new THREE.Scene();buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
 const edges=floor.outline.loops.flatMap(loop=>loop.map((a,i)=>[a,loop[(i+1)%loop.length]]));
 for(const exit of floor.exits){
  const label=`${exit.id} floor ${floor.id}`,normal=exit.axis==='x'?0:1,along=1-normal,centre=[exit.worldX,exit.worldZ];
  centre[along]+=exit.wallOpening.offset??0;
  const entrance=exit.id==='D1',half=entrance?.95:.79,head=entrance?3.6:2.465;
  const hosts=edges.filter(([a,b])=>Math.abs(a[normal]-b[normal])<1e-7&&centre[along]>=Math.min(a[along],b[along])&&centre[along]<=Math.max(a[along],b[along]));
  hosts.sort((a,b)=>Math.abs(a[0][normal]-centre[normal])-Math.abs(b[0][normal]-centre[normal]));
  const plane=hosts[0][0][normal];
  assert(Math.abs(plane-centre[normal])<.31,`${label} fits its nearby facade`);
  const fitted=centre[normal]-exit.facing*exit.wallOpening.inset;
  assert(Math.abs(fitted-plane)<1e-7,`${label} leaf and frame sit on the hosting wall`);
  assert(flatWalkable(floor,exit.inside.x,exit.inside.z),`${label} retains a clear E approach`);
  function across(point,y,dx,dz,kind){
   for(const side of [-1,1]){
    const origin=new THREE.Vector3(point[0]-dz*side*.4,y,point[1]+dx*side*.4);
    // Tight corners can put one origin inside the adjoining wall. Those
    // return faces are covered by the dedicated east-corner regression.
    if(edges.some(([a,b])=>segmentDistance(origin.x,origin.z,a,b)<.1))continue;
    ray.set(origin,new THREE.Vector3(dz*side,0,-dx*side));ray.far=.55;
    const hit=ray.intersectObject(scene.getObjectByName('Asylum '+kind),false)[0];
    assert(hit&&Math.abs(hit.distance-.31)<1e-5,`${label} ${kind} continues to its frame at ${point}, y=${y}`);
    masonry++;
   }
  }
  // Survey the former circular/full-height hole on the actual outline,
  // including returns, independently of the generated header metadata.
  for(const [a,b] of edges){
   const length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length;
   for(let t=.14;t<length-.13;t+=.035){
    const p=[a[0]+dx*t,a[1]+dz*t];
    if(Math.hypot(p[0]-centre[0],p[1]-centre[1])>1.04)continue;
    for(const y of [head+.15,floor.id===2?2.88:3.79])across(p,y,dx,dz,'Plaster');
    if(Math.abs(p[along]-centre[along])>half+.015){
     across(p,.55,dx,dz,'Brick');across(p,1.65,dx,dz,'Plaster');
     assert(!flatWalkable(floor,...p,.01),`${label} side masonry also blocks walking`);
    }
   }
  }
  // Closed leaves reach the head; there is no outdoor strip above them.
  for(const u of [-.5,0,.5])for(const y of [.2,1.65,entrance?3.1:2.43]){
   const p=[...centre];p[normal]=plane-exit.facing*.4;p[along]+=u;
   const direction=new THREE.Vector3(normal===0?exit.facing:0,0,normal===1?exit.facing:0);
   ray.set(new THREE.Vector3(p[0],y,p[1]),direction);ray.far=.6;
   const hit=ray.intersectObjects(scene.children,false)[0]?.object.name;
   assert(entrance?['Asylum EntrancePaint','Asylum EntranceInset'].includes(hit):['Asylum Panel','Asylum VictorianTimber','Asylum VictorianInset'].includes(hit),`${label} has a closed timber leaf up to the frame (${hit})`);leaves++;
  }
  doors++;
 }
}
assert.equal(doors,24);
console.log(`PASS: ${doors} fitted exterior doors, ${masonry} matching masonry probes, ${leaves} closed-leaf probes, aligned frames, solid side collision and clear approaches.`);
