import {ANNEXE_MAP_SCALE,ANNEXE_SITE,ANNEXE_RANGES,annexePoint,annexeSiteLocal} from './annexe.mjs';
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
 note:'The low entrance range extends to the green line. The purple lines narrow the apron around the doorway axis. The existing sweep and its kerbs translate together to this axis, preserving their complete curve and avenue join. Frontage side approaches and rear access roads remain removed.'
});
function curve(start,segments,steps=24){
 const points=[start];let a=start;
 for(const [b,c,d] of segments){
  for(let i=1;i<=steps;i++){const t=i/steps,q=1-t;points.push([0,1].map(k=>q*q*q*a[k]+3*q*q*t*b[k]+3*q*t*t*c[k]+t*t*t*d[k]));}a=d;
 }return points;
}
const halfEntrance=ANNEXE_ACCESS.entranceWidth/2,halfMouth=ANNEXE_ACCESS.entranceMouthWidth/2,halfCourt=ANNEXE_ACCESS.forecourtWidth/2;
// End on the avenue's asphalt edge, covering its kerb only at the open mouth.
const sweepSide=side=>{
 const x=side*halfEntrance,mouthX=side*halfMouth,startZ=64-.1;
 const roadEdgeZ=x=>annexeAvenueZ(x)-3/ANNEXE_SITE.scale;
 const mouthZ=roadEdgeZ(mouthX),stemZ=startZ+(mouthZ-startZ)*.4;
 // A straight neck leaves grass beside the apron, then turns smoothly onto
 // the oblique road. Each lip follows the road's own edge at the join.
 return curve([x,startZ],[
  [[x,startZ+(stemZ-startZ)/3],[x,startZ+(stemZ-startZ)*2/3],[x,stemZ]],
  [[x,stemZ+(mouthZ-stemZ)*.78],[mouthX*.72,roadEdgeZ(mouthX*.72)],[mouthX,mouthZ]]
 ]);
};
const translatedSweep=side=>sweepSide(side).map(([x,z])=>[x+centreX,z+sweepShiftZ]);
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
]);
export const LARKTON_APPROACH=Object.freeze({name:'Annexe Larkton Parsons approach',width:5,
 points:curve([-176.5,-34.8],[[[-174,-48],[-157,-53],[-143,-54]],[[-128,-56],[-115,-58],[-103,-55]]]).map((p,i)=>i===0?[533,-135]:wardPoint(p))});
export const ANNEXE_ACCESS_ROADS=Object.freeze([LARKTON_APPROACH]);
export const ANNEXE_ACCESS_PAVING=Object.freeze([
 {name:'Annexe Larkton paved court',surface:'asphalt apron',points:LARKTON_PAVING_OUTLINE.map(wardPoint)},
 {name:'Annexe sweeping entrance',surface:'junction',points:[...left,...right.slice().reverse()].map(annexeFrontPoint)},
 {name:'Annexe central asphalt forecourt',surface:'asphalt apron',points:forecourt.map(annexeFrontPoint)},
 {name:'Annexe frontage infill',surface:'asphalt apron',points:frontageInfill.map(annexeFrontPoint)},
 {name:'Annexe entrance step approach',surface:'asphalt apron',points:[[centreX-7,rear],[centreX-7,rear+3],[centreX+7,rear+3],[centreX+7,rear]].map(annexeFrontPoint)}
]);
export const ANNEXE_ACCESS_KERBS=Object.freeze([
 {name:'Annexe west sweeping entrance kerb',points:left.slice(0,-1).map(annexeFrontPoint)},
 {name:'Annexe east sweeping entrance kerb',points:right.slice(0,-1).map(annexeFrontPoint)},
 ...[-1,1].map(side=>({name:(side<0?'Annexe west':'Annexe east')+' forecourt exposed kerb',points:[[centreX+side*halfCourt,hallFront],[centreX+side*halfCourt,courtFront],[centreX+side*halfEntrance,courtFront]].map(annexeFrontPoint)}))
]);
