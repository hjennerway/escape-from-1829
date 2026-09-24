// redesmere.jpg, looking west from the red dot on redesmere-loc.png.
// +X is out towards the lawn; +Z is left in the photograph. Unmeasured
// dimensions and foliage-obscured openings are visual estimates.
export const REDESMERE_PHOTO_VIEW=Object.freeze({position:[141,1.8,-10],target:[94.5,5.1,-12],fov:54});
export function redesmerePhotoProfile(x,z){return Math.abs(x-89.2)<.01&&z===-14;}

export function addRedesmerePhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,hipRoof,sash,door,rod,iron}){
  const start=model.userData.eastPhotoOpenings.length;
  const band=material(0xd1cfbb),sage=material(0x9faea4),slate=material(0x555e61),soil=material(0x665b46),leaves=[material(0x60754c),material(0x516a43)];
  const wallX=94.42,frontX=wallX+.19;
  // Replace the outer white ground storey with continuous brick. The inner
  // courtyard's white walls, detailed openings and fire escape stay intact.
  mesh(worldUV(new THREE.BoxGeometry(.36,9.3,48),1.7),brick,wallX,4.65,-14,true).name='Redesmere outer brick elevation';
  box(band,frontX,4.36,-14,.2,.22,48);
  box(iron,frontX,9.25,-14,.2,.16,48);
  box(brick,frontX,8.95,-14,.18,.2,48);
  function window(face,x,y,z,rotation=Math.PI/2,w=1.3,h=2.65){
    sash(face,x,y,z,rotation,w,h);
    // Splayed stone heads are wider at the top, as in the photograph.
    const a=w/2+.08,b=w/2+.28,g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute([-a,0,0,a,0,0,b,.32,0,-a,0,0,b,.32,0,-b,.32,0],3));g.computeVertexNormals();
    const head=mesh(g,band,x+Math.sin(rotation)*.15,y+h/2+.07,z+Math.cos(rotation)*.15);head.rotation.y=rotation;
  }
  for(const z of [4.8,-5,-18.7,-21.5,-31.2,-35.5])for(const y of [2,6.7])window('redesmere-main',frontX+.03,y,z);
  // Continue the brick finish around the stepped rear corner at the right.
  for(const [x,z,d] of [[94.42,-40.5,5],[92.42,-44.5,3]]){
    mesh(worldUV(new THREE.BoxGeometry(.36,9.3,d),1.7),brick,x,4.65,z,true);
    box(band,x+.19,4.36,z,.2,.22,d);
    for(const y of [2,6.7])window('redesmere-rear-corner',x+.22,y,z);
  }

  // Two full-height canted bays: an extruded five-sided footprint gives each
  // bay a broad front and two angled cheeks, all with real sash windows.
  function bay(z){
    const points=[[94.3,z-3.8],[95.5,z-3.8],[97.1,z-2.15],[97.1,z+2.15],[95.5,z+3.8],[94.3,z+3.8]];
    const shape=new THREE.Shape();points.forEach(([x,pz],i)=>i?shape.lineTo(x,-pz):shape.moveTo(x,-pz));shape.closePath();
    const g=new THREE.ExtrudeGeometry(shape,{depth:9.3,bevelEnabled:false});g.rotateX(-Math.PI/2);
    mesh(worldUV(g,1.7),brick,0,0,0,true).name='Redesmere canted bay';
    // Each trim course follows the three outward facets and both returns.
    for(let i=0;i<points.length-1;i++){
      const a=points[i],b=points[i+1],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),rotation=Math.atan2(-dz,dx)+Math.PI;
      for(const [y,h,mat] of [[4.36,.22,band],[9.08,.12,brick],[9.3,.17,iron]])box(mat,(a[0]+b[0])/2,y,(a[1]+b[1])/2,length+.1,h,.16,rotation);
      if(i>=1&&i<=3)for(const y of [2,6.7])window('redesmere-bay',(a[0]+b[0])/2+Math.sin(rotation)*.06,y,(a[1]+b[1])/2+Math.cos(rotation)*.06,rotation,i===2?1.55:1.15);
    }
    // Slate roof pitches from a short ridge back into the main roof slope.
    const vertices=points.map(([x,pz])=>[x,9.4,pz]);vertices.push([94.45,10.75,z-1.6],[94.45,10.75,z+1.6]);
    const positions=[],uv=[];
    for(const face of [[0,1,6],[1,2,6],[2,3,7],[2,7,6],[3,4,7],[4,5,7],[5,0,6],[5,6,7]])for(const i of [...face].reverse()){positions.push(...vertices[i]);uv.push(vertices[i][0]/3,vertices[i][2]/3);}
    const cap=new THREE.BufferGeometry();cap.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));cap.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));cap.computeVertexNormals();
    const cover=mesh(cap,roof,0,0,0,true);cover.name='Redesmere bay slate roof';
    for(const pz of [z-3.85,z+3.85])box(iron,95.55,4.5,pz,.085,9,.085);
  }
  bay(.1);bay(-26.1);

  // The pale green centre projects between the brick bays. Its hipped roof
  // sits below the main ridge, and the doorway has a small slate gable.
  const centreZ=-11.85,centreFront=97.05;
  mesh(new THREE.BoxGeometry(3,8.8,11.2),sage,95.55,4.4,centreZ,true).name='Redesmere central entrance block';
  box(band,95.55,4.36,centreZ,3.15,.38,11.35);
  hipRoof(95.55,centreZ,3,11.2,8.86,1.3).name='Redesmere entrance hipped roof';
  for(const z of [-7.7,-16]){
    sash('redesmere-entrance',centreFront+.06,6.7,z,Math.PI/2,1.25,2.1);
    sash('redesmere-entrance',centreFront+.06,1.9,z,Math.PI/2,1.3,2.4);
  }
  sash('redesmere-entrance',centreFront+.06,7.15,-10.5,Math.PI/2,1.05,1.12);
  sash('redesmere-entrance',centreFront+.06,7.15,-12.7,Math.PI/2,1.5,.9);
  sash('redesmere-entrance-return',95.9,6.7,-17.51,Math.PI,1.05,2.1);
  door(centreFront+.08,-12,Math.PI/2,.35);
  for(let i=0;i<3;i++)box(band,centreFront+.45+(2-i)*.32,.1+i*.1,-12,1.15-(2-i)*.3,.2+i*.2,2.3);
  const porchVertices=[[97,3.75,-13.65],[98.6,3.75,-13.65],[97,4.85,-12],[98.6,4.85,-12],[97,3.75,-10.35],[98.6,3.75,-10.35]];
  const porchPositions=[];
  for(const face of [[0,1,3],[0,3,2],[2,3,5],[2,5,4]])for(const i of [...face].reverse())porchPositions.push(...porchVertices[i]);
  const porchGeo=new THREE.BufferGeometry();porchGeo.setAttribute('position',new THREE.Float32BufferAttribute(porchPositions,3));porchGeo.computeVertexNormals();
  mesh(porchGeo,slate,0,0,0,true).name='Redesmere gabled door canopy';
  const gable=new THREE.BufferGeometry();gable.setAttribute('position',new THREE.Float32BufferAttribute([98.62,3.75,-13.65,98.62,4.85,-12,98.62,3.75,-10.35],3));gable.computeVertexNormals();
  mesh(gable,slate);
  for(const z of [-13.65,-10.35])rod([97.1,2.8,z],[98.55,3.74,z],.055,iron);
  rod([98.63,3.75,-13.7],[98.63,4.89,-12],.06,band);rod([98.63,4.89,-12],[98.63,3.75,-10.3],.06,band);

  // The side openings belong to the end range built in redesmere-passage.mjs.
  // Its front elevation is windowless; this east face follows redesmere.jpg.
  for(const z of [12.7,16.9])window('redesmere-low-room',99.86,2.05,z,Math.PI/2,1.25,2.55);
  door(99.89,14.8,Math.PI/2);
  for(const z of [-37.8,-21.9,-5.55,9.85])box(iron,frontX+.18,4.55,z,.08,9.1,.08);

  // Brick stacks and restrained ridge ventilators, omitting modern aerials.
  for(const [z,x,w,h] of [[-3.9,90.2,2.8,2.25],[-20.5,90,1.2,2.6],[-23.8,92,1,3.5],[5.5,89.2,1.4,1.7]]){
    const base=11.05;
    mesh(worldUV(new THREE.BoxGeometry(.95,h+.45,w),1.7),brick,x,base+h/2-.225,z,true).name='Redesmere chimney stack';
    for(const offset of [0,.23])box(brick,x,base+h+offset,z,1.13,.14,w+.18);
    const pots=Math.max(2,Math.round(w/.45));
    for(let i=0;i<pots;i++)mesh(new THREE.CylinderGeometry(.105,.14,.48,8),brick,x,base+h+.52,z-w*.38+i*w*.76/(pots-1),true);
  }
  for(const z of [-8,-16]){
    mesh(worldUV(new THREE.BoxGeometry(1.2,.55,2),1.7),slate,89.2,12.35,z,true).name='Redesmere roof ventilator base';
    hipRoof(89.2,z,1.3,2.1,12.65,.35);
  }

  // Period garden border and low iron rail, with an opening at the door.
  // The adjacent drive remains wide enough to walk along the elevation.
  for(const [z,d] of [[2.4,24],[-26.5,23]]){
    box(soil,101.2,.27,z,1,.24,d);
    for(let pz=z-d/2;pz<=z+d/2;pz+=.55){
      box(iron,101.2,.92,pz,.04,1.45,.04);
    }
    for(const y of [.5,1.45])box(iron,101.2,y,z,.065,.065,d);
    for(let pz=z-d/2+.6;pz<z+d/2;pz+=1.8){
      const shrub=mesh(new THREE.IcosahedronGeometry(.43,1),leaves[pz%3>1?0:1],101,.5,pz);
      shrub.scale.set(.8,.85,1.3);
    }
  }
  model.userData.redesmerePhotoOpenings=model.userData.eastPhotoOpenings.slice(start);
}
