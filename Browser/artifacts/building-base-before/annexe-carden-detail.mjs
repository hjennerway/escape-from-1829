import {ANNEXE_TOWER_HEIGHT_SCALE} from './annexe-tower-height.mjs';
// The circled towers and belfry register the east/rear lawn elevation.
export const CARDEN_REFERENCE=Object.freeze({photo:'Research/carden-picton/img1.jpg',landmarks:'Research/carden-picton/img1-annotated.jpg',camera:'Research/carden-picton/img1-loc.png'});

export function addCardenElevation(THREE,{model,hall,ranges,frontDormers,brick,roof,material,worldUV,hipRoof}){
 const group=new THREE.Group();group.name='Carden side elevation';group.userData.reference=CARDEN_REFERENCE;model.add(group);
 const trim=material(0x9d4935),pale=material(0xdce0d4),blue=material(0x285575),lead=material(0xa5aeb0),glass=material(0x334c50,{roughness:.4,metalness:.12});
 const batches=new Map(),openings=[],roofs=[];
 function mesh(g,m,x,y,z,name){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=true;o.receiveShadow=true;group.add(o);return o;}
 function wall(x,y,z,w,h,d,name){const o=mesh(worldUV(new THREE.BoxGeometry(w,h,d),1.7),brick,x,y,z,name);o.userData.orientedCollision=true;return o;}
 function box(m,x,y,z,w,h,d,r=0){if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,w,h,d,r});}
 function beam(a,b,width,m,name){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p);const o=mesh(new THREE.CylinderGeometry(width/2,width/2,v.length(),6),m,...p.add(q).multiplyScalar(.5).toArray(),name);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 function hip(x,z,w,d,y,rise,name){const o=hipRoof(x,z,w,d,y,rise);group.add(o);o.name=name;roofs.push(o);return o;}
 function window(name,x,y,z,w,h,r=0,{arched=false,bars=true}={}){
  const c=Math.cos(r),s=Math.sin(r),part=(m,u,v,n,pw,ph,pd)=>box(m,x+c*u+s*n,y+v,z-s*u+c*n,pw,ph,pd,r);
  const radius=w/2,shoulder=arched?h/2-radius:h/2;openings.push({name,x,y,z,w,h,r,arched});
  if(arched){
   const shape=new THREE.Shape();shape.moveTo(-radius,-h/2);shape.lineTo(radius,-h/2);shape.lineTo(radius,shoulder);shape.absarc(0,shoulder,radius,0,Math.PI);shape.closePath();
   const pane=mesh(new THREE.ShapeGeometry(shape),glass,x+s*.08,y,z+c*.08,name+' glazing');pane.rotation.y=r;
   const pts=[];for(let i=0;i<=24;i++){const t=i*Math.PI/24;pts.push(new THREE.Vector3(x+c*radius*Math.cos(t)+s*.15,y+shoulder+radius*Math.sin(t),z-s*radius*Math.cos(t)+c*.15));}
   mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.045,6,false),pale,0,0,0,name+' arched frame');
  }else part(glass,0,0,.08,w,h,.08);
  for(const u of [-w/2,w/2])part(pale,u,(shoulder-h/2)/2,.15,.07,shoulder+h/2,.08);
  part(pale,0,-h/2,.15,w+.1,.07,.1);if(!arched)part(pale,0,h/2,.15,w+.1,.07,.1);
  if(bars){
   for(const u of [-w/6,w/6]){const top=arched?shoulder+Math.sqrt(radius*radius-u*u):h/2;part(pale,u,(top-h/2)/2,.16,.04,top+h/2,.07);}
   for(let v=-h/2+.7;v<=shoulder;v+=.7)part(pale,0,v,.16,w,.035,.07);
  }
  part(trim,0,-h/2-.10,.12,w+.25,.15,.25);
 }

 // Copy the actual three front assemblies through the hall ridge. Their
 // geometry/materials stay shared, so the rear is an exact counterpart.
 const rear=new THREE.Group();rear.name='Annexe rear hall dormers';rear.position.z=2*hall.z;rear.scale.z=-1;group.add(rear);
 for(const original of frontDormers.meshes){const copy=original.clone();copy.name=copy.name.replace(/^Hall dormer/,'Rear hall dormer');rear.add(copy);}
 const dummy=new THREE.Object3D();
 function instances(mat,items,name,parent){
  const o=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,items.length);o.name=name;o.castShadow=true;o.receiveShadow=true;o.userData.orientedCollision=true;
  items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.rotation.set(0,b.r??0,0);dummy.scale.set(b.w,b.h,b.d);dummy.updateMatrix();o.setMatrixAt(i,dummy.matrix);});parent.add(o);return o;
 }
 for(const b of frontDormers.batches)instances(b.material,b.items,'Rear hall dormer facade details',rear);
 const rearOpenings=frontDormers.openings.map(o=>({...o,name:'Rear hall dormer',z:2*hall.z-o.z,r:Math.PI}));
 openings.push(...rearOpenings);rear.userData.openings=rearOpenings;

 // The two red marks are small high-level sashes on the tower's rear face.
 const tower=ranges.find(b=>b.name==='East square tower'),towerBack=tower.z-tower.d/2;
 for(const dx of [-2.1,2.1])window('Carden tower high rear sash',tower.x+dx,18.4*ANNEXE_TOWER_HEIGHT_SCALE,towerBack-.06,1.05,1.75*ANNEXE_TOWER_HEIGHT_SCALE,Math.PI);

 function polygonWall(points,height,name){
  const sh=new THREE.Shape();points.forEach(([x,z],i)=>i?sh.lineTo(x,-z):sh.moveTo(x,-z));sh.closePath();
  const g=new THREE.ExtrudeGeometry(sh,{depth:height,bevelEnabled:false});g.rotateX(-Math.PI/2);
  const o=mesh(worldUV(g,1.7),brick,0,0,0,name);o.userData.collisionFootprint=points;return o;
 }
 // Purple outline: the wall runs back from the tower, then the conservatory
 // projects with clipped corners before stepping inward to the service range.
 const sideFootprint=[[8.1,-8.1],[29.17,-8.1],[29.17,-18],[20.3,-18],[20.3,-32.75],[8.1,-32.75]];
 polygonWall(sideFootprint,4.7,'Carden stepped low side range brick walls');
 const rearLink={x:24.735,z:-27.25,w:8.87,d:18.5,h:4.7,rise:1.9};
 group.userData.conservatoryRearLink=rearLink;
 wall(rearLink.x,rearLink.h/2,rearLink.z,rearLink.w,rearLink.h,rearLink.d,'Carden conservatory low rear link brick walls');
 hip(rearLink.x,rearLink.z,rearLink.w,rearLink.d,rearLink.h,rearLink.rise,'Carden conservatory low rear link slate roof');
 hip(18.635,-13.05,21.07,9.9,4.7,1.9,'Carden tower side link slate roof');
 hip(14.2,-25.375,12.2,14.75,4.7,1.9,'Carden low side range slate roof');
 window('Carden low side sash',29.205,2.5,-12.4,1.6,3.0,Math.PI/2,{bars:false});
 window('Carden low rear sash',24.735,2.5,-36.535,1.4,3.0,Math.PI,{bars:false});
 for(const [x,z,length] of [[29.17,-13.05,9.9],[20.3,-31.375,2.75]]){
  for(const y of [.25,4.4])box(trim,x+.08,y,z,.22,y<1?.5:.6,length);
  box(blue,x+.3,4.75,z,.15,.14,length+.4);
 }
 for(const [x,z] of [[29.48,-8.4],[29.48,-17.7],[20.61,-32.5]])box(blue,x,2.3,z,.1,4.6,.1);
 for(const z of [-39,-49,-59])window('Carden service side sash',22.724,1.85,z,1.35,2.5,Math.PI/2,{bars:false});
 box(trim,22.77,3.34,-46.9,.2,.42,30.1);

 // Tower-side gabled range: its outer wall shares the moved conservatory's
 // rear edge; its three sashes occupy the exposed section beside the tower.
 const wing={x0:20.3,x1:29.17,z0:-21,z1:towerBack,eave:12.4*ANNEXE_TOWER_HEIGHT_SCALE,rise:3.2*ANNEXE_TOWER_HEIGHT_SCALE};
 const centre=(wing.x0+wing.x1)/2,width=wing.x1-wing.x0,depth=wing.z1-wing.z0;
 wall(centre,wing.eave/2,(wing.z0+wing.z1)/2,width,wing.eave,depth,'Carden tower gabled range brick walls');
 const gableShape=new THREE.Shape();gableShape.moveTo(-width/2,0);gableShape.lineTo(width/2,0);gableShape.lineTo(0,wing.rise);gableShape.closePath();
 mesh(worldUV(new THREE.ExtrudeGeometry(gableShape,{depth,bevelEnabled:false}),1.7),brick,centre,wing.eave,wing.z0,'Carden tower range brick gable');
 const roofVertices=[],roofUV=[];
 for(const side of [-1,1]){
  const edge=centre+side*(width/2+.22),lo=wing.z0-.22,hi=wing.z1+.22;
  const points=side<0?[[edge,wing.eave,lo],[edge,wing.eave,hi],[centre,wing.eave+wing.rise,hi],[edge,wing.eave,lo],[centre,wing.eave+wing.rise,hi],[centre,wing.eave+wing.rise,lo]]:[[centre,wing.eave+wing.rise,lo],[centre,wing.eave+wing.rise,hi],[edge,wing.eave,hi],[centre,wing.eave+wing.rise,lo],[edge,wing.eave,hi],[edge,wing.eave,lo]];
  for(const p of points){roofVertices.push(...p);roofUV.push(p[0]/3,(p[2]+p[1])/3);}
  for(const z of [lo,hi])beam([edge,wing.eave,z],[centre,wing.eave+wing.rise,z],.16,trim,'Carden tower range gable verge');
  box(blue,edge,wing.eave,(lo+hi)/2,.14,.14,hi-lo);
 }
 const wingCap=new THREE.BufferGeometry();wingCap.setAttribute('position',new THREE.Float32BufferAttribute(roofVertices,3));wingCap.setAttribute('uv',new THREE.Float32BufferAttribute(roofUV,2));wingCap.computeVertexNormals();
 roofs.push(mesh(wingCap,roof,0,0,0,'Carden tower gabled range slate roof'));
 for(const z of [-10.2,-13.1,-16])window('Carden tower range sash',wing.x1+.035,9.2*ANNEXE_TOWER_HEIGHT_SCALE,z,1.35,3.4*ANNEXE_TOWER_HEIGHT_SCALE,Math.PI/2);
 for(const y of [.25,4.4,wing.eave-.22])box(trim,wing.x1+.08,y,(wing.z0+wing.z1)/2,.2,.35,depth);
 group.userData.towerRange=wing;

 // Exact translated outline of the removed blue-circled bay: 11 by 12,
 // including both 3 by 3 clipped corners, now used for the glazed conservatory.
 const conservatoryShift=29.17-20.3;
 const porchPoints=[[20.3,-30],[28.3,-30],[31.3,-27],[31.3,-21],[28.3,-18],[20.3,-18]].map(([x,z])=>[x+conservatoryShift,z]);
 polygonWall(porchPoints,1.2,'Carden canted conservatory brick plinth');
 for(let i=0;i<porchPoints.length;i++){
  const p=porchPoints[i],q=porchPoints[(i+1)%porchPoints.length],dx=q[0]-p[0],dz=q[1]-p[1],length=Math.hypot(dx,dz),r=Math.atan2(dz,-dx);
  beam([p[0],4.45,p[1]],[q[0],4.45,q[1]],.12,pale,'Carden conservatory eave');
  if(i===5)continue; // Only the rear edge now meets the new gabled range.
  const count=Math.max(1,Math.round(length/1.8));
  for(let k=0;k<count;k++){
   const f=(k+.5)/count,x=p[0]+f*dx,z=p[1]+f*dz;
   window('Carden conservatory light',x+Math.sin(r)*.04,2.8,z+Math.cos(r)*.04,length/count-.13,3.05,r,{bars:false});
   box(pale,x,3.7,z,length/count,.075,.1,r);
  }
  for(let k=0;k<=count;k++){const f=k/count;box(pale,p[0]+f*dx,2.8,p[1]+f*dz,.12,3.25,.12);}
 }
 const ridge=[22.3+conservatoryShift,6.1,-24],vertices=[],uv=[];
 for(let i=0;i<porchPoints.length;i++){
  const a=[porchPoints[i][0],4.5,porchPoints[i][1]],b=[porchPoints[(i+1)%porchPoints.length][0],4.5,porchPoints[(i+1)%porchPoints.length][1]];
  for(const p of [a,ridge,b]){vertices.push(...p);uv.push(p[0]/3,p[2]/3);}
  beam(a,ridge,.10,pale,'Carden conservatory hip glazing bar');
  const count=Math.max(1,Math.round(Math.hypot(a[0]-b[0],a[2]-b[2])/1.8));
  for(let k=1;k<count;k++){const f=k/count;beam([a[0]+f*(b[0]-a[0]),4.53,a[2]+f*(b[2]-a[2])],ridge,.065,pale,'Carden conservatory roof glazing rib');}
 }
 const cap=new THREE.BufferGeometry();cap.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));cap.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));cap.computeVertexNormals();
 roofs.push(mesh(cap,glass,0,0,0,'Carden canted conservatory roof'));
 for(const [mat,items] of batches)instances(mat,items,'Carden windows and trim',group);
 group.userData.openings=openings;group.userData.roofNames=roofs.map(o=>o.name);group.userData.conservatoryFootprint=porchPoints;group.userData.sideFootprint=sideFootprint;group.userData.rearDormers=rear;
 return group;
}
