import {ANNEXE_RANGES,ANNEXE_MAP_SCALE} from './annexe.mjs';
import {annexeGroundPoint,annexeGroundLocal} from './annexe-ground-placement.mjs';
import {SHARED_HISTORIC_LANES} from './historic-road-clearance.mjs';

const ap=([x,z])=>{const p=annexeGroundPoint(x,0,z);return [p[0],p[2]];};
const frontRanges=ANNEXE_RANGES.filter(r=>r.rect[1]<29&&r.rect[3]>0);
const frontage=(Math.max(...frontRanges.map(r=>r.rect[2]))-Math.min(...frontRanges.map(r=>r.rect[0])))*ANNEXE_MAP_SCALE;
export const ANNEXE_ACCESS=Object.freeze({
 source:'Research/historic-roads/annexe-entrance-revision.png',frontage,
 sweepWidthScale:.6,entranceWidth:frontage*.2*.6,forecourtWidth:frontage*.2,
 entranceZ:64,forecourtRearZ:28.3,avenueZ:84,
 note:'The latest annotation narrows the sweeping entrance to 60% of its previous width, removes the pale frontage strips and all entrance gates, and resurfaces the red-selected central forecourt in road asphalt. The earlier yellow side/rear roads and hardstandings remain. Dimensions other than requested proportions are fitted visual estimates.'
});
function curve(start,segments,steps=24){
 const points=[start];let a=start;
 for(const [b,c,d] of segments){
  for(let i=1;i<=steps;i++){const t=i/steps,q=1-t;points.push([0,1].map(k=>q*q*q*a[k]+3*q*q*t*b[k]+3*q*t*t*c[k]+t*t*t*d[k]));}a=d;
 }return points;
}
const halfEntrance=ANNEXE_ACCESS.entranceWidth/2,halfCourt=ANNEXE_ACCESS.forecourtWidth/2;
// End on the avenue's asphalt edge, covering its kerb only at the open mouth.
const left=curve([-halfEntrance,64],[[[-halfEntrance,75],[-39*.6,81],[-47*.6,81]]]);
const right=left.map(([x,z])=>[-x,z]);
const rear=ANNEXE_ACCESS.forecourtRearZ;
const forecourt=[[-halfCourt,rear],[-halfCourt,64],[halfCourt,64],[halfCourt,rear]];
const northLane=SHARED_HISTORIC_LANES.find(p=>p.name==='Parsons Lane (North)');
const local=annexeGroundLocal;

// Pick the middle of surveyed straight segments, never move the saved lane.
// The mouth ends exactly at its three-unit asphalt edge. Only the pale border
// is covered at the T-junction; no historic asphalt lies over Parsons asphalt.
function rearJunction(segment,name){
 const a=local(northLane.points[segment]),b=local(northLane.points[segment+1]);
 const length=Math.hypot(b[0]-a[0],b[1]-a[1]),t=b.map((v,i)=>(v-a[i])/length);
 let n=[-t[1],t[0]];if(n[1]<0)n=n.map(v=>-v);
 const origin=a.map((v,i)=>(v+b[i])/2),point=(across,inward)=>origin.map((v,i)=>v+t[i]*across+n[i]*inward);
 const sides=[-1,1].map(sign=>curve(point(sign*4.5,3),[[point(sign*4.5,5),point(sign*3,7),point(sign*3,11)]]));
 return {name,segment,origin:ap(origin),tangent:t,normal:n,localOrigin:origin,
  roadStart:point(0,0),inside:point(0,13),
  paving:{name:name+' open junction',surface:'junction',points:[...sides[0],...sides[1].slice().reverse()].map(ap)}};
}
export const ANNEXE_REAR_JUNCTIONS=Object.freeze([
 rearJunction(16,'Annexe rear north access'),rearJunction(14,'Annexe rear east access')
]);
const north=ANNEXE_REAR_JUNCTIONS[0],east=ANNEXE_REAR_JUNCTIONS[1];
export const ANNEXE_ACCESS_ROADS=Object.freeze([
 {name:'Annexe west side access',width:6,points:curve([-92,84],[[[-92,72],[-92,66],[-92,61]],[[-92,53],[-82,53],[-72,53]],[[-65,53],[-60,53],[-56,53]]]).map(ap)},
 {name:'Annexe east side access',width:6,points:curve([96,84],[[[96,71],[96,52],[96,41]],[[96,31],[107,31],[118,31]],[[123,31],[127,31],[131,31]]]).map(ap)},
 {name:north.name,width:6,points:curve(north.roadStart,[
  [north.inside,[60,-92],[56,-93]],[[45,-95],[28,-92],[14,-90]]
 ]).map(ap)},
 {name:east.name,width:6,points:curve(east.roadStart,[
  [east.inside,[95,-64],[86,-61]],[[82,-59],[76,-61],[72,-61]]
 ]).map(ap)},
 {name:'Annexe rear ward approach',width:5,points:curve([56,-93],[[[65,-94],[70,-84],[72,-75]],[[74,-61],[68,-51],[66,-45]]]).map(ap)},
 // Stop before the pavilion moved to the inner side of the east rear link.
 {name:'Annexe rear east return',width:5,points:curve([89,-63],[[[93,-54],[92,-46],[95,-40]]]).map(ap)}
]);
export const ANNEXE_ACCESS_PAVING=Object.freeze([
 {name:'Annexe sweeping entrance',surface:'junction',points:[...left,...right.slice().reverse()].map(ap)},
 {name:'Annexe central asphalt forecourt',surface:'asphalt apron',points:forecourt.map(ap)},
 {name:'Annexe entrance step approach',surface:'asphalt apron',points:[[-7,26.8],[-7,rear],[7,rear],[7,26.8]].map(ap)},
 {name:'Annexe east roadside hardstanding',surface:'asphalt apron',points:[[89,67],[124,67],[130,71],[130,76],[126,79],[89,79]].map(ap)},
 {name:'Annexe rear hardstanding',surface:'asphalt apron',points:[[5,-95],[22,-95],[22,-82],[5,-82]].map(ap)},
 ...ANNEXE_REAR_JUNCTIONS.map(j=>j.paving)
]);
export const ANNEXE_ACCESS_KERBS=Object.freeze([
 {name:'Annexe roadside hardstanding exposed kerb',points:[[100,67],[124,67],[130,71],[130,76],[126,79],[100,79]].map(ap)},
 {name:'Annexe rear hardstanding exposed kerb',points:[[22,-95],[5,-95],[5,-82],[22,-82],[22,-86]].map(ap)},
 {name:'Annexe west sweeping entrance kerb',points:left.slice(0,-1).map(ap)},
 {name:'Annexe east sweeping entrance kerb',points:right.slice(0,-1).map(ap)},
 ...[-1,1].map(side=>({name:(side<0?'Annexe west':'Annexe east')+' forecourt exposed kerb',points:[[side*7,rear],[side*halfCourt,rear],[side*halfCourt,64],[side*halfEntrance,64]].map(ap)}))
]);
