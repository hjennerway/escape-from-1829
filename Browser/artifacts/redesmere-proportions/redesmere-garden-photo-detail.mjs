// redesmere-edge/img3.jpg: looking north-west from img3-loc.png.
// One continuous east face, widened per the blue/red correction; south face retained.
// Unmeasured dimensions and obscured openings are visual estimates.
export const REDESMERE_GARDEN_VIEW=Object.freeze({position:[93,1.8,29.5],target:[70,6.1,20],fov:60});

export function addRedesmereGardenDetails(THREE,{model,box,mesh,worldUV,white,brick,roof,material,hipRoof,sash,door,rod,iron}){
  const start=model.userData.eastPhotoOpenings.length;
  const trim=material(0xd8ddd5),timber=material(0xa4a18c),darkWood=material(0x4c4438),gravel=material(0x99917b);
  // One widened pavilion face replaces the front pavilion plus the separate
  // rear tower. All side openings share the same wall plane.
  // The courtyard end steps back beside the bay; its projecting fire-exit
  // corner has a short hip supplied by the courtyard detail module.
  hipRoof(65.5,16.15,8.5,17.7,14.53,2.55).name='Garden pavilion slate roof';
  mesh(worldUV(new THREE.BoxGeometry(.16,10.3,20),1.7),brick,69.8,9.15,15,true).name='Garden pavilion east wall';
  for(const z of [14.25,16.05])sash('garden-pavilion-upper-pair',69.96,11.45,z,Math.PI/2,1.5,2.1);
  for(const [z,w] of [[13.65,.75],[15.15,1.9],[16.65,.75]])sash('garden-pavilion-middle-glazing',69.96,6.35,z,Math.PI/2,w,2.55);
  for(const y of [4.96,7.76])box(trim,70.1,y,15.15,.27,.2,4.05);
  for(const y of [10.29,12.64])box(trim,70.1,y,15.15,.24,.18,3.75);
  // The front part stays blank above its ground-floor sash and blue door.
  sash('garden-pavilion-ground',69.96,2,22.55,Math.PI/2,1.18,2.85);
  door(69.98,18.95,Math.PI/2);
  sash('garden-pavilion-door-transom',70.02,3.4,18.95,Math.PI/2,1.42,.48);
  sash('garden-pavilion-ground-centre',69.96,2.05,15.15,Math.PI/2,3.6,2.55);
  for(const z of [7.2,9.05])sash('garden-pavilion-upper-right',69.96,11.3,z,Math.PI/2,1,2);
  for(const y of [4.08,8.8])box(trim,69.94,y,15,.22,.21,20);
  // Only the shallow cornice step from the photo interrupts the eaves line.
  for(const [z,d,top] of [[21.55,6.95,14.3],[15.15,5.9,14.52],[8.55,7.25,14.3]]){
    for(const [offset,h,w] of [[-.19,.16,.24],[0,.21,.42],[.18,.12,.55]])box(trim,69.94,top+offset,z,w,h,d+.12);
    box(iron,70.07,top+.31,z,.16,.1,d+.25);
  }
  for(const z of [24.85,5.1])box(iron,70.02,7,z,.075,14,.075);
  rod([70.05,13.4,24.2],[70.05,12.1,24.2],.035,trim);
  model.userData.redesmereGardenOpenings=model.userData.eastPhotoOpenings.slice(start);

  // Weathered panels are boarded surfaces, not glazed openings in the low
  // windowless range. Ivy hangs below its eaves and across the brickwork.
  box(material(0x474b44),89.6,.28,22.08,20.1,.48,.12);
  for(const x of [82.15,92.75]){
    box(timber,x,1.7,22.1,2.3,2.5,.12);
    for(let i=0;i<9;i++)box(darkWood,x-1.05+i*.26,1.7,22.18,.018,2.48,.035);
  }
  const leafShape=new THREE.Shape();
  [[0,-.14],[-.05,-.02],[-.22,.08],[-.12,.16],[-.13,.26],[0,.2],[.1,.34],[.13,.16],[.23,.08],[.05,-.02]].forEach(([x,y],i)=>i?leafShape.lineTo(x,y):leafShape.moveTo(x,y));leafShape.closePath();
  const leafGeometry=new THREE.ShapeGeometry(leafShape);
  const leafMaterials=[0x3f542e,0x647944,0x6b6941].map(c=>material(c,{side:THREE.DoubleSide}));
  const ivy=[[],[],[]],dummy=new THREE.Object3D();
  const noise=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
  for(let col=0;col<260;col++){
    const x=79.8+col*.077;
    const bottom=2.5+Math.sin(col*.08)*.8+Math.cos(col*.157)*.25;
    for(let y=bottom;y<4.55;y+=.08){
      const i=col*101+Math.round(y*100);
      ivy[Math.floor(noise(i)*3)].push([x+(noise(i+1)-.5)*.13,y+(noise(i+2)-.5)*.12,22.25+noise(i+3)*.06,i]);
    }
    if(col%12===0)rod([x,4.45,22.2],[x+Math.sin(col)*.22,bottom-.18,22.21],.012,darkWood);
  }
  for(let index=0;index<ivy.length;index++){
    const leaves=new THREE.InstancedMesh(leafGeometry,leafMaterials[index],ivy[index].length);
    leaves.name='Redesmere garden ivy';leaves.receiveShadow=true;leaves.castShadow=true;
    ivy[index].forEach(([x,y,z,i],n)=>{dummy.position.set(x,y,z);dummy.rotation.set(0,(noise(i+4)-.5)*.5,(noise(i+5)-.5)*1.8);dummy.scale.setScalar(.25+noise(i+6)*.2);dummy.updateMatrix();leaves.setMatrixAt(n,dummy.matrix);});
    model.add(leaves);
  }
  // Two slatted wooden benches face the small garden from the wall-side walk.
  for(const x of [84.4,95.4]){
    const bench=new THREE.Group();bench.name='Redesmere garden bench';model.add(bench);
    function part(px,y,z,w,h,d){const m=mesh(new THREE.BoxGeometry(w,h,d),darkWood,px,y,z,true);bench.attach(m);}
    for(const dx of [-1.25,1.25])for(const z of [23,23.85])part(x+dx,.45,z,.14,.8,.14);
    for(let i=0;i<5;i++)part(x,.86,23.05+i*.18,2.95,.12,.14);
    for(const dx of [-1.38,1.38]){part(x+dx,1.16,23.45,.13,.14,1.12);part(x+dx,1.05,22.99,.12,1.3,.12);}
    for(let i=0;i<15;i++)part(x-1.3+i*.185,1.35,22.99,.09,.82,.08);
    part(x,1.79,22.99,3,.12,.12);
  }
  box(gravel,89.6,.22,23.7,20.1,.12,1.7);
  const lawn=material(0x667752);
  // One continuous lawn removes the old raised-patch seams. Follow the inner
  // walk's curved corner, the bench walk and the extended front cross-walk.
  const garden=new THREE.Shape();
  garden.moveTo(45,-43);garden.lineTo(99.7,-43);garden.lineTo(99.7,-25);
  garden.lineTo(79.7,-25);garden.lineTo(79.7,-30.55);garden.lineTo(46.1,-30.55);
  garden.quadraticCurveTo(45,-30.55,45,-31.65);garden.closePath();
  const surface=mesh(new THREE.ShapeGeometry(garden,24),lawn,0,.33,0);
  surface.rotation.x=-Math.PI/2;surface.name='Redesmere continuous garden lawn';
}
