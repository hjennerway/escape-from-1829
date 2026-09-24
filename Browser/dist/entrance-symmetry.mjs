import {addWestLawnPhotoDetails,WEST_LAWN_PHOTO_VIEW} from './west-lawn-photo-detail.mjs';
import {addEntranceWestPhotoDetails,ENTRANCE_WEST_PHOTO_VIEW} from './entrance-west-photo-detail.mjs';
import {addFrontWingChimneys} from './west-front-photo-detail.mjs';
const mirrorView=shot=>Object.freeze({...shot,position:[-shot.position[0],...shot.position.slice(1)],target:[-shot.target[0],...shot.target.slice(1)]});
export const EAST_LAWN_PHOTO_VIEW=mirrorView(WEST_LAWN_PHOTO_VIEW);
export const ENTRANCE_EAST_PHOTO_VIEW=mirrorView(ENTRANCE_WEST_PHOTO_VIEW);
// User-confirmed symmetry of the two elevations enclosing each entrance lawn.
// Reuse the west builders so later refinements stay identical across x=0.
export function addEastEntranceMirror(THREE,helpers){
  const {model,box,sash,door}=helpers,first=model.children.length;
  const westLawn=model.userData.westLawnPhotoOpenings,westEntrance=model.userData.entranceWestPhotoOpenings;
  const reflected={...helpers,includeReception:false,
    box:(mat,x,y,z,w,h,d,r=0)=>box(mat,-x,y,z,w,h,d,-r),
    sash:(face,x,y,z,r=0,w,h)=>sash(face.replaceAll('west','east'),-x,y,z,-r,w,h),
    door:(x,z,r=0,bottom=0)=>door(-x,z,-r,bottom)
  };
  // The two marked east lawn fittings are omitted at every timeline stop.
  addWestLawnPhotoDetails(THREE,reflected);
  model.userData.eastLawnPhotoOpenings=model.userData.westLawnPhotoOpenings;
  addEntranceWestPhotoDetails(THREE,reflected);
  model.userData.entranceEastPhotoOpenings=model.userData.entranceWestPhotoOpenings;
  model.userData.westLawnPhotoOpenings=westLawn;
  model.userData.entranceWestPhotoOpenings=westEntrance;
  // Meshes (including roofs and rods) are reflected only after their builders
  // finish assigning rotations. Instanced boxes were reflected above.
  const reflection=new THREE.Matrix4().makeScale(-1,1,1);
  for(const object of model.children.slice(first)){
    object.applyMatrix4(reflection);
    object.name=object.name.replaceAll('West','East').replaceAll('west','east');
  }
  addFrontWingChimneys(THREE,helpers,1);
}
