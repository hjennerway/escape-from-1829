import {writeFile} from 'node:fs/promises';
import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../../dist/aerial-layouts.mjs';
import {batchAerialMeshes,cacheAerialTransforms} from '../../dist/aerial-performance.mjs';
import {createAsylumOutside} from '../../dist/asylum-outside.mjs';
import {createEscapeGrounds} from '../../dist/escape-grounds.mjs';
const context=new Proxy({},{get:(_,key)=>key==='measureText'?text=>({width:text.length*16}):/Gradient$/.test(key)?()=>({addColorStop(){}}):()=>{}});
globalThis.document={createElement:()=>({getContext:()=>context})};
const exterior=createEscapeExterior(THREE,1.5);createAerialLayouts(THREE,exterior);
batchAerialMeshes(THREE,exterior.model);cacheAerialTransforms(exterior.scene);
const walker=createAsylumOutside(THREE,exterior),world=createEscapeGrounds(THREE,exterior,walker,{run:{},recordGrounds(){}}),meshes=[];
exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
const result=world.workshops.lockedDoors.map(d=>{
 const p=world.workshops.group.children.find(o=>o.name===d.title&&Math.hypot(o.position.x-d.point[0],o.position.z-d.point[1])<.001),probes=[];
 for(const x of [-1.3,-.6,0,.6,1.3])for(const y of [3.78,3.85,3.95,4.05,4.2,4.7]){
  const origin=p.localToWorld(new THREE.Vector3(x,y,.6)),direction=new THREE.Vector3(0,0,-1).transformDirection(p.matrixWorld);
  const hits=new THREE.Raycaster(origin,direction,0,.9).intersectObjects(meshes,false).map(h=>({name:h.object.name,distance:h.distance,point:h.point.toArray()}));
  probes.push({x,y,hits});
 }
 const originals=[];exterior.model.traverse(o=>{if(o.isMesh&&!o.userData.aerialBatch)originals.push(o);});
 const origin=p.localToWorld(new THREE.Vector3(.5,3.9,.6)),direction=new THREE.Vector3(0,0,-1).transformDirection(p.matrixWorld);
 const sourceHits=new THREE.Raycaster(origin,direction,0,.9).intersectObjects(originals,false).map(h=>({name:h.object.name,instanced:!!h.object.isInstancedMesh,parent:h.object.parent.name,distance:h.distance,batchSource:!!h.object.userData.aerialBatchSource}));
 return {id:d.id,probes,sourceHits};
});
await writeFile(new URL((process.argv[2]??'before')+'-geometry.json',import.meta.url),JSON.stringify(result,null,2));
console.log(JSON.stringify(result.map(d=>({id:d.id,sourceHits:d.sourceHits,conflicts:d.probes.filter(p=>p.hits.some((h,i)=>i&&Math.abs(h.distance-p.hits[i-1].distance)<.001))})),null,2));
world.dispose();
