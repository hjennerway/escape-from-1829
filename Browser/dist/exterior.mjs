// Dimensional interpretation of the four supplied front views, in metres.
// Architecture is real geometry; only the intricate pediment uses a photo detail.
export async function createBuildingExterior(THREE,aspect){
  const scene=new THREE.Scene();scene.background=new THREE.Color(0xa7b6bd);
  scene.fog=new THREE.FogExp2(0xa7b6bd,.008);
  const camera=new THREE.PerspectiveCamera(61,aspect,.05,180);
  scene.add(new THREE.HemisphereLight(0xe0ebf0,0x555444,2.1));
  const sun=new THREE.DirectionalLight(0xffeedb,2.2);sun.position.set(-15,24,18);scene.add(sun);
  const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.86,...extra});
  const stone=mat(0xd4d1bb),white=mat(0xe2e0d1),dark=mat(0x343a39),red=mat(0x681f28),redInset=mat(0x4d1720),metal=mat(0x383d36),brass=mat(0xb3985d,{metalness:.65,roughness:.32});
  const matGlass=mat(0x667e82,{metalness:.35,roughness:.3});
  const batches=new Map();
  function box(material,x,y,z,w,h,d,rotation=0){
    if(!batches.has(material))batches.set(material,[]);
    batches.get(material).push({x,y,z,w,h,d,rotation});
  }
  function mesh(geometry,material,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);scene.add(m);return m;}
  let seed=1829;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  function texture(draw,size=512){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;}
  const bricks=texture((g,s)=>{
    g.fillStyle='#726257';g.fillRect(0,0,s,s);
    for(let row=0;row<16;row++)for(let col=-1;col<8;col++){
      const shade=Math.floor(random()*28);g.fillStyle=`rgb(${103+shade},${48+shade*.6},${37+shade*.5})`;
      g.fillRect(col*72+(row%2)*36+1,row*32+1,69,29);
    }
    for(let i=0;i<25000;i++){g.fillStyle=random()>.5?'#25160c19':'#dec5a51a';g.fillRect(random()*s,random()*s,1+random()*3,1);}
  });
  const brick=mat(0xffffff,{map:bricks});
  function brickBlock(x,y,z,w,h,d){
    const geo=new THREE.BoxGeometry(w,h,d),p=geo.attributes.position,n=geo.attributes.normal,uv=geo.attributes.uv;
    for(let i=0;i<p.count;i++){uv.setXY(i,(Math.abs(n.getX(i))>.5?p.getZ(i):p.getX(i))/2,(Math.abs(n.getY(i))>.5?p.getZ(i):p.getY(i))/2);}
    mesh(geo,brick,x,y,z);
  }
  const asphalt=texture((g,s)=>{g.fillStyle='#505754';g.fillRect(0,0,s,s);for(let i=0;i<30000;i++){g.fillStyle=random()>.5?'#ffffff10':'#00000018';g.fillRect(random()*s,random()*s,2,2);}});asphalt.repeat.set(28,28);
  mesh(new THREE.BoxGeometry(150,.15,140),mat(0xb6beb9,{map:asphalt}),0,-.15,15);
  box(mat(0x47523a),-18,-.035,13,26,.08,18);box(mat(0x47523a),18,-.035,13,26,.08,18);
  // Central three-storey pavilion and recessed, two-storey wings.
  brickBlock(0,7.15,-3.2,13.8,12.1,6.4);
  for(const side of [-1,1]){
    brickBlock(side*14.8,5.55,-5,15.8,8.9,6.4);
    box(stone,side*14.8,.6,-1.65,15.9,1.2,.36);
    for(const [y,h,w] of [[1.35,.3,16.05],[9.95,.22,16.2],[10.22,.32,16.45]])box(white,side*14.8,y,-1.65,w,h,.6);
    box(dark,side*14.8,10.1,-5,15.8,.3,6.5);
    for(const x of [8.7,12.3,15.9,19.5])for(const y of [3.8,7.9])window(side*x,y,-1.72,1.35,2.35);
    for(const x of [9,15,20])window(side*x,.66,-1.42,.9,.75);
    brickBlock(side*5.35,13.95,-3.5,.85,2.2,1.05);box(stone,side*5.35,15.08,-3.5,1.02,.15,1.18);
  }
  box(stone,0,.65,.06,14,1.3,.4);
  for(const [y,h,w] of [[1.4,.32,14.1],[6.35,.30,14.2],[9.8,.35,14.2],[13.18,.23,14.5],[13.4,.17,14.75]])box(white,0,y,.13,w,h,.5);
  box(dark,0,13.2,-3.25,13.8,.2,6.4);
  for(const x of [-3.85,0,3.85])for(const y of [3.85,8.05,11.55])if(x!==0||y!==3.85)window(x,y,.04);
  function trapezoid(material,x,y,z,bottom,top,height){
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-bottom/2,0,0,bottom/2,0,0,top/2,height,0,-bottom/2,0,0,top/2,height,0,-top/2,height,0],3));g.computeVertexNormals();mesh(g,material,x,y,z);
  }
  function window(x,y,z,w=1.42,h=2.4){
    box(dark,x,y,z+.025,w+.16,h+.14,.14);
    box(matGlass,x,y,z+.11,w,h,.05);
    for(const s of [-1,1])box(white,x+s*w/2,y,z+.17,.09,h+.10,.14);
    for(const sy of [-1,0,1])box(white,x,y+sy*h/2,z+.18,w+.14,sy===0?.085:.11,.15);
    for(const s of [-1,1])box(white,x+s*w/6,y,z+.2,.038,h,.08);
    for(const sy of [-2,-1,1,2])box(white,x,y+sy*h/6,z+.2,w,.034,.08);
    box(stone,x,y-h/2-.10,z+.22,w+.35,.17,.4);
    trapezoid(stone,x,y+h/2+.05,z+.23,w+.15,w+.60,.30);
  }
  function triangle(w,h,material,x,y,z){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-w/2,0,0,w/2,0,0,0,h,0],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,1],2));g.computeVertexNormals();return mesh(g,material,x,y,z);}
  // Photo coordinates preserve the blue/gold heraldic relief from 1829front.webp.
  triangle(14.7,3.2,stone,0,13.48,.06);
  const relief=texture((g,s)=>{g.fillStyle='#274957';g.fillRect(0,0,s,s);});
  triangle(13.8,2.98,mat(0xffffff,{map:relief}),0,13.53,.08);
  try{
    const photo=await new THREE.TextureLoader().loadAsync('./exterior/1829front.webp');
    const g=relief.image.getContext('2d');g.drawImage(photo.image,29,27,276,64,0,0,512,512);relief.needsUpdate=true;photo.dispose();
  }catch(error){console.warn('Pediment photograph unavailable; retaining the modelled pediment.',error);}
  for(const side of [-1,1]){
    const slope=Math.atan2(3.2,7.35);
    box(white,side*3.675,15.08,.17,8.06,.19,.42,-side*slope);
    box(stone,side*3.675,15.27,.02,8.24,.13,.52,-side*slope);
  }
  box(white,0,13.5,.18,14.9,.17,.65);
  // Portico, raised landing, eight stone treads and red panelled door.
  box(stone,0,1.0,1.45,4.7,2,3.2);
  for(let i=0;i<8;i++){const height=(8-i)*.25;box(stone,0,height/2,3.15+i*.34,3.05,height,.36);}
  box(white,0,2.05,1.45,4.85,.16,3.3);
  box(dark,0,3.65,.10,1.95,3.1,.16);box(red,0,3.62,.21,1.64,2.96,.14);
  for(const x of [-.4,.4])for(const y of [2.68,3.58,4.46]){
    box(redInset,x,y,.29,.59,.68,.035);box(red,x,y,.32,.48,.55,.045);
  }
  box(brass,.18,3.55,.37,.08,.24,.09);box(brass,0,3.04,.37,.40,.06,.06);
  for(const s of [-1,1])box(white,s*.99,3.85,.29,.19,3.7,.22);
  box(white,0,5.66,.28,2.2,.19,.25);box(matGlass,0,5.25,.23,1.78,.53,.07);
  for(const x of [-.6,0,.6])box(white,x,5.25,.31,.045,.52,.07);
  for(const x of [-1.91,1.91])for(const z of [.65,2.55]){
    box(stone,x,2.24,z,.61,.32,.61);
    mesh(new THREE.CylinderGeometry(.19,.25,3.45,16),white,x,4.10,z);
    for(const y of [2.42,5.78])mesh(new THREE.CylinderGeometry(.29,.29,.12,16),stone,x,y,z);
    box(white,x,5.92,z,.64,.2,.62);
    // Ionic scroll silhouettes visible on the reference entrance.
    for(const s of [-1,1]){const scroll=mesh(new THREE.CylinderGeometry(.115,.115,.2,12),stone,x+s*.25,5.83,z+.12);scroll.rotation.x=Math.PI/2;}
  }
  for(const [y,w,h,d] of [[6.1,4.85,.24,3.1],[6.36,5.15,.3,3.35],[6.59,5.45,.16,3.65]])box(white,0,y,1.35,w,h,d);
  box(dark,0,6.72,1.35,5.0,.08,3.25);
  for(const side of [-1,1]){
    box(metal,side*1.72,2.56,2.1,.045,.045,2.2);
    for(let i=0;i<6;i++)box(metal,side*1.72,2.3,1.1+i*.4,.03,.55,.03);
    const rail=mesh(new THREE.CylinderGeometry(.027,.027,3.35,8),metal,side*1.66,1.7,4.4);rail.rotation.x=-.95;
    for(let i=0;i<4;i++)box(metal,side*1.66,2.3-i*.5,3.35+i*.67,.04,.9,.04);
  }
  // Evergreen trees frame the doorway without covering the camera's route.
  const foliage=[mat(0x263e2e),mat(0x344937),mat(0x3e5140)],trunk=mat(0x4c4131);
  for(const [x,z,h] of [[-5,2.5,5.5],[5.6,2.1,6.2],[-23,1,7],[24,0,7.6]]){
    mesh(new THREE.CylinderGeometry(.13,.25,2,8),trunk,x,1,z);
    for(let j=0;j<7;j++){
      const cone=mesh(new THREE.ConeGeometry((1-j*.11)*h*.23,h*.39,9),foliage[j%3],x,.8+j*h*.115,z);cone.rotation.y=j*.73;
    }
  }
  // Gravel beds, kerbs and a few restrained flower clusters along the drive.
  const bed=mat(0x353629),kerb=mat(0x9b9b88),flower=mat(0xbc9882);
  for(const side of [-1,1]){
    box(bed,side*8,.05,12,5,.15,6);box(kerb,side*5.5,.08,12,.15,.20,6.2);
    box(kerb,side*8,.08,15,5,.20,.15);
    for(let i=0;i<30;i++)box(i%3?foliage[1]:flower,side*(5.9+random()*4),.18+random()*.13,9.3+random()*5.4,.16,.25,.16);
  }
  // Merge repeated trim into material batches to keep mobile draw calls low.
  for(const [material,items] of batches){const instanced=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),material,items.length),dummy=new THREE.Object3D();
    items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.rotation.set(0,0,b.rotation);dummy.updateMatrix();instanced.setMatrixAt(i,dummy.matrix);});scene.add(instanced);
  }
  camera.position.set(-2.8,2,31);camera.lookAt(0,5.6,0);
  return {scene,camera};
}
