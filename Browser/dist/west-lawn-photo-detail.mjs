// img18.jpg: westward lawn view beside Reception, located by img18-loc.png.
// Dimensions and obscured returns are visual estimates, not survey data.
export const WEST_LAWN_PHOTO_VIEW=Object.freeze({position:[-6,1.8,36.8],target:[-30,5.6,33],fov:53});
export function addWestLawnPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,hipRoof,sash,iron}){
  const start=model.userData.eastPhotoOpenings.length;
  const trim=material(0xd2d9d2),archBrick=material(0x80675b);
  // Keep the narrower root recessed behind the main forward wing.
  for(const [x,z,length] of [[-28.88,35,16],[-31.88,23.4,7.2]]){
    for(const y of [4.05,8.48])box(trim,x,y,z,.23,y>8?.3:.2,length);
    box(iron,x+.1,8.65,z,.12,.12,length+.2);
  }
  function opening(face,x,y,z,w=1.05,h=2.5){
    sash(face,x,y,z,Math.PI/2,w,h);
    const shape=new THREE.Shape(),a=w/2+.1;
    shape.moveTo(-a,0);shape.quadraticCurveTo(0,.19,a,0);
    shape.lineTo(a,.2);shape.quadraticCurveTo(0,.43,-a,.2);shape.closePath();
    const head=mesh(new THREE.ShapeGeometry(shape),archBrick,x+.19,y+h/2+.03,z);
    head.rotation.y=Math.PI/2;
  }
  for(const y of [1.9,6.3]){
    for(const z of [42,38.6,31.7,30.1,27.8])opening('west-lawn-main',-28.94,y,z);
    for(const z of [25.4,23.3,21.2])opening('west-lawn-link',-31.94,y,z,.95,2.2);
  }
  // Flat three-window bay, pale plinth and its own shallow slate cap.
  mesh(worldUV(new THREE.BoxGeometry(1.5,8.95,4.7),1.7),brick,-28.25,4.475,35.5,true).name='West lawn three-window bay';
  for(const y of [.52,4.05,8.83])box(trim,-27.43,y,35.5,.28,y<1?.5:.23,4.85);
  for(const z of [33.07,37.93])box(trim,-28.2,4.05,z,1.65,.23,.17);
  hipRoof(-28.3,35.5,1.8,4.8,9.02,.55).name='West lawn bay slate roof';
  for(const y of [1.95,6.35])for(const z of [34,35.5,37])opening('west-lawn-bay',-27.44,y,z,.7,2.7);
  for(const z of [33.02,37.98])box(iron,-27.27,4.47,z,.075,8.94,.075);
  for(const [x,z] of [[-28.72,27.12],[-31.7,20.1]])box(iron,x,4.25,z,.08,8.5,.08);
  // The shared entrance walk follows the wall and bay, leaving the lawn open.
  for(const [x,z] of [[-28.7,29],[-27.5,35.5]]){
    box(trim,x,3.1,z,.12,.32,.7);
    for(const y of [3.02,3.1,3.18])box(iron,x+.08,y,z,.04,.025,.56);
  }
  for(const z of [32.5,39])box(iron,-10,.18,z,.65,.06,.8);
  model.userData.westLawnPhotoOpenings=model.userData.eastPhotoOpenings.slice(start);
}
