import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../dist/vendor/three.module.js';
import {makeFloors} from '../dist/floors.mjs';
import {walkable} from '../dist/core.mjs';
let architecture=await import('../dist/architecture.mjs');
if(process.argv[2]==='before'){
 let source=await readFile(new URL('./stair-skirting-before.mjs.txt',import.meta.url),'utf8');
 source=source.replace("'./interior-materials.mjs'",JSON.stringify(new URL('../dist/interior-materials.mjs',import.meta.url).href));
 architecture=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
}
const layout=JSON.parse(await readFile(new URL('../dist/layout.json',import.meta.url)));
let checks=0;const failures=[];
for(const [floorIndex,floor] of makeFloors(layout).entries()){
 const scene=new THREE.Scene();architecture.buildArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
 const points=new Map(),s=floor.cellSize;
 for(const w of architecture.interiorWallSurfaces(floor))for(const end of [-1,1]){
  const x=w.x+(w.dx?0:end*s/2),z=w.z+(w.dx?end*s/2:0),key=x+','+z;
  if(!points.has(key))points.set(key,{x,z,walls:[]});points.get(key).walls.push(w);
 }
 const ray=new THREE.Raycaster();ray.far=1.15;
 for(const p of points.values())if(p.walls.some(w=>w.dx)&&p.walls.some(w=>w.dz))for(let i=0;i<8;i++){
  const a=.23+i*Math.PI/4,x=p.x+Math.cos(a)*.7,z=p.z+Math.sin(a)*.7;
  if(!walkable(floor,x,z,.02))continue;
  const origin=new THREE.Vector3(x,.13,z),target=new THREE.Vector3(p.x+.017,.13,p.z-.023);
  ray.set(origin,target.sub(origin).normalize());
  const hits=ray.intersectObjects(scene.children,false),first=hits[0];
  if(!first)continue;
  if(first.object.name==='Layout Brick')failures.push({floor:floorIndex,corner:[p.x,p.z],angle:i,type:'bare brick'});
  if(first.object.name==='Layout Skirting'){
   const brick=hits.find(h=>h.object.name==='Layout Brick');
   if(brick&&brick.distance-first.distance<.004)failures.push({floor:floorIndex,corner:[p.x,p.z],angle:i,type:'coincident trim',gap:brick.distance-first.distance});
   checks++;
  }
 }
}
console.log(JSON.stringify({mode:process.argv[2]||'after',checks,failures:failures.length,examples:failures.slice(0,12)},null,2));
if(process.argv[2]!=='before')assert.equal(failures.length,0);
