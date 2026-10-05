import {FARNDON,FARNDON_FOOTPRINT,FARNDON_MODEL_VIEWS as FARNDON_VIEWS} from './farndon-ward.mjs';
import {placeWardViews} from './ward-placement.mjs';

// User-circled H-shaped ward: principal OS contour edges 131..150.
// Translate the complete Farndon model, preserving its size and orientation.
export const WITBY_OFFSET=Object.freeze({x:-56,z:-51});
export const WITBY=Object.freeze({...FARNDON,x:FARNDON.x+WITBY_OFFSET.x,z:FARNDON.z+WITBY_OFFSET.z,
 name:'Witby Ward',reference:'Research/witby/README.md'});
const point=([x,z])=>[x+WITBY_OFFSET.x,z+WITBY_OFFSET.z];
const viewPoint=([x,y,z])=>[x+WITBY_OFFSET.x,y,z+WITBY_OFFSET.z];
export const WITBY_FOOTPRINT=Object.freeze(FARNDON_FOOTPRINT.map(p=>Object.freeze(point(p))));
export const WITBY_VIEWS=placeWardViews('witby',WITBY,{
 witby:{...FARNDON_VIEWS.farndon,position:viewPoint(FARNDON_VIEWS.farndon.position),target:viewPoint(FARNDON_VIEWS.farndon.target)},
 'witby-plan':{...FARNDON_VIEWS['farndon-plan'],position:viewPoint(FARNDON_VIEWS['farndon-plan'].position),target:viewPoint(FARNDON_VIEWS['farndon-plan'].target)},
 'witby-site':{position:[222,116,-342],target:[136,0,-183],fov:52},
 'witby-ground':{position:[110,1.9,-240],target:[117,2.9,-212],fov:65}
});

export function createWitbyWard(farndon){
 const ward=farndon.clone(true);ward.name='Witby Ward';
 ward.position.set(WITBY.x,farndon.position.y,WITBY.z);
 ward.traverse(o=>{o.name=o.name.replaceAll('Farndon','Witby');});
 const data=ward.userData;
 data.source=WITBY;data.footprint=WITBY_FOOTPRINT;
 data.gardenBay={...data.gardenBay,x:data.gardenBay.x+WITBY_OFFSET.x,wallZ:data.gardenBay.wallZ+WITBY_OFFSET.z};
 data.roofs=data.roofs.map(spec=>({...spec,rect:[...point(spec.rect.slice(0,2)),...point(spec.rect.slice(2))]}));
 for(const key of ['westX','eastX'])data.roofRidges[key]+=WITBY_OFFSET.x;
 for(const key of ['crossZ','westFront','westRear','eastFront','eastRear'])data.roofRidges[key]+=WITBY_OFFSET.z;
 // Preserve both adjoining corridor edges; retire only this ward's old trace.
 data.replacedOSEdges={sourceBuilding:0,sourceLoop:0,indices:Array.from({length:20},(_,i)=>131+i)};
 return ward;
}
