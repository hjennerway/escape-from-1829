import {ESTATES_SOURCE_FOOTPRINT,estatesPoint} from './estates-department.mjs';

// Purple selects continuous asphalt around the translated Estates building,
// through the Irby/Ashley recesses and along the tower service ranges.
// The cobbled entrance remains a hole in the asphalt, along with the walls.
const p=ESTATES_SOURCE_FOOTPRINT;
const estateCourtBoundary=[p[9],p[0],p[1],p[2],
 [231.3,p[2][1]],[231.3,p[6][1]],p[7],p[8]]
 .map(([x,z])=>{const q=estatesPoint(x,0,z);return [q[0],q[2]];});
function roundedRect(x0,z0,x1,z1,r){
 const points=[];
 for(const [cx,cz,start] of [[x1-r,z1-r,0],[x0+r,z1-r,90],[x0+r,z0+r,180],[x1-r,z0+r,270]])
  for(let i=0;i<=8;i++){const a=(start+i*90/8)*Math.PI/180;points.push([cx+r*Math.cos(a),cz+r*Math.sin(a)]);}
 return points;
}
export const ESTATES_SERVICE_GRASS=Object.freeze({
 name:'Irby Estates small grass island',points:roundedRect(237,-83,261,-76,1.6),raisedIsland:true
});
export const ESTATES_SERVICE_COURT=Object.freeze({
 name:'Irby Estates continuous service court',surface:'junction',
 // The upper boundary follows the three existing Irby/Ashley wings exactly.
 points:[[221.7,-112.7],[235.4,-112.7],[235.4,-98.6],[241.7,-98.6],
  [241.7,-112.7],[250.4,-112.7],[250.4,-98.6],[260.6,-98.6],
  [265,-100],[270,-101],[272.5,-98],[272.5,-32],[272,-28.5],[270,-27.5],
  [235,-27.5],[233,-18],[236,-7],[240,1],[244,5],[242,13],[234,13],
  [222,2],[220.86,-8.1],[220.86,-48.7],[220.86,-71],
  [218.5,-73.5],[218.5,-87.5],[221.7,-94]],
 holes:[estateCourtBoundary,ESTATES_SERVICE_GRASS.points],
 reference:'Research/estates/service-court-alignment.png'
});
