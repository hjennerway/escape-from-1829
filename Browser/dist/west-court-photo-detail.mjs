import {addWestCantedBay} from './west-refinement.mjs';
// west/img4.jpg and img5.jpg refine the earlier img6 rear courtyard reference.
// The locator image fixes the court; unseen dimensions remain approximations.
export const WEST_COURT_PHOTO_VIEW=Object.freeze({position:[-51,1.8,-33],target:[-54,7,5],fov:66});
// The red-marked corner is the fixed datum. The yellow elevation, including
// its attached bay, now meets it; the lean-to projects 3.5 units from this wall.
export const WEST_COURT_ALIGNMENT=Object.freeze({wallZ:-1,oldWallZ:4.5,gardenZ:19.5,leanToFrontZ:-4.5,leanToX:-41.4,leanToWidth:4.8});
export function westCourtPhotoProfile(x,z){
  return (x===-48.6&&z===(WEST_COURT_ALIGNMENT.wallZ+WEST_COURT_ALIGNMENT.gardenZ)/2)||(x===-62.5&&z===10.25)||(x===-69&&z===9.25)||(x===-39.6&&z===3)||(x===-31&&z===-10);
}
export function addWestCourtPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,frame,hipRoof}){
  const start=model.userData.eastPhotoOpenings.length;
  const {wallZ,oldWallZ,leanToFrontZ,leanToX,leanToWidth}=WEST_COURT_ALIGNMENT,shift=wallZ-oldWallZ;
  // Five openings per storey: a single sash, then two closely spaced pairs.
  const paired=[-45.2,-47.6,-49,-52.5,-53.9];
  for(const y of [2,6.5,11])for(const x of paired){
    if(y===2&&x===-45.2)continue;
    sash('west-court-paired',x,y,wallZ-.07,Math.PI,1.02,2.4);
  }
  door(-45.2,wallZ-.09,Math.PI);
  // Pale bands sit between floors, rather than covering the brick ground floor.
  for(const y of [4.05,8.6])box(white,-51.2,y,wallZ-.12,16,.18,.2);
  addWestCantedBay(THREE,{model,mesh,worldUV,brick,white,roof,sash},{x:-58.4,z:4.4+shift,side:-1,name:'West courtyard polygonal bay',face:'west-court-bay',height:15.2,depth:3.35,width:6.5,windowWidth:1.3});
  // Keep the existing outer recess fixed. Solid side masonry and a roof close
  // the bay's deeper connection into that retained part of the cross range.
  mesh(worldUV(new THREE.BoxGeometry(3.3,14.3,-shift+.2),1.7),brick,-60,7.15,(wallZ+oldWallZ)/2,true).name='West courtyard bay extended return';
  hipRoof(-60,(wallZ+oldWallZ)/2,3.3,-shift+.2,14.53,1).name='West courtyard bay return roof';
  for(const y of [4.05,8.6,14.3])box(white,-61.72,y,(wallZ+oldWallZ)/2,.2,.18,-shift+.2);
  // Yellow annotation: a broad recessed wall followed by a projecting corner.
  // The recess has paired windows at the top and middle; the corner's upper
  // front remains blank, with the high openings turned onto its side return.
  for(const y of [2,6.4,11.1])for(const x of [-62.1,-63.25])
    sash('west-court-recess',x,y,4.93,Math.PI,.78,2.25);
  for(const y of [2,6.4])for(const x of [-67.4,-70.2])
    sash('west-court-outer',x,y,2.93,Math.PI,1.12,2.25);
  for(const y of [2,6.4,11.1])sash('west-corner-return',-65.95,y,4.1,Math.PI/2,.78,2.15);
  for(const y of [4.05,8.6]){
    box(white,-62.5,y,4.86,7.12,.18,.23);
    box(white,-69,y,2.86,6.12,.18,.23);
    box(white,-65.88,y,4,.23,.18,2.3);
  }
  // A shallow two-storey stair projection sits in front of the recess.
  mesh(worldUV(new THREE.BoxGeometry(2.8,8.65,2),1.7),brick,-65.05,4.325,3.9,true).name='West court low projecting bay';
  hipRoof(-65.05,3.9,2.8,2,8.78,.5).name='West court low bay slate cap';
  for(const y of [2,6.4])for(const x of [-64.16,-65.54])sash('west-court-low-bay',x,y,2.84,Math.PI,1.04,2.25);
  for(const y of [4.05,8.6])box(white,-65.05,y,2.78,2.97,.18,.25);
  box(iron,-66.55,4.33,2.74,.085,8.66,.085);
  for(const x of [-65.9,-71.7])box(iron,x,6.3,2.74,.085,12.6,.085);
  // Retain the photographed front curved bay; only its flanking front sashes
  // are added here, while the new polygonal bay faces the rear court.
  for(const y of [2,6.5,11])for(const z of [8,12,16])sash('west-pavilion-east',-37.95,y,z,Math.PI/2,1.1,2.4);

  // The rearward arm now uses the mirrored img15/img16 detail module.
  // The fixed red corner window remains in the newly aligned elevation.
  sash('west-court-inset',-39.6,8.15,-1.05,Math.PI,1.1,2.3);
  const depth=wallZ-leanToFrontZ,centreZ=(wallZ+leanToFrontZ)/2,frontHeight=2.65,rearHeight=3.7;
  // The red side guides shift the complete lean-to 1.8 units along the court
  // wall, leaving a narrow open gap beside the yellow-marked rear arm.
  const walls=new THREE.BoxGeometry(leanToWidth,rearHeight,depth),vertices=walls.attributes.position;
  for(let i=0;i<vertices.count;i++)if(vertices.getY(i)>0){
    const t=(vertices.getZ(i)+depth/2)/depth;
    vertices.setY(i,frontHeight+(rearHeight-frontHeight)*t-.06-rearHeight/2);
  }
  walls.computeVertexNormals();
  mesh(worldUV(walls,1.7),brick,leanToX,rearHeight/2,centreZ,true).name='West courtyard glazed lean-to';
  const glazing=material(0x8b9c99,{roughness:.45,metalness:.1});
  const pitch=-Math.atan2(rearHeight-frontHeight,depth),roofLength=(depth+.3)/Math.cos(pitch),roofY=(frontHeight+rearHeight)/2;
  const top=mesh(new THREE.BoxGeometry(leanToWidth+.15,.09,roofLength),glazing,leanToX,roofY,centreZ);top.rotation.x=pitch;top.name='West courtyard extended glazed roof';
  for(let i=0;i<=4;i++){
    const x=leanToX-leanToWidth/2+i*leanToWidth/4;
    const bar=mesh(new THREE.BoxGeometry(.06,.12,roofLength+.04),frame,x,roofY+.07,centreZ);bar.rotation.x=pitch;
  }
  // Green marks the exposed side facing along the court toward the bay.
  // Rotate the whole low door surround onto that side; the front stays brick.
  const doorX=leanToX-leanToWidth/2-.07;
  const sideDoor=mesh(new THREE.BoxGeometry(1.42,2.4,.12),material(0x172e50),doorX,1.2,centreZ);
  sideDoor.rotation.y=-Math.PI/2;sideDoor.name='West courtyard lean-to side door';
  for(const u of [-.81,.81])box(white,doorX-.08,1.25,centreZ+u,.12,2.5,.16,-Math.PI/2);
  box(white,doorX-.08,2.5,centreZ,1.9,.15,.23,-Math.PI/2);
  box(glazing,doorX-.09,2.1,centreZ,1.42,.6,.08,-Math.PI/2);
  box(frame,doorX-.15,2.1,centreZ,.04,.6,.04,-Math.PI/2);
  for(const [x,z,w,top] of [[-48.6,wallZ-.15,21.3,14.3],[-62.5,4.85,7.1,14.3],[-69,2.85,6.15,15.2]]){
    for(const [dy,h,d] of [[-.18,.16,.23],[.04,.22,.4],[.22,.1,.55]])box(white,x,top+dy,z,w,h,d);
    box(iron,x,top+.32,z-.2,w+.13,.08,.12);
  }
  for(const x of [-46.4,-50.8,-55.2])box(iron,x,7,wallZ-.32,.085,14,.085);
  for(const y of [4.3,8.9])rod([-50.8,y,wallZ-.32],[-48.3,y,wallZ-.32],.035);
  for(const x of [-50,-54.7])box(stone,x,8.1,wallZ-.4,.4,.3,.15);

  // The court gravel is part of the continuous west surface in addEntranceWalks.
  model.userData.westCourtPhotoOpenings=model.userData.eastPhotoOpenings.slice(start);
}
