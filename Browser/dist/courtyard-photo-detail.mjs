// img2.jpg: camera in the east court, looking from the rear towards +Z.
// The two close pairs and the single sash beside them are observed openings;
// dimensions and the portions beyond the photograph remain visual estimates.
export const COURTYARD_PHOTO_VIEW=Object.freeze({position:[56,1.8,-25],target:[58,8.5,3],fov:64});
export function courtyardPhotoProfile(x,z){
  return (x===31&&z===-10)||(Math.abs(x-89.2)<.01&&z===-14)||
    (x===69.2&&z===5)||(Math.abs(x-74.2)<.01&&z===3);
}

export function addCourtyardPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,frame,glass}){
  const courtOpeningsStart=model.userData.eastPhotoOpenings.length;
  // Looking towards +Z reverses screen left/right: the single window is at
  // the west end, then two pairs, then the projecting bay towards the east.
  for(const y of [2,6.5,11])for(const x of [46.55,49.5,51,54,55.5])
    sash('courtyard-paired-wall',x,y,4.45,Math.PI,1.04,2.45);
  for(const y of [4.06,8.8])box(white,50.8,y,4.38,11.5,.18,.22);
  // White ground storey continues around the inset corner into the rear arm.
  box(white,41.05,2,6.86,8.1,4,.26);
  box(white,41.05,4.06,6.77,8.2,.18,.22);
  sash('courtyard-inset',41.4,10.15,6.68,Math.PI,1.16,2.15);
  sash('courtyard-inset',38.15,6.3,6.68,Math.PI,1.12,2.35);

  // An octagonal bay projects into this court. Its forward corner separates
  // the two broad, windowed facets; each outer return has a narrower sash.
  const bayX=60.8,bayZ=2.5,r=4.25,apothem=r*Math.cos(Math.PI/8);
  const bay=mesh(worldUV(new THREE.CylinderGeometry(r,r,10.3,8),1.7),brick,bayX,9.15,bayZ,true);
  bay.name='East courtyard polygonal bay';
  mesh(new THREE.CylinderGeometry(r,r,4,8),white,bayX,2,bayZ,true);
  for(const y of [4.06,8.8,14.3])mesh(new THREE.CylinderGeometry(r+.08,r+.08,.18,8),white,bayX,y,bayZ);
  mesh(new THREE.ConeGeometry(r+.22,1.2,8),roof,bayX,14.95,bayZ,true);
  for(const offset of [-3,-1,1,3]){
    const a=Math.PI+offset*Math.PI/8;
    for(const y of [2,6.5,11])sash('courtyard-bay',bayX+Math.sin(a)*(apothem+.055),y,bayZ+Math.cos(a)*(apothem+.055),a,Math.abs(offset)===1?1.25:.72,2.45);
  }

  // Stair tower to the left of the bay. The top and middle landings reach
  // separate blue doors, with windows at the ground level below the flights.
  for(const y of [4.06,8.25])box(white,69.2,y,.37,6.12,.18,.22);
  for(const [x,y] of [[67.25,2],[69.1,2],[71,2],[67.25,6.3],[67.25,10.5]])
    sash('courtyard-stair-block',x,y,.43,Math.PI,1.02,2.25);
  door(70.3,.4,Math.PI,4.25);door(68.7,.4,Math.PI,8.5);
  for(const y of [2,6.3,10.5])sash('courtyard-stair-return',72.25,y,3.1,Math.PI/2,.9,2.2);
  // Zigzag steel fire escape, with open risers, railings, stringers and legs.
  const stair=new THREE.Group();stair.name='East courtyard two-flight fire escape';model.add(stair);
  function stairRod(a,b,r=.027){rod(a,b,r);const m=model.children[model.children.length-1];stair.attach(m);}
  function landing(x,y){
    box(iron,x,y,-.6,2.5,.13,2.1);
    for(let i=0;i<9;i++)box(iron,x-1.2+i*.3,y+.56,-1.64,.035,1.05,.035);
    stairRod([x-1.2,y+1.08,-1.64],[x+1.2,y+1.08,-1.64]);
  }
  landing(69,8.5);landing(73,4.25);
  function flight(x0,y0,x1,y1,z){
    const count=18,run=(x1-x0)/count,rise=(y1-y0)/count;
    for(let i=0;i<count;i++){
      const x=x0+(i+.5)*run,y=y0+(i+.5)*rise;
      box(iron,x,y,z,Math.abs(run)+.04,.07,1.15);
      for(const side of [-1,1])box(iron,x,y+.55,z+side*.59,.03,1.1,.03);
    }
    for(const side of [-1,1]){
      stairRod([x0,y0+1.08,z+side*.59],[x1,y1+1.08,z+side*.59]);
      stairRod([x0,y0-.1,z+side*.54],[x1,y1-.1,z+side*.54],.065);
    }
  }
  flight(69.9,8.5,74,4.25,-1.5);flight(73,4.25,68.9,.3,-2.8);
  box(iron,73.2,4.25,-1.8,2.6,.13,3.1);
  for(const [x,z,h] of [[68,-1.6,8.5],[70,-1.6,8.5],[74,-2.9,4.25]])stairRod([x,.2,z],[x,h,z],.07);

  // Left two-storey range and right three-storey return retain their footprints
  // but now have occupied white ground floors and finer vertical sash windows.
  for(const y of [2,6.25]){
    for(const z of [-35,-31.4,-27.8,-24.2,-20.6,-17,-13.4,-9.8,-6.2,-2.6,1,4.6,8]){
      sash('outer-east-wing',94.25,y,z,Math.PI/2,1.06,2.35);
    }
    for(const x of [86,89.2,92.4])sash('outer-east-wing-end',x,y,-38.05,Math.PI,1.06,2.35);
  }
  for(const y of [2,6.5,11]){
    for(const z of [-22.5,-18.8,-15.1,-11.4,-7.7,-4,-.3,3]){
      sash('courtyard-west-wing',37.05,y,z,Math.PI/2,1.02,2.35);
      // The inward face has its own img14 window schedule and projections.
    }
    for(const x of [27.5,31,34.5])sash('west-wing-end',x,y,5.05,0,1.02,2.35);
  }

  // Low brick enclosure with a sloping glazed top in the inset right corner.
  mesh(worldUV(new THREE.BoxGeometry(5.1,3.9,2),1.7),brick,41.3,1.95,5.7,true).name='Courtyard glazed lean-to';
  const leanGlass=material(0xa2aea9,{roughness:.55,metalness:.1});
  const glazing=mesh(new THREE.BoxGeometry(5.15,.09,2.8),leanGlass,41.3,4.65,5.25);
  glazing.rotation.x=-.72;
  for(const x of [38.78,40.45,42.15,43.82]){
    const bar=mesh(new THREE.BoxGeometry(.075,.12,2.9),frame,x,4.71,5.25);bar.rotation.x=-.72;
  }
  for(const offset of [-1.4,0,1.4])box(frame,41.3,4.71+offset*Math.sin(.72),5.25+offset*Math.cos(.72),5.25,.09,.09);
  // Gutters, vertical soil pipes and branching waste pipes are distinctive in
  // the photograph, particularly between the paired window groups.
  for(const [x,z,h] of [[45.4,4.1,13.8],[48.1,4.1,13.8],[52.7,4.1,13.8],[65.5,4.1,12.7],[37.23,-3,13.8]])
    box(iron,x,h/2,z,.09,h,.09);
  for(const x of [48.1,52.7])for(const y of [4.3,9.1])rod([x,y,4.09],[x+1.65,y,4.09],.04);
  rod([45.4,3.5,4.1],[43.8,3.5,4.1],.045);
  for(const x of [47.5,54.5,62])box(stone,x,7.75,4.19,.36,.28,.12);
  // Small yellow grit bin and low planting beds, keeping the court open.
  const yellow=material(0xbda240),soil=material(0x635343),leaf=material(0x536143),rust=material(0x795448);
  box(yellow,47.9,.54,3.3,1.35,.85,.85);box(yellow,47.9,.99,3.3,1.42,.16,.9);
  box(soil,61.2,.23,-2.6,8.5,.25,1.3);
  for(let i=0;i<15;i++){
    const shrub=mesh(new THREE.IcosahedronGeometry(.44,1),i%3?leaf:rust,57.5+i*.52,.56,-2.6+Math.sin(i*2)*.23);
    shrub.scale.set(1,.65,1);
  }
  for(let i=0;i<14;i++){
    const shrub=mesh(new THREE.IcosahedronGeometry(.65,1),leaf,39.1+Math.sin(i*2)*.35,.8+(i%3)*.18,2.8-i*.6,true);
    shrub.scale.set(1,1.2,1);
  }
  const paint=material(0x969a8d);
  for(let z=-22;z<-3;z+=3.8)box(paint,41,.27,z,5.6,.015,.06);
  model.userData.courtyardPhotoOpenings=model.userData.eastPhotoOpenings.slice(courtOpeningsStart);
}
