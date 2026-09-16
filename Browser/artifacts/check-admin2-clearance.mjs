import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../dist/aerial-layouts.mjs';
import {HISTORIC_ROADS} from '../dist/historic-roads.mjs';
import {missingHistoricFootprints,pointInFootprint} from '../dist/historic-footprints.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5);createAerialLayouts(THREE,exterior);
const missing=missingHistoricFootprints(THREE,exterior),road=HISTORIC_ROADS.find(r=>r.name==='Admin north service road');
const failures=[];
for(let i=1;i<road.points.length;i++){
 const a=road.points[i-1],b=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),steps=Math.ceil(length);
 for(let j=0;j<=steps;j++)for(const offset of [-3.6,0,3.6]){
  const t=j/steps,p=[a[0]+dx*t-dz/length*offset,a[1]+dz*t+dx/length*offset];
  const hit=missing.occupied.find(poly=>pointInFootprint(p,poly));
  if(hit)failures.push({point:p,outline:hit});
 }
}
console.log(JSON.stringify(failures.slice(0,8),null,2));console.log('Conflicts: '+failures.length);
