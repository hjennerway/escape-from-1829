// Escape-only fittings. The caller owns the shared factory resource set.
export function createDoorLockFactory(THREE,resources){
 const keep=value=>{resources.add(value);return value;};
 // Repeatable iron, oxidation and pits, independent of canvas or image files.
 const size=128,pixels=new Uint8Array(size*size*4),grain=new Uint8Array(size*size*4);
 const hash=(x,y)=>{let n=Math.imul(x+19,374761393)^Math.imul(y+73,668265263);n=Math.imul(n^(n>>>13),1274126177);return (n>>>0)/4294967295;};
 const noise=(x,y,scale)=>{const px=x/scale,py=y/scale,ix=Math.floor(px),iy=Math.floor(py),u=px-ix,v=py-iy,a=u*u*(3-2*u),b=v*v*(3-2*v),period=size/scale;
  const h=(dx,dy)=>hash((ix+dx)%period,(iy+dy)%period);return (h(0,0)*(1-a)+h(1,0)*a)*(1-b)+(h(0,1)*(1-a)+h(1,1)*a)*b;};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=(y*size+x)*4,patch=noise(x,y,16)*.7+noise(x,y,4)*.3,rust=Math.max(0,(patch-.40)*2),pit=hash(x,y),shade=82+patch*75+(pit-.5)*24;
  pixels[i]=shade+rust*25;pixels[i+1]=shade-rust*17;pixels[i+2]=shade-rust*31;pixels[i+3]=255;
  grain[i]=grain[i+1]=grain[i+2]=145+rust*75+pit*26;grain[i+3]=255;
 }
 function texture(data,color=false){const t=keep(new THREE.DataTexture(data,size,size));if(color)t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;}
 const patina=texture(pixels,true),roughness=texture(grain);
 const iron=keep(new THREE.MeshStandardMaterial({color:0x969994,map:patina,metalness:.65,roughness:.78,roughnessMap:roughness,bumpMap:roughness,bumpScale:.001}));
 const aged=keep(new THREE.MeshStandardMaterial({color:0x96776a,map:patina,metalness:.52,roughness:.9,roughnessMap:roughness,bumpMap:roughness,bumpScale:.0015}));
 const rim=keep(new THREE.MeshStandardMaterial({color:0x55524b,metalness:.65,roughness:.63}));
 const dark=keep(new THREE.MeshStandardMaterial({color:0x151411,roughness:.95}));
 const cube=keep(new THREE.BoxGeometry(1,1,1));
 // Round-ended oval links alternate planes. Their pitch is shorter than their
 // open length, so each closed loop passes through its neighbour's opening.
 const wire=.012,halfStraight=.040,radius=.040,points=[];
 for(let side=0;side<2;side++)for(let i=0;i<=16;i++){
  const a=-Math.PI/2+i*Math.PI/16+side*Math.PI;points.push(new THREE.Vector3((side?-1:1)*halfStraight+radius*Math.cos(a),radius*Math.sin(a),0));
 }
 const link=keep(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points,true,'centripetal'),64,wire,8,true));
 const eye=keep(new THREE.TorusGeometry(.05,.013,8,24));
 const shacklePath=new THREE.CatmullRomCurve3([
  new THREE.Vector3(-.135,.095,0),new THREE.Vector3(-.135,.24,0),new THREE.Vector3(-.103,.337,0),
  new THREE.Vector3(0,.375,0),new THREE.Vector3(.103,.337,0),new THREE.Vector3(.135,.24,0),new THREE.Vector3(.135,.095,0)
 ]);
 const shackle=keep(new THREE.TubeGeometry(shacklePath,48,.024,10,false));
 const shape=new THREE.Shape();
 shape.moveTo(-.18,.12);shape.quadraticCurveTo(-.12,.145,-.065,.115);shape.quadraticCurveTo(0,.075,.065,.115);shape.quadraticCurveTo(.12,.145,.18,.12);
 shape.bezierCurveTo(.23,.025,.215,-.075,.17,-.135);shape.bezierCurveTo(.08,-.24,-.08,-.24,-.17,-.135);shape.bezierCurveTo(-.215,-.075,-.23,.025,-.18,.12);
 const body=keep(new THREE.ExtrudeGeometry(shape,{depth:.085,bevelEnabled:true,bevelThickness:.009,bevelSize:.009,bevelSegments:3,steps:1,curveSegments:16}));body.translate(0,0,-.0425);
 const seam=keep(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.206,-.055,0),new THREE.Vector3(0,-.068,0),new THREE.Vector3(.206,-.055,0)]),16,.003,5,false));
 const pin=keep(new THREE.SphereGeometry(1,12,8));
 const keyShape=new THREE.Shape();keyShape.absarc(0,0,.024,0,Math.PI*2,false);
 const keyRound=keep(new THREE.ShapeGeometry(keyShape,20));
 const slotShape=new THREE.Shape();slotShape.moveTo(-.010,-.008);slotShape.lineTo(.010,-.008);slotShape.lineTo(.007,-.064);slotShape.lineTo(-.007,-.064);slotShape.closePath();
 const slot=keep(new THREE.ShapeGeometry(slotShape));
 const coverShape=new THREE.Shape();coverShape.moveTo(0,.028);coverShape.bezierCurveTo(.04,.04,.065,.005,.104,-.006);coverShape.lineTo(.095,-.033);coverShape.bezierCurveTo(.056,-.029,.01,-.015,-.014,.003);coverShape.quadraticCurveTo(-.02,.023,0,.028);
 const cover=keep(new THREE.ExtrudeGeometry(coverShape,{depth:.008,bevelEnabled:true,bevelThickness:.002,bevelSize:.002,bevelSegments:1,curveSegments:10}));
 const transform=new THREE.Object3D(),faceMatrix=new THREE.Matrix4(),along=new THREE.Vector3(1,0,0);
 function mesh(parent,geometry,material,position,size){
  const item=new THREE.Mesh(geometry,material);item.position.set(...position);if(size)item.scale.set(...size);
  item.castShadow=item.receiveShadow=true;item.userData.noWalkingCollision=true;parent.add(item);return item;
 }
 return function addDoorLock(parent,{width,height=1.75,depth=.09,faces=[1,-1],id}={}){
  const group=new THREE.Group();group.name='Door chain and padlock';group.userData.doorLock={id,width,height,depth,faces:[...faces]};parent.add(group);
  const span=width*.40,surface=depth/2,z=surface+.118,lockY=height-.49,runs=[];
  // Upper runs end on the arch; lower runs end on its uprights. Terminal
  // links are perpendicular to the shackle, enclosing its wire.
  const shackleEnds=[shacklePath.getPoint(.24),shacklePath.getPoint(.10)];
  for(const face of faces)for(const side of [-1,1])for(const [row,end] of shackleEnds.entries()){
   const start=new THREE.Vector3(side*span,height+(row?-.43:.08),z),finish=new THREE.Vector3(side*Math.abs(end.x),lockY+end.y,z);
   const middle=start.clone().lerp(finish,.5);middle.y-=.015;
   const path=new THREE.QuadraticBezierCurve3(start,middle,finish),length=path.getLength();
   // Odd counts make both terminal loops edge-on. Each encloses the iron wire
   // of its eye/shackle without cutting through it; interior planes alternate.
   const count=Math.max(5,Math.ceil(Math.ceil(length/.125)/2)*2+1);
   runs.push({face,side,row,path,count,start:0});
  }
  const chain=new THREE.InstancedMesh(link,iron,runs.reduce((n,r)=>n+r.count,0));chain.name='Heavy interlocking door chain';chain.castShadow=chain.receiveShadow=true;chain.userData.noWalkingCollision=true;group.add(chain);
  let instance=0;
  for(const run of runs){
   run.start=instance;faceMatrix.makeRotationY(run.face<0?Math.PI:0);
   for(let i=0;i<run.count;i++){
    const t=i/(run.count-1),p=run.path.getPointAt(t),tangent=run.path.getTangentAt(t);
    transform.position.copy(p);transform.quaternion.setFromUnitVectors(along,tangent);transform.rotateX(i%2?0:Math.PI/2);transform.scale.set(1,1,1);transform.updateMatrix();
    chain.setMatrixAt(instance++,transform.matrix.clone().premultiply(faceMatrix));
   }
  }
  chain.userData.chainRuns=runs.map(({face,side,row,start,count})=>({face,side,row,start,count}));
  for(const face of faces){
   const fitting=new THREE.Group();fitting.name='Padlock face';fitting.rotation.y=face<0?Math.PI:0;group.add(fitting);
   for(const side of [-1,1])for(const row of [0,1]){
    const y=height+(row?-.43:.08);
    mesh(fitting,cube,iron,[side*span,y,surface+.014],[.13,.18,.028]).name='Chain anchor plate';
    const ring=mesh(fitting,eye,iron,[side*span,y,surface+.068]);ring.rotation.y=Math.PI/2;ring.name='Chain anchor eye';
    for(const dy of [-.06,.06])mesh(fitting,pin,rim,[side*span,y+dy,surface+.031],[.012,.012,.006]).name='Anchor bolt';
   }
   mesh(fitting,body,aged,[0,lockY,z+.022]).name='Round weathered iron padlock';
   mesh(fitting,shackle,iron,[0,lockY,z]).name='Padlock shackle';
   mesh(fitting,seam,dark,[0,lockY,z+.075]).name='Padlock case seam';
   const keyY=lockY-.106,keyZ=z+.075;
   mesh(fitting,pin,rim,[0,keyY,keyZ-.004],[.042,.044,.007]).name='Keyhole escutcheon';
   mesh(fitting,keyRound,dark,[0,keyY,keyZ+.004]).name='Padlock keyhole';
   mesh(fitting,slot,dark,[0,keyY,keyZ+.004]).name='Padlock key slot';
   mesh(fitting,cover,aged,[0,lockY-.057,keyZ+.004]).name='Pivoting keyhole cover';
   for(const [x,y] of [[-.174,.062],[.174,.062],[0,-.051],[-.127,-.14]])mesh(fitting,pin,rim,[x,lockY+y,keyZ+.005],[.012,.012,.006]).name='Padlock rivet';
  }
  chain.instanceMatrix.needsUpdate=true;chain.computeBoundingBox();chain.computeBoundingSphere();
  return group;
 };
}
