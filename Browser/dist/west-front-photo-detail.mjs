import {addWestCantedBay,addWestEndDetails} from './west-refinement.mjs';
import {addExteriorStairRail} from './exterior-stair-rail.mjs';
import {addFacadeCourse} from './facade-courses.mjs';
// west/img1..3 refine the earlier img9 garden and outer end interpretation.
export const WEST_FRONT_PHOTO_VIEW=Object.freeze({position:[-73,1.8,51],target:[-51,7,24],fov:70});
export const WEST_FRONT_FACADE_Z=19.5;
// Owner's front-left red E trace: keep the spine and long forward range,
// extending only the broad outer pavilion and the middle canted arm.
export const WEST_FRONT_E_PLAN=Object.freeze({outerFront:26.5,bayRoot:21,bayFront:23.8,
  outerLeft:-72,outerRight:-64,bayX:-52.5,bayWidth:6.2,bayFrontWidth:2.3,innerX:-41});
export function westFrontPhotoProfile(x,z){return (x===-36.5&&z===23)||(x===-35&&z===35);}
export function addWestFrontPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,hipRoof}){
  const start=model.userData.eastPhotoOpenings.length;
  const {outerFront,bayRoot,outerLeft,outerRight,bayX,bayWidth,bayFrontWidth,innerX}=WEST_FRONT_E_PLAN,outerBack=15.5;
  const outerWidth=outerRight-outerLeft,outerX=(outerLeft+outerRight)/2;
  const bayLeft=bayX-bayWidth/2,bayRight=bayX+bayWidth/2;
  const leftFlank=(outerRight+bayLeft)/2,rightFlank=(bayRight+innerX)/2;
  mesh(worldUV(new THREE.BoxGeometry(outerWidth,15.2,outerFront-outerBack),1.7),brick,outerX,7.6,(outerBack+outerFront)/2,true).name='West front square pavilion';
  hipRoof(outerX,(outerBack+outerFront)/2,outerWidth,outerFront-outerBack,15.47,2.86).name='West front outer arm slate roof';
  for(const y of [4.05,8.6,15.2])addFacadeCourse(THREE,{mesh,worldUV},'West outer pavilion continuous floor band '+y,white,
    [[outerLeft-.08,19.425],[outerLeft-.08,outerFront+.08],[outerRight+.08,outerFront+.08],[outerRight+.08,19.425]],y,.18,.18);
  for(const y of [2,6.4,11.8])for(const x of [outerX-1.8,outerX+1.8])sash('west-front-square',x,y,outerFront+.06,0,1.4,2.75);
  addWestEndDetails(THREE,{model,box,mesh,worldUV,brick,white,material,sash,door,iron,hipRoof});
  // The narrower outer face exposes a longer recessed elevation. Close its
  // wall and roof back to the retained cross range, without moving the rear.
  const recessRight=-59,recessWidth=recessRight-outerRight,recessX=(outerRight+recessRight)/2;
  mesh(worldUV(new THREE.BoxGeometry(recessWidth,14.3,4),1.7),brick,recessX,7.15,17.5,true).name='West front widened recess';
  hipRoof(recessX,15.5,recessWidth,8,14.53,1.2).name='West front widened recess slate roof';
  for(const y of [14.3,14.52])box(white,recessX,y,19.59,recessWidth+.15,.17,.2);
  // Turn the whole escape onto the inner return of the extended outer arm.
  // The original doors, treads and rails share one transform into the recess.
  const stairPoint=(x,z)=>[outerRight+.07+(z-19.57),21-(x+58)];
  const [sx,sz]=stairPoint(-58.6,19.56);
  sash('west-front-stair-inset',sx,2,sz,Math.PI/2,1.05,2.5);
  for(const [x,y] of [[-58.6,4.25],[-58,8.5]]){const [px,pz]=stairPoint(x,19.57);door(px,pz,Math.PI/2,y);}
  for(const y of [4.05,8.6])addFacadeCourse(THREE,{mesh,worldUV},'West middle bay continuous floor band '+y,white,
    [[outerRight+.09,19.62],[bayLeft,19.62],[bayLeft,bayRoot+2.8*.28],
      [bayX-bayFrontWidth/2,bayRoot+2.8],[bayX+bayFrontWidth/2,bayRoot+2.8],
      [bayRight,bayRoot+2.8*.28],[bayRight,19.62],[-38,19.62]],y,.2,.2);
  mesh(worldUV(new THREE.BoxGeometry(bayWidth,14.8,bayRoot-19.5),1.7),brick,bayX,7.4,(19.5+bayRoot)/2,true).name='West front middle arm';
  for(const y of [14.72,14.95])for(const x of [bayLeft-.09,bayRight+.09])
    box(white,x,y,(19.5+bayRoot)/2,.2,.2,bayRoot-19.5+.1);
  addWestCantedBay(THREE,{model,mesh,worldUV,brick,white,roof,sash},{x:bayX,z:bayRoot,width:bayWidth,frontWidth:bayFrontWidth,side:1,name:'West curved bay',face:'west-front-bay',height:14.8,includeRoof:false,bandHeights:[14.72,14.95]});
  addMiddleArmRoof(THREE,{mesh,roof},bayX,bayWidth,bayFrontWidth,bayRoot);
  // Paired top sashes; broad lower glazing with narrow sidelights.
  for(const x of [leftFlank,rightFlank]){
    for(const dx of [-.75,.75])sash('west-front-bay-flank-upper',x+dx,11.3,19.56,0,1.27,2.5);
    for(const y of [2,6.45]){
      if(x!==rightFlank||y!==2)sash('west-front-bay-flank',x,y,19.56,0,1.55,2.6);
      for(const dx of [-1.25,1.25])sash('west-front-bay-flank-sidelight',x+dx,y,19.56,0,.61,2.6);
    }
    for(const y of [.53,3.48,4.98,7.93,9.92,12.69]){
      // The garden entrance replaces the lower central sash. Its sill ends
      // outside the doorframe, while the two sidelights retain their ledges.
      if(x===rightFlank&&y===.53){
        for(const side of [-1,1])box(white,x+side*1.42,y,19.72,.94,.17,.24);
      }else box(white,x,y,19.72,3.78,.17,.24);
    }
  }
  for(const x of [bayLeft-.1,bayRight+.25])box(iron,x,7.3,19.83,.075,14.6,.075);
  for(const [x,z,h] of [[outerLeft+.2,outerFront+.2,15],[leftFlank-1.85,19.7,14.2],[-41.18,29,8.5]])box(iron,x,h/2,z,.085,h,.085);

  const stair=new THREE.Group();stair.name='West front iron return stair';model.add(stair);
  function guard(a,b){
    const point=p=>{const [x,z]=stairPoint(p[0]-4.4,p[2]);return [x,p[1]+.07,z];};
    return addExteriorStairRail(THREE,stair,iron,point(a),point(b));
  }
  function rail(a,b,r=.03){
    const pa=stairPoint(a[0]-4.4,a[2]),pb=stairPoint(b[0]-4.4,b[2]);
    rod([pa[0],a[1],pa[1]],[pb[0],b[1],pb[1]],r);stair.attach(model.children[model.children.length-1]);
  }
  function stepBox(mat,x,y,z,w,h,d){const [px,pz]=stairPoint(x-4.4,z);box(mat,px,y,pz,w,h,d,Math.PI/2);}
  function flight(x0,y0,x1,y1,z){
    for(let i=0;i<18;i++){
      const t=(i+.5)/18,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t;
      stepBox(iron,x,y,z,Math.abs(x1-x0)/18+.04,.075,1.2);
    }
    for(const side of [-1,1]){
      guard([x0,y0,z+side*.62],[x1,y1,z+side*.62]);
      rail([x0,y0-.1,z+side*.56],[x1,y1-.1,z+side*.56],.065);
    }
  }
  stepBox(iron,-53.6,8.5,20.61,2.2,.14,2.12);
  stepBox(iron,-58.625,4.25,21.185,1.25,.14,3.27);
  // A short wall-side platform connects the intermediate landing to its door.
  stepBox(iron,-56.175,4.25,19.95,6.15,.14,.75);
  flight(-54.7,8.5,-58,4.25,20.95);flight(-58,4.25,-53.4,.3,22.2);
  for(const [x,z,h] of [[-52.5,21.67,8.5],[-54.7,21.67,8.5],[-59.25,22.82,4.25]])rail([x,.2,z],[x,h,z],.07);
  // Enclose both decks and the door walkway, leaving the flight mouths open.
  for(const [a,b] of [
    [[-54.7,8.5,21.67],[-52.5,8.5,21.67]],
    [[-52.5,8.5,21.67],[-52.5,8.5,19.55]],
    [[-54.7,8.5,19.55],[-54.7,8.5,20.33]],
    [[-59.25,4.25,19.55],[-59.25,4.25,22.82]],
    [[-59.25,4.25,22.82],[-58,4.25,22.82]],
    [[-58,4.25,21.57],[-58,4.25,21.58]],
    [[-58,4.25,20.325],[-53.1,4.25,20.325]],
    [[-53.1,4.25,20.325],[-53.1,4.25,19.575]]
  ])guard(a,b);

  // Lower forward range: brick ground floor, tall upper sashes and slate roof.
  for(const y of [1.9,6.3]){
    for(const z of [21.5,24,28,29.5,34,35.5,41])sash('west-front-forward-west',-41.06,y,z,-Math.PI/2,1.05,2.35);
    // The inner east face is scheduled separately from img18.jpg.
    // The northward img17 photograph supplies the end wall separately.
  }
  addFrontWingChimneys(THREE,{mesh,worldUV,brick,box});
  for(const y of [4.05,8.6])box(white,-41.15,y,32,.23,.18,22);
  // Low glazed extension along the garden side, with a real sloping roof.
  mesh(worldUV(new THREE.BoxGeometry(4.4,3.2,16),1.7),brick,-43.2,1.6,35,true).name='West front glazed extension';
  const leanRoof=mesh(new THREE.BoxGeometry(5.1,.16,16.5),roof,-43.2,3.85,35,true);leanRoof.rotation.z=.27;leanRoof.name='West garden lean-to slate roof';
  for(const z of [28.7,31.8,34.9,41.3]){
    for(const dz of [-.65,.65])sash('west-front-extension',-45.46,1.65,z+dz,-Math.PI/2,1.19,1.45);
  }
  door(-45.46,38.15,-Math.PI/2);
  sash('west-front-extension-end',-43.2,1.65,43.07,0,2.6,1.45);
  // Retain the garden and approach after the marked tree removal.
  const lawn=material(0x667b49);
  box(lawn,-57.7,.32,34,22.5,.1,17);
  box(material(0xa39e88),-46.1,.41,33.5,1.55,.1,18);
  // The garden's glazed blue entrance has an open, unrailed approach.
  door(rightFlank,19.59,0);
  model.userData.westFrontPhotoOpenings=model.userData.eastPhotoOpenings.slice(start);
}

function addMiddleArmRoof(THREE,{mesh,roof},bayX,width,frontWidth,root){
  // The branch ridge meets the retained cross-range ridge. Its rear edges
  // are buried in that roof, forming valleys without a detached bay cap.
  const half=width*.535,frontHalf=frontWidth*.535,points=[[-half,15.1,9.25],[-half,15.1,root+.944],
    [-frontHalf,15.1,root+2.96],[frontHalf,15.1,root+2.96],
    [half,15.1,root+.944],[half,15.1,9.25],
    // The retained cross-range ridge starts at x=-50.76. Keep the rear
    // junction just inside it when the bay moves sideways, closing the seam.
    [-50.76-bayX,18.32,9.25],[0,18.33,root-.5]];
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
    mesh(worldUV(new THREE.BoxGeometry(side>0?.7:1.45,side>0&&z>30?3.4:5.4,side>0?1.25:1.9),1.7),brick,side*x,side>0&&z>30?11.5:12.5,z,true).name=side<0?'West front chimney':'East front chimney';
    for(const y of [15.05,15.3])box(brick,side*x,y-(side>0&&z>30?2:0),z,side>0?.9:1.65,.18,side>0?1.45:2.1);
    for(const dz of [-.55,.55])mesh(new THREE.CylinderGeometry(.14,.17,.55,8),brick,side*x,side>0&&z>30?13.65:15.65,z+dz*(side>0?.65:1),true);
  }
}
