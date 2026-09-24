// Red img1 faces the inner L; blue img2 faces the outer long elevation.
export const LEIGHTON_REFERENCE={location:'Research/leighton-newton/locations.png',inner:'Browser/dist/building-photos/leighton-newton-inner.jpg',outer:'Browser/dist/building-photos/leighton-newton-outer.jpg'};
export function addLeightonNewton(THREE,{ward,scale:S,brick,roof,material,worldUV,hipRoof}){
 const group=new THREE.Group();group.name='Leighton Newton photographed elevations';
 const angle=22*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
 group.rotation.y=angle;group.position.set((9-c*9+s*42)*S,0,(-42+s*9+c*42)*S);ward.add(group);group.userData.reference=LEIGHTON_REFERENCE;
 const masonry=brick.clone();masonry.color.setHex(0x897969);
 for(const o of ward.children)if(o.name.endsWith('brick walls'))o.material=masonry;
 const trim=material(0xa75a40),frame=material(0xe3e6d9),glass=material(0x324745),blue=material(0x477f99),stone=material(0xa29c89);
 const batches=new Map(),openings=[];
 const mesh=(g,m,x,y,z,name)=>{const o=new THREE.Mesh(g,m);o.position.set(x*S,y,z*S);o.name='Leighton Newton '+name;o.castShadow=o.receiveShadow=true;group.add(o);return o;};
 const box=(m,x,y,z,w,h,d,name,collision=false)=>{const o=mesh(worldUV(new THREE.BoxGeometry(w*S,h,d*S),1.7),m,x,y,z,name);if(collision)o.userData.orientedCollision=true;return o;};
 function part(m,x,y,z,w,h,d,r=0){if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x:x*S,y,z:z*S,w:w*S,h,d:d*S,r});}
 function face(x,z,r=0){const c=Math.cos(r),s=Math.sin(r);return (m,u,y,n,w,h,d)=>part(m,x+c*u+s*n,y,z-s*u+c*n,w,h,d,r);}
 function sash(x,z,r,{w=.85,h=2.8,y=6.45}={}){
  const p=face(x,z,r);openings.push({x:x*S,y,z:z*S,r,w:w*S,h});p(glass,0,y,.04,w,h,.05);
  for(const u of [-w/2,-w/6,w/6,w/2])p(frame,u,y,.10,.035,h+.06,.05);for(let i=0;i<=8;i++)p(frame,0,y-h/2+i*h/8,.11,w+.07,i===4?.065:.035,.05);
  p(trim,0,y-h/2-.09,.09,w+.18,.16,.18);p(trim,0,y+h/2+.10,.04,w+.22,.18,.09);
 }
 function entrance(x,z,r){
  const p=face(x,z,r);p(blue,0,1.35,.075,1.08,2.7,.10);for(const u of [-.64,.64])p(trim,u,1.4,.12,.18,2.8,.22);
  const sh=new THREE.Shape();sh.absarc(0,2.7,.75*S,0,Math.PI,false);sh.lineTo(-.55*S,2.7);sh.absarc(0,2.7,.55*S,Math.PI,0,true);sh.closePath();
  const arch=mesh(new THREE.ExtrudeGeometry(sh,{depth:.2*S,bevelEnabled:false}),trim,x,0,z,'arched entrance surround');arch.rotation.y=r;
  const fan=new THREE.Shape();fan.moveTo(-.53*S,0);fan.absarc(0,0,.53*S,Math.PI,0,true);fan.closePath();
  const light=mesh(new THREE.ShapeGeometry(fan),glass,x+Math.sin(r)*.12,2.7,z+Math.cos(r)*.12,'door fanlight');light.rotation.y=r;p(blue,0,2.95,.16,.055,.5,.06);
  for(const u of [-.27,.27])for(const y of [.6,1.65])p(blue,u,y,.14,.42,.72,.05);p(stone,0,.06,.55,1.7,.12,1.1);
 }
 function elevation(x,z,width,r,columns,{door=null,short=false}={}){
  const p=face(x,z,r);for(const [y,h] of [[.22,.35],[2.1,.10],[4.25,.42],[5.08,.10],[6.45,.10],[8.12,.38]])p(trim,0,y,.04,width,h,.09);p(blue,0,8.43,.16,width+.3,.12,.13);
  for(const u of [-width/2+.10,width/2-.10])p(blue,u,4.2,.17,.065,8.4,.065);
  for(const u of columns){const px=x+Math.cos(r)*u,pz=z-Math.sin(r)*u;sash(px,pz,r,{h:short?1.6:2.8,y:short?7.02:6.45});if(door===null||Math.abs(u-door)>.7)sash(px,pz,r,{y:2.05,h:3.1});}
  if(door!==null)entrance(x+Math.cos(r)*door,z-Math.sin(r)*door,r);
 }
 function projection(x,z,w,d,{gable=false,side=1,rise=2.8}={}){
  box(masonry,x,4.2,z,w,8.4,d,'projecting bay brick walls',true);const front=z+side*d/2;
  if(gable){
   const sh=new THREE.Shape();sh.moveTo(-w*S/2,0);sh.lineTo(w*S/2,0);sh.lineTo(0,rise);sh.closePath();mesh(worldUV(new THREE.ExtrudeGeometry(sh,{depth:.22*S,bevelEnabled:false}),1.7),masonry,x,8.4,front-.22,'outer brick gable');
   for(const sign of [-1,1]){const length=Math.hypot(w*S/2,rise),pitch=Math.atan2(rise,w*S/2);const verge=mesh(new THREE.BoxGeometry(length+.16,.15,.15*S),trim,x+sign*w/4,8.4+rise/2,front+.10,'terracotta gable verge');verge.rotation.z=-sign*pitch;}
   // Front gable with a hipped rear termination, as seen from the red camera.
   const back=z-d/2,L=[(x-w/2-.1)*S,8.4,(front+.15)*S],R=[(x+w/2+.1)*S,8.4,(front+.15)*S],LB=[L[0],8.4,(back-.1)*S],RB=[R[0],8.4,(back-.1)*S],F=[x*S,8.4+rise,(front+.15)*S],B=[x*S,8.4+rise,(back+3)*S];
   const points=[...L,...F,...LB,...LB,...F,...B,...R,...RB,...F,...RB,...B,...F,...LB,...B,...RB],geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(points.flatMap((v,i)=>i%3===0?[v/3,points[i+2]/3]:[]),2));geo.computeVertexNormals();mesh(geo,roof,0,0,0,'cross gable slate roof');
   for(const y of [.12,.8,1.5,2.15])part(trim,x,8.4+y,front+.045,w*(1-y/rise),.13,.12);
  }else{const cap=hipRoof(x*S,z*S,w*S,d*S,8.4,rise);cap.name='Leighton Newton projecting hip slate roof';group.add(cap);}
  return front;
 }
 const leftFront=projection(21,-41.35,6.8,9.3,{gable:true,rise:3.8}),rightFront=projection(43.5,-41.25,9,9.5,{gable:true,rise:4.6});
 elevation(13.3,-38,8.6,0,[-3,-1,1,3],{door:0});elevation(21,leftFront,6.8,0,[-2,0,2]);elevation(31.8,-38,14.4,0,[-5.6,-1.8,1.8,5.6]);elevation(43.5,rightFront,9,0,[-2.6,0,2.6]);
 mesh(new THREE.TorusGeometry(.39,.085,8,24),trim,21,9.8,leftFront+.14,'round gable light surround');mesh(new THREE.CircleGeometry(.30,24),frame,21,9.8,leftFront+.16,'round gable light');part(blue,21,9.8,leftFront+.18,.04,.5,.03);
 // Low brick piers and short fence panels line the sheltered walk.
 for(let i=0;i<4;i++){const x=26.4+i*3.6;box(masonry,x,.38,-34.35,.5,.76,.45,'veranda garden pier',true);for(let j=0;j<7;j++)part(stone,x+.4+j*.25,.3,-34.35,.08,.6,.07);}
 const vx=31.8,vw=14.4,back=-37.93,front=-34.7;
 const canopy=new THREE.BufferGeometry(),a=[(vx-vw/2)*S,3.8,back*S],b=[(vx+vw/2)*S,3.8,back*S],d=[(vx-vw/2)*S,3.05,front*S],e=[(vx+vw/2)*S,3.05,front*S];canopy.setAttribute('position',new THREE.Float32BufferAttribute([...a,...d,...b,...b,...d,...e],3));canopy.computeVertexNormals();
 mesh(canopy,material(0x536967,{roughness:.48,metalness:.3,side:THREE.DoubleSide}),0,0,0,'veranda roof');box(stone,vx,.035,(back+front)/2,vw,.07,front-back+.3,'veranda paving');part(blue,vx,3.02,front,vw+.25,.14,.12);
 for(let i=0;i<=4;i++){const x=vx-vw/2+i*vw/4;box(blue,x,1.5,front,.09,3,.09,'veranda column',true);box(stone,x,.43,front,.35,.86,.35,'veranda column plinth',true);part(blue,x,2.93,front,.30,.14,.20);}
 for(let i=0;i<=16;i++){const x=(vx-vw/2+i*vw/16)*S,p=new THREE.Vector3(x,3.82,back*S),q=new THREE.Vector3(x,3.07,front*S),v=q.clone().sub(p);const rib=mesh(new THREE.CylinderGeometry(.025,.025,v.length(),5),frame,0,0,0,'veranda roof seam');rib.position.copy(p.add(q).multiplyScalar(.5));rib.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());}
 const innerA=projection(17,-46.0,6.4,3.2,{side:-1,rise:2});
 elevation(17,innerA,6.4,Math.PI,[-1.8,0,1.8],{door:0});
 // The marked correction replaces the middle bay with a block in the L's
 // inner corner: x=32..39, z=-54..-46, joined to both existing ranges.
 const cornerFront=projection(35.5,-50,7,8,{side:-1,rise:2.2});
 elevation(35.5,cornerFront,7,Math.PI,[-2,2],{short:true});
 elevation(32,-50,8,-Math.PI/2,[-2,2],{short:true});
 for(const [x,w,cols] of [[11.4,4.8,[-1.3,1.3]],[22.85,5.3,[-1.7,1.7]],[28.75,6.5,[-2,2]]])elevation(x,-46,w,Math.PI,cols);
 elevation(39,-60,12,-Math.PI/2,[-4,0,4]);elevation(48,-55.5,21,Math.PI/2,[-8,-4,0,4,8]);elevation(43.5,-66,9,Math.PI,[-2.8,0,2.8],{short:true});
 for(const [x,z,height,pots] of [[13,-42,12,2],[21,-42,12.8,3],[26,-42,13.8,3],[30,-42,13.5,2],[37,-42,12.8,3],[43.5,-44,13.5,3],[43.5,-53,13.8,2],[43.5,-62,12.7,2]]){
  box(masonry,x,(9+height)/2,z,1.15,height-9,.85,'chimney stack');for(const y of [height-1.1,height-.12])part(trim,x,y,z,1.35,.16,1.02);for(let i=0;i<pots;i++)mesh(new THREE.CylinderGeometry(.12,.15,.75,8),trim,x+(i-(pots-1)/2)*.34,height+.32,z,'terracotta chimney pot');
 }
 const dummy=new THREE.Object3D();for(const [mat,items] of batches){const o=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,items.length);o.name='Leighton Newton facade details';o.castShadow=o.receiveShadow=true;items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.rotation.set(0,b.r,0);dummy.updateMatrix();o.setMatrixAt(i,dummy.matrix);});group.add(o);}
 group.userData.openings=openings;return group;
}
