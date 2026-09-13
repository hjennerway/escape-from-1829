// img3.jpg and img3-loc.png: inner eastern court, viewed from the rear.
// Architectural proportions are visual estimates; planting and plain ironwork
// adapt the present-day photograph to the game's circa-1900 grounds.
export const INNER_COURT_PHOTO_VIEW=Object.freeze({position:[10,1.8,-44],target:[23,6,-26],fov:66});
// Heights include the roof: each end ridge is two-thirds of its adjoining
// wing ridge. Both ends use a visibly pitched slate roof with a 2.2-unit rise.
export const REAR_END_ROOF_RISE=2.2;
export const REAR_END_HEIGHTS=Object.freeze({west:(11.3+.23+3.6)*2/3,east:(14.3+.23+3.6)*2/3});
export function innerCourtPhotoProfile(x,z){return x===31&&z===-30;}

export function addInnerCourtPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone}){
  const start=model.userData.eastPhotoOpenings.length;
  const plinth=material(0xddd0ae,{map:brick.map}),lawn=material(0x638046),bark=material(0xc0bcb0);
  const leaves=[material(0x496b3a),material(0x567943),material(0x65854a)];
  // The east rear end is lower than the main wing, under a hipped slate roof.
  const eaves=REAR_END_HEIGHTS.east-REAR_END_ROOF_RISE;
  mesh(worldUV(new THREE.BoxGeometry(13,eaves-2,11),1.7),brick,31,(eaves+2)/2,-30,true).name='Inner court projecting brick block';
  mesh(worldUV(new THREE.BoxGeometry(13,2,11),1.7),plinth,31,1,-30,true);
  box(white,31,eaves-.1,-30,13.25,.2,11.25);
  for(const x of [24.6,28.85,33.15,37.4])box(white,x,1,-35.57,.16,2,.12);
  box(stone,31,2.04,-35.6,13.15,.16,.26);
  box(stone,24.42,2.04,-30,.26,.16,11);
  // North elevation: small basement lights, tall middle sashes and a broad
  // central upper sash between narrower openings.
  for(const x of [28.8,33.2])sash('inner-block-basement',x,1.1,-35.57,Math.PI,1.2,1.2);
  for(const x of [27,31,35])sash('inner-block-north',x,4.15,-35.57,Math.PI,1.22,2.2);
  for(const x of [27,31,35])sash('inner-block-north',x,7.9,-35.57,Math.PI,x===31?2.05:1.12,2.2);
  box(iron,31,5.92,-35.68,13.1,.13,.38);
  box(white,27.5,5.72,-35.65,6,.18,.3);
  for(const x of [28.8,36.8])box(iron,x,2.85,-35.8,.09,5.7,.09);
  for(const y of [1.1,4.15,7.9])sash('inner-block-west',24.43,y,-33.3,-Math.PI/2,1.1,y===1.1?1.4:2.2);
  door(24.42,-27.1,-Math.PI/2,2.4);door(24.42,-30.4,-Math.PI/2,5.9);
  for(const y of [1.1,4.15,7.9])for(const z of [-33,-29,-25.8])sash('inner-block-east',37.56,y,z,Math.PI/2,1.1,y===1.1?1.4:2.2);

  const stairs=new THREE.Group();stairs.name='Inner court iron stairs';model.add(stairs);
  function rail(a,b,r=.03){rod(a,b,r);stairs.attach(model.children[model.children.length-1]);}
  function flight(x,z0,y0,z1,y1,width=1.45){
    const count=18;
    for(let i=0;i<count;i++){
      const t=(i+.5)/count,z=z0+(z1-z0)*t,y=y0+(y1-y0)*t;
      box(iron,x,y,z,width,.075,Math.abs(z1-z0)/count+.03);
      for(const side of [-1,1])box(iron,x+side*width/2,y+.53,z,.035,1.06,.035);
    }
    for(const side of [-1,1]){
      const px=x+side*width/2;
      rail([px,y0+1.06,z0],[px,y1+1.06,z1]);
      rail([px,y0-.1,z0],[px,y1-.1,z1],.065);
    }
  }
  // Return flights run parallel to the west wall, with landings at both doors.
  box(iron,23.45,5.9,-30.4,2.05,.14,2);
  box(iron,22.1,2.4,-25.9,4.6,.14,2.5);
  flight(22,-29.5,5.9,-25.9,2.4);
  flight(20.4,-25.9,2.4,-31.4,.3);
  for(const [x,z,h] of [[22.75,-31.3,5.9],[23.9,-29.5,5.9],[19.9,-25,2.4]])rail([x,.2,z],[x,h,z],.075);
  for(let i=0;i<7;i++)box(iron,22.4,6.43,-31.3+i*.3,.035,1.06,.035);
  rail([22.4,6.96,-31.3],[22.4,6.96,-29.5]);
  // Foreground stair beside the central arm, as in the right of the photograph.
  door(5.08,-22.4,Math.PI/2,4.25);
  box(iron,6.2,4.25,-22.4,2.2,.14,2.1);
  flight(6.2,-33,.3,-23.4,4.25,1.8);
  for(const x of [5.3,7.1])rail([x,.2,-23.2],[x,5.3,-23.2],.075);

  // Raised grass, rough stone edging and low white gate walls. The gravel
  // route continues around the garden and through to the rear road.
  box(plinth,14,.43,-29,8.5,.5,9);
  box(lawn,14,.72,-29,8.5,.1,9);
  for(let row=0;row<2;row++)for(let i=0;i<13;i++){
    const rock=mesh(new THREE.DodecahedronGeometry(.42,0),stone,10+i*.64+(row%2)*.15,.3+row*.3,-33.65,true);
    rock.scale.set(1,.55,.55);rock.rotation.y=i*1.7;
  }
  box(white,17.2,.62,-33.7,2.4,.95,.36);
  box(stone,17.2,1.13,-33.7,2.6,.14,.48);
  for(const x of [16,18.4]){
    box(white,x,.72,-33.7,.55,1.25,.55);
    mesh(new THREE.ConeGeometry(.42,.25,4),stone,x,1.46,-33.7).rotation.y=Math.PI/4;
  }
  // A birch at the left edge frames the facade without hiding its windows.
  const trunk=mesh(new THREE.CylinderGeometry(.17,.3,7.7,8),bark,26,4.55,-43,true);
  trunk.rotation.z=-.05;
  for(let i=0;i<22;i++){
    const a=i*2.4,y=5.5+(i%6)*.62;
    const crown=mesh(new THREE.IcosahedronGeometry(1,1),leaves[i%3],25.8+Math.sin(a)*1.55,y,-43+Math.cos(a)*1.45,true);
    crown.scale.set(.85,1.45,.85);
  }
  for(let i=0;i<10;i++){
    const shrub=mesh(new THREE.IcosahedronGeometry(.52,1),leaves[i%3],18.2,.95,-32+i*.68,true);
    shrub.scale.set(1,.85,1);
  }
  model.userData.innerCourtPhotoOpenings=model.userData.eastPhotoOpenings.slice(start);
}
