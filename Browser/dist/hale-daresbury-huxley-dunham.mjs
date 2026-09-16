import {photoDetailPrimitives} from './photo-detail-primitives.mjs';
import {HALE_CORRIDOR_RUNS} from './hale-corridors.mjs';
import {FARNDON_CORRIDOR} from './farndon-corridor.mjs';

// The green strokes describe ward ranges in an oblique aerial, not screen-
// space angles. Fit them to the estate axes between Grafton and the tower.
// The existing OS spine locates the range; the green guide sets its branches.
export const HALE_WARD=Object.freeze({name:'Hale/Daresbury/Huxley/Dunham',
 x:118.7,z:-111,eave:8.4,storeys:2,layout:'historic',
 reference:'Research/hale-daresbury-huxley-dunham/README.md'});
export const HALE_WARD_FOOTPRINT=Object.freeze([
 [95.62,-140.89],[121.86,-140.89],[121.86,-131],[131,-131],
 [131,-123],[121.86,-123],[121.86,-111.71],[137,-111.71],
 [137,-103.7],[121.86,-103.7],[121.86,-89.11],[145,-89.11],
 [145,-81.2],[83.8,-81.2],[83.8,-89.11],[112.54,-89.11],
 [112.54,-132],[95.62,-132]
].map(p=>Object.freeze(p)));
export const HALE_WARD_ROOFS=Object.freeze([
 {name:'Tower-side cross range',rect:[83.8,-89.11,145,-81.2],axis:'x',rise:2.25},
 {name:'Connecting spine',rect:[112.54,-140.89,121.86,-81.2],axis:'z',rise:2.65},
 {name:'Middle courtyard wing',rect:[112.54,-111.71,137,-103.7],axis:'x',rise:2.3},
 {name:'Grafton-side courtyard wing',rect:[112.54,-131,131,-123],axis:'x',rise:2.3},
 {name:'Opposite end return',rect:[95.62,-140.89,121.86,-132],axis:'x',rise:2.5}
]);
export const HALE_WARD_VIEWS=Object.freeze({
 'hale-daresbury-huxley-dunham':{position:[62,89,-210],target:[119,2,-111],fov:48},
 'hale-daresbury-huxley-dunham-plan':{position:[118.7,113,-110.99],target:[118.7,0,-111],fov:46},
 'hale-daresbury-huxley-dunham-site':{position:[33,183,-291],target:[114,3,-115],fov:48},
 'hale-daresbury-huxley-dunham-courts':{position:[193,58,-118],target:[126,4,-110],fov:48},
 'hale-daresbury-huxley-dunham-ground':{position:[137,1.8,-116.8],target:[118,4.2,-112],fov:65}
});

export function createHaleWard(THREE,{brick,roof,worldUV,material}){
 const building=new THREE.Group();building.name=HALE_WARD.name;
 const {x:cx,z:cz,eave}=HALE_WARD;building.position.set(cx,0,cz);
 brick=brick.clone();brick.color.set(0xf2ded0);
 const white=material(0xbab9ab),steel=material(0x354447),red=material(0x8f4e38);
 const batches=new Map(),openings=[];
 function mesh(g,m,x=0,y=0,z=0,name=''){
  const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;
  o.castShadow=true;o.receiveShadow=true;building.add(o);return o;
 }
 function box(m,x,y,z,w,h,d,r=0){
  if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,w,h,d,r});
 }
 const local=HALE_WARD_FOOTPRINT.map(([x,z])=>[x-cx,z-cz]);
 function mass(height,mat,name){
  const shape=new THREE.Shape(local.map(([x,z])=>new THREE.Vector2(x,-z)));
  const g=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});g.rotateX(-Math.PI/2);
  const o=mesh(worldUV(g,1.7),mat,0,0,0,name);o.userData.collisionFootprint=local;return o;
 }
 mass(eave,brick,'Hale ward two-storey walls').userData.historicOutlinePadding=.7;
 mass(.38,material(0x685549),'Hale ward brick foundation');
 const detail=photoDetailPrimitives(THREE,{model:building,box,mesh,white,steel,material});
 // Same shared 3-by-6 glazing, dimensions, pale heads and dark sills as Irby/Ashley.
 function sash(x,y,z,r,h){
  const w=1.3,nx=Math.sin(r),nz=Math.cos(r);
  detail.sash('Hale ward multi-pane sash',x,y,z,r,w,h);
  box(white,x+nx*.07,y+h/2+.15,z+nz*.07,w+.43,.28,.22,r);
  box(steel,x+nx*.19,y-h/2-.15,z+nz*.19,w+.43,.13,.4,r);
  openings.push({x,y,z,r,w,h});
 }
 for(let i=0;i<local.length;i++){
  const a=local[i],b=local[(i+1)%local.length],dx=b[0]-a[0],dz=b[1]-a[1];
  const length=Math.hypot(dx,dz),nx=dz/length,nz=-dx/length,r=Math.atan2(nx,nz);
  const at=(m,y,h,d,n)=>box(m,(a[0]+b[0])/2+nx*n,y,(a[1]+b[1])/2+nz*n,length,h,d,r);
  at(brick,3.9,.18,.18,.03);at(red,eave-.58,.14,.19,.07);
  at(brick,eave-.24,.18,.3,.09);at(steel,eave+.02,.12,.18,.18);
  for(let t=.19;t<length;t+=.42)box(red,a[0]+dx*t/length+nx*.11,eave-.41,a[1]+dz*t/length+nz*.11,.18,.17,.26,r);
  const count=Math.max(0,Math.floor((length-.8)/3.55));
  for(let n=0;n<count;n++){
   const t=(n+.5)/count,x=a[0]+dx*t+nx*.035,z=a[1]+dz*t+nz*.035;
   const entry=(i===0||i===8)&&n===Math.floor(count/2);
   const corridorContact=nx>.9&&HALE_CORRIDOR_RUNS.some(run=>Math.abs(x+cx-run.wardFaceX)<.1&&Math.abs(z+cz-run.start[1])<FARNDON_CORRIDOR.width/2+.86);
   if(!corridorContact){if(entry)detail.door(x,z,r);else sash(x,2.05,z,r,2.65);}
   sash(x,5.9,z,r,2.75);
  }
  if(length>5)box(steel,a[0]+dx*.07+nx*.2,4.1,a[1]+dz*.07+nz*.2,.095,8.1,.095);
 }
 function surface(vertices,faces,name){
  const p=[],uv=[];
  for(const face of faces){
   const points=face.map(i=>vertices[i]);
   const a=new THREE.Vector3(...points[0]);
   if(new THREE.Vector3().crossVectors(new THREE.Vector3(...points[1]).sub(a),new THREE.Vector3(...points[2]).sub(a)).y<0)points.reverse();
   for(const [x,y,z]of points){p.push(x,y,z);uv.push(x/2,(z+y)/2);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
  return mesh(g,roof,0,0,0,name);
 }
 for(const spec of HALE_WARD_ROOFS){
  const [wx0,wz0,wx1,wz1]=spec.rect,x0=wx0-cx-.18,x1=wx1-cx+.18,z0=wz0-cz-.18,z1=wz1-cz+.18;
  const alongX=spec.axis==='x',inset=Math.min(x1-x0,z1-z0)*.43,top=eave+spec.rise;
  const v=[[x0,eave,z0],[x1,eave,z0],[x1,eave,z1],[x0,eave,z1],
   ...(alongX?[[x0+inset,top,(z0+z1)/2],[x1-inset,top,(z0+z1)/2]]:[[(x0+x1)/2,top,z0+inset],[(x0+x1)/2,top,z1-inset]])];
  surface(v,alongX?[[0,1,5],[0,5,4],[2,3,4],[2,4,5],[1,2,5],[3,0,4]]:
   [[1,2,5],[1,5,4],[3,0,4],[3,4,5],[0,1,4],[2,3,5]],spec.name+' slate roof');
  detail.rod(v[4],v[5],.085,red);
 }
 for(const [wx,wz,height]of [[98,-85.155,12.3],[136,-85.155,12.3],[130,-107.705,12.5],[126,-127,12.5],[105,-136.445,12.7]]){
  const x=wx-cx,z=wz-cz;
  mesh(worldUV(new THREE.BoxGeometry(1.15,height-eave+1,1.05),1.7),brick,x,(height+eave-1)/2,z,'Hale ward brick chimney');
  box(red,x,height-.35,z,1.32,.17,1.22);box(red,x,height-.13,z,1.42,.17,1.3);box(steel,x,height-.025,z,1.04,.055,.91);
 }
 const dummy=new THREE.Object3D();
 for(const [mat,items]of batches){
  const batch=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,items.length);
  batch.name='Hale ward sashes, masonry bands and rainwater goods';batch.castShadow=true;batch.receiveShadow=true;batch.userData.orientedCollision=true;
  items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.rotation.set(0,b.r,0);dummy.scale.set(b.w,b.h,b.d);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});building.add(batch);
 }
 building.userData={...building.userData,source:HALE_WARD,footprint:HALE_WARD_FOOTPRINT,storeys:2,openings,roofs:HALE_WARD_ROOFS,
  // The green guide replaces the old stepped OS rooms, including their courts.
  replacedOSAreas:[[[83.1,-141.5],[153.6,-141.5],[153.6,-70.1],[83.1,-70.1]]]};
 return building;
}
