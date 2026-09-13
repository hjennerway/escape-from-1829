// img6.jpg: outside the west rear arm, looking towards the rear of the frontage.
// The locator image fixes the court; unseen dimensions remain approximations.
export const WEST_COURT_PHOTO_VIEW=Object.freeze({position:[-51,1.8,-33],target:[-54,7,5],fov:66});
export function westCourtPhotoProfile(x,z){
  return (x===-48.6&&z===12)||(x===-62.5&&z===10.25)||(x===-69&&z===9.25)||(x===-39.6&&z===3)||(x===-31&&z===-10);
}
export function addWestCourtPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,frame}){
  const start=model.userData.eastPhotoOpenings.length;
  // Five openings per storey: a single sash, then two closely spaced pairs.
  const paired=[-45.2,-47.6,-49,-52.5,-53.9];
  for(const y of [2,6.5,11])for(const x of paired){
    if(y===2&&x===-45.2)continue;
    sash('west-court-paired',x,y,4.43,Math.PI,1.02,2.4);
  }
  door(-45.2,4.41,Math.PI);
  // Pale bands sit between floors, rather than covering the brick ground floor.
  for(const y of [4.05,8.6])box(white,-48.6,y,4.38,21.32,.18,.2);
  // A polygonal bay with two broad front facets and narrow side returns.
  const bx=-58.4,bz=4.4,r=3.3,apothem=r*Math.cos(Math.PI/8);
  mesh(worldUV(new THREE.CylinderGeometry(r,r,14.3,8),1.7),brick,bx,7.15,bz,true).name='West courtyard polygonal bay';
  for(const y of [4.05,8.6,14.3])mesh(new THREE.CylinderGeometry(r+.08,r+.08,.18,8),white,bx,y,bz);
  mesh(new THREE.ConeGeometry(r+.24,1.5,8),roof,bx,15.09,bz,true).name='West courtyard bay slate roof';
  for(const offset of [-3,-1,1,3]){
    const angle=Math.PI+offset*Math.PI/8;
    for(const y of [2,6.5,11])sash('west-court-bay',bx+Math.sin(angle)*(apothem+.06),y,bz+Math.cos(angle)*(apothem+.06),angle,Math.abs(offset)===1?1.1:.65,2.4);
  }
  // Yellow annotation: a broad recessed wall followed by a projecting corner.
  // The recess has paired windows at the top and middle; the corner's upper
  // front remains blank, with the high openings turned onto its side return.
  for(const y of [2,6.4,10.4])for(const x of [-63,-64.5])
    sash('west-court-recess',x,y,4.93,Math.PI,1.03,2.25);
  for(const y of [2,6.4])for(const x of [-67.4,-70.2])
    sash('west-court-outer',x,y,2.93,Math.PI,1.12,2.25);
  for(const y of [2,6.4,10.4])sash('west-corner-return',-65.95,y,4.1,Math.PI/2,.78,2.15);
  for(const y of [4.05,8.6]){
    box(white,-62.5,y,4.86,7.12,.18,.23);
    box(white,-69,y,2.86,6.12,.18,.23);
    box(white,-65.88,y,4,.23,.18,2.3);
  }
  for(const y of [2,6.4,10.4])for(const z of [6,10,14])sash('west-outer-side',-72.05,y,z,-Math.PI/2,1.08,2.25);
  for(const x of [-65.9,-71.7])box(iron,x,6.3,2.74,.085,12.6,.085);
  // Retain the photographed front curved bay; only its flanking front sashes
  // are added here, while the new polygonal bay faces the rear court.
  for(const y of [2,6.5,11])for(const z of [8,12,16])sash('west-pavilion-east',-37.95,y,z,Math.PI/2,1.1,2.4);

  // The rearward arm now uses the mirrored img15/img16 detail module.
  // Recessed corner above the glazed lean-to, with just two tall openings.
  for(const y of [2,6])sash('west-court-inset',-39.6,y,-1.05,Math.PI,1.1,2.3);
  for(const side of [-1,1])for(const y of [2,6])sash('west-court-inset-side',-39.6+side*3.65,y,3,side*Math.PI/2,1.05,2.3);
  mesh(worldUV(new THREE.BoxGeometry(4.8,2.5,1.7),1.7),brick,-39.6,1.25,-1.9,true).name='West courtyard glazed lean-to';
  const glazing=material(0x8b9c99,{roughness:.45,metalness:.1});
  const top=mesh(new THREE.BoxGeometry(4.9,.09,2.2),glazing,-39.6,3.13,-1.9);top.rotation.x=-.5;
  for(const x of [-42,-40.8,-39.6,-38.4,-37.2]){
    const bar=mesh(new THREE.BoxGeometry(.06,.12,2.25),frame,x,3.2,-1.9);bar.rotation.x=-.5;
  }
  for(const x of [-46.4,-50.8,-55.2])box(iron,x,7,4.18,.085,14,.085);
  for(const y of [4.3,8.9])rod([-50.8,y,4.18],[-48.3,y,4.18],.035);
  for(const x of [-50,-54.7])box(stone,x,8.1,4.1,.4,.3,.15);

  // Unmarked gravel and a low planted border replace the modern parking apron.
  const gravel=material(0xaaa18a),soil=material(0x635443),leaf=material(0x557344);
  box(gravel,-54.5,.2,-13,35,.12,26);
  box(soil,-70,.31,-11,1.5,.2,17);
  for(let i=0;i<24;i++){
    const shrub=mesh(new THREE.IcosahedronGeometry(.46,1),leaf,-70+Math.sin(i*2)*.28,.65,-19+i*.68,true);
    shrub.scale.set(1,.8,1);
  }
  model.userData.westCourtPhotoOpenings=model.userData.eastPhotoOpenings.slice(start);
}
