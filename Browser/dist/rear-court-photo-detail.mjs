// img8.jpg: the same east courtyard, now looking north towards the rear estate.
// The rear return's five upper sashes and door are distinct from its larger
// ground-floor glazing. Coordinates outside the photograph remain estimates.
export const REAR_COURT_PHOTO_VIEW=Object.freeze({position:[47,1.8,-12],target:[80,-.2,-30],fov:64});
export function rearCourtPhotoProfile(x,z){return Math.abs(x-76.2)<.01&&[-38,-44].includes(z);}

export function addRearCourtPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,sash,door,rod,iron,stone,frame,glass}){
  const start=model.userData.eastPhotoOpenings.length;
  const blue=material(0x182c4c),lintel=material(0xc9c9bb),soil=material(0x625e4a),leaf=material(0x5e6d42),rust=material(0x74594a);
  function window(face,x,y,z,rotation=0,w=1.12,h=2.35){
    sash(face,x,y,z,rotation,w,h);
    // The photograph has splayed pale stone heads above the sash openings.
    const g=new THREE.BufferGeometry(),a=w/2+.11,b=w/2+.33;
    g.setAttribute('position',new THREE.Float32BufferAttribute([-a,0,0,a,0,0,b,.32,0,-a,0,0,b,.32,0,-b,.32,0],3));g.computeVertexNormals();
    const head=mesh(g,lintel,x+Math.sin(rotation)*.12,y+h/2+.08,z+Math.cos(rotation)*.12);head.rotation.y=rotation;
  }
  // Long rear return, seen on the left. The far-left pier stays exposed brick.
  mesh(worldUV(new THREE.BoxGeometry(6,4,.22),1.7),brick,61.2,2,-32.84,true);
  box(brick,60.7,9.48,-32.87,5,.55,.25);
  for(const x of [62.8,70.4,73.7,77,80.2])window('rear-return-upper',x,6.5,-32.94,0,1.22,x===62.8?1.9:2.35);
  door(66.4,-32.92,0,4.25);
  window('rear-return-ground',62.8,2.8,-32.67,0,1.4,1.65);
  for(const [x,w] of [[66.4,2.4],[70.4,2.75],[77.4,2.65],[80.5,2.25]])window('rear-return-ground',x,2,-32.92,0,w,2.5);
  for(const x of [67.25,70.4,73.7,77,80.2]){
    // The back elevation is not documented here; retain regular sash spacing.
    for(const y of [2,6.5])window('rear-return-back',x,y,-46.05,Math.PI,1.1,2.3);
  }
  for(const y of [2,6.5])for(const z of [-35.3,-39.2,-41.2])window('rear-return-west',58.15,y,z,-Math.PI/2,1.1,2.3);
  box(white,74.1,4.95,-32.82,20.2,.13,.2);
  for(const x of [64.6,68.6,81.6])box(iron,x,4.55,-32.65,.075,9.1,.075);

  function porch(x,z,rotation){
    door(x,z,rotation);
    const p=(u,y,v)=>[x+Math.cos(rotation)*u+Math.sin(rotation)*v,y,z-Math.sin(rotation)*u+Math.cos(rotation)*v];
    const verts=[[-1.65,3.45,0],[1.65,3.45,0],[0,4.8,0],[-1.65,3.45,1.8],[1.65,3.45,1.8],[0,4.8,1.8]];
    const positions=[];
    for(const face of [[0,3,5],[0,5,2],[2,5,4],[2,4,1],[3,4,5]])for(const i of face)positions.push(...p(...verts[i]));
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();
    const cover=mesh(g,blue);cover.material.side=THREE.DoubleSide;cover.name='Rear court blue gabled porch';
    for(const u of [-1.42,1.42]){
      rod(p(u,3.48,1.6),p(u,2.4,.1),.065,blue);
      rod(p(u,3.48,1.6),p(u,2.5,1.6),.055,blue);
    }
  }
  porch(73.9,-32.72,0);

  // A return stair reaches the upper door: two short flights and a half landing.
  const stairGroup=new THREE.Group();stairGroup.name='Rear return external stair';model.add(stairGroup);
  function stairRod(a,b,r=.027){rod(a,b,r);stairGroup.attach(model.children[model.children.length-1]);}
  box(iron,66.4,4.25,-31.85,2,.13,1.8);box(iron,63.7,2.2,-30.9,1.5,.13,2.2);
  function flight(x0,y0,x1,y1,z){
    for(let i=0;i<10;i++){
      const t=(i+.5)/10,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t;
      box(iron,x,y,z,Math.abs(x1-x0)/10+.02,.075,1.05);
      for(const side of [-1,1])box(iron,x,y+.5,z+side*.54,.03,1,.03);
    }
    for(const side of [-1,1]){
      stairRod([x0,y0+1,z+side*.54],[x1,y1+1,z+side*.54]);
      stairRod([x0,y0-.08,z+side*.5],[x1,y1-.08,z+side*.5],.06);
    }
  }
  flight(66.3,4.25,63.6,2.2,-31.75);flight(63.6,2.2,66.7,.25,-30.1);
  for(const x of [65.5,67.3])stairRod([x,.2,-31],[x,5.25,-31],.055);
  stairRod([65.5,5.25,-31],[67.3,5.25,-31]);

  // East wing: the shallow chimney projection interrupts the otherwise flat
  // elevation; the blue porch replaces a ground sash at z=-4.8.
  const wingZ=[-28,-25.3,-22.6,-18.9,-12.4,-8.6,-4.8,-1,2.8,6.6];
  mesh(worldUV(new THREE.BoxGeometry(.75,5.3,5.7),1.7),brick,83.85,6.65,-18.9,true).name='Rear court chimney projection';
  box(white,83.85,2,-18.9,.75,4,5.7);
  for(const y of [4.04,4.95,9.26])box(y===9.26?iron:white,83.78,y,-18.9,.9,.14,5.84);
  for(const z of wingZ){
    const x=z===-18.9?83.42:84.15;
    window('rear-court-wing-upper',x,6.5,z,-Math.PI/2,1.12,2.35);
    if(z!==-4.8)window('rear-court-wing-ground',x,2,z,-Math.PI/2,1.1,2.35);
  }
  box(white,84.05,4.95,-14,.22,.13,47.7);
  porch(84.08,-4.8,-Math.PI/2);
  // Two large stacks with brick caps and four chimney pots apiece.
  for(const z of [-20.7,-16.9]){
    mesh(worldUV(new THREE.BoxGeometry(1.45,3.5,1.3),1.7),brick,85.1,11.15,z,true).name='Rear court tall chimney';
    for(const y of [12.45,12.78])box(brick,85.1,y,z,1.65,.2,1.5);
    for(const dx of [-.4,.4])for(const dz of [-.34,.34])mesh(new THREE.CylinderGeometry(.12,.15,.55,8),brick,85.1+dx,13.12,z+dz,true);
  }
  for(const z of [-31.9,-22.1,-15.8,-1.7,9])box(iron,83.98,4.55,z,.08,9.1,.08);
  box(iron,84.03,9.3,-14,.18,.16,47.8);
  // White mono-pitch stair enclosure in the corner, with a narrow glazed strip.
  const w=2.2,d=2.6,low=7.4,high=9.1;
  const v=[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2],[-w/2,low,-d/2],[w/2,high,-d/2],[w/2,high,d/2],[-w/2,low,d/2]],pos=[];
  for(const face of [[0,4,5],[0,5,1],[1,5,6],[1,6,2],[2,6,7],[2,7,3],[3,7,4],[3,4,0],[4,7,6],[4,6,5]])for(const i of face)pos.push(...v[i]);
  const shell=new THREE.BufferGeometry();shell.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));shell.computeVertexNormals();
  mesh(shell,white,83.1,0,-31.7,true).name='Rear court white stair enclosure';
  const cap=mesh(new THREE.BoxGeometry(Math.hypot(w,high-low)+.3,.14,d+.3),roof,83.1,8.33,-31.7,true);cap.rotation.z=Math.atan2(high-low,w);
  for(const y of [1.55,4.25,6.95])window('rear-corner-glazing',84.02,y,-29.8,-Math.PI/2,.65,2.4);
  // Wall-mounted ventilation unit next to the stair enclosure.
  box(stone,83.75,3.35,-25.8,.65,1.5,1.35);
  for(let i=0;i<9;i++)box(frame,83.39,2.72+i*.15,-25.8,.035,.045,1.15);

  // Long low planting island and faded bay markings seen in the foreground.
  box(soil,74,.23,-20,18.5,.24,1.4);
  for(let i=0;i<34;i++){
    const shrub=mesh(new THREE.IcosahedronGeometry(.4+(i%3)*.06,1),i%4?rust:leaf,65.1+i*.54,.48,-20+Math.sin(i*2.3)*.33);
    shrub.scale.set(1,.6,1);
  }
  for(let i=0;i<13;i++){
    const shrub=mesh(new THREE.IcosahedronGeometry(.45,1),leaf,69+Math.sin(i*2)*.7,.8+(i%5)*.35,-20+Math.cos(i*1.7)*.5,true);
    shrub.scale.set(1,1.2,1);
  }
  const paint=material(0xaaa995);
  for(let x=59;x<83;x+=3.3)box(paint,x,.27,-15.4,.07,.02,7.2);
  model.userData.rearCourtPhotoOpenings=model.userData.eastPhotoOpenings.slice(start);
}
