import {ANNEXE_TRIANGLE_CORNERS,ANNEXE_TRIANGLE_FORK} from './annexe-loop-road.mjs';
import {ROAD_STYLE} from './road-style.mjs';

const add=(a,b,s=1)=>a.map((v,i)=>v+b[i]*s),sub=(a,b)=>a.map((v,i)=>v-b[i]);
const unit=v=>v.map(n=>n/Math.hypot(...v)),cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
const left=([x,z])=>[-z,x],right=([x,z])=>[z,-x];
const [apex,far,near]=ANNEXE_TRIANGLE_CORNERS;
const boundary=[apex,far,...ANNEXE_TRIANGLE_FORK.slice(0,-1)];
// Offset the curved lane on its island side, then clip to the two straight
// road verges. This retains the concave sweep without extending its tangents.
const forkNormals=ANNEXE_TRIANGLE_FORK.map((p,i)=>left(unit(sub(ANNEXE_TRIANGLE_FORK[Math.min(i+1,ANNEXE_TRIANGLE_FORK.length-1)],ANNEXE_TRIANGLE_FORK[Math.max(0,i-1)]))));
const offset=ANNEXE_TRIANGLE_FORK.map((p,i)=>add(p,forkNormals[i],3+ROAD_STYLE.edgeWidth));
const incoming=unit(sub(far,apex)),outgoing=unit(sub(near,far));
const a=add(far,left(incoming),3+ROAD_STYLE.edgeWidth),b=add(far,left(outgoing),3+ROAD_STYLE.edgeWidth);
const farInset=add(a,incoming,cross(sub(b,a),outgoing)/cross(incoming,outgoing));
let sharp=[offset.at(-1),farInset,...offset.slice(0,-1)];
for(const [a,b] of [[apex,far],[far,near]]){
 const normal=left(unit(sub(b,a))),distance=p=>sub(p,a).reduce((s,v,k)=>s+v*normal[k],0)-(3+ROAD_STYLE.edgeWidth);
 const clipped=[];
 for(let j=0;j<sharp.length;j++){
  const p=sharp[j],q=sharp[(j+1)%sharp.length],dp=distance(p),dq=distance(q);
  if(dp>=-1e-8)clipped.push(p);
  if((dp>=0)!==(dq>=0))clipped.push(add(p,sub(q,p),dp/(dp-dq)));
 }
 sharp=clipped.filter((p,i)=>Math.hypot(...sub(p,clipped[(i+1)%clipped.length]))>1e-6);
}
// Keep enough straight length around the three tips for visible corner arcs.
for(let pass=0;pass<3;pass++){
 const tips=sharp.filter((p,i)=>{const u=unit(sub(sharp[(i+sharp.length-1)%sharp.length],p)),v=unit(sub(sharp[(i+1)%sharp.length],p));return u[0]*v[0]+u[1]*v[1]>Math.cos(2.7);});
 sharp=sharp.filter(p=>tips.includes(p)||!tips.some(t=>Math.hypot(...sub(p,t))<5));
}
const island=[],arcs=[];
for(let i=0;i<sharp.length;i++){
 const corner=sharp[i],prev=sharp[(i+sharp.length-1)%sharp.length],next=sharp[(i+1)%sharp.length];
 const u=unit(sub(prev,corner)),v=unit(sub(next,corner));
 if(cross(sub(corner,prev),sub(next,corner))<0){island.push(corner);continue;}
 const angle=Math.acos(Math.max(-1,Math.min(1,u[0]*v[0]+u[1]*v[1])));
 if(Math.PI-angle<1e-6){island.push(corner);continue;}
 const trim=Math.min(1.3/Math.tan(angle/2),Math.hypot(...sub(prev,corner))*.45,Math.hypot(...sub(next,corner))*.45);
 const radius=trim*Math.tan(angle/2),a=add(corner,u,trim),b=add(corner,v,trim);
 const center=add(corner,unit(add(u,v)),radius/Math.sin(angle/2));
 const from=Math.atan2(a[1]-center[1],a[0]-center[0]);
 let sweep=Math.atan2(b[1]-center[1],b[0]-center[0])-from;while(sweep<=0)sweep+=Math.PI*2;
 const points=Array.from({length:17},(_,j)=>{const t=from+sweep*j/16;return add(center,[Math.cos(t),Math.sin(t)],radius);});
 island.push(...points);if(angle<2.7)arcs.push({center,radius,points,oldCorner:corner});
}
// Only resurface inside the lane-centre loop. The fork itself is a normal
// six-metre road ribbon, so no extra paving can spread toward the tree.
export const IRBY_ROUNDING_PAVING=Object.freeze([{name:'Annexe triangular island resurfacing',surface:'junction',points:boundary}]);
const normals=ANNEXE_TRIANGLE_FORK.map((p,i)=>right(unit(sub(ANNEXE_TRIANGLE_FORK[Math.min(i+1,ANNEXE_TRIANGLE_FORK.length-1)],ANNEXE_TRIANGLE_FORK[Math.max(0,i-1)]))));
export const IRBY_ROUNDED_BEND=Object.freeze({points:ANNEXE_TRIANGLE_FORK.map((p,i)=>add(p,normals[i],3)),normals});
export const IRBY_TRIANGLE_ROUNDING=Object.freeze({arcs});
export const IRBY_ROUNDED_ISLAND=Object.freeze({name:'Annexe rounded triangular grass island',points:island,raisedIsland:true});
export const IRBY_ROUNDED_KERB=Object.freeze({name:'Annexe rounded triangular inner kerb',points:[...island,island[0]],width:ROAD_STYLE.edgeWidth});
