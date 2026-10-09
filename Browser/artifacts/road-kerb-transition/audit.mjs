import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import * as THREE from '../../dist/vendor/three.module.js';
import * as before from 'baseline:road-end-fades';
import * as after from '../../dist/road-end-fades.mjs';
import {MODERN_ROAD_PATHS} from '../../dist/modern-road-data.mjs';
import {roadCenterline} from '../../dist/road-centerlines.mjs';
import {PARSONS_NORTH_MODERN_TAIL} from '../../dist/parsons-north-bend.mjs';
import {HISTORIC_ROADS} from '../../dist/historic-road-layout.mjs';
import {assertRoadEndSurface} from '../../test-support/road-end-assertions.mjs';

let roadMeshes=0,roadVertices=0,kerbs=0;
const modern=MODERN_ROAD_PATHS.map(r=>({...r,points:r.name==='Vivienne Smith Lane'?roadCenterline(r).slice(0,12):roadCenterline(r)}));
modern.push({name:'Vivienne Smith Lane eastern continuation',points:roadCenterline(MODERN_ROAD_PATHS.find(r=>r.name==='Vivienne Smith Lane')).slice(11)},
 {name:'Parsons Lane northern modern endpoint',points:PARSONS_NORTH_MODERN_TAIL});
for(const road of [...modern,...HISTORIC_ROADS]){
 if(!after.GRASS_ROAD_ENDS[road.name])continue;
 const ends=after.prepareRoadEnds(road.name,road.points),width=road.width??6;
 const old=before.createRoadEndFades(THREE,road.name,width,ends),current=after.createRoadEndFades(THREE,road.name,width,ends);
 for(const mesh of current.children){
  const original=old.getObjectByName(mesh.name);
  if(mesh.userData.roadEndFade.kind==='edge'){
   assertRoadEndSurface(mesh);kerbs++;
   assert.throws(()=>assertRoadEndSurface(original),/Kerbs remain solid/);
   continue;
  }
  for(const [g,h] of [[mesh.geometry,original.geometry],...mesh.children.map((child,i)=>[child.geometry,original.children[i].geometry])]){
   for(const key of Object.keys(g.attributes))assert.deepEqual(g.attributes[key].array,h.attributes[key].array,'Retain every road position, normal, texture coordinate and opacity: '+mesh.name);
   assert.deepEqual(g.index?.array,h.index?.array,'Retain road triangles');
  }
  roadVertices+=mesh.geometry.attributes.position.count;roadMeshes++;
 }
}
const report={roadMeshes,roadVertices,kerbs,roadBuffersUnchanged:true,originalGhostRejected:true};
await writeFile(new URL('road-preservation.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(report);
