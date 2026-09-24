// South lawn elevation registered by the red outline and blue camera marker.
export function addJarmanFront(THREE,{model,host,brick,roof,material,worldUV}){
 const group=new THREE.Group();group.name='West court front elevation';model.userData.wards['tarvin-jarman'].add(group);
 const left=host.x-host.w/2,width=host.w,z=host.z+host.d/2+.10,h=8.4,x=f=>left+width*f;
 const trim=material(0xa5523d),pale=material(0xe1e4da),blue=material(0x33718b),glass=material(0x34464b,{roughness:.43,metalness:.12}),lead=material(0x7a898f),dark=material(0x343b36);
 const batches=new Map(),openings=[];
 function mesh(g,m,px,y,pz,name){const o=new THREE.Mesh(g,m);o.name=name;o.position.set(px,y,pz);o.castShadow=true;o.receiveShadow=true;group.add(o);return o;}
 function box(m,px,y,pz,w,h,d){if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x:px,y,z:pz,w,h,d});}
 function wall(px,y,pz,w,h,d,name){const o=mesh(worldUV(new THREE.BoxGeometry(w,h,d),1.7),brick,px,y,pz,name);o.userData.orientedCollision=true;return o;}
 function beam(a,b,r,m,name){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p);const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),6),m,...p.add(q).multiplyScalar(.5).toArray(),name);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());}
 function sash(px,y,pz,w=1.9,height=3.0,name='Jarman ward sash'){
  openings.push({name,x:px,y,z:pz,w,h:height});box(glass,px,y,pz+.065,w,height,.08);
  for(const dx of [-w/2,w/2])box(pale,px+dx,y,pz+.13,.065,height,.10);
  for(const dy of [-height/2,0,height/2])box(pale,px,y+dy,pz+.14,w+.08,.075,.10);
  for(const dx of [-w/4,0,w/4])box(pale,px+dx,y,pz+.15,.035,height,.07);
  for(let i=1;i<8;i++)if(i!==4)box(pale,px,y-height/2+height*i/8,pz+.15,w,.032,.07);
  box(trim,px,y-height/2-.10,pz+.11,w+.3,.16,.3);
 }
 wall(host.x,h/2,z-.26,width,h,.5,'Jarman frontage brick walls');
 const courses=[[.22,.36],[3.5,.10],[4.06,.42],[7.63,.10],[8.12,.48]];
 for(const [y,t] of courses)box(trim,host.x,y,z+.07,width,t,.18);
 box(blue,host.x,h+.02,z+.27,width+.4,.14,.2);
 const bays=[{centre:.315,w:.23},{centre:.91,w:.18}],front=z+1.55;
 const veranda={left:x(.43)+.12,right:x(.82)-.12,back:z,front:z+4.1};
 for(const f of [.065,.153])for(const y of [1.83,6.05])sash(x(f),y,z,2.1,3.15);
 for(const f of [.465,.5425,.62,.6975,.775])sash(x(f),6.05,z,1.9,3.15);
 for(const bay of bays){
  const px=x(bay.centre),w=width*bay.w,rise=3.25,depth=host.d*.56+1.55;
  wall(px,h/2,front-.9,w,h,1.8,'Court projecting gable brick walls');
  for(const [y,t] of courses)box(trim,px,y,front+.08,w+.06,t,.2);
  for(const dx of [-w*.29,0,w*.29])for(const y of [1.83,6.05])sash(px+dx,y,front,Math.min(2.0,w*.19),3.15);
  const sh=new THREE.Shape();sh.moveTo(-w/2,0);sh.lineTo(w/2,0);sh.lineTo(0,rise);sh.closePath();
  mesh(worldUV(new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:false}),1.7),brick,px,h,front-depth,'Jarman decorated brick gable');
  for(const sign of [-1,1]){
   const cap=mesh(worldUV(new THREE.BoxGeometry(Math.hypot(w/2,rise)+.3,.14,depth+.3),1.7),roof,px+sign*w/4,h+rise/2,front-depth/2,'Jarman cross-gable slate roof');cap.rotation.z=-sign*Math.atan2(rise,w/2);
   for(const inset of [0,.22,.42])beam([px+sign*w/2,h-inset,front+.14],[px,h+rise-inset,front+.14],.07,trim,'Jarman stepped terracotta verge');
  }
  for(const dy of [.48,1.32,2.15])box(trim,px,h+dy,front+.11,w*(1-dy/rise)-.5,.12,.17);
  mesh(new THREE.CircleGeometry(.39,24),glass,px,h+1.56,front+.20,'Court circular gable vent');
  mesh(new THREE.TorusGeometry(.47,.13,8,32),trim,px,h+1.56,front+.23,'Jarman circular terracotta surround');
  box(pale,px,h+1.56,front+.3,.055,.72,.065);box(pale,px,h+1.56,front+.3,.72,.055,.065);
  box(trim,px,h+2.17,front+.12,.33,.42,.24);
  beam([px,h+rise,front],[px,h+rise+.28,front],.045,dark,'Jarman gable finial');
  const pipe=px-w/2-.13;
  beam([pipe,8.4,z+.29],[pipe,7.95,front+.27],.055,blue,'Jarman rainwater offset');
  beam([pipe,7.95,front+.27],[pipe,.25,front+.27],.055,blue,'Jarman downpipe');
 }
 // The final broad stack encloses the old host stack and pots; host roof stays fixed.
 for(const [f,top,w] of [[.16,12.6,2.8],[.33,12.05,2.9],[.51,11.65,2.45],[.78,13.4,2.8]]){
  const px=x(f),pz=host.z,base=9.5;
  wall(px,(base+top)/2,pz,w,top-base,1.6,'Jarman broad chimney stack');
  for(const y of [top-.85,top-.1,top+.06])box(trim,px,y,pz,w+.26,.15,1.86);
  for(const sign of [-1,1]){box(dark,px,top-.45,pz+sign*.815,w*.54,.58,.045);for(let i=0;i<5;i++)box(lead,px,top-.68+i*.11,pz+sign*.85,w*.54,.026,.04);}
 }
 const vw=veranda.right-veranda.left,vc=(veranda.left+veranda.right)/2,vf=veranda.front,door=veranda.left+vw*.61,doorW=1.65;
 wall(vc,.53,(veranda.back+vf)/2,vw,1.06,vf-veranda.back,'Jarman veranda brick plinth');
 const panel=(a,b)=>{const n=Math.ceil((b-a)/2.1);for(let i=0;i<n;i++)sash(a+(i+.5)*(b-a)/n,2.02,vf,(b-a)/n-.10,1.82,'Jarman veranda glazing');};
 panel(veranda.left,door-doorW/2-.09);panel(door+doorW/2+.09,veranda.right);
 box(blue,door,1.47,vf+.15,doorW,2.94,.13);box(glass,door,2.10,vf+.23,doorW-.26,1.28,.08);
 box(pale,door,1.41,vf+.30,doorW-.16,.065,.065);box(pale,door-doorW*.30,1.32,vf+.32,.12,.06,.06);
 for(const px of [veranda.left,veranda.right,door-doorW/2-.09,door+doorW/2+.09])box(blue,px,1.62,vf+.23,.12,3.24,.13);
 for(const px of [veranda.left+vw*.2,veranda.left+vw*.4,veranda.left+vw*.79])box(blue,px,1.62,vf+.23,.09,3.24,.13);
 // Glazed returns close the exposed ends beneath the sloping lean-to roof.
 for(const px of [veranda.left,veranda.right]){
  const start=front+.1,end=vf,centre=(start+end)/2,length=end-start;
  box(glass,px,2.02,centre,.075,1.82,length);
  for(const y of [1.11,2.02,2.93])box(pale,px, y,centre,.14,.065,length+.1);
  for(let pz=start;pz<=end+.01;pz+=length/7)box(pale,px,2.02,pz,.14,1.82,.035);
  for(const y of [1.56,2.47])box(pale,px,y,centre,.14,.035,length);
  for(const pz of [start,end])box(blue,px,1.62,pz,.13,3.24,.13);
 }
 const backY=4.28,frontY=3.14,depth=vf-z+.35;
 const cap=mesh(new THREE.BoxGeometry(vw+.5,.10,Math.hypot(depth,backY-frontY)),lead,vc,(backY+frontY)/2,(z+vf)/2,'Jarman veranda metal roof');cap.rotation.x=Math.atan2(backY-frontY,depth);
 for(let px=veranda.left;px<=veranda.right;px+=1.02)beam([px,backY+.08,z-.16],[px,frontY+.08,vf+.18],.025,lead,'Jarman veranda roof seam');
 box(dark,vc,4.30,z+.10,vw+.4,.15,.18);box(blue,vc,3.15,vf+.24,vw+.6,.16,.20);
 const paving=material(0x737872);box(paving,vc,.025,vf+.95,vw+1.4,.05,1.65);
 for(const px of [door-1.0,door+1.0]){
  beam([px,.05,vf+.4],[px,.92,vf+.4],.045,blue,'Jarman entrance handrail');
  beam([px,.92,vf+.4],[px,.92,vf+1.65],.045,blue,'Jarman entrance handrail');
  beam([px,.92,vf+1.65],[px,.05,vf+1.65],.045,blue,'Jarman entrance handrail');
 }
 const dummy=new THREE.Object3D();
 for(const [mat,items] of batches){const o=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,items.length);o.name='Jarman frontage window and brick details';o.castShadow=true;o.receiveShadow=true;o.userData.orientedCollision=true;items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.updateMatrix();o.setMatrixAt(i,dummy.matrix);});group.add(o);}
 group.userData.openings=openings;group.userData.veranda=veranda;
 group.userData.reference={photo:'Research/jarman/img1.jpg',secondPhoto:'Research/jarman/jarman3.jpg',camera:'Research/jarman/img1-loc.png'};
 return group;
}

