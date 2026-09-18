import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildArchitecture,interiorWallSurfaces} from './dist/architecture.mjs';
import {makeFloors} from './dist/floors.mjs';
import {exitDirection} from './dist/escape-routes.mjs';
import {walkable} from './dist/core.mjs';
const layout=JSON.parse(await readFile(new URL('./dist/layout.json',import.meta.url)));
const snapshot=JSON.stringify(layout),scenes=[];
let openings=0,passages=0,headers=0,trimSamples=0,skirtingSamples=0,stairSamples=0,exitDoors=0;
for(const floor of makeFloors(layout)){
 const scene=new THREE.Scene();buildArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);scenes.push(scene);
 assert(scene.children.length<=22,'Architectural details stay batched');
 const surfaces=interiorWallSurfaces(floor),windows=surfaces.filter(w=>w.window);
 assert(windows.length>10,'Arched windows appear throughout both floors');
 const ray=new THREE.Raycaster();ray.far=3;
 for(const exit of floor.exits){
  const {dx,dz}=exitDirection(exit);
  ray.set(new THREE.Vector3(exit.x*floor.cellSize-dx*1.5,1.65,exit.z*floor.cellSize-dz*1.5),new THREE.Vector3(dx,0,dz));
  assert.equal(ray.intersectObjects(scene.children,false)[0]?.object.name,'Layout Panel',exit.name+' door must be visible from the corridor');exitDoors++;
 }
 ray.far=1;
 // Inspect actual window apertures in every wall orientation, below and above
 // the spring line: the first hit must be a recessed pane, not solid plaster.
 for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const wall=windows.find(w=>w.dx===dx&&w.dz===dz);assert(wall);
  for(const y of [1.6,2.45]){
   const u=.15;
   ray.set(new THREE.Vector3(wall.x+(dx?0:u)-dx*.6,y,wall.z+(dx?-u:0)-dz*.6),new THREE.Vector3(dx,0,dz));
   const hit=ray.intersectObjects(scene.children,false)[0];
   assert(hit&&['Layout Glass','Layout Recess'].includes(hit.object.name),`Exposed window ${dx},${dz} at ${y}: ${hit?.object.name}`);openings++;
  }
 }
 // Rays along the reveals expose coplanar trim/wall faces that straight-on
 // aperture checks miss. Cover both jambs and sill corners of every window.
 for(const wall of windows)for(const side of [-1,1]){
  const {x,z,dx,dz}=wall,tx=dx?0:side,tz=dx?-side:0;
  function separated(origin,direction,expected){
   ray.set(origin,direction);
   const hits=[...new Map(ray.intersectObjects(scene.children,false).map(h=>[h.object.uuid+':'+h.instanceId,h])).values()];
   assert(hits.length&&expected.includes(hits[0].object.name),'Expected exposed window trim');
   assert(!hits[1]||hits[1].distance-hits[0].distance>.015,'Window trim and masonry must not share a visible face');trimSamples++;
  }
  for(const y of [1.35,1.55,1.74,1.93,2.12]){
   separated(new THREE.Vector3(x,y,z),new THREE.Vector3(tx,0,tz),['Layout RedArch','Layout BuffArch']);
  }
  separated(new THREE.Vector3(x+tx*.95-dx*.15,1.28,z+tz*.95-dz*.15),new THREE.Vector3(-tx,0,-tz),['Layout Stone']);
 }
 // Oblique rays cover concave and convex skirting joins, including the stair mouths.
 const corners=new Map(),size=floor.cellSize;
 for(const w of surfaces)for(const end of [-1,1]){
  const x=w.x+(w.dx?0:end*size/2),z=w.z+(w.dx?end*size/2:0),key=x+','+z;
  if(!corners.has(key))corners.set(key,{x,z,walls:[]});corners.get(key).walls.push(w);
 }
 ray.far=1.15;
 for(const p of corners.values())if(p.walls.some(w=>w.dx)&&p.walls.some(w=>w.dz))for(let i=0;i<8;i++){
  const angle=.23+i*Math.PI/4,x=p.x+Math.cos(angle)*.7,z=p.z+Math.sin(angle)*.7;
  if(!walkable(floor,x,z,.02))continue;
  const origin=new THREE.Vector3(x,.13,z),direction=new THREE.Vector3(p.x+.017,.13,p.z-.023).sub(origin).normalize();
  ray.set(origin,direction);const hits=ray.intersectObjects(scene.children,false),first=hits[0];
  if(!first)continue;
  assert.notEqual(first.object.name,'Layout Brick','Skirting wraps the exposed brick corner');
  if(first.object.name==='Layout Skirting'){
   const brick=hits.find(h=>h.object.name==='Layout Brick');
   assert(!brick||brick.distance-first.distance>.004,'Skirting corner caps do not coincide with masonry');skirtingSamples++;
  }
 }
 ray.far=2;
 function stairSeparation(origin,direction,front,back,minGap){
  ray.set(new THREE.Vector3(...origin),new THREE.Vector3(...direction));
  const hits=ray.intersectObjects(scene.children,false),a=hits.find(h=>h.object.name===front),b=hits.find(h=>h.object.name===back);
  assert(a&&b,'Both stair surfaces must be sampled');
  assert(b.distance-a.distance>minGap,'Stair edge strips must not share tread or riser faces');stairSamples++;
 }
 for(const t of floor.stairs){
  const x=t.x*size,z=(t.z-.5)*size;
  if(t.direction==='UP')for(let n=0;n<6;n++){
   const h=(n+1)*.12,front=z-n*.28;
   for(const offset of [-.7,0,.7]){
    stairSeparation([x+offset,h+.3,front-.025],[0,-1,0],'Layout Stone','Layout Carpet',.010);
    stairSeparation([x+offset,h-.003,front+.1],[0,0,-1],'Layout Stone','Layout Carpet',.008);
   }
   for(const side of [-1,1])stairSeparation([x+side*.95,h-.003,front-.025],[-side,0,0],'Layout Carpet','Layout Stone',.006);
  }
  else for(let n=-2;n<=2;n++)for(const side of [-1,1]){
   stairSeparation([x+side*.95,.022,t.z*size+n*.28],[-side,0,0],'Layout Carpet','Layout Brass',.015);
  }
 }
 const s=floor.cellSize,open=(x,z)=>floor.cells[z*floor.width+x]===1;
 ray.far=s-.04;
 for(let z=1;z<floor.galleryZ-2;z++)for(let x=1;x<floor.width-1;x++)if(open(x,z)&&!open(x-1,z)&&!open(x+1,z)&&open(x,z-1)&&open(x,z+1)){
  // The masonry above each arch closes the entire gap from either side.
  for(const offset of [-s/2+.02,-.75,0,.75,s/2-.02])for(const direction of [-1,1]){
   const crown=2.08+Math.sqrt((s/2)**2-offset**2),y=(crown+3.475)/2;
   ray.set(new THREE.Vector3(x*s+offset,y,z*s-direction*(s/2-.02)),new THREE.Vector3(0,0,direction));
   const hit=ray.intersectObjects(scene.children,false)[0];
   assert.equal(hit?.object.name,'Layout PlasterPassageHeader','White bricks join the arch to the ceiling');headers++;
  }
  for(const offset of [0,-s/2+.35,s/2-.35]){
   ray.set(new THREE.Vector3(x*s+offset,1.65,z*s-s/2+.02),new THREE.Vector3(0,0,1));
   assert.equal(ray.intersectObjects(scene.children,false).length,0,'Arches preserve the traversable corridor width');passages++;
  }
 }
}
assert.equal(JSON.stringify(layout),snapshot,'Finishes do not alter navigation');
assert.equal(scenes[0].getObjectByName('Layout Brick').material,scenes[1].getObjectByName('Layout Brick').material,'Floors share finish resources');
console.log(`PASS: ${exitDoors} visible exit doors, ${openings} exposed arched-window samples, ${passages} unobstructed passage samples, ${headers} solid header samples, ${trimSamples} separated window-trim samples, ${skirtingSamples} skirting joins, ${stairSamples} separated stair edges, navigation unchanged, shared materials and bounded batches.`);
