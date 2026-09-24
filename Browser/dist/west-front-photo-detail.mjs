import {addWestCantedBay,addWestEndDetails} from './west-refinement.mjs';
// west/img1..3 refine the earlier img9 garden and outer end interpretation.
export const WEST_FRONT_PHOTO_VIEW=Object.freeze({position:[-73,1.8,51],target:[-51,7,24],fov:70});
export const WEST_FRONT_FACADE_Z=19.5;
export function westFrontPhotoProfile(x,z){return (x===-36.5&&z===23)||(x===-35&&z===35);}
export function addWestFrontPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,hipRoof}){
  const start=model.userData.eastPhotoOpenings.length;
  // The square frontage and stair doors share the pavilion's facade plane.
  mesh(worldUV(new THREE.BoxGeometry(13,15.2,4),1.7),brick,-65.5,7.6,17.5,true).name='West front square pavilion';
  hipRoof(-62.5,17.5,7,4,15.47,1.15);
  for(const y of [4.05,8.6,15.2])box(white,-65.5,y,19.58,13.15,.18,.18);
  for(const y of [2,6.4,11.8])for(const x of [-68,-62.5])sash('west-front-square',x,y,WEST_FRONT_FACADE_Z+.06,0,1.65,2.75);
  addWestEndDetails(THREE,{model,box,mesh,worldUV,brick,white,material,sash,door,iron,hipRoof});
  // The fire escape sits to the left of the broad flanking windows.
  sash('west-front-stair-inset',-58.6,2,19.56,0,1.05,2.5);
  door(-58.6,19.57,0,4.25);door(-58,19.57,0,8.5);
  for(const y of [4.05,8.6])box(white,-48.6,y,19.62,21.32,.18,.2);
  addWestCantedBay(THREE,{model,mesh,worldUV,brick,white,roof,sash},{x:-50.8,z:19.5,side:1,name:'West curved bay',face:'west-front-bay',height:14.8});
  // Paired top sashes; broad lower glazing with narrow sidelights.
  for(const x of [-55.5,-43.6]){
    for(const dx of [-.75,.75])sash('west-front-bay-flank-upper',x+dx,11.3,19.56,0,1.27,2.5);
    for(const y of [2,6.45]){
      if(x!==-43.6||y!==2)sash('west-front-bay-flank',x,y,19.56,0,1.55,2.6);
      for(const dx of [-1.25,1.25])sash('west-front-bay-flank-sidelight',x+dx,y,19.56,0,.61,2.6);
    }
    for(const y of [.53,3.48,4.98,7.93,9.92,12.69])box(white,x,y,19.72,3.78,.17,.24);
  }
  for(const x of [-54,-47.45])box(iron,x,7.3,19.83,.075,14.6,.075);
  for(const [x,z,h] of [[-71.8,19.7,15],[-57.35,19.7,14.2],[-41.18,29,8.5]])box(iron,x,h/2,z,.085,h,.085);

  const stair=new THREE.Group();stair.name='West front iron return stair';model.add(stair);
  function rail(a,b,r=.03){rod(a,b,r);stair.attach(model.children[model.children.length-1]);}
  // Shift the complete escape (including batched treads) with its landing doors.
  const stairBox=box;
  function stepBox(mat,x,y,z,w,h,d){stairBox(mat,x-4.4,y,z,w,h,d);}
  function flight(x0,y0,x1,y1,z){
    for(let i=0;i<18;i++){
      const t=(i+.5)/18,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t;
      stepBox(iron,x,y,z,Math.abs(x1-x0)/18+.04,.075,1.2);
      for(const side of [-1,1])stepBox(iron,x,y+.53,z+side*.62,.035,1.06,.035);
    }
    for(const side of [-1,1]){
      rail([x0,y0+1.06,z+side*.62],[x1,y1+1.06,z+side*.62]);
      rail([x0,y0-.1,z+side*.56],[x1,y1-.1,z+side*.56],.065);
    }
  }
  stepBox(iron,-53.6,8.5,20.45,2.2,.14,1.8);
  stepBox(iron,-56.5,4.25,21.15,2.5,.14,3.2);
  // A short wall-side platform connects the intermediate landing to its door.
  stepBox(iron,-55.1,4.25,19.95,4,.14,.85);
  flight(-53.6,8.5,-56.5,4.25,20.65);flight(-56.5,4.25,-53.4,.3,22.2);
  for(const [x,z,h] of [[-52.6,21.2,8.5],[-54.6,21.2,8.5],[-57.5,22.6,4.25]])rail([x,.2,z],[x,h+1.05,z],.07);
  rail([-54.6,9.55,21.2],[-52.6,9.55,21.2]);
  for(let i=0;i<8;i++)stepBox(iron,-54.6+i*.28,9.02,21.2,.035,1.04,.035);
  stair.position.x=-4.4;

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
  box(material(0x99917b),-46.1,.41,33.5,1.55,.1,18);
  // The garden's glazed blue entrance has an open, unrailed approach.
  door(-43.6,19.59,0);
  model.userData.westFrontPhotoOpenings=model.userData.eastPhotoOpenings.slice(start);
}

export function addFrontWingChimneys(THREE,{mesh,worldUV,brick,box},side=-1){
  for(const [x,z] of [[38.5,28.8],[31.1,39.7]]){
    mesh(worldUV(new THREE.BoxGeometry(side>0?.7:1.45,side>0&&z>30?3.4:5.4,side>0?1.25:1.9),1.7),brick,side*x,side>0&&z>30?11.5:12.5,z,true).name=side<0?'West front chimney':'East front chimney';
    for(const y of [15.05,15.3])box(brick,side*x,y-(side>0&&z>30?2:0),z,side>0?.9:1.65,.18,side>0?1.45:2.1);
    for(const dz of [-.55,.55])mesh(new THREE.CylinderGeometry(.14,.17,.55,8),brick,side*x,side>0&&z>30?13.65:15.65,z+dz*(side>0?.65:1),true);
  }
}
