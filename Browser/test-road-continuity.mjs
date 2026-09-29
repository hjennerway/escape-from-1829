import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {writeFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';

// Inspect actual world-space geometry, including hidden batch sources in a
// compiled scene. A resurfacing patch must never form a ledge across a lane.
export function assertRoadContinuity(layouts){
 const roots=[layouts.roads,layouts.historicRoads,layouts.entrance,layouts.countessRoundabout,layouts.carPark];
 for(const root of roots)root.updateWorldMatrix(true,true);
 const reference=layouts.roads.getObjectByName('Vivienne Smith Lane').children[1].children[0];
 const level=new THREE.Vector3().fromBufferAttribute(reference.geometry.attributes.position,0).applyMatrix4(reference.matrixWorld).y;
 const point=new THREE.Vector3(),normal=new THREE.Vector3(),surfaces=[],issues=[],sides=[];
 for(const root of roots)root.traverse(mesh=>{
  if(!mesh.isMesh||mesh.isInstancedMesh)return;
  const material=mesh.material;
  if(material.userData?.estateSurface!=='asphalt'&&mesh.name!=='Countess roundabout painted centre')return;
  const p=mesh.geometry.attributes.position,n=mesh.geometry.attributes.normal;
  let min=Infinity,max=-Infinity;
  for(let i=0;i<p.count;i++){
   normal.fromBufferAttribute(n,i).transformDirection(mesh.matrixWorld);
   if(normal.y<.99)continue;
   point.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);
   min=Math.min(min,point.y);max=Math.max(max,point.y);
  }
  if(!Number.isFinite(min))return;
  const name=mesh.name||mesh.parent.name;
  surfaces.push({name,min,max});
  if(Math.max(Math.abs(min-level),Math.abs(max-level))>1e-5)issues.push({name,min,max,step:Math.max(Math.abs(min-level),Math.abs(max-level))});
 });
 // The supporting sides must remain under the level carriageway. This also
 // catches stale skirts if a top was moved after its ground contact was built.
 for(const root of roots)root.traverse(mesh=>{
  if(!mesh.userData.groundContact||mesh.material.color.getHex()!==reference.material.color.getHex())return;
  const p=mesh.geometry.attributes.position;
  for(let i=0;i<p.count;i++){
   point.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);
   if(point.y>level+1e-5){sides.push({name:mesh.name,y:point.y});break;}
  }
 });
 assert(surfaces.length>1000,'Inspect the whole historic and modern road network');
 const report={level,surfaceCount:surfaces.length,issues,exposedSides:sides};
 assert.deepEqual(issues,[],'All carriageways, courts, junction patches, parking and paint must meet flush: '+JSON.stringify(report));
 assert.deepEqual(sides,[],'No internal asphalt support may project above the road');
 return report;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
 const exterior=createEscapeExterior(THREE,1.6),layouts=createAerialLayouts(THREE,exterior);
 const result=assertRoadContinuity(layouts);
 writeFileSync(new URL('artifacts/road-steps-audit.json',import.meta.url),JSON.stringify(result,null,2));
 console.log(`PASS: ${result.surfaceCount} road surfaces and their supporting edges meet one continuous carriageway level.`);
}
