import {ANNEXE_TRIANGLE_CORNERS,IRBY_ANNEXE_APPROACH} from './annexe-loop-road.mjs';
import {ROAD_STYLE} from './road-style.mjs';

const add=(a,b,scale=1)=>a.map((v,i)=>v+b[i]*scale);
const subtract=(a,b)=>a.map((v,i)=>v-b[i]);
const unit=v=>{const length=Math.hypot(...v);return v.map(n=>n/length);};
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
const left=([x,z])=>[-z,x],right=([x,z])=>[z,-x];
const [outerStart,outerEnd,near]=ANNEXE_TRIANGLE_CORNERS;
const avenueDirection=unit(subtract(outerEnd,near));
const avenueCentre=add(near,avenueDirection,-15);
const approach=IRBY_ANNEXE_APPROACH.points;
const approachIndex=approach.findIndex(p=>p[0]>=319);
const approachCentre=approach[approachIndex];
const approachDirection=unit(subtract(approach[approachIndex-1],approachCentre));
const start=add(avenueCentre,right(avenueDirection),3);
const end=add(approachCentre,right(approachDirection),3);
const c1=add(start,avenueDirection,15),c2=add(end,approachDirection,-14);
const bend=[],normals=[];
for(let i=0;i<=48;i++){
 const t=i/48,q=1-t;
 bend.push([0,1].map(k=>q*q*q*start[k]+3*q*q*t*c1[k]+3*q*t*t*c2[k]+t*t*t*end[k]));
 const tangent=[0,1].map(k=>3*q*q*(c1[k]-start[k])+6*q*t*(c2[k]-c1[k])+3*t*t*(end[k]-c2[k]));
 normals.push(right(unit(tangent)));
}
// Only the lawn-side half of the bend needs resurfacing. Its curve joins both
// existing verges tangentially; the triangle and outer road remain fixed.
const returnEdge=[approachCentre,...approach.slice(approachIndex+1),near,avenueCentre];
export const IRBY_ROUNDED_BEND=Object.freeze({points:bend,normals});
export const IRBY_ROUNDING_PAVING=Object.freeze([
 {name:'Irby rounded frontage bend border',surface:'junction edge',points:[...bend.map((p,i)=>add(p,normals[i],ROAD_STYLE.edgeWidth)),...returnEdge]},
 {name:'Irby rounded frontage bend',surface:'junction',points:[...bend,...returnEdge]},
 // Bury the three old pointed kerbs before placing the rounded island above.
 {name:'Annexe triangular island resurfacing',surface:'junction',points:ANNEXE_TRIANGLE_CORNERS}
]);

function insetTriangle(distance){
 const corners=ANNEXE_TRIANGLE_CORNERS;
 return corners.map((p,i)=>{
  const incoming=unit(subtract(p,corners[(i+2)%3])),outgoing=unit(subtract(corners[(i+1)%3],p));
  const a=add(p,left(incoming),distance),b=add(p,left(outgoing),distance);
  return add(a,incoming,cross(subtract(b,a),outgoing)/cross(incoming,outgoing));
 });
}
const sharp=insetTriangle(3+ROAD_STYLE.edgeWidth);
const island=[],arcs=[];
for(let i=0;i<3;i++){
 const corner=sharp[i],u=unit(subtract(sharp[(i+2)%3],corner)),v=unit(subtract(sharp[(i+1)%3],corner));
 const angle=Math.acos(u[0]*v[0]+u[1]*v[1]),radius=1.3,trim=radius/Math.tan(angle/2);
 const a=add(corner,u,trim),b=add(corner,v,trim);
 const center=add(corner,unit(add(u,v)),radius/Math.sin(angle/2));
 const from=Math.atan2(a[1]-center[1],a[0]-center[0]);
 let sweep=Math.atan2(b[1]-center[1],b[0]-center[0])-from;
 while(sweep<=0)sweep+=Math.PI*2;
 const points=Array.from({length:17},(_,j)=>{const angle=from+sweep*j/16;return add(center,[Math.cos(angle),Math.sin(angle)],radius);});
 island.push(...points);arcs.push({center,radius,points,oldCorner:corner});
}
export const IRBY_TRIANGLE_ROUNDING=Object.freeze({arcs});
export const IRBY_ROUNDED_ISLAND=Object.freeze({name:'Annexe rounded triangular grass island',points:island,raisedIsland:true});
export const IRBY_ROUNDED_KERB=Object.freeze({name:'Annexe rounded triangular inner kerb',points:[...island,island[0]],width:ROAD_STYLE.edgeWidth});
