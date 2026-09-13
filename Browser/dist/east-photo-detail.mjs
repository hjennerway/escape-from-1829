import {addWestForwardEndPhotoDetails} from './west-forward-end-photo-detail.mjs';
import {addEastEntranceMirror} from './entrance-symmetry.mjs';
import {photoDetailPrimitives} from './photo-detail-primitives.mjs';
import {addWestWingPhotoDetails} from './west-wing-photo-detail.mjs';
// Visible east forecourt, from 20260912_172141.jpg and the user's camera mark.
// Coordinates are visual estimates. Keep the window schedule explicit so later
// photographs can correct individual openings without changing the whole estate.
import {addWestFrontPhotoDetails} from './west-front-photo-detail.mjs';
import {addWestCourtPhotoDetails} from './west-court-photo-detail.mjs';
import {addCourtyardPhotoDetails} from './courtyard-photo-detail.mjs';
import {addRearCourtPhotoDetails} from './rear-court-photo-detail.mjs';
import {addRedesmerePhotoDetails} from './redesmere-photo-detail.mjs';
import {addWestLawnPhotoDetails} from './west-lawn-photo-detail.mjs';
import {addEntranceWestPhotoDetails} from './entrance-west-photo-detail.mjs';
import {addInnerCourtPhotoDetails} from './inner-court-photo-detail.mjs';
import {addCentralCourtPhotoDetails} from './central-court-photo-detail.mjs';
export const EAST_PHOTO_VIEW=Object.freeze({position:[76,1.8,48],target:[53,5.4,21],fov:76});

export function eastPhotoProfile(x,z){
  return (Math.abs(x-54.875)<.01&&z===12)||
    (Math.abs(x-40.05)<.01&&z===23)||(Math.abs(x-38.55)<.01&&z===35)||
    (x===65.5&&z===20.75)||(Math.abs(x-74.425)<.01&&[8,15.5].includes(z));
}

export function addEastPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,steel,material,hipRoof}){
  const {frame,glass,iron,stone,sash,door,rod}=photoDetailPrimitives(THREE,{model,box,mesh,white,steel,material});
  // The two-storey forward wing: nine positions on its east wall. The eighth
  // position is the blue entrance and upper escape door, not another window.
  const sideZ=[17.3,20,22.3,25.1,27.4,31.2,33.5,38.1,42];
  for(const z of sideZ)if(z!==38.1)for(const y of [2,6.25])sash('forward-wing-east',48.15,y,z,Math.PI/2,1.02,2.45);
  for(const y of [2,6.25])for(const x of [32,35,38,42.1,45.7])sash('forward-wing-end',x,x<41?(y===2?1.9:6.3):y,43.06,0,x<41?1.15:1.08,2.35);
  // The inner wall is the reflected img18 elevation, supplied below.
  door(48.18,38.1,Math.PI/2);door(48.18,38.1,Math.PI/2,4.25);
  // External metal stair descends along the wall from the upper blue door.
  box(iron,49.1,4.18,38.1,1.8,.14,2);
  for(let i=0;i<17;i++){
    const y=4.1-i*.24,z=36.95-i*.3;
    box(iron,49.1,y,z,1.6,.09,.32);
    for(const x of [48.35,49.88])box(iron,x,y+.53,z,.045,1.06,.045);
  }
  for(const x of [48.35,49.88])rod([x,5.2,38.9],[x,5.2,36.95]);
  for(const x of [48.35,49.88])rod([x,5.2,36.95],[x,1.36,32.15]);
  // Recessed three-storey wall flanking the shallow polygonal bay. A broad
  // paired top sash and the blue entrance distinguish the right-hand recess.
  for(const y of [2,6.5,11])sash('pavilion-left',49.6,y,19.55,0,1.02,2.35);
  sash('pavilion-right',58.2,11,19.55,0,2.25,2.4);
  sash('pavilion-right',59.6,6.5,19.55,0,.55,2.2);
  door(58.4,19.6);
  box(white,58.4,3.55,20.05,3.25,.2,1.15);
  const bayX=53.1,bayZ=19,r=2.55;
  mesh(new THREE.CylinderGeometry(r,r,10.3,8),brick,bayX,9.15,bayZ,true).name='East curved bay';
  mesh(new THREE.CylinderGeometry(r,r,4,8),white,bayX,2,bayZ,true);
  for(const y of [4.06,8.8,14.28])mesh(new THREE.CylinderGeometry(r+.08,r+.08,.16,8),white,bayX,y,bayZ);
  mesh(new THREE.ConeGeometry(r+.24,1.15,8),roof,bayX,14.96,bayZ,true);
  // Windows sit on the three outward facets, with no windows buried in brick.
  const apothem=r*Math.cos(Math.PI/8);
  for(const angle of [-Math.PI/4,0,Math.PI/4])for(const y of [2,6.5,11]){
    // CylinderGeometry has vertices on +Z: rotate the body by half a segment
    // below so the middle facet is flat and these openings sit flush.
    sash('polygonal-bay',bayX+Math.sin(angle)*(apothem+.06),y,bayZ+Math.cos(angle)*(apothem+.06),angle,y===2?1.45:1.05,2.35);
  }
  for(const o of model.children)if(o.geometry?.type==='CylinderGeometry'&&o.position.x===bayX&&o.position.z===bayZ)o.rotation.y=Math.PI/8;
  // Square projecting pavilion: exactly two aligned openings on each storey
  // of its front face, and two on its exposed east return.
  for(const y of [2,6.5,11]){
    for(const x of [63.65,67.35])sash('square-front',x,y,25.05,0,1.15,2.45);
    for(const z of [18.4,22.4])sash('square-east',69.8,y,z,Math.PI/2,1.2,2.45);
  }
  // The low link sits below the pavilion's first-floor windows; the courtyard
  // opening remains walkable. Its taller rear block is set behind this roof.
  for(const y of [2,6.5])for(const x of [66.7,70.5,81.7]){
    if(x>79)sash('service-rear',x,y,4.45,Math.PI,1.05,2.2);
    if(x>79)sash('service-front',x,y,11.55,0,1.05,2.2);
  }
  for(const x of [71,81.7])sash('low-link',x,1.85,19.55,0,.95,2.15);
  // Dark rainwater pipes break up the long white ground storey.
  for(const z of [17,29,42.7])box(iron,48.3,4.1,z,.085,8.2,.085);
  for(const x of [61.4,69.6])box(iron,x,7,25.2,.085,14,.085);
  // Photo foreground: an access lane close to the building, a slim young tree
  // and lighting columns, leaving the window elevations readable.
  const asphalt=material(0x777d79),paving=material(0xb7b9ac),foliage=material(0x617849),bark=material(0x665c46);
  box(paving,61,.18,29.5,25,.1,2.1);box(asphalt,64,.19,33,31,.1,4.6);
  mesh(new THREE.CylinderGeometry(.09,.14,5.6,7),bark,55.5,2.8,30,true);
  for(let i=0;i<13;i++){
    const a=i*2.4,y=3.1+i*.38,s=.6+Math.sin(i*1.9)*.18;
    const crown=mesh(new THREE.IcosahedronGeometry(1,1),foliage,55.5+Math.sin(a)*.38,y,30+Math.cos(a)*.35,true);
    crown.scale.set(s,s*1.35,s);
  }
  for(const [x,z,h] of [[55,43,11.8],[75,31,8]]){
    mesh(new THREE.CylinderGeometry(.06,.095,h,8),steel,x,h/2,z,true);
    rod([x,h-.12,z],[x+1.3,h-.35,z],.06,steel);
    box(iron,x+1.4,h-.4,z,.8,.1,.3);
  }
  addWestFrontPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,hipRoof});
  addWestForwardEndPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,material,sash,door,rod,iron});
  addWestCourtPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,frame});
  addCourtyardPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,frame,glass});
  addInnerCourtPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone});
  addWestWingPhotoDetails(THREE,{model,worldUV,white,brick,roof,steel,material,hipRoof});
  addCentralCourtPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,sash,door,rod,iron,stone,hipRoof});
  addRearCourtPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,frame,glass});
  addRedesmerePhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,hipRoof,sash,door,rod,iron});
  addWestLawnPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,hipRoof,sash,iron});
  addEntranceWestPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,hipRoof,sash,door,rod,iron,frame,glass});
  addEastEntranceMirror(THREE,{model,box,mesh,worldUV,white,brick,roof,material,hipRoof,sash,door,rod,iron,frame,glass});
}
