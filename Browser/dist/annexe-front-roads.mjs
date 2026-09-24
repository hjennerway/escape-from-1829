import {annexeSiteLocal,annexeSitePoint} from './annexe.mjs';

// Ground-plane registration of the red/yellow/purple screenshot. The northern
// endpoint is snapped to the existing boundary road; all buildings stay fixed.
export const ANNEXE_FRONT_ROAD_REFERENCE=Object.freeze({
 source:'Research/annexe-placement/front-roads-annotated.png',
 redPixels:[[270,418],[551,19]],yellowPixels:[[280,266],[379,254]],
 teardropShift:[-16,-12],
 redLine:[[251.45,3.47],[428.5,-186.86848406675448]],
 gravelStart:[269.7,-72.79108280254777],gravelWidth:2.4
});
export const ANNEXE_TEARDROP_SHIFT=ANNEXE_FRONT_ROAD_REFERENCE.teardropShift;
export const shiftAnnexeTeardrop=([x,z])=>[x+ANNEXE_TEARDROP_SHIFT[0],z+ANNEXE_TEARDROP_SHIFT[1]];
const [ra,rb]=ANNEXE_FRONT_ROAD_REFERENCE.redLine;
const lineLength=Math.hypot(rb[0]-ra[0],rb[1]-ra[1]),unit=ra.map((v,i)=>(rb[i]-v)/lineLength);
const tip=shiftAnnexeTeardrop([270,18]),join=ra.map((v,i)=>v+unit[i]*12);
const c1=tip.map((v,i)=>v+unit[i]*4),c2=join.map((v,i)=>v-unit[i]*4);
// Blend only the short mouth at the translated teardrop. The long frontage
// follows the registered red line exactly.
const mouth=Array.from({length:9},(_,i)=>{const t=i/8,q=1-t;return tip.map((v,k)=>q*q*q*v+3*q*q*t*c1[k]+3*q*t*t*c2[k]+t*t*t*join[k]);});
export const ANNEXE_FRONT_AVENUE=Object.freeze({name:'Annexe front avenue',width:6,points:[...mouth,rb]});
const local=annexeSiteLocal;
const [a,b]=ANNEXE_FRONT_ROAD_REFERENCE.redLine.map(local);
// The marked road is slightly oblique to the frontage. Its actual edge, rather
// than a parallel approximation, fixes both lips of the sweeping entrance.
export const annexeAvenueZ=x=>a[1]+(x-a[0])*(b[1]-a[1])/(b[0]-a[0]);
export const annexeFrontPoint=([x,z])=>{const p=annexeSitePoint(x,0,z);return [p[0],p[2]];};
// September 24 blue guide: shift the alignment six units north, starting
// at the existing side-road edge rather than burying gravel under its asphalt.
const start=ANNEXE_FRONT_ROAD_REFERENCE.gravelStart;
const slope=-1.5/47.1;
const t=(start[1]+slope*(ra[0]-start[0])-ra[1])/((rb[1]-ra[1])-slope*(rb[0]-ra[0]));
const end=ra.map((v,i)=>v+(rb[i]-v)*t),length=Math.hypot(end[0]-start[0],end[1]-start[1]);
const halfWidth=ANNEXE_FRONT_ROAD_REFERENCE.gravelWidth/2;
const normal=[-(end[1]-start[1])/length*halfWidth,(end[0]-start[0])/length*halfWidth];
export const ANNEXE_GRAVEL_PATH=Object.freeze({
 name:'Annexe service court gravel path',height:.335,width:ANNEXE_FRONT_ROAD_REFERENCE.gravelWidth,centerline:[start,end],
 points:[start.map((v,i)=>v+normal[i]),end.map((v,i)=>v+normal[i]),end.map((v,i)=>v-normal[i]),start.map((v,i)=>v-normal[i])]
});
