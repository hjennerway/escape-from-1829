import {ANNEXE_MAP_SCALE,ANNEXE_SITE,ANNEXE_RANGES,annexePoint,annexeSiteLocal} from './annexe.mjs';
import {annexeOuterRoadZ} from './annexe-loop-road.mjs';
import {ROAD_STYLE} from './road-style.mjs';
import {LARKTON_SHIFT} from './annexe-larkton-recess.mjs';
import {annexeFrontPoint,annexeAvenueZ} from './annexe-front-roads.mjs';

// Keep the entrance's local proportions independent of individual ward edits.
// The later whole-annexe plan fit scales this approach with the frontage.
const frontage=166*ANNEXE_MAP_SCALE;
const frontRange=name=>ANNEXE_RANGES.find(range=>range.name===name).rect;
const siteCorner=(x,z)=>{const p=annexePoint(x*ANNEXE_MAP_SCALE,0,z*ANNEXE_MAP_SCALE);return annexeSiteLocal([p[0],p[2]]);};
const entry=frontRange('Entrance range'),hall=frontRange('Central hall');
const [entryLeft,entryFront]=siteCorner(entry[0],entry[3]),[entryRight]=siteCorner(entry[2],entry[3]),[,hallFront]=siteCorner(0,hall[3]);
const centreX=(entryLeft+entryRight)/2;
// Translate parallel to the avenue, retaining the whole curve and both road joins.
const sweepShiftZ=annexeAvenueZ(centreX)-annexeAvenueZ(0);
const courtLeft=siteCorner(-10.5,0)[0],courtRight=siteCorner(10.5,0)[0];
export const ANNEXE_ACCESS=Object.freeze({
 source:'Research/historic-roads/annexe-entrance-revision.png',frontage,
 sweepWidthScale:.16,entranceWidth:frontage*.2*.16,entranceMouthWidth:frontage*.2*.98,forecourtWidth:courtRight-courtLeft,
 centreX,sweepShiftZ,entranceZ:64+sweepShiftZ,forecourtRearZ:entryFront,avenueZ:annexeAvenueZ(centreX),
 rearRemovalSource:'Research/annexe-frontage-adjustment/remove-rear-roads.png',
 sweepRevisionSource:'Research/annexe-frontage-adjustment/narrow-entrance.png',
 frontageInfillSource:'Research/annexe-frontage-adjustment/front-paving-gaps.png',
 alignmentSource:'Research/annexe-frontage-adjustment/entrance-alignment-reference.png',
 flareReference:'Research/historic-roads/annexe-frontage-junction-marked.png',
 note:'The apron remains on the doorway axis. The latest red edges replace the elongated flare with two quarter circles meeting the orange frontage road. Frontage side approaches and rear access roads remain removed.'
});
function curve(start,segments,steps=24){
 const points=[start];let a=start;
 for(const [b,c,d] of segments){
  for(let i=1;i<=steps;i++){const t=i/steps,q=1-t;points.push([0,1].map(k=>q*q*q*a[k]+3*q*q*t*b[k]+3*q*t*t*c[k]+t*t*t*d[k]));}a=d;
 }return points;
}
const halfEntrance=ANNEXE_ACCESS.entranceWidth/2,halfMouth=ANNEXE_ACCESS.entranceMouthWidth/2,halfCourt=ANNEXE_ACCESS.forecourtWidth/2;
// End the arcs on the avenue edge. Offset kerbs toward the grass so they
// meet the straight border tangentially with the same width.
const sweepSide=(side,kerbInset=0)=>{
 const roadEdgeZ=x=>annexeAvenueZ(x)-3/ANNEXE_SITE.scale;
 const slope=annexeAvenueZ(1)-annexeAvenueZ(0),length=Math.hypot(1,slope);
 const u=[1/length,slope/length],v=[-slope/length,1/length];
 const radius=(halfMouth-halfEntrance)*length,edge=[0,roadEdgeZ(0)];
 const arc=Array.from({length:25},(_,i)=>{
  const angle=i/24*Math.PI/2;
  return [0,1].map(k=>edge[k]+side*(halfEntrance*length+radius)*u[k]-radius*v[k]-side*(radius-kerbInset)*Math.cos(angle)*u[k]+(radius-kerbInset)*Math.sin(angle)*v[k]);
 });
 // A straight neck reaches a true quarter-circle flare at the roadway.
 return [[side*(halfEntrance+kerbInset),64-.1],...arc];
};
const translatedSweep=(side,inset=0)=>sweepSide(side,inset).map(([x,z])=>[x+centreX,z+sweepShiftZ]);
const left=translatedSweep(-1),right=translatedSweep(1);
const rear=ANNEXE_ACCESS.forecourtRearZ;
const courtFront=ANNEXE_ACCESS.entranceZ;
const forecourt=[[courtLeft,rear],[courtLeft,courtFront],[courtRight,courtFront],[courtRight,rear]];
// Follow the actual placed front ranges, including the narrow recesses beside
// the entrance. A small overlap under the masonry prevents hairline seams.
const lap=.08;
const frontageInfill=[[courtLeft,rear+lap],[courtRight,rear+lap],
 [courtRight,hallFront-lap],[entryRight-lap,hallFront-lap],
 [entryRight-lap,entryFront-lap],[entryLeft+lap,entryFront-lap],
 [entryLeft+lap,hallFront-lap],[courtLeft,hallFront-lap]];
// The yellow circle removes this entire rear access group, including the two
// mouths against Parsons Lane. Their former data is saved with the reference.
export const ANNEXE_REAR_JUNCTIONS=Object.freeze([]);
// The later Larkton annotation adds one independent west approach.
const wardPoint=([x,z])=>{const p=annexePoint(x*ANNEXE_MAP_SCALE,0,z*ANNEXE_MAP_SCALE);return [p[0],p[2]];};
export const LARKTON_PAVING_OUTLINE=Object.freeze([
 [-108,-64],[-73,-64],[-73,-7.92],[-86,-7.92],
 [-86,-49],[-101,-49],[-101,-39.92],[-108,-39.92]
].map(([x,z])=>[x+LARKTON_SHIFT,z]));
const larktonTrace=curve([-176.5,-34.8],[[[-174,-48],[-157,-53],[-143,-54]],[[-128+LARKTON_SHIFT,-56],[-115+LARKTON_SHIFT,-58],[-103+LARKTON_SHIFT,-55]]]).map(wardPoint);
// Start where the approach crosses the outer road. Moving just its first
// point left the next few vertices doubling back and forming a lawn-side nub.
const entryIndex=larktonTrace.findIndex(p=>p[1]>=annexeOuterRoadZ(p[0]));
const a=larktonTrace[entryIndex-1],b=larktonTrace[entryIndex];
const da=a[1]-annexeOuterRoadZ(a[0]),db=b[1]-annexeOuterRoadZ(b[0]);
const mouth=a.map((v,k)=>v+(b[k]-v)*(-da/(db-da)));
export const LARKTON_APPROACH=Object.freeze({name:'Annexe Larkton Parsons approach',width:5,
 points:[mouth,...larktonTrace.slice(entryIndex)]});
export const ANNEXE_ACCESS_ROADS=Object.freeze([LARKTON_APPROACH]);
export const ANNEXE_ACCESS_PAVING=Object.freeze([
 {name:'Annexe Larkton paved court',surface:'asphalt apron',points:LARKTON_PAVING_OUTLINE.map(wardPoint)},
 {name:'Annexe sweeping entrance',surface:'junction',points:[...left,...right.slice().reverse()].map(annexeFrontPoint)},
 {name:'Annexe central asphalt forecourt',surface:'asphalt apron',points:forecourt.map(annexeFrontPoint)},
 {name:'Annexe frontage infill',surface:'asphalt apron',points:frontageInfill.map(annexeFrontPoint)},
 {name:'Annexe entrance step approach',surface:'asphalt apron',points:[[centreX-7,rear],[centreX-7,rear+3],[centreX+7,rear+3],[centreX+7,rear]].map(annexeFrontPoint)}
]);
export const ANNEXE_ACCESS_KERBS=Object.freeze([
 ...[-1,1].map(side=>({name:`Annexe ${side<0?'west':'east'} sweeping entrance kerb`,width:ROAD_STYLE.edgeWidth,points:translatedSweep(side,ROAD_STYLE.edgeWidth/2/ANNEXE_SITE.scale).map(annexeFrontPoint)})),
 ...[-1,1].map(side=>({name:(side<0?'Annexe west':'Annexe east')+' forecourt exposed kerb',points:[[centreX+side*halfCourt,hallFront],[centreX+side*halfCourt,courtFront],[centreX+side*halfEntrance,courtFront]].map(annexeFrontPoint)}))
]);

// Remove the avenue's building-facing border across the entrance mouth.
// Subtract in the annexe frame, preserving the opposite verge.
export function trimAnnexeEntranceBorder(points){
 let remaining=points.map(annexeSiteLocal);const fragments=[];
 for(const [axis,edge,sign] of [[0,centreX-halfMouth,1],[0,centreX+halfMouth,-1],[1,ANNEXE_ACCESS.avenueZ,-1]]){
  const inside=[],outside=[];
  for(let i=0;i<remaining.length;i++){
   const p=remaining[i],q=remaining[(i+1)%remaining.length],a=(p[axis]-edge)*sign,b=(q[axis]-edge)*sign;
   (a>=0?inside:outside).push(p);
   if((a>=0)!==(b>=0)){const t=a/(a-b),cross=p.map((v,k)=>v+(q[k]-v)*t);inside.push(cross);outside.push(cross);}
  }
  if(outside.length>=3)fragments.push(outside.map(annexeFrontPoint));
  remaining=inside;if(remaining.length<3)break;
 }
 return fragments;
}
