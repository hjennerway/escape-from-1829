import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from './dist/estate-timeline.mjs';
import {batchAerialMeshes,cacheAerialTransforms} from './dist/aerial-performance.mjs';
import {PERIODS} from './dist/estate-periods.mjs';
import {ANNEXE_REAR_SURFACES} from './dist/annexe-rear-roads.mjs';
import {pointInFootprint} from './dist/historic-footprints.mjs';
const input=JSON.parse(readFileSync(new URL('../Research/historic-roads/annexe-rear-network-input.json',import.meta.url)));
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(t){return {width:t.length*16}},strokeText(){},fillText(){}})})};
const e=createEscapeExterior(THREE,1.5),l=createAerialLayouts(THREE,e),timeline=prepareEstateTimeline(THREE,e,l),ray=new THREE.Raycaster();
const asphalt=ANNEXE_REAR_SURFACES.filter(s=>s.surface==='junction');
const inside=(p,s)=>pointInFootprint(p,s.points)&&!s.holes.some(h=>pointInFootprint(p,h));
const onNew=p=>asphalt.some(s=>inside(p,s));
const samples=input.routes.flatMap(route=>route.slice(1).flatMap((b,i)=>Array.from({length:20},(_,j)=>b.map((v,k)=>route[i][k]+(v-route[i][k])*j/20)))).filter(onNew);
// Independent checks immediately outside the long wall, projecting bay and head.
const wallSamples=[];
for(const name of ['Oakmere joined extension brick walls','Oakmere court projecting bay brick walls','Oakmere widened head brick walls','Oakmere blue-face projecting bay brick walls']){
 const wall=input.walls.find(w=>w.name===name),centre=wall.points.reduce((s,p)=>s.map((n,k)=>n+p[k]/4),[0,0]);
 let count=0;
 for(let i=0;i<wall.points.length;i++){
  const a=wall.points[i],b=wall.points[(i+1)%wall.points.length];
  for(const t of [.15,.5,.85]){const p=a.map((v,k)=>v+(b[k]-v)*t),v=p.map((n,k)=>n-centre[k]),length=Math.hypot(...v),outside=p.map((n,k)=>n+v[k]/length*.06);if(onNew(outside)){wallSamples.push(outside);count++;}}
 }
 assert(count>=2,'Paving reaches the stepped wall: '+name);
}
assert(samples.length>100);assert(wallSamples.length>12);
for(const stage of ['source','batched']){
 if(stage==='batched'){batchAerialMeshes(THREE,e.model,{exclude:[e.trees,e.terrain,...l.visibilityObjects]});cacheAerialTransforms(e.scene);}
 for(const {year} of PERIODS){
  timeline.setPeriod(year);e.model.updateMatrixWorld(true);
  const meshes=[];l.historicRoads.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
  const expected=[1915,1916,1938].includes(year);
  for(const p of [...samples,...wallSamples]){
   ray.set(new THREE.Vector3(p[0],.49,p[1]),new THREE.Vector3(0,-1,0));
   const hits=ray.intersectObjects(meshes,false),hit=hits[0];
   assert(hit||!expected,'Road or paving reaches '+p);
   assert.equal(hits.some(h=>h.point.y<.39&&h.object.material.color.getHex()===0x555b5c),expected,`${stage} ${year}: road/paving visibility at ${p}`);
  }
 }
}
// At both mouths there is asphalt all the way into the original through-road.
timeline.setPeriod(1916);e.model.updateMatrixWorld(true);const meshes=[];e.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
for(const route of [input.routes[0],input.routes[3]]){
 const a=route.at(-2),b=route.at(-1),dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
 for(let d=0;d<5;d+=.2)for(const offset of [-2,0,2]){
  const p=[b[0]-dx/len*d-dz/len*offset,b[1]-dz/len*d+dx/len*offset];ray.set(new THREE.Vector3(p[0],.49,p[1]),new THREE.Vector3(0,-1,0));
  assert.equal(ray.intersectObjects(meshes,false)[0]?.object.material.color.getHex(),0x555b5c,'No gap or internal kerb at a road mouth');
 }
}
console.log('PASS: merged annexe rear roads, both open mouths, wall-edge paving, and only 1915/1916/1938 before and after batching.');


