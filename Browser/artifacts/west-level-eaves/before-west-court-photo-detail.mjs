import {addWestCantedBay} from './west-refinement.mjs';
import {addFacadeCourse} from './facade-courses.mjs';
import {WEST_RANGE_PLAN} from './west-range-plan.mjs';
// west/img4.jpg and img5.jpg refine the earlier img6 rear courtyard reference.
// The locator image fixes the court; unseen dimensions remain approximations.
export const WEST_COURT_PHOTO_VIEW=Object.freeze({position:[-51,1.8,-33],target:[-54,7,5],fov:66});
// The later marked outline narrows the court side along with the garden side.
// Its attached lean-to retains a 3.5-unit depth and follows the moved wall.
export const WEST_COURT_ALIGNMENT=Object.freeze({wallZ:WEST_RANGE_PLAN.courtZ,oldWallZ:WEST_RANGE_PLAN.recessRearZ-.5,gardenZ:WEST_RANGE_PLAN.gardenZ,leanToFrontZ:WEST_RANGE_PLAN.courtZ-3.5,leanToX:-41.4,leanToWidth:4.8});
export function westCourtPhotoProfile(x,z){
  return (x===-48.6&&z===(WEST_COURT_ALIGNMENT.wallZ+WEST_COURT_ALIGNMENT.gardenZ)/2)||(x===-62.5&&z===(WEST_RANGE_PLAN.recessRearZ+WEST_RANGE_PLAN.gardenZ)/2)||(x===-69&&z===(WEST_RANGE_PLAN.outerRearZ+WEST_RANGE_PLAN.gardenZ)/2)||(x===-39.6&&z===(WEST_COURT_ALIGNMENT.wallZ+7)/2)||(x===-31&&z===-10);
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
  addWestCantedBay(THREE,{model,mesh,worldUV,brick,white,roof,sash},{x:-58.4,z:wallZ-.1,side:-1,name:'West courtyard polygonal bay',face:'west-court-bay',height:15.2,depth:3.35,width:6.5,
    windowRows:[2,6.45,11.35].map(y=>({y,width:1.3,sideWidth:1.3,height:2.5}))});
  // Keep the existing outer recess fixed. Solid side masonry and a roof close
  // the bay's deeper connection into that retained part of the cross range.
  mesh(worldUV(new THREE.BoxGeometry(3.3,14.3,-shift+.2),1.7),brick,-60,7.15,(wallZ+oldWallZ)/2,true).name='West courtyard bay extended return';
  hipRoof(-60,(wallZ+oldWallZ)/2,3.3,-shift+.2,14.53,1).name='West courtyard bay return roof';
  box(white,-61.72,14.3,(wallZ+oldWallZ)/2,.2,.18,-shift+.2);
  // Yellow annotation: a broad recessed wall followed by a projecting corner.
  // Retain the upper pair. Each lower floor has one sash centred on the
  // exposed wall between the polygonal bay and the low stair projection.
  const lowBayX=-65.05,lowBayWidth=2.8,bayLeft=-58.4-6.5/2;
  const recessWindowX=(bayLeft+lowBayX+lowBayWidth/2)/2;
  for(const y of [2,6.4,11.1])for(const x of y===11.1?[-62.1,-63.25]:[recessWindowX])
    sash('west-court-recess',x,y,WEST_RANGE_PLAN.recessRearZ-.07,Math.PI,.78,2.25);
  for(const y of [2,6.4])for(const x of [-67.4,-70.2])
    sash('west-court-outer',x,y,WEST_RANGE_PLAN.outerRearZ-.07,Math.PI,1.12,2.25);
  for(const y of [2,6.4,11.1])sash('west-corner-return',-65.95,y,WEST_RANGE_PLAN.outerRearZ+1.1,Math.PI/2,.78,2.15);
  // The garden detail builder continues these floor bands around the whole
  // stepped outer end, including this low bay, as a single level sweep.
  // A shallow two-storey stair projection sits in front of the recess.
  const lowBayZ=WEST_RANGE_PLAN.outerRearZ+.9;
  mesh(worldUV(new THREE.BoxGeometry(lowBayWidth,8.65,2),1.7),brick,lowBayX,4.325,lowBayZ,true).name='West court low projecting bay';
  mesh(worldUV(new THREE.BoxGeometry(lowBayWidth+.2,.16,2.2),3),roof,lowBayX,8.73,lowBayZ,true).name='West court low bay flat roof';
  // A small pale rim rises 0.20 above the level slate deck, with flush joins.
  for(const side of [-1,1]){
    box(white,lowBayX,8.91,lowBayZ+side*1.04,3,.2,.12);
    box(white,lowBayX+side*1.44,8.91,lowBayZ,.12,.2,1.96);
  }
  for(const y of [2,6.4])for(const x of [-64.16,-65.54])sash('west-court-low-bay',x,y,lowBayZ-1.06,Math.PI,1.04,2.25);
  // Owner's later blue guide moves the far-end pipe beside this low roof.
  // Finish at its rim, in the clear pier between the two window banks.
  const pipeHeight=8.91;
  box(iron,lowBayX-lowBayWidth/2-.1,pipeHeight/2,lowBayZ-1.16,.085,pipeHeight,.085);
  // Retain the photographed front curved bay; only its flanking front sashes
  // are added here, while the new polygonal bay faces the rear court.
  for(const y of [2,6.5,11])for(const z of [8,12,16])sash('west-pavilion-east',-37.95,y,z,Math.PI/2,1.1,2.4);

  // The rearward arm now uses the mirrored img15/img16 detail module.
  // The fixed red corner window remains in the newly aligned elevation.
  sash('west-court-inset',-39.6,8.15,wallZ-.05,Math.PI,1.1,2.3);
  // The marked high corner must be closed above the lower recessed link.
  // Continue the cross-range masonry and cornice into the rear arm's slate;
  // the last side sash stays clear in front of this z=-1 wall plane.
  const halfRoof=z=>z<2?6.9-(z+6)*.5/8:6.4;
  const rows=[wallZ,7.2].map(z=>{
    const half=halfRoof(z),edge=-31-half;
    return [[-38.04,14.3,z],[-37.6,14.3,z],[edge,13.03,z],
      [-31-half*(1-1.27/2.6),14.3,z],[-33.39,14.3,z]];
  });
  const infill=[];
  function quad(vertices,a,b,c,d){vertices.push(...a,...b,...c,...a,...c,...d);}
  const foot=p=>[p[0],11.3,p[2]];
  for(let row=1;row<rows.length;row++)for(let i=1;i<rows[row].length;i++)
    quad(infill,rows[row-1][i-1],rows[row][i-1],rows[row][i],rows[row-1][i]);
  for(let i=1;i<rows[0].length;i++){
    quad(infill,foot(rows[0][i-1]),rows[0][i-1],rows[0][i],foot(rows[0][i]));
    quad(infill,foot(rows.at(-1)[i]),rows.at(-1)[i],rows.at(-1)[i-1],foot(rows.at(-1)[i-1]));
  }
  for(let row=1;row<rows.length;row++){
    quad(infill,foot(rows[row][0]),rows[row][0],rows[row-1][0],foot(rows[row-1][0]));
    quad(infill,foot(rows[row-1][4]),rows[row-1][4],rows[row][4],foot(rows[row][4]));
  }
  function geometry(vertices){
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(vertices.length/3*2),2));
    g.computeVertexNormals();return g;
  }
  mesh(worldUV(geometry(infill),1.7),brick,0,0,0,true).name='West courtyard upper link infill';
  // The tall roof meets the lower rear-arm pitch at a brick return, rather
  // than the former almost vertical strip of slate. Bury its foot in the
  // existing infill and carry the matching white cornice around the corner.
  const returnEndZ=7.25,returnX=-31-halfRoof(returnEndZ),returnWidth=returnX+38.04;
  mesh(worldUV(new THREE.BoxGeometry(returnWidth,3,returnEndZ-wallZ),1.7),brick,
    returnX-returnWidth/2,12.8,(wallZ+returnEndZ)/2,true).name='West courtyard upper link brick return';
  for(const [dy,h,width] of [[-.18,.16,.23],[.04,.22,.4],[.22,.1,.55]])
    addFacadeCourse(THREE,{mesh,worldUV},'West courtyard upper link joined cornice '+dy,white,
      [[-38.05,wallZ-.15],[returnX,wallZ-.15],[returnX,returnEndZ]],14.3+dy,h,width);
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
  for(const [x,z,w,top] of [[-48.6,wallZ-.15,21.3,14.3],[-62.5,WEST_RANGE_PLAN.recessRearZ-.15,7.1,14.3],[-69,WEST_RANGE_PLAN.outerRearZ-.15,6.15,15.2]]){
    if(x!==-69)for(const [dy,h,d] of [[-.18,.16,.23],[.04,.22,.4],[.22,.1,.55]])box(white,x,top+dy,z,w,h,d);
    // The recessed gutter stops at the lower eave, beyond the new rendered
    // roof-step riser; its former end crossed through that white return.
    const gutterLeft=x===-62.5?-65.2:x-(w+.13)/2,gutterRight=x+(w+.13)/2;
    box(iron,(gutterLeft+gutterRight)/2,top+.32,z-.2,gutterRight-gutterLeft,.08,.12);
  }
  for(const x of [-46.4,-50.8,-55.2])box(iron,x,7,wallZ-.32,.085,14,.085);
  for(const y of [4.3,8.9])rod([-50.8,y,wallZ-.32],[-48.3,y,wallZ-.32],.035);
  for(const x of [-50,-54.7])box(stone,x,8.1,wallZ-.4,.4,.3,.15);

  // The court gravel is part of the continuous west surface in addEntranceWalks.
  model.userData.westCourtPhotoOpenings=model.userData.eastPhotoOpenings.slice(start);
}
