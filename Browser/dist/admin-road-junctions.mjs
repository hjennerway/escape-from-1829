import {VIVIENNE_LANE} from './modern-entrance.mjs';
import {SHARED_HISTORIC_LANES} from './historic-road-clearance.mjs';

const unit=v=>{const l=Math.hypot(...v);return v.map(n=>n/l);};
const along=(origin,target,d)=>{const u=unit(target.map((v,i)=>v-origin[i]));return origin.map((v,i)=>v+u[i]*d);};
function inFromEnd(road,end,distance=7){
 const p=end?road.points.slice().reverse():road.points;let left=distance;
 for(let i=1;i<p.length;i++){
  const d=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);
  if(d>=left)return along(p[i-1],p[i],left);left-=d;
 }return p.at(-1);
}
function junction(name,origin,centres){
 const arms=centres.map(center=>{
  const vector=center.map((v,i)=>v-origin[i]),direction=unit(vector);
  return {center,direction,normal:[-direction[1],direction[0]],distance:Math.hypot(...vector),angle:Math.atan2(vector[1],vector[0])};
 }).sort((a,b)=>a.angle-b.angle);
 function outline(radius){
  const points=[];
  for(let i=0;i<arms.length;i++){
   const a=arms[i],b=arms[(i+1)%arms.length],edge=(arm,sign)=>arm.center.map((v,k)=>v+arm.normal[k]*radius*sign);
   const start=edge(a,1),end=edge(b,-1),c=start.map((v,k)=>v-a.direction[k]*a.distance*.48),d=end.map((v,k)=>v-b.direction[k]*b.distance*.48);
   points.push(edge(a,-1),start);
   for(let j=1;j<=16;j++){const t=j/16,q=1-t;points.push([0,1].map(k=>q*q*q*start[k]+3*q*q*t*c[k]+3*q*t*t*d[k]+t*t*t*end[k]));}
  }return points;
 }
 // Localised open mouths replace the clipped caps at the two red-circled
 // junctions. The original named lane and all its saved vertices stay intact.
 return [{name:name+' border',surface:'junction edge',points:outline(3.6),junctionOrigin:origin},
  {name,surface:'junction',points:outline(3),junctionOrigin:origin}];
}
export function mainAdminLaneJunctions(roads){
 const road=name=>roads.find(r=>r.name===name),west=VIVIENNE_LANE[8],east=VIVIENNE_LANE[11];
 const drive=road('Admin east crossing drive'),inner=road('Annexe inner east road');
 const join=drive.points.at(-1),split=inner.points.findIndex(p=>p[0]>join[0]);
 const westArm={points:[join,...inner.points.slice(0,split).reverse()]};
 const eastArm={points:[join,...inner.points.slice(split)]};
 return [
  ...junction('Admin west lane junction',west,[along(west,VIVIENNE_LANE[7],13),along(west,VIVIENNE_LANE[9],13),inFromEnd(road('Historic lane continuation'),false)]),
  ...junction('Admin south lane junction',east,[along(east,VIVIENNE_LANE[10],14),inFromEnd(road('Southern estate drive'),false),inFromEnd(inner,false)]),
  ...junction('Admin pine road east junction',join,[inFromEnd(westArm,false,12),inFromEnd(drive,true,12),inFromEnd(eastArm,false,12)])
 ];
}

export function parsonsNorthEndJunction(roads){
 const lane=SHARED_HISTORIC_LANES.find(p=>p.name==='Parsons Lane (North)').points,origin=lane.at(-1);
 const road=roads.find(r=>r.name==='Northern Parsons Lane connection');
 // Follow the saved endpoint exactly: a smoothed two-arm mouth can cut the
 // corner and leave a gap when the retraced approach changes direction.
 const centers=[inFromEnd(road,true,7),origin,along(origin,lane.at(-2),12)];
 const directions=centers.slice(1).map((p,i)=>unit(p.map((v,k)=>v-centers[i][k])));
 const normals=directions.map(([x,z])=>[-z,x]);
 const middle=unit(normals[0].map((v,i)=>v+normals[1][i]));
 const scale=1/(middle[0]*normals[0][0]+middle[1]*normals[0][1]);
 const offsets=[normals[0],middle.map(v=>v*scale),normals[1]];
 const outline=radius=>[1,-1].flatMap(sign=>{
  const side=centers.map((p,i)=>p.map((v,k)=>v+sign*radius*offsets[i][k]));
  return sign===1?side:side.reverse();
 });
 return [{name:'Parsons north end junction border',surface:'junction edge',points:outline(3.6),junctionOrigin:origin},
  {name:'Parsons north end junction',surface:'junction',points:outline(3),junctionOrigin:origin}];
}
