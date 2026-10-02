import {WING_ROOF_JOIN} from './wing-roof-junctions.mjs';
// img14.jpg, looking east from the marked position beside the central arm.
// The projecting enclosure and stepped return are estimates from the photo;
// the estate's map proportions stay intact. The corrected rear side profile
// and its low sloping annex are built in inner-court-photo-detail.mjs.
export const INNER_EAST_PHOTO_VIEW=Object.freeze({position:[9,1.8,-24],target:[24,7,-22.5],fov:76});
export function innerEastPhotoView(aspect){
  // Retain the stairs and projecting front together in narrow preview panes.
  return {...INNER_EAST_PHOTO_VIEW,fov:Math.max(76,2*Math.atan(Math.tan(54*Math.PI/180)/aspect)*180/Math.PI)};
}
export function addInnerEastElevation(THREE,{model,box,mesh,worldUV,white,brick,roof,sash,iron,stone}){
  const start=model.userData.eastPhotoOpenings.length;
  // Brick infill lowers the over-tall white ground storey on this face only.
  mesh(worldUV(new THREE.BoxGeometry(.24,2.5,30),1.7),brick,24.83,2.75,-10,true).name='Inner east brick ground-storey facing';
  for(const y of [2.7,6.5,11])for(const z of [-23,-20.3,-8.9,0,3])
    sash('inner-east-adjoining',24.64,y,z,-Math.PI/2,1.15,y===2.7?1.7:2.35);
  // Narrow plain front with one opening per floor, and a glazed side return.
  mesh(worldUV(new THREE.BoxGeometry(6.2,13,7.4),1.7),brick,21.9,8.2,-14.5,true).name='Inner east tall rectangular projection';
  box(white,21.9,.85,-14.5,6.2,1.7,7.4);
  box(roof,21.9,14.67,-14.5,6.25,.14,7.45);
  for(const x of [18.78,25.02])box(stone,x,14.78,-14.5,.18,.22,7.65);
  for(const z of [-18.22,-10.78])box(stone,21.9,14.78,z,6.4,.22,.18);
  for(const [y,w,h] of [[3.45,1.5,2.05],[8.25,1.5,1.95],[13.05,1.35,1.4]])
    sash('inner-east-projection-front',18.74,y,-14.5,-Math.PI/2,w,h);
  for(const y of [3.45,8.25,12.7])for(const x of [20.1,22.4,24.1])
    sash('inner-east-projection-return',x,y,-18.26,Math.PI,x===24.1?.9:1.25,2.15);
  box(iron,18.67,.66,-13.1,.07,.34,.54);
  for(let i=0;i<5;i++)box(stone,18.62,.53+i*.065,-13.1,.04,.025,.5);
  // The shallower adjoining pier gives the main wall its stepped profile.
  mesh(worldUV(new THREE.BoxGeometry(2,12.8,4.8),1.7),brick,24,7.9,-5.5,true).name='Inner east stepped return';
  box(white,24,.75,-5.5,2,1.5,4.8);
  box(roof,24,14.3,-5.5,2.25,.16,5.05);
  for(const y of [13.9,14.2])box(white,24,y,-5.5,2.2,.2,5);
  for(const y of [3,6.5,11])sash('inner-east-stepped-front',22.94,y,-5.5,-Math.PI/2,1.12,y===3?1.7:2.35);
  for(const y of [6.5,11])sash('inner-east-stepped-return',24,y,-7.96,Math.PI,1.05,2.35);
  for(const z of [-24.65,-8.1]){
    const height=z<-24?WING_ROOF_JOIN.wall:13.8;
    box(iron,24.54,height/2,z,.085,height,.085);
  }
  model.userData.innerEastPhotoOpenings=model.userData.eastPhotoOpenings.slice(start);
}
