import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../../dist/aerial-layouts.mjs';
import {batchAerialMeshes,cacheAerialTransforms} from '../../dist/aerial-performance.mjs';
import {createAsylumOutside} from '../../dist/asylum-outside.mjs';
import {createEscapeGrounds} from '../../dist/escape-grounds.mjs';
import {outdoorPath} from '../../dist/escape-world.mjs';
const context=new Proxy({},{get:(_,key)=>key==='measureText'?text=>({width:text.length*16}):/Gradient$/.test(key)?()=>({addColorStop(){}}):()=>{}});
globalThis.document={createElement:()=>({getContext:()=>context})};
const exterior=createEscapeExterior(THREE,1.5);createAerialLayouts(THREE,exterior);batchAerialMeshes(THREE,exterior.model);cacheAerialTransforms(exterior.scene);
const walker=createAsylumOutside(THREE,exterior);
function snapshot(root=exterior.model){
 const rows=[];root.traverse(o=>{if(!o.isMesh)return;const hash=createHash('sha256');for(const a of [...Object.values(o.geometry.attributes),o.geometry.index,o.instanceMatrix].filter(Boolean))hash.update(new Uint8Array(a.array.buffer,a.array.byteOffset,a.array.byteLength));
  rows.push({id:o.uuid,parent:o.parent.uuid,visible:o.visible,source:!!o.userData.aerialBatchSource,geometry:o.geometry.uuid,hash:hash.digest('hex'),matrix:o.matrix.toArray(),material:[o.material].flat().map(m=>m.uuid)});});return rows.sort((a,b)=>a.id.localeCompare(b.id));
}
const original=snapshot(),tower=exterior.model.getObjectByName('Water tower · rear-right clearing'),originalTower=snapshot(tower),results=[];
for(let attempt=0;attempt<2;attempt++){
 const run={},world=createEscapeGrounds(THREE,exterior,walker,{run,recordGrounds(){}}),w=world.workshops,meshes=[];
 exterior.model.updateMatrixWorld(true);exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
 assert.deepEqual(snapshot(tower),originalTower,'Retain exact tower geometry, material and placement');
 let surfaceProbes=0,windowProbes=0;const glassMaterials=new Set();exterior.model.traverse(o=>{if(o.isMesh&&/glass|glazing/i.test(o.name))for(const m of [o.material].flat())glassMaterials.add(m);});
 const hit=(origin,direction,far=10)=>new THREE.Raycaster(new THREE.Vector3(...origin),new THREE.Vector3(...direction),0,far).intersectObjects(meshes,false);
 for(const z of [-49.4,-48.3,-45.9,-43.55,-43.45,-41.55,-40.7,-38.6,-36.35,-33.1,-29.8,-27.9,-26.96,-26.85,-26.72])for(const y of [.02,1,5.07,5.11,6,8]){
  const rays=hit([145.39,y,z],[1,0,0],.04);assert.equal(rays.length,1);assert(Math.abs(rays[0].point.x-145.4)<1e-5,'One brick face on the moved plane');surfaceProbes++;
 }
 for(const z of [-47,-42.5,-37,-31.5])for(const y of [2.4,4.2])for(const [x,dx]of [[144.7,1],[146.2,-1]]){
  const h=hit([x,y,z+.3],[dx,0,0],4)[0];assert(glassMaterials.has(h?.object.material),'Window moves with its physical opening: '+JSON.stringify({x,y,z,first:h?.object.name,point:h?.point}));windowProbes++;
 }
 for(const z of [-49,-40,-33,-27])assert(Math.abs(hit([145.8,12,z],[0,-1,0],5)[0].point.y-8.84)<.17,'Roof covers the moved facade');
 const door=world.nodes.find(n=>n.id==='tower-door');assert.equal(outdoorPath(walker,{x:144.1,z:-45},world.nodes.find(n=>n.id==='crowbar')).length,0);
 world.use(door);for(const n of world.nodes.filter(n=>n.id.startsWith('workshop-door:')))world.use(n);
 const actor={x:144.1,y:0,z:-45,outside:true};let steps=0;
 for(const to of [{x:156,z:-44.75},...world.nodes.filter(n=>['crowbar','oil'].includes(n.id))]){
  const route=outdoorPath(walker,actor,to);assert(route.length,'Connected route through moved access door and workshop');
  for(const p of route){for(let i=0;i<60&&Math.hypot(actor.x-p.x,actor.z-p.z)>.04;i++){
   const dx=p.x-actor.x,dz=p.z-actor.z,d=Math.hypot(dx,dz),step=Math.min(.06,d);walker.update(actor,dx/d*step,dz/d*step,.02);steps++;
  }assert(Math.hypot(actor.x-p.x,actor.z-p.z)<.05,'Physical walking clearance');}
 }
 assert(!walker.clear(145.4,-40));assert(walker.clear(146.05,-46));
 world.dispose();assert.deepEqual(snapshot(),original,'Restore every estate mesh, material, transform, batch and instance on restart');
 results.push({attempt:attempt+1,surfaceProbes,windowProbes,steps,exactTowerPreservation:true,exactRestoration:true});
}
await writeFile(new URL('wall-checks.json',import.meta.url),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
