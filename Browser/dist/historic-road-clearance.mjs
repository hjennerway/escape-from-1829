import {MODERN_ROAD_PATHS} from './modern-road-data.mjs';
import {earthToScene} from './earth-registration.mjs';
import {ROAD_STYLE} from './road-style.mjs';

export const SHARED_HISTORIC_LANES=Object.freeze(MODERN_ROAD_PATHS
 .filter(p=>p.name==='Vivienne Smith Lane'||p.name.startsWith('Parsons Lane'))
 .map(p=>({name:p.name,points:p.coordinates.map(c=>earthToScene(...c))})));
const segments=SHARED_HISTORIC_LANES.flatMap(p=>p.points.slice(1).map((b,i)=>[p.points[i],b]));
export function distanceToSharedLane([x,z]){
 return Math.min(...segments.map(([a,b])=>{
  const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz;
  const t=l?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/l)):0;
  return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);
 }));
}

// Reserve the complete saved lane surface, including borders and round caps.
// Split at BOTH sides of a lane, so a crossing cannot leave overlapping strips
// or discard a later, independently marked stretch of the historic route.
export function clearSharedLanes(road){
 const clearance=road.width/2+3+2*ROAD_STYLE.edgeWidth+.04;
 const dense=[road.points[0]];
 for(let i=1;i<road.points.length;i++){
  const a=road.points[i-1],b=road.points[i],steps=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.25));
  for(let j=1;j<=steps;j++)dense.push(a.map((v,k)=>v+(b[k]-v)*j/steps));
 }
 const parts=[];let part=[];
 for(let i=0;i<dense.length;i++){
  const p=dense[i],outside=distanceToSharedLane(p)>=clearance;
  if(i){
   const a=dense[i-1],wasOutside=distanceToSharedLane(a)>=clearance;
   if(outside!==wasOutside){
    let lo=0,hi=1;
    for(let n=0;n<28;n++){
     const t=(lo+hi)/2,q=a.map((v,k)=>v+(p[k]-v)*t);
     if((distanceToSharedLane(q)>=clearance)===wasOutside)lo=t;else hi=t;
    }
    const t=wasOutside?lo:hi,q=a.map((v,k)=>v+(p[k]-v)*t);
    if(wasOutside){part.push(q);parts.push(part);part=[];}else part.push(q);
   }
  }
  if(outside)part.push(p);
 }
 if(part.length>1)parts.push(part);
 // Keep the original sampled curves inside each safe interval; dense points
 // are for collision search only, not thousands of unnecessary rendered caps.
 return parts.filter(p=>p.length>1&&p.slice(1).reduce((s,b,i)=>s+Math.hypot(b[0]-p[i][0],b[1]-p[i][1]),0)>2)
  .map((p,i)=>{
   const points=[p[0]];
   for(let j=1;j<p.length-1;j++){
    const a=points[points.length-1],b=p[j],c=p[j+1];
    if(Math.abs((b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]))>1e-8)points.push(b);
   }
   points.push(p[p.length-1]);
   return {...road,name:i?`${road.name} · section ${i+1}`:road.name,points};
  });
}
