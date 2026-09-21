import {ANNEXE_MAP_SCALE,ANNEXE_SITE} from './annexe.mjs';
import {annexeFrontPoint,annexeAvenueZ} from './annexe-front-roads.mjs';

// Keep the entrance's local proportions independent of individual ward edits.
// The later whole-annexe plan fit scales this approach with the frontage.
const frontage=166*ANNEXE_MAP_SCALE;
export const ANNEXE_ACCESS=Object.freeze({
 source:'Research/historic-roads/annexe-entrance-revision.png',frontage,
 sweepWidthScale:.16,entranceWidth:frontage*.2*.16,entranceMouthWidth:frontage*.2*.98,forecourtWidth:frontage*.2,
 entranceZ:64,forecourtRearZ:28.3,avenueZ:annexeAvenueZ(0),
 rearRemovalSource:'Research/annexe-frontage-adjustment/remove-rear-roads.png',
 sweepRevisionSource:'Research/annexe-frontage-adjustment/narrow-entrance.png',
 note:'The yellow outline narrows the entrance to a slim neck with a smooth flare onto the red-line frontage road. The red-circled asphalt forecourt keeps its exact footprint. Both frontage side approaches and the later yellow-circled rear roads, junction mouths, kerbs and hardstanding are removed. The shared Parsons Lane surface remains unchanged.'
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
 const x=side*halfEntrance,mouthX=side*halfMouth,startZ=ANNEXE_ACCESS.entranceZ-.1;
 const roadEdgeZ=x=>annexeAvenueZ(x)-3/ANNEXE_SITE.scale;
 const mouthZ=roadEdgeZ(mouthX),stemZ=startZ+(mouthZ-startZ)*.4;
 // A straight neck leaves grass beside the apron, then turns smoothly onto
 // the oblique road. Each lip follows the road's own edge at the join.
 return curve([x,startZ],[
  [[x,startZ+(stemZ-startZ)/3],[x,startZ+(stemZ-startZ)*2/3],[x,stemZ]],
  [[x,stemZ+(mouthZ-stemZ)*.78],[mouthX*.72,roadEdgeZ(mouthX*.72)],[mouthX,mouthZ]]
 ]);
};
const left=sweepSide(-1),right=sweepSide(1);
const rear=ANNEXE_ACCESS.forecourtRearZ;
const forecourt=[[-halfCourt,rear],[-halfCourt,64],[halfCourt,64],[halfCourt,rear]];
// The yellow circle removes this entire rear access group, including the two
// mouths against Parsons Lane. Their former data is saved with the reference.
export const ANNEXE_REAR_JUNCTIONS=Object.freeze([]);
export const ANNEXE_ACCESS_ROADS=Object.freeze([]);
export const ANNEXE_ACCESS_PAVING=Object.freeze([
 {name:'Annexe sweeping entrance',surface:'junction',points:[...left,...right.slice().reverse()].map(annexeFrontPoint)},
 {name:'Annexe central asphalt forecourt',surface:'asphalt apron',points:forecourt.map(annexeFrontPoint)},
 {name:'Annexe entrance step approach',surface:'asphalt apron',points:[[-7,26.8],[-7,rear],[7,rear],[7,26.8]].map(annexeFrontPoint)}
]);
export const ANNEXE_ACCESS_KERBS=Object.freeze([
 {name:'Annexe west sweeping entrance kerb',points:left.slice(0,-1).map(annexeFrontPoint)},
 {name:'Annexe east sweeping entrance kerb',points:right.slice(0,-1).map(annexeFrontPoint)},
 ...[-1,1].map(side=>({name:(side<0?'Annexe west':'Annexe east')+' forecourt exposed kerb',points:[[side*7,rear],[side*halfCourt,rear],[side*halfCourt,64],[side*halfEntrance,64]].map(annexeFrontPoint)}))
]);
