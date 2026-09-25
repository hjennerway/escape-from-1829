import {addRedesmereGardenDetails} from './redesmere-garden-photo-detail.mjs';
import {addEastForwardEndPhotoDetails} from './east-forward-end-photo-detail.mjs';
import {addWestForwardEndPhotoDetails} from './west-forward-end-photo-detail.mjs';
import {addEastEntranceMirror} from './entrance-symmetry.mjs';
import {addWestWingPhotoDetails} from './west-wing-photo-detail.mjs';
// Visible east forecourt, from 20260912_172141.jpg and the user's camera mark.
// Coordinates are visual estimates. Keep the window schedule explicit so later
// photographs can correct individual openings without changing the whole estate.
import {addWestFrontPhotoDetails} from './west-front-photo-detail.mjs';
import {addWestCourtPhotoDetails} from './west-court-photo-detail.mjs';
import {addWestCantedBay} from './west-refinement.mjs';
import {addCourtyardPhotoDetails} from './courtyard-photo-detail.mjs';
import {addRearCourtPhotoDetails} from './rear-court-photo-detail.mjs';
import {addRedesmerePhotoDetails} from './redesmere-photo-detail.mjs';
import {addWestLawnPhotoDetails} from './west-lawn-photo-detail.mjs';
import {addEntranceWestPhotoDetails} from './entrance-west-photo-detail.mjs';
import {addInnerCourtPhotoDetails} from './inner-court-photo-detail.mjs';
import {addCentralCourtPhotoDetails} from './central-court-photo-detail.mjs';
export const EAST_PHOTO_VIEW=Object.freeze({position:[76,1.8,48],target:[53,5.4,21],fov:76});

export function eastPhotoProfile(x,z){
  return (Math.abs(x-54.175)<.01&&z===12)||
    (x===36.5&&z===23)||(x===35&&z===35)||
    (x===65.5&&z===16.15)||
    (Math.abs(x-81.875)<.01&&z===8);
}

export function addEastPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,steel,material,hipRoof,details}){
  const {frame,glass,iron,stone,sash,door,rod}=details;
  // The two-storey forward wing: nine positions on its east wall. The eighth
  // position is the blue entrance and upper escape door, not another window.
  const sideZ=[17.3,20,22.3,25.1,27.4,31.2,33.5,38.1,42];
  for(const z of sideZ)if(z!==38.1)for(const y of [2,6.25])sash('forward-wing-east',41.05,y,z,Math.PI/2,1.02,2.45);
  addEastForwardEndPhotoDetails(THREE,{model,box,mesh,worldUV,brick,material,sash,rod,iron});
  // The inner wall is the reflected img18 elevation, supplied below.
  door(41.08,38.1,Math.PI/2);door(41.08,38.1,Math.PI/2,4.25);
  // External metal stair descends along the wall from the upper blue door.
  box(iron,42,4.18,38.1,1.8,.14,2);
  for(let i=0;i<17;i++){
    const y=4.1-i*.24,z=36.95-i*.3;
    box(iron,42,y,z,1.6,.09,.32);
    for(const x of [41.25,42.78])box(iron,x,y+.53,z,.045,1.06,.045);
  }
  for(const x of [41.25,42.78])rod([x,5.2,38.9],[x,5.2,36.95]);
  for(const x of [41.25,42.78])rod([x,5.2,36.95],[x,1.36,32.15]);
  // Recessed three-storey wall flanking the shallow polygonal bay. A broad
  // paired top sash and the blue entrance distinguish the right-hand recess.
  for(const y of [2,6.5,11])sash('pavilion-left',49.6,y,19.55,0,1.02,2.35);
  sash('pavilion-right',58.2,11,19.55,0,2.25,2.4);
  sash('pavilion-right',59.6,6.5,19.55,0,.55,2.2);
  door(58.4,19.6);
  box(white,58.4,3.55,20.05,3.25,.2,1.15);
  // Match the west half-octagonal bays: one broad front, two canted cheeks,
  // matching bands/hip and world-scale brickwork instead of cylinder UVs.
  addWestCantedBay(THREE,{model,mesh,worldUV,brick,white,roof,sash},{
    x:53.1,z:19.45,side:1,name:'East curved bay',face:'polygonal-bay',
    width:5.1,depth:2.8,height:14.3,baseHeight:4,
    bandHeights:[4.06,8.8,14.28,14.45],
    windowRows:[2,6.5,11].map(y=>({y,width:y===2?1.45:1.05,sideWidth:y===2?1.45:1.05,height:2.35}))
  });
  // Square projecting pavilion: exactly two aligned openings on each storey
  // of its front face, and two on its exposed east return.
  for(const y of [2,6.5,11]){
    for(const x of [63.65,67.35])sash('square-front',x,y,25.05,0,1.15,2.45);
    // The east return is scheduled separately from redesmere-edge/img3.jpg.
  }
  addRedesmereGardenDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,hipRoof,sash,door,rod,iron});
  // Separate service rooms stop at the lane; no windows float in the gap.

  for(const y of [2,6.5])for(const x of [66.7,70.5,81.7]){
    if(x>79)sash('service-rear',x,y,4.45,Math.PI,1.05,2.2);
    if(x>79)sash('service-front',x,y,11.55,0,1.05,2.2);
  }
  // Only the taller rear building has front windows above the low roof.
  sash('service-background',92.4,7.5,10.05,0,1.15,2.2);
  // Dark rainwater pipes break up the long white ground storey.
  for(const z of [17,29,42.7])box(iron,41.2,4.1,z,.085,8.2,.085);
  for(const x of [61.4,69.6])box(iron,x,7,25.2,.085,14,.085);
  // Photo foreground: an access lane close to the building and a slim young tree.
  const paving=material(0xb7b9ac);
  box(paving,61,.18,29.5,25,.1,2.1);
  // The marked east lawn column is removed in every period; retain the
  // separate light beside the Redesmere approach.
  for(const [x,z,h] of [[102,39,8]]){
    mesh(new THREE.CylinderGeometry(.06,.095,h,8),steel,x,h/2,z,true);
    rod([x,h-.12,z],[x+1.3,h-.35,z],.06,steel);
    box(iron,x+1.4,h-.4,z,.8,.1,.3);
  }
  addWestFrontPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,hipRoof});
  addWestForwardEndPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,material,sash,door,rod,iron});
  addWestCourtPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,frame,hipRoof});
  addCourtyardPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,frame,glass,hipRoof});
  addInnerCourtPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone});
  addWestWingPhotoDetails(THREE,{model,worldUV,white,brick,roof,steel,material,hipRoof});
  addCentralCourtPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,sash,door,rod,iron,stone,hipRoof});
  addRearCourtPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,frame,glass});
  addRedesmerePhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,hipRoof,sash,door,rod,iron});
  addWestLawnPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,hipRoof,sash,iron});
  addEntranceWestPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,hipRoof,sash,door,rod,iron,frame,glass});
  addEastEntranceMirror(THREE,{model,box,mesh,worldUV,white,brick,roof,material,hipRoof,sash,door,rod,iron,frame,glass});
}
