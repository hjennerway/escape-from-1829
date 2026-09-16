import {ESCAPE_CHAPEL} from './chapel.mjs';
import {CHURTON_WARD} from './churton-ward.mjs';

// Two fixed landmarks in the user's directly overhead, colour-marked OS map.
// Building centres (not the freehand circle centres) give approximate positions.
// This registration applies only to the five selected wards, never corridors.
export const WARD_MAP_REFERENCE=Object.freeze({
 source:'Research/ward-placement/marked-plan.png',
 church:[208,318],churton:[252,322],
 witby:[110,270],farndon:[128,220],irbyAshley:[140,173],graftonEdge:[160,286],haleWard:[176,239]
});
const map=WARD_MAP_REFERENCE,du=map.churton[0]-map.church[0],dv=map.churton[1]-map.church[1];
const dx=CHURTON_WARD.x-ESCAPE_CHAPEL.x,dz=CHURTON_WARD.z-ESCAPE_CHAPEL.z;
const length2=du*du+dv*dv;
const a=(dx*du+dz*dv)/length2,b=(dx*dv-dz*du)/length2;
export function wardMapPoint([u,v]){
 return [ESCAPE_CHAPEL.x+a*(u-map.church[0])+b*(v-map.church[1]),
  ESCAPE_CHAPEL.z-b*(u-map.church[0])+a*(v-map.church[1])];
}
export const WARD_POSITIONS=Object.freeze(Object.fromEntries(['witby','farndon','irbyAshley','graftonEdge','haleWard'].map(key=>{
 const [x,z]=wardMapPoint(map[key]).map(n=>Math.round(n*10)/10);
 // The later corridor correction fixes Farndon's transverse alignment to
 // the straight Main/tower gallery; retain its map-derived lengthwise move.
 return [key,Object.freeze({x:key==='farndon'?173.7:x,z})];
})));
export function wardPlacementOffset(key,source){
 const target=WARD_POSITIONS[key];return {x:target.x-source.x,z:target.z-source.z};
}
export function placeWardViews(key,source,views){
 const offset=wardPlacementOffset(key,source);
 const point=([x,y,z])=>[x+offset.x,y,z+offset.z];
 return Object.freeze(Object.fromEntries(Object.entries(views).map(([name,view])=>[name,
  {...view,position:point(view.position),target:point(view.target)}])));
}
export function placeWard(building,key){
 const data=building.userData,offset=wardPlacementOffset(key,data.source);
 const point=([x,z])=>[x+offset.x,z+offset.z];
 const footprint=points=>points.map(point);
 const rect=([x0,z0,x1,z1])=>[...point([x0,z0]),...point([x1,z1])];
 building.position.x+=offset.x;building.position.z+=offset.z;
 data.source={...data.source,...WARD_POSITIONS[key]};
 data.placement={reference:map.source,offset};
 data.footprint=footprint(data.footprint);
 data.roofs=data.roofs.map(roof=>({...roof,rect:rect(roof.rect)}));
 if(data.gardenBay)data.gardenBay={...data.gardenBay,x:data.gardenBay.x+offset.x,wallZ:data.gardenBay.wallZ+offset.z};
 if(data.roofRidges){
  data.roofRidges={...data.roofRidges};
  for(const name of ['westX','eastX'])data.roofRidges[name]+=offset.x;
  for(const name of ['crossZ','westFront','westRear','eastFront','eastRear'])data.roofRidges[name]+=offset.z;
 }
 if(data.bays)data.bays=data.bays.map(bay=>({...bay,x:bay.x+offset.x,z:bay.z+offset.z,footprint:footprint(bay.footprint)}));
 if(data.corner)data.corner={...data.corner,footprint:footprint(data.corner.footprint)};
 if(data.veranda){
  data.veranda={...data.veranda,footprint:footprint(data.veranda.footprint)};
  for(const name of ['frontX','wallX','ridgeX'])data.veranda[name]+=offset.x;
 }
 if(data.conservatory){
  data.conservatory={...data.conservatory};
  for(const name of ['x0','x1'])data.conservatory[name]+=offset.x;
  for(const name of ['z0','z1'])data.conservatory[name]+=offset.z;
 }
 // Meshes, per-mesh collision footprints and sash positions remain local.
 // Their world transforms follow the building without altering its geometry.
 return building;
}
