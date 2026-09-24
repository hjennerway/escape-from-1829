import {ROAD_STYLE} from './road-style.mjs';

const add=(a,b,k=1)=>a.map((v,i)=>v+k*b[i]);
const unit=v=>{const n=Math.hypot(...v);return v.map(x=>x/n);};
const left=([x,z])=>[-z,x];
function bend(a,b,c,d){
 const points=[],normals=[];
 for(let i=0;i<=64;i++){
  const t=i/64,q=1-t;
  points.push(a.map((v,k)=>q*q*q*v+3*q*q*t*b[k]+3*q*t*t*c[k]+t*t*t*d[k]));
  normals.push(left(unit(a.map((v,k)=>3*q*q*(b[k]-v)+6*q*t*(c[k]-b[k])+3*t*t*(d[k]-c[k])))));
 }
 return {points,normals};
}
function verge(name,curve,returnEdge){
 return [
  {name:name+' border',surface:'junction edge',points:[...curve.points.map((p,i)=>add(p,curve.normals[i],ROAD_STYLE.edgeWidth)),...returnEdge]},
  {name,surface:'junction',points:[...curve.points,...returnEdge]}
 ];
}

// The September 24 red guides describe the outside of the junction. These
// tangent verges bury the old ribbon joins without touching the grass island.
export function adminTeardropPaving(roads){
 const road=name=>roads.find(r=>r.name===name).points;
 const lane=road('Historic lane continuation'),drive=road('Admin east crossing drive'),tear=road('Admin teardrop circulation'),avenue=road('Annexe front avenue');
 const direction=(p,i)=>unit(p[Math.min(p.length-1,i+1)].map((v,k)=>v-p[Math.max(0,i-1)][k]));
 const laneIndex=64,driveIndex=24,ld=direction(lane,laneIndex),dd=direction(drive,driveIndex);
 const a=add(lane[laneIndex],left(ld),3),b=add(drive[driveIndex],left(dd),3);
 const treeCurve=bend(a,add(a,ld,24),add(b,dd,-25),b);
 const treeReturn=[...drive.slice(0,driveIndex+1).reverse(),...tear.slice(12,32).reverse(),...lane.slice(laneIndex,-1).reverse()];
 const avenueDirection=unit(avenue[9].map((v,i)=>v-avenue[8][i]));
 const avenueCentre=add(avenue[8],avenueDirection,10);
 const lawnDriveIndex=20,lawnDirection=direction(drive,lawnDriveIndex);
 const c=add(drive[lawnDriveIndex],left(lawnDirection),-3),d=add(avenueCentre,left(avenueDirection),3);
 const lawnCurve=bend(c,add(c,lawnDirection,-26),add(d,avenueDirection,-20),d);
 const lawnReturn=[avenueCentre,...avenue.slice(0,9).reverse(),...tear.slice(32,48).reverse(),...drive.slice(0,lawnDriveIndex+1)];
 return [
  ...verge('Admin teardrop tree-side sweep',treeCurve,treeReturn),
  ...verge('Admin teardrop outer lawn sweep',lawnCurve,lawnReturn),
  // Slight overlap beneath masonry avoids a hairline of grass at each step.
  // The exposed boundary follows the east pavilion, shoulder and low rear link.
  {name:'Admin teardrop building-side paving',surface:'junction',points:[
   [224,43.5],[232.45,40.15],[232.45,22.55],[235.45,22.55],
   [235.45,19.35],[241.45,19.35],[241.45,12.9],[240,10],[240,2],[245,2],[254,6],
   ...tear.slice(1,13),...lane.slice(laneIndex,-1).reverse()
  ]}
 ];
}
