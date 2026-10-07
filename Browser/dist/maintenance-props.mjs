// Reusable metalwork at actual tool scale; all resources belong to the overlay.
export function createMaintenanceProps(THREE,resources){
 const material=(color,roughness,metalness)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness});resources.add(m);return m;};
 const iron=material(0x384244,.57,.78),steel=material(0x9caaa8,.3,.88),rust=material(0x725038,.86,.25),brass=material(0xa88545,.42,.72),paint=material(0x606953,.64,.5);
 const mesh=(g,m,parent,p=[0,0,0],name='')=>{resources.add(g);const o=new THREE.Mesh(g,m);o.name=name;o.position.set(...p);o.castShadow=o.receiveShadow=true;o.userData.noWalkingCollision=true;parent.add(o);return o;};
 function tube(points,r,parent,m=iron,name='',closed=false){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),closed,'centripetal');return mesh(new THREE.TubeGeometry(curve,Math.max(12,points.length*5),r,8,closed),m,parent,[0,0,0],name);}
 function cylinder(r0,r1,h,parent,m,p,name=''){return mesh(new THREE.CylinderGeometry(r0,r1,h,16),m,parent,p,name);}
 function crowbar(){
  const g=new THREE.Group();g.name='Takeable crowbar';
  tube([[0,.036,-.58],[0,.036,.18],[0,.042,.35],[0,.075,.46],[0,.12,.49],[0,.17,.46],[0,.175,.39]],.027,g,iron,'Forged steel shaft and curved crook');
  const shape=new THREE.Shape();shape.moveTo(-.028,-.06);shape.lineTo(-.056,.015);shape.lineTo(-.056,.09);shape.lineTo(-.017,.09);shape.lineTo(-.013,.045);shape.lineTo(.013,.045);shape.lineTo(.017,.09);shape.lineTo(.056,.09);shape.lineTo(.056,.015);shape.lineTo(.028,-.06);shape.closePath();
  const claw=mesh(new THREE.ExtrudeGeometry(shape,{depth:.014,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:1}),steel,g,[0,.181,.39],'Split nail-pulling claw');claw.rotation.x=Math.PI/2;
  const tip=mesh(new THREE.BoxGeometry(.065,.012,.105),steel,g,[0,.034,-.6],'Flattened polished chisel end');tip.rotation.x=-.11;
  tube([[0,.036,-.48],[0,.036,-.37]],.028,g,rust,'Worn oxide on the shaft');
  return g;
 }
 function oilCan(){
  const g=new THREE.Group();g.name='Takeable oil can';
  const profile=[[0,0],[.12,0],[.15,.025],[.16,.08],[.151,.18],[.125,.245],[.05,.27],[.044,.3],[0,.3]].map(p=>new THREE.Vector2(...p));
  mesh(new THREE.LatheGeometry(profile,24),paint,g,[0,0,0],'Pressed steel oil reservoir');
  for(const y of [.025,.27]){const ring=mesh(new THREE.TorusGeometry(y<.1?.145:.045,.007,6,24),brass,g,[0,y,0],'Rolled soldered seam');ring.rotation.x=Math.PI/2;}
  cylinder(.046,.046,.032,g,brass,[0,.302,0],'Threaded filler cap');
  cylinder(.014,.018,.064,g,steel,[0,.345,0],'Thumb pump');cylinder(.047,.047,.014,g,brass,[0,.384,0],'Pump button');
  tube([[-.1,.2,0],[-.18,.23,0],[-.32,.35,0],[-.48,.43,0]],.014,g,brass,'Curved brass delivery spout');
  const nozzle=cylinder(.004,.015,.09,g,steel,[-.51,.445,0],'Tapered spout tip');nozzle.rotation.z=Math.PI/2-.35;
  tube([[.11,.22,0],[.25,.25,0],[.3,.2,0],[.29,.09,0],[.23,.06,0],[.14,.08,0]],.016,g,brass,'Open loop handle');
  return g;
 }
 function wicket(pivot,boards,width){
  const box=(size,p,m,name)=>mesh(new THREE.BoxGeometry(...size),m,pivot,p,name);
  for(const x of [.05,width-.05])box([.1,3.25,.13],[x,1.73,0],iron,'Wicket side stile');
  box([width,.12,.16],[width/2,3.28,0],iron,'Wicket top frame');box([width,.14,.15],[width/2,.16,0],iron,'Wicket bottom frame');
  for(const y of [.38,1.72,2.95]){
   cylinder(.075,.075,.18,pivot,steel,[0,y,0],'Hinge knuckle');box([.25,.07,.025],[.12,y,.1],iron,'Hinge strap');
   for(const x of [.1,.21]){const rivet=mesh(new THREE.SphereGeometry(.018,8,6),rust,pivot,[x,y,.124],'Hinge strap rivet');rivet.scale.z=.4;}
  }
  box([.31,.27,.035],[width-.2,1.4,.1],iron,'Latch backplate');box([.36,.043,.052],[width-.13,1.43,.14],steel,'Sliding latch bolt');
  const handle=mesh(new THREE.TorusGeometry(.065,.012,6,16),iron,pivot,[width-.25,1.28,.155],'Ring pull');handle.rotation.y=.2;
  // A few rough edges, irregular grain and real fasteners keep boards legible.
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=64;const c=canvas.getContext('2d');c.fillStyle='#826749';c.fillRect(0,0,512,64);
  for(let i=0;i<28;i++){c.strokeStyle=i%3?'#73593e':'#a08560';c.lineWidth=1;c.beginPath();c.moveTo(0,(i*13)%64);c.bezierCurveTo(150,(i*13)%64+6,350,(i*13)%64-4,512,(i*13)%64+2);c.stroke();}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;resources.add(texture);const wood=new THREE.MeshStandardMaterial({map:texture,roughness:.95});resources.add(wood);
  for(const [i,y] of [.9,1.7,2.5].entries()){
   const board=new THREE.Group();board.name='Nailed retaining board '+(i+1);board.position.set(width/2,y,.18);board.rotation.z=[-.035,.027,-.018][i];boards.add(board);
   const shape=new THREE.Shape();shape.moveTo(-width/2-.09,-.135);shape.lineTo(width/2+.07,-.135);shape.lineTo(width/2+.11,-.04);shape.lineTo(width/2+.06,.035);shape.lineTo(width/2+.1,.135);shape.lineTo(-width/2-.11,.135);shape.lineTo(-width/2-.055,.065);shape.closePath();
   mesh(new THREE.ExtrudeGeometry(shape,{depth:.1,bevelEnabled:false}),wood,board,[0,0,0],'Rough sawn timber');
   for(const x of [-width/2+.12,width/2-.12])for(const dy of [-.066,.064]){const nail=mesh(new THREE.SphereGeometry(.019,8,6),steel,board,[x,dy,.108],'Square nail head');nail.scale.z=.3;}
  }
 }
 return {crowbar,oilCan,wicket};
}
