import {readFileSync,writeFileSync} from 'node:fs';
const edit=(path,fn)=>{const url=new URL(path,import.meta.url);writeFileSync(url,fn(readFileSync(url,'utf8')));};
const replace=(s,a,b)=>{if(!s.includes(a))throw Error('Missing edit anchor: '+a);return s.replace(a,b);};

edit('../dist/annexe-carden-detail.mjs',s=>{
 if(!s.includes('export function refineCardenSpine'))throw Error('Correction has already been applied');
 s=s.slice(0,s.indexOf('export function refineCardenSpine'))+s.slice(s.indexOf('export function addCardenElevation'));
 s=replace(s,'{model,brick,roof,material,worldUV,hipRoof}','{model,hall,ranges,frontDormers,brick,roof,material,worldUV,hipRoof}');
 s=s.slice(0,s.indexOf(' function gable'))+String.raw`
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
 for(const dx of [-2.1,2.1])window('Carden tower high rear sash',tower.x+dx,18.4,towerBack-.06,1.05,1.75,Math.PI);

 function polygonWall(points,height,name){
  const sh=new THREE.Shape();points.forEach(([x,z],i)=>i?sh.lineTo(x,-z):sh.moveTo(x,-z));sh.closePath();
  const g=new THREE.ExtrudeGeometry(sh,{depth:height,bevelEnabled:false});g.rotateX(-Math.PI/2);
  const o=mesh(worldUV(g,1.7),brick,0,0,0,name);o.userData.collisionFootprint=points;return o;
 }
 // Purple outline: the wall runs back from the tower, then the conservatory
 // projects with clipped corners before stepping inward to the service range.
 const sideFootprint=[[8.1,-8.1],[29.17,-8.1],[29.17,-18],[20.3,-18],[20.3,-32.75],[8.1,-32.75]];
 polygonWall(sideFootprint,4.7,'Carden stepped low side range brick walls');
 hip(18.635,-13.05,21.07,9.9,4.7,1.9,'Carden tower side link slate roof');
 hip(14.2,-25.375,12.2,14.75,4.7,1.9,'Carden low side range slate roof');
 window('Carden low side sash',29.205,2.5,-12.4,1.6,3.0,Math.PI/2,{bars:false});
 window('Carden low side sash',20.335,2.5,-31.3,1.4,3.0,Math.PI/2,{bars:false});
 for(const [x,z,length] of [[29.17,-13.05,9.9],[20.3,-31.375,2.75]]){
  for(const y of [.25,4.4])box(trim,x+.08,y,z,.22,y<1?.5:.6,length);
  box(blue,x+.3,4.75,z,.15,.14,length+.4);
 }
 for(const [x,z] of [[29.48,-8.4],[29.48,-17.7],[20.61,-32.5]])box(blue,x,2.3,z,.1,4.6,.1);
 for(const z of [-39,-49,-59])window('Carden service side sash',22.724,1.85,z,1.35,2.5,Math.PI/2,{bars:false});
 box(trim,22.77,3.34,-46.9,.2,.42,30.1);

 // Exact translated outline of the removed blue-circled bay: 11 by 12,
 // including both 3 by 3 clipped corners, now used for the glazed conservatory.
 const porchPoints=[[20.3,-30],[28.3,-30],[31.3,-27],[31.3,-21],[28.3,-18],[20.3,-18]];
 polygonWall(porchPoints,1.2,'Carden canted conservatory brick plinth');
 for(let i=0;i<porchPoints.length;i++){
  const p=porchPoints[i],q=porchPoints[(i+1)%porchPoints.length],dx=q[0]-p[0],dz=q[1]-p[1],length=Math.hypot(dx,dz),r=Math.atan2(dz,-dx);
  beam([p[0],4.45,p[1]],[q[0],4.45,q[1]],.12,pale,'Carden conservatory eave');
  if(i>=4)continue; // These two edges meet the brick side range.
  const count=Math.max(1,Math.round(length/1.8));
  for(let k=0;k<count;k++){
   const f=(k+.5)/count,x=p[0]+f*dx,z=p[1]+f*dz;
   window('Carden conservatory light',x+Math.sin(r)*.04,2.8,z+Math.cos(r)*.04,length/count-.13,3.05,r,{bars:false});
   box(pale,x,3.7,z,length/count,.075,.1,r);
  }
  for(let k=0;k<=count;k++){const f=k/count;box(pale,p[0]+f*dx,2.8,p[1]+f*dz,.12,3.25,.12);}
 }
 const ridge=[22.3,6.1,-24],vertices=[],uv=[];
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
`;
 return s;
});
edit('../dist/annexe-oakmere-detail.mjs',s=>s.replace("import {refineCardenSpine} from './annexe-carden-detail.mjs';\n",'').replace(' refineCardenSpine(upper,mainCap);',''));
edit('../dist/annexe-os-refinement.mjs',s=>{
 s=replace(s,"'Central rear spine':[-5,-20,5,-5]","'Central rear spine':[-5,-20,5,-12]");
 return replace(s,"  {name:'Rear court west range'","  {name:'Central rear low hall link',rect:[-5,-12,5,-5],h:4.7,rise:1.5,kitchen:true},\n  {name:'Rear court west range'");
});
edit('../dist/annexe.mjs',s=>{
 s=replace(s,' // Three round-headed, pedimented dormers above the low entrance roof.'," const frontDormerStart=model.children.length,frontDormerBatches=new Map([...batches].map(([m,items])=>[m,items.length]));\n // Three round-headed, pedimented dormers above the low entrance roof.");
 s=replace(s," for(const x of [-8,8])sash('Entrance range'", " const frontDormers={meshes:model.children.slice(frontDormerStart),batches:[...batches].map(([material,items])=>({material,items:items.slice(frontDormerBatches.get(material)??0)})).filter(b=>b.items.length),openings:openings.filter(o=>o.name==='Hall dormer')};\n for(const x of [-8,8])sash('Entrance range'");
 s=replace(s,"eastSide.traverse(o=>{o.name=o.name.replace(/^West /,'East ');});model.add(eastSide);", "eastSide.traverse(o=>{o.name=o.name.replace(/^West /,'East ');});\n // The latest annotation removes the mirrored east bay, retaining its stairs.\n for(const o of [...eastSide.children])if(/canted bay/.test(o.name))eastSide.remove(o);\n model.add(eastSide);");
 s=s.replace(/ for\(const \[mat,items\] of batches\)for\(const item of items\.slice\(sideBatchStarts\.get\(mat\)\?\?0\)\)items\.push\([^\n]+\n/,'');
 s=s.replace(/ for\(const o of openings\.slice\(sideOpeningStart\)\)openings\.push\([^\n]+\n/,'');
 s=s.replace('const sideMeshStart=model.children.length,sideOpeningStart=openings.length;','const sideMeshStart=model.children.length;').replace(/ const sideBatchStarts=[^\n]+\n/,'');
 return replace(s,'addCardenElevation(THREE,{model,brick,roof,material,worldUV,hipRoof})','addCardenElevation(THREE,{model,hall,ranges,frontDormers,brick,roof,material,worldUV,hipRoof})');
});
console.log('Applied annotated Carden tower, bay, footprint and rear-hall corrections.');
