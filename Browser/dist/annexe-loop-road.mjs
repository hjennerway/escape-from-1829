import {ANNEXE_SITE,annexePoint,annexeSiteLocal,annexeSitePoint} from './annexe.mjs';
import {ANNEXE_INWARD_SHIFT,moveAnnexeInward} from './annexe-inward-placement.mjs';
import {LAMP_POSTS} from './kml-11-data.mjs';
import {ROAD_STYLE} from './road-style.mjs';
import {SHARED_HISTORIC_LANES} from './historic-road-clearance.mjs';

// Turn only the outer boundary road about its saved northern endpoint. Its
// outer kerb is tangent to the fixed first lamp's square concrete base.
// Keep the previous frontage anchor separate: the annexe avenue does not move.
const previousOuterStart=[333.63,-84.91];
const outerEnd=SHARED_HISTORIC_LANES.find(r=>r.name==='Parsons Lane (North)').points.at(-1);
const lamp=LAMP_POSTS[0],baseCorner=[lamp.x+.17,lamp.z+.17];
const lampVector=baseCorner.map((v,k)=>v-outerEnd[k]);
const bearing=Math.atan2(lampVector[1],lampVector[0])-Math.asin((3+ROAD_STYLE.edgeWidth)/Math.hypot(...lampVector));
const outerStart=[previousOuterStart[0],outerEnd[1]+(previousOuterStart[0]-outerEnd[0])*Math.tan(bearing)];
export const ANNEXE_LOOP_ROAD=Object.freeze({
 source:'Research/historic-roads/annexe-outer-loop-marked.png',
 frontageRevision:'Research/historic-roads/annexe-frontage-junction-marked.png',
 lampAlignment:'Research/historic-roads/parsons-lamp-alignment-marked.png',
 start:Object.freeze(outerStart),
 end:outerEnd
});
const {start,end}=ANNEXE_LOOP_ROAD;
export const annexeOuterRoadZ=x=>start[1]+(x-start[0])*(end[1]-start[1])/(end[0]-start[0]);
const along=[177.05,-190.33848406675448],length=Math.hypot(...along),unit=along.map(v=>v/length);
// Orange replaces green: shift the avenue nine metres toward the annexe.
export const ANNEXE_AVENUE_SHIFT=Object.freeze([-unit[1]*9,unit[0]*9]);
// Preserve the previous island placement as the source for the new rigid turn.
const previousTrianglePoint=([x,z])=>[x+ANNEXE_AVENUE_SHIFT[0]-unit[0]*35,z+ANNEXE_AVENUE_SHIFT[1]-unit[1]*35];
const [baseA,baseB]=[previousOuterStart,[355,-107.85]].map(previousTrianglePoint).map(moveAnnexeInward).map(annexeSiteLocal);
const baseSlope=(baseB[1]-baseA[1])/(baseB[0]-baseA[0]),baseLength=Math.hypot(1,baseSlope);
const doorway=annexePoint(0,0,0),anchorX=annexeSiteLocal([doorway[0],doorway[2]])[0];
const anchorZ=baseA[1]+(anchorX-baseA[0])*baseSlope;
export const ANNEXE_FRONT_ALIGNMENT=Object.freeze({
 source:'Research/historic-roads/annexe-parallel-frontage-marked.png',width:6,
 anchorX,previousZ:anchorZ,avenueZ:anchorZ-6/ANNEXE_SITE.scale
});
// Rigidly turn the old frontage onto the annexe X axis, moving it one road
// width toward the building. Island proportions and planting offsets survive.
export function alignAnnexeFrontage(point){
 const [x,z]=annexeSiteLocal(moveAnnexeInward(point)),dx=x-anchorX,dz=z-anchorZ;
 const p=annexeSitePoint(anchorX+(dx+baseSlope*dz)/baseLength,0,
  ANNEXE_FRONT_ALIGNMENT.avenueZ+(-baseSlope*dx+dz)/baseLength);
 return [p[0],p[2]];
}
// Keep the outer-loop junction fixed; only the frontage approach moves.
export function annexeTrianglePoint(point){return alignAnnexeFrontage(previousTrianglePoint(point)).map((v,i)=>v-ANNEXE_INWARD_SHIFT[i]);}
// Keep the frontage straight to the yellow-marked outer road. The fork is
// a separate six-metre curved lane, with extra clearance beside Beech2.
const frontageA=annexeSitePoint(0,0,ANNEXE_FRONT_ALIGNMENT.avenueZ);
const frontageB=annexeSitePoint(1,0,ANNEXE_FRONT_ALIGNMENT.avenueZ);
const frontageSlope=(frontageB[2]-frontageA[2])/(frontageB[0]-frontageA[0]);
const frontageZ=x=>frontageA[2]+(x-frontageA[0])*frontageSlope;
const outerSlope=(end[1]-start[1])/(end[0]-start[0]);
const joinX=(start[1]-frontageA[2]+frontageSlope*frontageA[0]-outerSlope*start[0])/(frontageSlope-outerSlope);
export const ANNEXE_TRIANGLE_APEX=Object.freeze([319.3,annexeOuterRoadZ(319.3)]);
// The latest yellow guide pivots the short arm toward the island, keeping
// the outer-road apex and the frontage axis fixed.
const near=[322.4,frontageZ(322.4)];
export const ANNEXE_FRONT_OUTER_JOIN=Object.freeze([joinX,annexeOuterRoadZ(joinX)]);
export const ANNEXE_TRIANGLE_CORNERS=Object.freeze([ANNEXE_TRIANGLE_APEX,ANNEXE_FRONT_OUTER_JOIN,near]);
const forkC1=[321.2,-71],forkC2=[319.3,-77];
export const ANNEXE_TRIANGLE_FORK=Object.freeze(Array.from({length:49},(_,i)=>{
 const t=i/48,q=1-t;
 return near.map((v,k)=>q*q*q*v+3*q*q*t*forkC1[k]+3*q*t*t*forkC2[k]+t*t*t*ANNEXE_TRIANGLE_APEX[k]);
}));

// Red ground picks from irby-tree-junction-marked.png. The bend threads the
// existing beech/oak gap and meets the side court beside Irby/Ashley.
const approachStart=[267,-78];
const approachSegments=[
 [[273,-82],[279,-90],[285,-97]],
 [[288,-100.5],[292,-101],[298,-99]],
 [[310,-99],[317,-88],ANNEXE_TRIANGLE_APEX]
];
const approach=[approachStart];let previous=approachStart;
for(const [b,c,d] of approachSegments){
 for(let i=1;i<=24;i++){
  const t=i/24,q=1-t;
  approach.push([0,1].map(k=>q*q*q*previous[k]+3*q*q*t*b[k]+3*q*t*t*c[k]+t*t*t*d[k]));
 }
 previous=d;
}
export const IRBY_ANNEXE_APPROACH=Object.freeze({name:'Irby Ashley tree-gap approach',width:6,points:approach});
