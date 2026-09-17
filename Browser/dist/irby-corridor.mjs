import {createCorridorRun,FARNDON_CORRIDOR} from './farndon-corridor.mjs';
import {ANNEXE_GRAVEL_PATH} from './annexe-front-roads.mjs';

// September 17 red/green annotation: an eastward branch at the water tower,
// square to the existing gallery and aligned with the gravel path's mouth.
export const IRBY_CORRIDOR=Object.freeze({
 name:'Water tower to Irby corridor',start:[FARNDON_CORRIDOR.x,ANNEXE_GRAVEL_PATH.centerline[0][1]],
 end:[221.7,ANNEXE_GRAVEL_PATH.centerline[0][1]],width:5.4,height:3.6,rise:.64
});
// Blue footprint: Irby's rectangular return butts against the ward-side wall
// of the corridor, with both ends flush at the red line (x=221.7).
export const IRBY_CONNECTION_FRONT=IRBY_CORRIDOR.end[1]-IRBY_CORRIDOR.width/2;
export const IRBY_CORRIDOR_VIEWS=Object.freeze({
 'irby-corridor':{position:[348,116,-28],target:[205,2,-65],fov:48},
 'irby-corridor-plan':{position:[214.01,160,-72],target:[214,0,-72],fov:48}
});
export const IRBY_CORRIDOR_WALK=Object.freeze({position:[190,1.8,-75],target:[187,2,-66.6],fov:62});

export function addIrbyCorridor(THREE,{corridor,...materials}){
 const run=IRBY_CORRIDOR,length=run.end[0]-run.start[0];
 // The tower end sits beneath the existing taller service-range roof.
 const branch=createCorridorRun(THREE,{...materials,...run,detailRanges:[[6.4,length-.7]],
  omitWindow:(distance,side)=>run.start[0]+distance>(side===-1?211.1:180.2)});
 branch.userData.reference='Research/irby-corridor/front-footprint-reference.png';
 // The red endpoint is exposed, so close the gable under the slate slopes.
 const half=run.width/2,top=run.height+.06+run.rise;
 const edge=top-run.rise*half/(half+.22),vertices=[
  [length,run.height,-half],[length,edge,-half],[length,top,0],
  [length,edge,half],[length,run.height,half]
 ];
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute([[0,1,2],[0,2,3],[0,3,4]].flatMap(face=>face.flatMap(i=>vertices[i])),3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count*2),2));
 geometry.computeVertexNormals();
 const brick=materials.brick.clone();brick.color.set(0xc7a391);
 const cap=new THREE.Mesh(materials.worldUV(geometry,1.7),brick);cap.name='Irby corridor exposed end gable';cap.castShadow=true;cap.receiveShadow=true;branch.add(cap);
 corridor.add(branch);
 const footprint={minX:run.start[0],maxX:run.end[0],minZ:run.start[1]-run.width/2,maxZ:run.start[1]+run.width/2};
 branch.userData.footprint=footprint;corridor.userData.footprints.push(footprint);
 for(const key of ['minX','minZ'])corridor.userData.footprint[key]=Math.min(corridor.userData.footprint[key],footprint[key]);
 for(const key of ['maxX','maxZ'])corridor.userData.footprint[key]=Math.max(corridor.userData.footprint[key],footprint[key]);
 return branch;
}
