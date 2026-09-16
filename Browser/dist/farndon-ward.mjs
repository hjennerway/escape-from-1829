import {photoDetailPrimitives} from './photo-detail-primitives.mjs';

// The corrected blue outline in img1.png overrides the older OS silhouette.
// See Tools/register_farndon.mjs and Research/farndon/README.md.
export const FARNDON=Object.freeze({x:173.7,z:-160.8,eave:4.6,storeys:1,layout:'historic',
 reference:'Research/farndon/README.md'});
export const FARNDON_FOOTPRINT=Object.freeze([
 [194.3,-141.3],[186.4,-141.3],[186.4,-152.7],
 [174.3,-152.7],[174.3,-148],[175.3,-148],[175.3,-140.3],
 [167.4,-140.3],[167.4,-148],[169.7,-148],[169.7,-152.7],
 [159,-152.7],[159,-147.3],[149.3,-147.3],[149.3,-179],
 [158,-179],[158,-160.9],[184.2,-160.9],[184.2,-181.2],
 [194.3,-181.2],[194.3,-160.6],[198.1,-160.6],[198.1,-153.7],[194.3,-153.7]
].map(p=>Object.freeze(p)));
export const FARNDON_VIEWS=Object.freeze({
 farndon:{position:[209,57,-224],target:[173.7,1.8,-159],fov:48},
 'farndon-plan':{position:[173.7,96,-160.81],target:[173.7,0,-160.8],fov:46},
 'farndon-site':{position:[147,195,-269],target:[147,0,-137],fov:54},
 // Yellow dot is beyond the open garden, looking towards the transverse range.
 'farndon-2':{position:[176,1.9,-214],target:[172,2.9,-160.9],fov:58}
});
export const FARNDON_ROOFS=Object.freeze([
 {name:'Transverse ward range',rect:[149.3,-160.9,194.3,-152.7],axis:'x',rise:2.15},
 {name:'West garden wing',rect:[184.2,-181.2,194.3,-152.7],axis:'z',rise:2.65,gableStart:true},
 {name:'West rear wing',rect:[186.4,-156.8,194.3,-141.3],axis:'z',rise:2.1},
 {name:'East garden wing',rect:[149.3,-179,158,-152.7],axis:'z',rise:2.28,gableStart:true},
 {name:'East rear wing',rect:[149.3,-160.9,159,-147.3],axis:'z',rise:2.5},
 {name:'Rear room link',rect:[169.7,-152.7,174.3,-147.7],axis:'z',rise:1.05,eave:3.3},
 {name:'Small rear room',rect:[167.4,-148,175.3,-140.3],axis:'x',rise:1.85,eave:4.1}
]);
export function createFarndon(THREE,{brick,roof,worldUV,material}){
 const building=new THREE.Group();building.name='Farndon ward';
 const {x:cx,z:cz,eave}=FARNDON;building.position.set(cx,0,cz);
 brick=brick.clone();brick.color.set(0xe2c9b7);
 const white=material(0xc8c7b7),steel=material(0x354344),red=material(0x86503c),plinth=material(0x66564a);
 const batches=new Map(),openings=[],roofSurfaces=[];
 function mesh(g,m,x=0,y=0,z=0,name=''){
  const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=true;o.receiveShadow=true;building.add(o);return o;
 }
 function box(m,x,y,z,w,h,d,r=0){
  if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,w,h,d,r});
 }
 const local=points=>points.map(([x,z])=>[x-cx,z-cz]);
 function mass(points,height,mat,name,bottom=0){
  const p=local(points),shape=new THREE.Shape(p.map(([x,z])=>new THREE.Vector2(x,-z)));
  const g=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});g.rotateX(-Math.PI/2);
  const o=mesh(worldUV(g,1.7),mat,0,bottom,0,name);o.userData.collisionFootprint=p;return o;
 }
 const main=FARNDON_FOOTPRINT.filter((_,i)=>!(i>=3&&i<=10)&&i!==21&&i!==22);
 const room=[[167.4,-148],[175.3,-148],[175.3,-140.3],[167.4,-140.3]];
 const link=[[169.7,-152.7],[174.3,-152.7],[174.3,-148],[169.7,-148]];
 const side=[[194.3,-160.6],[198.1,-160.6],[198.1,-153.7],[194.3,-153.7]];
 for(const [p,h,name] of [[main,eave,'Single-storey ward walls'],[room,4.1,'Small rear room'],[link,3.3,'Narrow rear link'],[side,3.25,'Low west side room']]){
  mass(p,h,brick,name).userData.historicOutlinePadding=.6;mass(p,.3,plinth,name+' plinth');
 }
 const detail=photoDetailPrimitives(THREE,{model:building,box,mesh,white,steel,material});
 function sash(wx,wz,r,w=1.32,h=2.85,y=2.24){
  const x=wx-cx,z=wz-cz;
  detail.sash('Farndon tall multi-pane sash',x,y,z,r,w,h);
  box(red,x+Math.sin(r)*.075,y+h/2+.17,z+Math.cos(r)*.075,w+.31,.18,.19,r);
  openings.push({x,y,z,r,w,h});
 }
 function door(wx,wz,r){detail.door(wx-cx,wz-cz,r);}
 function trim(a,b,height=eave){
  const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=dz/len,nz=-dx/len,r=Math.atan2(nx,nz);
  const at=(m,y,h,d,n)=>box(m,(a[0]+b[0])/2-cx+nx*n,y,(a[1]+b[1])/2-cz+nz*n,len,h,d,r);
  at(brick,height-.27,.2,.22,.075);at(red,height-.53,.12,.18,.04);at(steel,height+.015,.115,.2,.13);
  for(let t=.2;t<len;t+=.43)box(red,a[0]+dx*t/len-cx+nx*.09,height-.4,a[1]+dz*t/len-cz+nz*.09,.18,.15,.23,r);
 }
 // Walk the corrected external perimeter. The ground-photo gable ends are
 // plain brick; the garden cross-range and inward returns carry the tall sashes.
 for(let i=0;i<FARNDON_FOOTPRINT.length;i++){
  const a=FARNDON_FOOTPRINT[i],b=FARNDON_FOOTPRINT[(i+1)%FARNDON_FOOTPRINT.length];
  const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=dz/len,nz=-dx/len,r=Math.atan2(nx,nz);
  const h=i>=3&&i<=9?(i===3||i===9?3.3:4.1):i>=20&&i<=22?3.25:eave;
  trim(a,b,h);
  const frontCross=i===16,plainGable=i===14||i===18;
  if(plainGable)continue;
  const count=Math.max(0,Math.floor((len-.7)/(frontCross?3.05:3.3)));
  for(let n=0;n<count;n++){
   const t=(n+.5)/count,wx=a[0]+dx*t+nx*.03,wz=a[1]+dz*t+nz*.03;
   if((i===16&&n===count-1)||(i===17&&n===count-1)||(i===11&&n===0)){door(wx,wz,r);continue;}
   if(h<3.5)sash(wx,wz,r,1.1,1.8,1.8);
   else sash(wx,wz,r,1.32,h===4.1?2.4:2.85,h===4.1?2.0:2.24);
  }
  if(len>7)box(steel,a[0]+dx*.06-cx+nx*.18,h/2,a[1]+dz*.06-cz+nz*.18,.08,h,.08);
 }
 function surface(v,faces,mat,name,up=false){
  const p=[],uv=[];
  for(const f of faces){
   const tri=f.map(i=>v[i]);
   if(up){const a=new THREE.Vector3(...tri[0]),normal=new THREE.Vector3().crossVectors(new THREE.Vector3(...tri[1]).sub(a),new THREE.Vector3(...tri[2]).sub(a));if(normal.y<0)tri.reverse();}
   for(const [x,y,z] of tri){p.push(x,y,z);uv.push(x/2,(z+y)/2);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
  const o=mesh(g,mat,0,0,0,name);if(up)roofSurfaces.push(o);return o;
 }
 const rod=(a,b,r=.055,mat=red)=>detail.rod(a,b,r,mat);
 for(const spec of FARNDON_ROOFS){
  const [wx0,wz0,wx1,wz1]=spec.rect,x0=wx0-cx-.16,x1=wx1-cx+.16,z0=wz0-cz-.16,z1=wz1-cz+.16;
  const y=spec.eave??eave,top=y+spec.rise,alongX=spec.axis==='x',inset=Math.min(x1-x0,z1-z0)*.44;
  const v=[[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1],
   ...(alongX?[[x0+inset,top,(z0+z1)/2],[x1-inset,top,(z0+z1)/2]]:[[(x0+x1)/2,top,z0+(spec.gableStart?0:inset)],[(x0+x1)/2,top,z1-inset]])];
  const faces=alongX?[[0,1,5],[0,5,4],[2,3,4],[2,4,5],[1,2,5],[3,0,4]]:[[1,2,5],[1,5,4],[3,0,4],[3,4,5],[2,3,5],...spec.gableStart?[]:[[0,1,4]]];
  surface(v,faces,roof,spec.name+' slate roof',true);
  if(spec.gableStart){
   const g=surface(v,[[0,1,4]],brick,spec.name+' plain brick gable');g.material=brick.clone();g.material.side=THREE.DoubleSide;worldUV(g.geometry,1.7);
   rod(v[0],v[4],.075);rod(v[1],v[4],.075);
  }
  rod(v[4],v[5],.075);
 }
 // Central triangular garden gable in img2: its face stays on the marked wall.
 const gx=171.1-cx,gz=-160.94-cz;
 const gv=[[gx-3.5,eave,gz],[gx+3.5,eave,gz],[gx,6.7,gz],[gx,6.75,-156.8-cz]];
 const gable=surface(gv,[[0,2,1]],brick,'Central garden brick gable');gable.material=brick.clone();gable.material.side=THREE.DoubleSide;worldUV(gable.geometry,1.7);
 surface(gv,[[0,2,3],[1,3,2]],roof,'Central garden gable slate roof',true);rod(gv[0],gv[2],.085);rod(gv[1],gv[2],.085);
 // Small side-room roof falls away from the main west wall.
 const sv=[[194.3-cx,3.75,-160.76-cz],[198.27-cx,3.32,-160.76-cz],[198.27-cx,3.32,-153.54-cz],[194.3-cx,3.75,-153.54-cz]];
 surface(sv,[[0,1,2],[0,2,3]],roof,'West side-room lean-to slate roof',true);
 for(const z of [-160.6,-153.7])surface([[194.3-cx,3.25,z-cz],[198.1-cx,3.25,z-cz],[198.1-cx,3.34,z-cz],[194.3-cx,3.75,z-cz]],[[0,1,2],[0,2,3]],brick,'Side-room roof closure').material.side=THREE.DoubleSide;
 // Slender gable-end stacks and a small rear flue are visible in the references.
 for(const [wx,wz,h] of [[189.25,-180.55,8.0],[153.65,-178.4,7.5],[189.6,-145.1,7.2]]){
  const x=wx-cx,z=wz-cz;
  mesh(worldUV(new THREE.BoxGeometry(.85,h-eave, .85),1.7),brick,x,(h+eave)/2,z,'Farndon brick chimney');
  for(const [offset,w] of [[.3,1.02],[.1,1.1]])box(red,x,h-offset,z,w,.16,w);
  box(steel,x,h+.005,z,.79,.05,.79);
 }
 const dummy=new THREE.Object3D();
 for(const [mat,items] of batches){
  const batch=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,items.length);batch.name='Farndon sashes, doors, masonry and rainwater goods';batch.castShadow=true;batch.receiveShadow=true;batch.userData.orientedCollision=true;
  items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.rotation.set(0,b.r,0);dummy.scale.set(b.w,b.h,b.d);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});building.add(batch);
 }
 building.userData={...building.userData,source:FARNDON,storeys:1,footprint:FARNDON_FOOTPRINT,openings,roofs:FARNDON_ROOFS,
  // Both connecting OS corridor edges remain; only the selected ward retires.
  replacedOSEdges:{sourceBuilding:0,sourceLoop:0,indices:Array.from({length:13},(_,i)=>154+i)}};
 return building;
}



