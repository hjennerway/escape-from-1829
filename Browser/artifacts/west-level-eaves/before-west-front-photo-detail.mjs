import {addWestCantedBay,addWestEndDetails,WEST_END_PROPORTIONS} from './west-refinement.mjs';
import {addWestGardenStair} from './west-garden-stair.mjs';
import {addFacadeCourse} from './facade-courses.mjs';
import {closeGroundEdges} from './ground-contact.mjs';
import {WEST_RANGE_PLAN} from './west-range-plan.mjs';
// west/img1..3 refine the earlier img9 garden and outer end interpretation.
export const WEST_FRONT_PHOTO_VIEW=Object.freeze({position:[-73,1.8,51],target:[-51,7,24],fov:70});
export const WEST_FRONT_FACADE_Z=WEST_RANGE_PLAN.gardenZ;
// The three garden arms follow the later marked plan: outer pavilion,
// canted middle bay and restored inner square return beside the lower wing.
export const WEST_FRONT_E_PLAN=Object.freeze({outerFront:WEST_RANGE_PLAN.outerFrontZ,bayRoot:WEST_RANGE_PLAN.bayRootZ,bayFront:WEST_RANGE_PLAN.bayFrontZ,
  outerLeft:-72,outerRight:-64,bayX:-52.5,bayWidth:6.2,bayFrontWidth:2.3,innerX:-41,
  rightFlankX:(-52.5+6.2/2+WEST_RANGE_PLAN.innerLeft)/2,rightFlankEnd:WEST_RANGE_PLAN.innerLeft});
export function westFrontPhotoProfile(x,z){return (x===-36.5&&z===23)||(x===-35&&z===35);}
export function addWestFrontPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,hipRoof}){
  const start=model.userData.eastPhotoOpenings.length;
  const {outerFront,bayRoot,outerLeft,outerRight,bayX,bayWidth,bayFrontWidth,rightFlankEnd}=WEST_FRONT_E_PLAN,outerBack=WEST_FRONT_FACADE_Z,garden=WEST_FRONT_FACADE_Z;
  const outerWidth=outerRight-outerLeft,outerX=(outerLeft+outerRight)/2;
  const bayLeft=bayX-bayWidth/2,bayRight=bayX+bayWidth/2;
  const leftFlank=(outerRight+bayLeft)/2,rightFlank=WEST_FRONT_E_PLAN.rightFlankX;
  mesh(worldUV(new THREE.BoxGeometry(outerWidth,15.2,outerFront-outerBack),1.7),brick,outerX,7.6,(outerBack+outerFront)/2,true).name='West front square pavilion';
  hipRoof(outerX,(outerBack+outerFront)/2,outerWidth,outerFront-outerBack,15.47,1.10).name='West front outer arm slate roof';
  for(const [y,h] of [[2,2.30],[6.4,2.40],[11.8,2.55]])for(const x of [outerX-1.8,outerX+1.8])sash('west-front-square',x,y,outerFront+.06,0,1.4,h);
  addWestEndDetails(THREE,{model,box,mesh,worldUV,brick,white,material,sash,door,iron,hipRoof},{front:outerFront,back:WEST_RANGE_PLAN.outerRearZ});
  // The narrower outer face exposes a longer recessed elevation. Close its
  // wall and roof back to the retained cross range, without moving the rear.
  const recessRight=-59,recessWidth=recessRight-outerRight,recessX=(outerRight+recessRight)/2;
  const recessDepth=Math.min(3.5,garden-WEST_RANGE_PLAN.recessRearZ),recessZ=garden-recessDepth/2;
  mesh(worldUV(new THREE.BoxGeometry(recessWidth,14.3,recessDepth),1.7),brick,recessX,7.15,recessZ,true).name='West front widened recess';
  hipRoof(recessX,recessZ,recessWidth,recessDepth,14.53,1.2).name='West front widened recess slate roof';
  for(const y of [14.3,14.52])box(white,recessX,y,garden+.09,recessWidth+.15,.17,.2);
  // Retain the low sash on the inner return; the photographed landing doors
  // now face the garden from the recessed wall behind the stairs.
  const stairPoint=(x,z)=>[outerRight+.07+(z-19.57),bayRoot-(x+58)];
  const [sx,sz]=stairPoint(-58.6,19.56);
  sash('west-front-stair-inset',sx,2,sz,Math.PI/2,1.05,2.5);
  // One level sweep follows the court, stepped end, front pavilion and garden
  // bays. Separate end bars used different heights and stopped at the corners.
  const {doorZ,pierWidth}=WEST_END_PROPORTIONS,pierLeft=doorZ-pierWidth/2,pierRight=doorZ+pierWidth/2;
  for(const y of [4.05,8.6])addFacadeCourse(THREE,{mesh,worldUV},'West outer and garden continuous floor band '+y,white,
    [[-61.72,WEST_RANGE_PLAN.courtZ-.1],[-61.72,WEST_RANGE_PLAN.recessRearZ-.14],
      [-63.57,WEST_RANGE_PLAN.recessRearZ-.14],[-63.57,WEST_RANGE_PLAN.outerRearZ-.18],
      [-72.25,WEST_RANGE_PLAN.outerRearZ-.18],[-72.25,pierLeft],[-72.51,pierLeft],
      [-72.51,pierRight],[-72.25,pierRight],[-72.25,outerFront+.08],
      [outerRight+.09,outerFront+.08],[outerRight+.09,garden+.12],
      [bayLeft,garden+.12],[bayLeft,bayRoot+2.8*.28],
      [bayX-bayFrontWidth/2,bayRoot+2.8],[bayX+bayFrontWidth/2,bayRoot+2.8],
      [bayRight,bayRoot+2.8*.28],[bayRight,garden+.12],[rightFlankEnd-.09,garden+.12],
      [rightFlankEnd-.09,WEST_RANGE_PLAN.innerFrontZ+.09],[WEST_RANGE_PLAN.innerRight+.09,WEST_RANGE_PLAN.innerFrontZ+.09],
      [WEST_RANGE_PLAN.innerRight+.09,garden+.12]],y,.18,.2);
  mesh(worldUV(new THREE.BoxGeometry(bayWidth,14.8,bayRoot-garden),1.7),brick,bayX,7.4,(garden+bayRoot)/2,true).name='West front middle arm';
  for(const y of [14.72,14.95])addFacadeCourse(THREE,{mesh,worldUV},'West middle arm joined cornice '+y,white,
    [[bayLeft-.09,garden-.05],[bayLeft-.09,bayRoot+2.8*.28],
      [bayX-bayFrontWidth/2,bayRoot+2.8+.1],[bayX+bayFrontWidth/2,bayRoot+2.8+.1],
      [bayRight+.09,bayRoot+2.8*.28],[bayRight+.09,garden-.05]],y,.2,.2);
  addWestCantedBay(THREE,{model,mesh,worldUV,brick,white,roof,sash},{x:bayX,z:bayRoot,width:bayWidth,frontWidth:bayFrontWidth,side:1,name:'West curved bay',face:'west-front-bay',height:14.8,includeRoof:false,bandHeights:[],
    windowRows:[[2,2.20],[6.45,2.20],[11.35,2.30]].map(([y,height])=>({y,height,width:1.10,sideWidth:1.10}))});
  addMiddleArmRoof(THREE,{mesh,roof},bayX,bayWidth,bayFrontWidth,bayRoot);
  // The circled square return is a full-height arm behind the lower wing.
  // The later green/yellow photo recesses the west face behind the lower
  // wing and adds two sashes on each lower floor. The upper west face is blank.
  const {innerLeft,innerRight,innerFrontZ,innerHeight}=WEST_RANGE_PLAN;
  const innerWidth=innerRight-innerLeft,innerDepth=innerFrontZ-garden,innerCentre=(innerLeft+innerRight)/2;
  const innerPeriod=new THREE.Group();innerPeriod.name='West garden inner pavilion period';innerPeriod.userData.estateSection='1829 Wings';model.add(innerPeriod);
  const innerWall=mesh(worldUV(new THREE.BoxGeometry(innerWidth,innerHeight,innerDepth),1.7),brick,innerCentre,innerHeight/2,(garden+innerFrontZ)/2,true);
  innerWall.name='West garden inner projecting pavilion';innerPeriod.add(innerWall);
  const innerRoof=hipRoof(innerCentre,(garden+innerFrontZ)/2,innerWidth,innerDepth,innerHeight+.23,1.05);
  innerRoof.name='West garden inner pavilion slate roof';innerPeriod.add(innerRoof);
  // Recessing the pavilion crosses the automatic x=-38 timeline boundary.
  // Keep this whole existing 1849 arm dated together, including its cornices.
  for(const y of [innerHeight-.08,innerHeight+.15])innerPeriod.add(addFacadeCourse(THREE,{mesh,worldUV},'West garden inner pavilion cornice '+y,white,
    [[innerLeft-.09,garden-.1],[innerLeft-.09,innerFrontZ+.09],[innerRight+.09,innerFrontZ+.09],[innerRight+.09,garden-.1]],y,.2,.24));
  for(const x of [innerLeft+1.4,innerRight-1.4])sash('west-front-inner-upper',x,11.3,innerFrontZ+.065,0,1.02,2.4);
  // Equal clear gaps at both corners and between the complete window sills.
  const returnSillWidth=1.05+.32,returnGap=(innerDepth-2*returnSillWidth)/3;
  for(const y of [2,6.45])for(const z of [garden+returnGap+returnSillWidth/2,innerFrontZ-returnGap-returnSillWidth/2])
    sash('west-front-inner-return',innerLeft-.065,y,z,-Math.PI/2,1.05,2.35);
  // Paired top sashes; broad lower glazing with narrow sidelights.
  for(const x of [leftFlank,rightFlank]){
    for(const dx of [-.75,.75])sash('west-front-bay-flank-upper',x+dx,11.3,garden+.06,0,x===rightFlank?1.05:1.27,2.5);
    for(const y of [2,6.45]){
      if(x!==rightFlank||y!==2)sash('west-front-bay-flank',x,y,garden+.06,0,1.55,2.6);
      for(const dx of [-1.25,1.25])sash('west-front-bay-flank-sidelight',x+dx,y,garden+.06,0,.61,2.6,{columns:2});
    }
    for(const y of [.53,3.48,4.98,7.93,9.92,12.69]){
      // The garden entrance replaces the lower central sash. Its sill ends
      // outside the doorframe, while the two sidelights retain their ledges.
      if(x===rightFlank&&y===.53){
        for(const side of [-1,1])box(white,x+side*1.42,y,garden+.22,.94,.17,.24);
      }else box(white,x,y,garden+.22,3.78,.17,.24);
    }
  }
  for(const x of [bayLeft-.1,bayRight+.25])box(iron,x,7.3,garden+.33,.075,14.6,.075);
  for(const [x,z,h] of [[outerLeft+.2,outerFront+.2,15],[leftFlank-1.85,garden+.2,14.2],[innerLeft-.15,innerFrontZ+.1,14.2],[-41.18,29,8.5]])box(iron,x,h/2,z,.085,h,.085);

  addWestGardenStair(THREE,{model,iron,door});

  // Lower forward range: brick ground floor, tall upper sashes and slate roof.
  for(const y of [1.9,6.3]){
    for(const z of [22.1,24,28,29.5,34,35.5,41])sash('west-front-forward-west',-41.06,y,z,-Math.PI/2,1.05,2.35);
    // The inner east face is scheduled separately from img18.jpg.
    // The northward img17 photograph supplies the end wall separately.
  }
  addFrontWingChimneys(THREE,{mesh,worldUV,brick,box});
  // The pavilion's joined course covers the recessed root and the shoulder;
  // the retained straight lower-wing course starts beyond that corner.
  for(const y of [4.05,8.6])box(white,-41.15,y,(WEST_RANGE_PLAN.innerFrontZ+.09+43)/2,.23,.18,43-WEST_RANGE_PLAN.innerFrontZ-.09);
  // Low glazed extension along the garden side, with a real sloping roof.
  mesh(worldUV(new THREE.BoxGeometry(4.4,3.2,16),1.7),brick,-43.2,1.6,35,true).name='West front glazed extension';
  const leanRoof=mesh(new THREE.BoxGeometry(5.1,.16,16.5),roof,-43.2,3.85,35,true);leanRoof.rotation.z=.27;leanRoof.name='West garden lean-to slate roof';
  for(const z of [28.7,31.8,34.9,41.3]){
    for(const dz of [-.65,.65])sash('west-front-extension',-45.46,1.65,z+dz,-Math.PI/2,1.19,1.45);
  }
  door(-45.46,38.15,-Math.PI/2);
  sash('west-front-extension-end',-43.2,1.65,43.07,0,2.6,1.45);
  // The continuous estate terrain supplies the garden lawn. A raised grass
  // box here leaves a step across the open surface at z=25.5.
  // Keep the doorway approach at its established height, with solid sides
  // extending into the lawn instead of exposing the former slab's underside.
  const approach=mesh(new THREE.BoxGeometry(1.55,.1,18),material(0xa39e88),-46.1,.41,33.5);
  approach.name='West garden lean-to approach';closeGroundEdges(THREE,approach);
  // The garden's glazed blue entrance has an open, unrailed approach.
  door(rightFlank,garden+.09,0);
  model.userData.westFrontPhotoOpenings=model.userData.eastPhotoOpenings.slice(start);
}

function addMiddleArmRoof(THREE,{mesh,roof},bayX,width,frontWidth,root){
  // Match the narrowed host hip: its ridge becomes lower and longer as the
  // depth shrinks. The bay outline and shallow front crown remain unchanged.
  const depth=WEST_RANGE_PLAN.gardenZ-WEST_RANGE_PLAN.courtZ;
  const ridgeZ=(WEST_RANGE_PLAN.gardenZ+WEST_RANGE_PLAN.courtZ)/2;
  const ridgeX=-48.6-21.2/2-.4+(depth/2+.4)*.83;
  const ridgeY=14.53+Math.min(3.8,depth*.3)-.01;
  const half=width*.535,frontHalf=frontWidth*.535,points=[[-half,15.1,ridgeZ],[-half,15.1,root+.944],
    [-frontHalf,15.1,root+2.96],[frontHalf,15.1,root+2.96],
    [half,15.1,root+.944],[half,15.1,ridgeZ],
    [ridgeX+.01-bayX,ridgeY,ridgeZ],[0,15.62,root-.5]];
  const faces=[[0,1,7],[0,7,6],[1,2,7],[2,3,7],[3,4,7],[4,5,6],[4,6,7]],positions=[],uv=[];
  for(const face of faces){
    const [a,b,c]=face.map(i=>points[i]);
    const normalY=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]);
    for(const index of normalY>0?face:[...face].reverse()){
      const [x,y,z]=points[index];positions.push(x,y,z);uv.push(x/3,(z+y)/3);
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();
  mesh(geometry,roof,bayX,0,0,true).name='West curved bay slate roof';
}

export function addFrontWingChimneys(THREE,{mesh,worldUV,brick,box},side=-1){
  for(const [x,z] of [[38.5,28.8],[31.1,39.7]]){
    const west=side<0,shaftHeight=west?4.10:side>0&&z>30?3.4:5.4,shaftY=west?11.85:side>0&&z>30?11.5:12.5;
    mesh(worldUV(new THREE.BoxGeometry(side>0?.7:1.45,shaftHeight,side>0?1.25:1.9),1.7),brick,side*x,shaftY,z,true).name=west?'West front chimney':'East front chimney';
    for(const y of [15.05,15.3])box(brick,side*x,y-(west?1.30:side>0&&z>30?2:0),z,side>0?.9:1.65,.18,side>0?1.45:2.1);
    for(const dz of [-.55,.55])mesh(new THREE.CylinderGeometry(.14,.17,.55,8),brick,side*x,west?14.35:side>0&&z>30?13.65:15.65,z+dz*(side>0?.65:1),true);
  }
}
