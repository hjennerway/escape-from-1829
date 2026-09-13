// top-heights-map.png fixes the rear endpoint between the side-wing ends
// and the east courtyard return. img11.jpg supplies the inward elevation.
// These are relative photo/map estimates, not surveyed dimensions.
export const MAP_REAR_PROPORTIONS=Object.freeze({front:19.5,wingRear:-35.5,courtyardRear:-46,centralRear:-39.5,centralJoin:7,centralWidth:13});
export const CENTRAL_COURT_PHOTO_VIEW=Object.freeze({position:[19.2,1.8,-35],target:[0,4.5,-26],fov:76});
export function centralCourtPhotoView(aspect){
  return {...CENTRAL_COURT_PHOTO_VIEW,fov:Math.max(76,2*Math.atan(Math.tan(54*Math.PI/180)/aspect)*180/Math.PI)};
}
export function addCentralCourtPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,sash,door,rod,iron,stone,hipRoof}){
  const start=model.userData.eastPhotoOpenings.length;
  const {centralJoin,centralRear,centralWidth}=MAP_REAR_PROPORTIONS,step=-24.5,base=1.4;
  function range(name,x,z,w,d,h,rise){
    mesh(worldUV(new THREE.BoxGeometry(w,h-base,d),1.7),brick,x,(h+base)/2,z,true).name=name;
    box(white,x,base/2,z,w,base,d);
    box(stone,x,h-.05,z,w+.2,.12,d+.2);
    hipRoof(x,z,w,d,h,rise);
  }
  range('Central court two-storey range',0,(centralJoin+step)/2,centralWidth,centralJoin-step,8.6,.9);
  // Small eastward step near the rear; the western wall remains aligned.
  range('Central court raised rear section',.7,(step+centralRear)/2,14.4,step-centralRear,9.4,.6);
  for(const z of [3.8,1.1,-5.1,-8.8,-12.5,-16.2,-20])
    sash('central-court-upper',6.56,6.2,z,Math.PI/2,1.3,2.55);
  for(const z of [3.8,1.1])sash('central-court-ground-pair',6.56,2.7,z,Math.PI/2,1.3,1.6);
  for(const z of [-5.1,-12.5,-20])sash('central-court-ground',6.56,2.2,z,Math.PI/2,1.55,3);
  for(const z of [-27,-29.4,-34])sash('central-court-rear-upper',7.96,6.8,z,Math.PI/2,1.3,2.8);
  for(const z of [-28.1,-35.1])sash('central-court-rear-ground',7.96,2.2,z,Math.PI/2,1.55,3);
  door(7.97,-36.3,Math.PI/2,5.1);
  // Continue the established sash treatment around the unseen west/rear faces.
  for(let z=3.8;z>centralRear+1.5;z-=3.8)for(const y of [2.2,z<step?6.8:6.2])
    sash('central-court-west',-6.56,y,z,-Math.PI/2,1.15,2.4);
  for(const x of [-3.5,.7,4.9])for(const y of [2.2,6.8])
    sash('central-court-rear-end',x,y,centralRear-.06,Math.PI,1.2,2.4);
  for(const [x,z,h] of [[6.74,.1,8.6],[6.74,-23.9,8.6],[8.14,-32,9.4]])box(iron,x,h/2,z,.09,h,.09);
  rod([8.17,4.6,-29.8],[8.17,4.5,-32],.05);
  // Relocate the existing central-arm stair to the doorway seen in img11.
  const stair=new THREE.Group();stair.name='Central court rear iron stair';model.add(stair);
  function rail(a,b,r=.03){rod(a,b,r);stair.attach(model.children[model.children.length-1]);}
  box(iron,8.9,5.1,-36.3,1.8,.14,2);
  for(let i=0;i<20;i++){
    const t=(i+.5)/20,z=-37.3-t*5.9,y=5.1-t*4.8;
    box(iron,8.9,y,z,1.6,.075,.33);
    for(const x of [8.12,9.68])box(iron,x,y+.53,z,.035,1.06,.035);
  }
  for(const x of [8.12,9.68]){
    rail([x,6.16,-37.3],[x,1.36,-43.2]);
    rail([x,5,-37.3],[x,.2,-43.2],.065);
    rail([x,.2,-37.2],[x,6.16,-37.2],.07);
  }
  rail([9.8,6.16,-35.3],[9.8,6.16,-37.3]);
  for(let i=0;i<8;i++)box(iron,9.8,5.63,-35.3-i*.28,.035,1.06,.035);
  model.userData.centralCourtPhotoOpenings=model.userData.eastPhotoOpenings.slice(start);
}
