// img9.jpg, located by img9-loc.png: west front garden and stair recess.
export const WEST_FRONT_PHOTO_VIEW=Object.freeze({position:[-73,1.8,51],target:[-51,7,24],fov:70});
export const WEST_FRONT_FACADE_Z=19.5;
export function westFrontPhotoProfile(x,z){return (x===-36.5&&z===23)||(x===-35&&z===35);}
export function addWestFrontPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,hipRoof}){
  const start=model.userData.eastPhotoOpenings.length;
  // The square frontage and stair doors share the pavilion's facade plane.
  mesh(worldUV(new THREE.BoxGeometry(13,15.2,4),1.7),brick,-65.5,7.6,17.5,true).name='West front square pavilion';
  hipRoof(-65.5,17.5,13,4,15.3,1.7);
  for(const y of [4.05,8.6,15.2])box(white,-65.5,y,17.5,13.15,.18,4.15);
  for(const y of [2,6.4,11.8])for(const x of [-68,-62.5])sash('west-front-square',x,y,WEST_FRONT_FACADE_Z+.06,0,1.65,2.75);
  // A white entrance surround belongs only to the narrow west return.
  box(white,-72.06,2,17.5,.16,4,4);
  door(-72.16,17.5,-Math.PI/2);
  for(const y of [6.4,11.8])sash('west-front-square-return',-72.08,y,17.5,-Math.PI/2,1.15,2.8);
  // Tall inset beside the bay: two landing doors and a ground-floor sash.
  sash('west-front-stair-inset',-55.6,2,19.56,0,1.15,2.5);
  door(-55.6,19.57,0,4.25);door(-53.6,19.57,0,8.5);
  for(const y of [4.05,8.6])box(white,-48.6,y,19.62,21.32,.18,.2);
  // Fine sash glazing follows the flat facets of the existing west bay.
  const bx=-46,bz=19,r=3.15,apothem=r*Math.cos(Math.PI/8);
  mesh(worldUV(new THREE.CylinderGeometry(r,r,14.3,8),1.7),brick,bx,7.15,bz,true).name='West curved bay';
  for(const y of [4.05,8.6,14.3])mesh(new THREE.CylinderGeometry(r+.08,r+.08,.18,8),white,bx,y,bz);
  mesh(new THREE.ConeGeometry(r+.25,1.5,8),roof,bx,15.1,bz,true);
  for(const offset of [-3,-1,1,3]){
    const a=offset*Math.PI/8;
    for(const y of [2,6.5,11])sash('west-front-bay',bx+Math.sin(a)*(apothem+.06),y,bz+Math.cos(a)*(apothem+.06),a,Math.abs(offset)===1?.86:.6,2.5);
  }
  for(const y of [2,6.5,11])for(const x of [-50,-42])sash('west-front-bay-flank',x,y,19.56,0,.95,2.4);
  for(const [x,z,h] of [[-71.8,19.7,15],[-57.35,19.7,14.2],[-41.18,29,8.5]])box(iron,x,h/2,z,.085,h,.085);

  const stair=new THREE.Group();stair.name='West front iron return stair';model.add(stair);
  function rail(a,b,r=.03){rod(a,b,r);stair.attach(model.children[model.children.length-1]);}
  function flight(x0,y0,x1,y1,z){
    for(let i=0;i<18;i++){
      const t=(i+.5)/18,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t;
      box(iron,x,y,z,Math.abs(x1-x0)/18+.04,.075,1.2);
      for(const side of [-1,1])box(iron,x,y+.53,z+side*.62,.035,1.06,.035);
    }
    for(const side of [-1,1]){
      rail([x0,y0+1.06,z+side*.62],[x1,y1+1.06,z+side*.62]);
      rail([x0,y0-.1,z+side*.56],[x1,y1-.1,z+side*.56],.065);
    }
  }
  box(iron,-53.6,8.5,20.45,2.2,.14,1.8);
  box(iron,-56.5,4.25,21.15,2.5,.14,3.2);
  flight(-53.6,8.5,-56.5,4.25,20.65);flight(-56.5,4.25,-53.4,.3,22.2);
  for(const [x,z,h] of [[-52.6,21.2,8.5],[-54.6,21.2,8.5],[-57.5,22.6,4.25]])rail([x,.2,z],[x,h+1.05,z],.07);
  rail([-54.6,9.55,21.2],[-52.6,9.55,21.2]);
  for(let i=0;i<8;i++)box(iron,-54.6+i*.28,9.02,21.2,.035,1.04,.035);

  // Lower forward range: brick ground floor, tall upper sashes and slate roof.
  for(const y of [1.9,6.3]){
    for(const z of [18,21.5,25,28.5,32,35.5,39,42])sash('west-front-forward-west',-41.06,y,z,-Math.PI/2,1.05,2.35);
    // The inner east face is scheduled separately from img18.jpg.
    // The northward img17 photograph supplies the end wall separately.
  }
  addFrontWingChimneys(THREE,{mesh,worldUV,brick,box});
  // Low glazed extension along the garden side, with a real sloping roof.
  mesh(worldUV(new THREE.BoxGeometry(4.4,3.2,16),1.7),brick,-43.2,1.6,35,true).name='West front glazed extension';
  const leanRoof=mesh(new THREE.BoxGeometry(5.1,.16,16.5),roof,-43.2,3.85,35,true);leanRoof.rotation.z=.27;
  for(const z of [28.7,31.8,38.2,41.3])sash('west-front-extension',-45.46,1.65,z,-Math.PI/2,2.25,1.45);
  door(-45.46,35,-Math.PI/2);
  sash('west-front-extension-end',-43.2,1.65,43.07,0,2.6,1.45);
  // One spreading garden tree leaves the upper windows and stairs visible.
  const bark=material(0x625342),leaf=material(0x4d713d),lawn=material(0x667b49);
  box(lawn,-49,.32,35,7,.1,14);
  const trees=model.getObjectByName('Trees');
  trees.add(mesh(new THREE.CylinderGeometry(.12,.2,4.5,8),bark,-48.5,2.25,36,true));
  for(let i=0;i<12;i++){
    const a=i*2.4,crown=mesh(new THREE.IcosahedronGeometry(1,1),leaf,-48.5+Math.sin(a)*1.8,4.7+(i%3)*.35,36+Math.cos(a)*2,true);
    crown.scale.set(1.35,.65,1.4);trees.add(crown);
  }
  model.userData.westFrontPhotoOpenings=model.userData.eastPhotoOpenings.slice(start);
}

export function addFrontWingChimneys(THREE,{mesh,worldUV,brick,box},side=-1){
  for(const [x,z] of [[38.5,28.8],[31.1,39.7]]){
    mesh(worldUV(new THREE.BoxGeometry(side>0?.7:1.45,side>0&&z>30?3.4:5.4,side>0?1.25:1.9),1.7),brick,side*x,side>0&&z>30?11.5:12.5,z,true).name=side<0?'West front chimney':'East front chimney';
    for(const y of [15.05,15.3])box(brick,side*x,y-(side>0&&z>30?2:0),z,side>0?.9:1.65,.18,side>0?1.45:2.1);
    for(const dz of [-.55,.55])mesh(new THREE.CylinderGeometry(.14,.17,.55,8),brick,side*x,side>0&&z>30?13.65:15.65,z+dz*(side>0?.65:1),true);
  }
}
