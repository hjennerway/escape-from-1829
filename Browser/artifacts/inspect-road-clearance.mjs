import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../dist/aerial-layouts.mjs';
import {HISTORIC_ROADS} from '../dist/historic-road-layout.mjs';
import {pointInFootprint,existingBuildingFootprints} from '../dist/historic-footprints.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(t){return {width:t.length*16}},strokeText(){},fillText(){}})})};
const e=createEscapeExterior(THREE,1.5),l=createAerialLayouts(THREE,e),occupied=l.historicRoads.userData.missingFootprints.occupied;
const hits=[];
for(const road of HISTORIC_ROADS){
 const bad=[];
 const check=p=>{if(occupied.some(poly=>pointInFootprint(p,poly)))bad.push(p)};
 for(let i=1;i<road.points.length;i++){
  const a=road.points[i-1],b=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length<1e-8)continue;
  const steps=Math.ceil(length/.4);
  for(let j=0;j<=steps;j++)for(const offset of [-road.width/2-.6,0,road.width/2+.6]){
   const t=j/steps;check([a[0]+dx*t-dz/length*offset,a[1]+dz*t+dx/length*offset]);
  }
 }
 for(const p of [road.points[0],road.points.at(-1)])for(let i=0;i<24;i++){const a=i*Math.PI/12,r=road.width/2+.6;check([p[0]+r*Math.cos(a),p[1]+r*Math.sin(a)]);}
 if(bad.length)hits.push({road:road.name,count:bad.length,bounds:[Math.min(...bad.map(p=>p[0])),Math.min(...bad.map(p=>p[1])),Math.max(...bad.map(p=>p[0])),Math.max(...bad.map(p=>p[1]))],first:bad[0],polygons:occupied.filter(poly=>bad.some(p=>pointInFootprint(p,poly)))});
}
console.log(JSON.stringify(hits,null,2));
for(const [name,object] of Object.entries(e))if(object?.isObject3D&&!['scene','model'].includes(name)){
 const polygons=existingBuildingFootprints(THREE,{model:object});
 if(hits.some(hit=>polygons.some(poly=>pointInFootprint(hit.first,poly))))console.log('Overlapping object:',name);
}
