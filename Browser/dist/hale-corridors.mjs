import {createCorridorRun,FARNDON_CORRIDOR} from './farndon-corridor.mjs';

// The two red strokes extend the shortened wing axes to the existing gallery.
// Start just inside the ward walls; end on the gallery ridge for a closed T join.
export const HALE_CORRIDOR_RUNS=Object.freeze([
 {name:'Hale tower-side corridor',wardFaceX:145,start:[144.7,-85.155],end:[FARNDON_CORRIDOR.x,-85.155]},
 {name:'Hale middle-wing corridor',wardFaceX:137,start:[136.7,-107.705],end:[FARNDON_CORRIDOR.x,-107.705]}
].map(run=>Object.freeze({...run,start:Object.freeze(run.start),end:Object.freeze(run.end)})));

export function addHaleCorridors(THREE,{corridor,...materials}){
 const group=new THREE.Group();group.name='Hale connecting corridors';corridor.add(group);
 group.userData={reference:'Research/hale-daresbury-huxley-dunham/corridor-reference.png',runs:HALE_CORRIDOR_RUNS};
 const {width,height,rise}=FARNDON_CORRIDOR,half=width/2;
 for(const run of HALE_CORRIDOR_RUNS){
  const branch=createCorridorRun(THREE,{...materials,...run,width,height,rise,
   // Only the exposed walls between the ward and the main gallery get lights.
   detailRanges:[[run.wardFaceX-run.start[0],run.end[0]-half-run.start[0]]]});
  group.add(branch);
  const footprint={minX:run.start[0],maxX:run.end[0],minZ:run.start[1]-half,maxZ:run.start[1]+half};
  branch.userData.footprint=footprint;
  corridor.userData.footprints.push(footprint);
  for(const key of ['minX','minZ'])corridor.userData.footprint[key]=Math.min(corridor.userData.footprint[key],footprint[key]);
  for(const key of ['maxX','maxZ'])corridor.userData.footprint[key]=Math.max(corridor.userData.footprint[key],footprint[key]);
 }
 return group;
}
