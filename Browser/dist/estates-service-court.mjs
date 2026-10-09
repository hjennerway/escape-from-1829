import {ESTATES_SOURCE_FOOTPRINT,estatesPoint} from './estates-department.mjs';
import {IRBY_CORRIDOR} from './irby-corridor.mjs';
import {IRBY_REAR_SHIFT} from './irby-ashley.mjs';
import {ROAD_STYLE} from './road-style.mjs';

// Retain the Estates entrance court while following the relocated ward frontage.
const p=ESTATES_SOURCE_FOOTPRINT;
const irbyCourtBack=-88.1+IRBY_REAR_SHIFT;
// Follow the north and entrance edges, leaving the building, cobbled court
// and former east/south road outside the asphalt polygon.
const estateCourtBoundary=[p[9],p[8],p[7],
 [231.3,p[6][1]],[231.3,p[2][1]],p[2],p[1]]
 .map(([x,z])=>{const q=estatesPoint(x,0,z);return [q[0],q[2]];});
export const ESTATES_SERVICE_COURT=Object.freeze({
 name:'Irby Estates continuous service court',surface:'junction',
 // The upper boundary follows the three existing Irby/Ashley wings exactly.
 points:[[221.7,irbyCourtBack],[235.4,irbyCourtBack],[235.4,-74],[241.7,-74],
  [241.7,irbyCourtBack],[250.4,irbyCourtBack],[250.4,-74],[260.6,-74],
  [264,-74],[264,-72],
  ...estateCourtBoundary,[233,-27.5],[233,-18],[236,-7],[240,1],[244,5],[242,13],[234,13],
  [222,2],[220.86,-8.1],[220.86,-48.7],
  [220.86,IRBY_CORRIDOR.end[1]+IRBY_CORRIDOR.width/2],
  [IRBY_CORRIDOR.end[0],IRBY_CORRIDOR.end[1]+IRBY_CORRIDOR.width/2]],
 reference:'Research/estates/grass-road-revision.png'
});

// Join the front court along the marked east side, flush to both wall returns.
export const IRBY_SIDE_ROAD=Object.freeze({
 name:'Irby Ashley side connection',surface:'junction',
 points:[[263.2,-112.9],[270,-112.9],[270,-70],[260.6,-70],
  [260.6,-99.6+IRBY_REAR_SHIFT],[263.2,-99.6+IRBY_REAR_SHIFT]]
});

// The owner's purple lines join the two exposed service-road kerbs around
// Estates. Anchor inside each surviving edge and follow the rotated frontage.
export function estatesKerbJoins(road){
 const width=ROAD_STYLE.edgeWidth,offset=road.width/2+width/2;
 function edge(i){
  const a=road.points[i-1],b=road.points[i+1],p=road.points[i];
  const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
  return [p[0]-dz/length*offset,p[1]+dx/length*offset];
 }
 function tangent(i,direction=1){
  const a=edge(i-1),b=edge(i+1),length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  return b.map((v,k)=>(v-a[k])/length*direction);
 }
 const along=(p,d,length)=>p.map((v,k)=>v+d[k]*length);
 const front=z=>{const q=estatesPoint(231.3,0,z);return [q[0],q[2]];};
 function curve(points,b,c,d){
  const a=points.at(-1);
  for(let i=1;i<=32;i++){const t=i/32,q=1-t;points.push(a.map((v,k)=>q*q*q*v+3*q*q*t*b[k]+3*q*t*t*c[k]+t*t*t*d[k]));}
 }
 const start=edge(116),corner=front(p[8][1]),returnPoint=front(-54),end=edge(61);
 const frontage=returnPoint.map((v,k)=>(v-corner[k])/Math.hypot(...returnPoint.map((v,j)=>v-corner[j])));
 const long=[start];
 curve(long,along(start,tangent(116,-1),10),along(corner,frontage,-7),corner);
 long.push(returnPoint);
 curve(long,along(returnPoint,frontage,1.2),along(end,tangent(61,-1),-1.5),end);
 const short=[edge(38)],shortEnd=edge(50);
 curve(short,along(short[0],tangent(38),3.5),along(shortEnd,tangent(50),-3.5),shortEnd);
 return [
  {name:'Estates workshop smooth kerb join',points:long,width,joinHeight:.32,blendLength:2},
  {name:'Estates entrance smooth kerb join',points:short,width,joinHeight:.32,blendLength:2}
 ];
}
