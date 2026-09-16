import {ESCAPE_CHAPEL} from './chapel.mjs';
import {CHURTON_WARD} from './churton-ward.mjs';
import {WARD_POSITIONS} from './ward-placement.mjs';

// Building centres in the user's 322 x 385 OS extract. The coloured circles
// identify landmarks; their freehand outlines are not building footprints.
export const ANNEXE_PLACEMENT_REFERENCE=Object.freeze({
 source:'Research/annexe-placement/marked-os-map.png',
 frontReference:'Research/annexe-placement/marked-front-section.png',
 landmarks:[
  {name:'Church',pixel:[164,323],world:[ESCAPE_CHAPEL.x,ESCAPE_CHAPEL.z]},
  {name:'Churton',pixel:[210,323],world:[CHURTON_WARD.x,CHURTON_WARD.z]},
  {name:'Grafton/Edge',pixel:[118,288],world:[WARD_POSITIONS.graftonEdge.x,WARD_POSITIONS.graftonEdge.z]}
 ],
 frontLine:[[80,83],[107,90]],
 note:'Rigid placement from the purple front-section line. The three fixed landmarks set map scale and orientation; annexe dimensions and all other site geometry stay unchanged. Pixel picks are approximate.'
});
const reference=ANNEXE_PLACEMENT_REFERENCE;
const mean=points=>points.reduce((sum,p)=>sum.map((v,i)=>v+p[i]/points.length),[0,0]);
const pixelCentre=mean(reference.landmarks.map(p=>p.pixel)),worldCentre=mean(reference.landmarks.map(p=>p.world));
let denominator=0,along=0,across=0;
for(const {pixel,world} of reference.landmarks){
 const u=pixel[0]-pixelCentre[0],v=pixel[1]-pixelCentre[1],x=world[0]-worldCentre[0],z=world[1]-worldCentre[1];
 denominator+=u*u+v*v;along+=x*u+z*v;across+=x*v-z*u;
}
// Least-squares similarity fit uses all three anchors without shearing the map.
const a=along/denominator,b=across/denominator;
export function annexePlacementMapPoint([u,v]){
 return [worldCentre[0]+a*(u-pixelCentre[0])+b*(v-pixelCentre[1]),
  worldCentre[1]-b*(u-pixelCentre[0])+a*(v-pixelCentre[1])];
}
export function placeAnnexeFront(frontZ){
 const [left,right]=reference.frontLine.map(annexePlacementMapPoint),centre=mean([left,right]);
 const rotation=Math.atan2(left[1]-right[1],right[0]-left[0]);
 return Object.freeze({x:centre[0]-Math.sin(rotation)*frontZ,z:centre[1]-Math.cos(rotation)*frontZ,rotation});
}
