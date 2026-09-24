import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {HISTORIC_ROADS} from './dist/historic-roads.mjs';
import {SHARED_HISTORIC_LANES} from './dist/historic-road-clearance.mjs';
import {WEST_PARSONS_JUNCTIONS} from './dist/west-parsons-junctions.mjs';
import {historicSurfaceSection} from './dist/estate-periods.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(t){return {width:t.length*16}},strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior);
exterior.model.updateMatrixWorld(true);
const meshes=[];for(const group of [layouts.historicRoads,layouts.roads])group.traverse(o=>{if(o.isMesh)meshes.push(o);});
const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);
for(const [name,laneName,end] of [['Northern estate boundary','Parsons Lane',false],['North west ward approach','Parsons Lane (Upton Lea)',true]]){
 const road=HISTORIC_ROADS.find(r=>r.name===name),p=end?road.points.at(-1):road.points[0];
 const lane=SHARED_HISTORIC_LANES.find(r=>r.name===laneName);
 let join,distance=Infinity;
 for(let i=1;i<lane.points.length;i++){
  const a=lane.points[i-1],b=lane.points[i],d=b.map((v,k)=>v-a[k]),l=d.reduce((s,v)=>s+v*v,0);
  const t=Math.max(0,Math.min(1,d.reduce((s,v,k)=>s+v*(p[k]-a[k]),0)/l)),q=a.map((v,k)=>v+d[k]*t),gap=Math.hypot(...q.map((v,k)=>v-p[k]));
  if(gap<distance){join=q;distance=gap;}
 }
 const normal=[-(join[1]-p[1])/distance,(join[0]-p[0])/distance];
 // Scan the full driving corridor across the old grass gap and buried kerbs.
 for(let t=0;t<=1.001;t+=.025)for(const offset of [-2,-1,0,1,2]){
  const q=p.map((v,k)=>v+(join[k]-v)*t+normal[k]*offset);
  ray.set(new THREE.Vector3(q[0],2,q[1]),down);
  const hit=ray.intersectObjects(meshes,false)[0];
  assert.equal(hit?.object.material.color.getHex(),0x555b5c,name+' continuous asphalt at '+q);
 }
 for(const surface of WEST_PARSONS_JUNCTIONS.filter(s=>s.name.startsWith(name))){
  assert.equal(historicSurfaceSection(surface.name),historicSurfaceSection(name),'Joins and borders follow the adjoining historic road');
  assert(layouts.historicRoads.getObjectByName(surface.name));
 }
}
console.log('PASS: both western Parsons joins have full-width continuous asphalt and matching period ownership.');

