import {OS_FOOTPRINTS} from './historic-footprint-data.mjs';
import {historicOSPoint} from './historic-footprints.mjs';
import {photoDetailPrimitives} from './photo-detail-primitives.mjs';
import {wardMapPoint} from './ward-placement.mjs';

// Retain the OS contour as modelling coordinates. The later yellow-line
// correction rotates it clockwise. The latest overhead-map registration
// supplies its position while preserving that angle and its local geometry.
export const ESTATES_SOURCE_FOOTPRINT=Object.freeze(OS_FOOTPRINTS[1].loops[0]
 .map(p=>Object.freeze(historicOSPoint(...p))));
const sourceOrigin={x:244,z:-49.5};
// Blue-circled Estates centre in the latest OS reference, fitted to the same
// fixed church and Churton anchors as the wards. Retain the established angle.
export const ESTATES_MAP_REFERENCE=Object.freeze({source:'Research/ward-placement/estates-plan.png',pixel:[167,145]});
const [estatesX,estatesZ]=wardMapPoint(ESTATES_MAP_REFERENCE.pixel).map(n=>Math.round(n*10)/10);
export const ESTATES=Object.freeze({x:estatesX,z:estatesZ,rotation:-19*Math.PI/180,eave:7.6,layout:'historic',
 reference:'Research/estates/README.md'});
export function estatesPoint(x,y,z){
 const c=Math.cos(ESTATES.rotation),s=Math.sin(ESTATES.rotation),dx=x-sourceOrigin.x,dz=z-sourceOrigin.z;
 return [ESTATES.x+c*dx+s*dz,y,ESTATES.z-s*dx+c*dz];
}
const footprintPoint=([x,z])=>{const p=estatesPoint(x,0,z);return [p[0],p[2]];};
export const ESTATES_FOOTPRINT=Object.freeze(ESTATES_SOURCE_FOOTPRINT.map(p=>Object.freeze(footprintPoint(p))));
export const ESTATES_VIEWS=Object.freeze({
 estates:{position:estatesPoint(201,36,-78),target:estatesPoint(244,3,-49.5),fov:48},
 'estates-plan':{position:[ESTATES.x,76,ESTATES.z+.01],target:[ESTATES.x,0,ESTATES.z],fov:46},
 'estates-photo':{position:estatesPoint(227,1.9,-47.4),target:estatesPoint(248.5,3.9,-49.5),fov:64},
 'estates-site':{position:[161+ESTATES.x-246.3,129,-206+ESTATES.z+49.5],target:[233+ESTATES.x-246.3,0,-77+ESTATES.z+49.5],fov:48}
});

export function createEstatesDepartment(THREE,{brick,roof,worldUV,material}){
 const building=new THREE.Group();building.name='Estates department';
 const {x:cx,z:cz}=sourceOrigin,{eave}=ESTATES;
 building.position.set(ESTATES.x,0,ESTATES.z);building.rotation.y=ESTATES.rotation;
 const p=ESTATES_SOURCE_FOOTPRINT;
 const rear=p[0][0],rightEnd=p[0][1],rightFront=p[1][0],rightInner=p[2][1];
 const inner=p[3][0],leftInner=p[4][1],leftReturn=p[5][0],gateLeft=p[6][1];
 const leftFront=p[7][0],leftEnd=p[8][1],upperFront=242;
 brick=brick.clone();brick.color.set(0xcab2a6);
 const red=material(0xa5553d),coping=material(0x9b513b),white=material(0xd8ddd5);
 const steel=material(0x354648),blue=material(0x68b4be),base=material(0x6a5145);
 const batches=new Map(),openings=[],doors=[];
 const local=points=>points.map(([x,z])=>[x-cx,z-cz]);
 const rect=(x0,z0,x1,z1)=>[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
 function mesh(g,m,x=0,y=0,z=0,name=''){
  const o=new THREE.Mesh(g,m);o.name=name;o.position.set(x,y,z);
  o.castShadow=true;o.receiveShadow=true;building.add(o);return o;
 }
 function box(m,x,y,z,w,h,d,r=0){
  if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,w,h,d,r});
 }
 function mass(points,height,name,mat=brick,bottom=0){
  const polygon=local(points),shape=new THREE.Shape(polygon.map(([x,z])=>new THREE.Vector2(x,-z)));
  const g=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});g.rotateX(-Math.PI/2);
  const o=mesh(worldUV(g,1.7),mat,0,bottom,0,name);
  o.userData.collisionFootprint=polygon;return o;
 }
 // Each wall lies on the OS trace. The higher right return is visible above
 // the low hipped room in the photograph; its hidden length is estimated.
 const ranges=[
  {name:'Rear two-storey offices',points:rect(inner,leftEnd,rear,rightEnd),height:eave},
  {name:'Right upper gabled return',points:rect(upperFront,rightInner,inner,rightEnd),height:eave},
  {name:'Right low entrance room',points:rect(rightFront,rightInner,upperFront,rightEnd),height:4},
  {name:'Left gabled workshop',points:rect(leftFront,leftEnd,inner,leftInner),height:4},
  {name:'Left entrance stores and screen wall',points:rect(leftFront,leftInner,leftReturn,gateLeft),height:2.85}
 ];
 for(const s of ranges){mass(s.points,s.height,s.name);mass(s.points,.28,s.name+' dark brick plinth',base);}
 const detail=photoDetailPrimitives(THREE,{model:building,box,mesh,white,steel,material});

 function face(wx,wz,r){
  const dx=Math.cos(r),dz=-Math.sin(r),nx=Math.sin(r),nz=Math.cos(r);
  return (mat,u,y,n,w,h,d)=>box(mat,wx-cx+dx*u+nx*n,y,wz-cz+dz*u+nz*n,w,h,d,r);
 }
 function sash(wx,wz,r,w=1.25,h=2.2,y=1.95,columns=3,rows=6){
  const part=face(wx,wz,r);
  part(detail.recess,0,y,0,w+.16,h+.12,.09);
  part(detail.glass,0,y,.06,w,h,.07);
  for(const s of [-1,1]){
   part(white,s*w/2,y,.12,.065,h+.12,.09);
   part(white,0,y+s*h/2,.12,w+.1,.065,.09);
  }
  for(let n=1;n<columns;n++)part(white,-w/2+w*n/columns,y,.14,.035,h,.05);
  for(let n=1;n<rows;n++)part(white,0,y-h/2+h*n/rows,.14,w,n===rows/2?.06:.03,.06);
  part(white,0,y-h/2-.1,.12,w+.3,.13,.28);
  part(red,0,y+h/2+.14,.045,w+.3,.2,.17);
  openings.push({x:wx-cx,y,z:wz-cz,r,w,h});
 }
 function door(wz){
  const wx=inner-.025,r=-Math.PI/2,part=face(wx,wz,r),w=1.65;
  part(detail.recess,0,1.57,.02,w+.19,3.14,.12);
  part(blue,0,1.37,.11,w,2.72,.12);
  for(let n=1;n<8;n++)part(steel,-w/2+w*n/8,1.37,.176,.012,2.64,.01);
  for(const side of [-1,1])part(blue,side*(w/2+.08),1.58,.18,.13,3.16,.14);
  part(blue,0,3.12,.18,w+.25,.13,.15);
  part(detail.recess,0,2.9,.18,w-.06,.28,.06);
  part(blue,0,2.7,.19,w+.02,.09,.1);
  part(steel,-.58,1.45,.22,.065,.24,.06);
  const disc=mesh(new THREE.CylinderGeometry(.095,.095,.02,12),material(0xbdbb98),wx-cx-.2,2.05,wz-cz,'Door round brass plate');
  disc.rotation.z=Math.PI/2;
  doors.push({x:wx,z:wz,width:w});
 }
 // The rear wall is the recognisable photo elevation: two broad upper
 // windows between narrower lights, with two turquoise doors below.
 for(const [z,w,c] of [[-54.6,1.1,1],[-51.4,2.05,3],[-47.15,2.05,3],[-44.1,1.1,1]])
  sash(inner-.025,z,-Math.PI/2,w,2.1,5.85,c,2);
 for(const z of [-54.6,-44.1])sash(inner-.025,z,-Math.PI/2,1.2,2.15,1.95);
 for(const z of [-51.4,-47.15])door(z);
 // Large foreground window and quieter inward-facing workshop elevations.
 sash(rightFront-.025,(rightInner+rightEnd)/2,-Math.PI/2,1.95,2.75,2.0,4,6);
 sash(239,rightInner-.025,Math.PI,1.25,2.25,1.95);
 sash(245.1,rightInner-.025,Math.PI,1.25,2.2,5.85,2,2);
 for(const x of [241.8,245.7])sash(x,leftInner+.025,0,1.1,1.8,2.0);
 // Concealed outer faces use the same restrained workshop window language.
 for(const z of [-59,-53,-47,-40])for(const y of [1.95,5.85])
  sash(rear+.025,z,Math.PI/2,1.2,2.05,y,3,y>4?2:6);
 for(const x of [237.2,243.9,251])sash(x,leftEnd-.025,Math.PI,1.2,2.05,1.95);
 for(const x of [238,245,251])sash(x,rightEnd+.025,0,1.2,2.05,1.95);
 for(const x of [245,251])sash(x,rightEnd+.025,0,1.2,2.05,5.85,2,2);

 function trim(a,b,height){
  const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
  const r=Math.atan2(dz/len,-dx/len),part=face((a[0]+b[0])/2,(a[1]+b[1])/2,r);
  part(red,0,.48,.015,len,.17,.13);
  part(red,0,height-.31,.05,len,.28,.18);
  part(steel,0,height+.01,.13,len,.13,.2);
  if(height>6)part(red,0,3.75,.025,len,.21,.15);
 }
 // Footprint winding is clockwise in the X/Z plane; trim projects outwards.
 for(let i=0;i<p.length;i++){
  const a=p[i],b=p[(i+1)%p.length];
  if(i===0){trim(a,[upperFront,rightEnd],eave);trim([upperFront,rightEnd],b,4);}
  else if(i===2){trim(a,[upperFront,rightInner],4);trim([upperFront,rightInner],b,eave);}
  else if(i===8){trim(a,[inner,leftEnd],4);trim([inner,leftEnd],b,eave);}
  else trim(a,b,[eave,4,eave,eave,4,2.85,2.85,2.85,4,eave][i]);
 }
 // Blue-painted downpipe beside the left-hand door and dark gutters.
 for(const [wx,wz,h,mat] of [[inner-.19,-53.1,eave,blue],[rightFront-.17,rightInner+.12,4,blue],[leftFront-.17,leftEnd+.15,4,steel],[rear+.15,-59,eave,steel]]){
  box(mat,wx-cx,h/2,wz-cz,.085,h,.085);
  for(const y of [.6,3.4,6.5].filter(y=>y<h))box(steel,wx-cx,y,wz-cz,.13,.065,.13);
 }

 function surface(v,faces,mat,name,up=false){
  const points=[],uv=[];
  for(const f of faces){
   const tri=f.map(i=>v[i]);
   if(up){const a=new THREE.Vector3(...tri[0]);if(new THREE.Vector3().crossVectors(new THREE.Vector3(...tri[1]).sub(a),new THREE.Vector3(...tri[2]).sub(a)).y<0)tri.reverse();}
   const origin=new THREE.Vector3(...tri[0]);
   const normal=new THREE.Vector3().crossVectors(new THREE.Vector3(...tri[1]).sub(origin),new THREE.Vector3(...tri[2]).sub(origin));
   const acrossX=Math.abs(normal.x)>Math.abs(normal.z);
   for(const [x,y,z] of tri){points.push(x-cx,y,z-cz);uv.push((acrossX?z:x)/2,(up?(acrossX?x:z):y)/2);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
  return mesh(g,mat,0,0,0,name);
 }
 const rod=(a,b,r=.065,mat=coping)=>detail.rod([a[0]-cx,a[1],a[2]-cz],[b[0]-cx,b[1],b[2]-cz],r,mat);
 const gableMaterial=brick.clone();gableMaterial.side=THREE.DoubleSide;
 function gable(a,b,top,name,offset=[.16,0]){
  const o=surface([a,b,top].map(([x,y,z])=>[x+offset[0],y,z+offset[1]]),[[0,1,2]],gableMaterial,name);worldUV(o.geometry,1.7);
  rod(a,top,.085);rod(b,top,.085);
 }
 // Joined L-shaped upper roof: shared ridge and valley vertices avoid an
 // overlapping hip cutting across the right-hand brick gable.
 const ex=inner-.16,ox=rear+.16,z0=leftEnd-.16,z1=rightEnd+.16;
 const rx=(inner+rear)/2,rz=(rightInner+rightEnd)/2,top=9.65,fx=upperFront-.16;
 const v=[[ex,eave,z0],[ox,eave,z0],[ox,eave,z1],[fx,eave,z1],
  [fx,eave,rightInner-.16],[ex,eave,rightInner-.16],
  [rx,top,z0],[rx,top,rz],[fx,top,rz]];
 surface(v,[[0,6,7],[0,7,5],[1,2,7],[1,7,6],[2,3,8],[2,8,7],[4,5,7],[4,7,8]],roof,'Joined rear office and right return slate roof',true);
 gable(v[0],v[1],v[6],'Rear office end brick gable',[0,.16]);
 gable(v[3],v[4],v[8],'Photographed tall right brick gable');
 rod(v[6],v[7]);rod(v[7],v[8]);

 function lowRoof(name,x0,z0,x1,z1,y,rise,hip){
  x0-=.16;x1+=.16;z0-=.16;z1+=.16;
  const mid=(z0+z1)/2,inset=hip?(z1-z0)*.45:0;
  const a=[[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1],
   [x0+inset,y+rise,mid],[x1,y+rise,mid]];
  surface(a,[[0,1,5],[0,5,4],[2,3,4],[2,4,5],...(hip?[[3,0,4]]:[])],roof,name+' slate roof',true);
  if(!hip)gable(a[3],a[0],a[4],name+' front brick gable');
  rod(a[4],a[5]);if(hip){rod(a[0],a[4]);rod(a[3],a[4]);}
 }
 lowRoof('Right low hipped entrance room',rightFront,rightInner,upperFront, rightEnd,4,1.65,true);
 lowRoof('Left workshop',leftFront,leftEnd,inner,leftInner,4,1.9,false);
 mass(rect(leftFront-.05,leftInner-.02,leftReturn+.05,gateLeft+.03),.09,'Stores flat lead roof',material(0x56615e),2.8);
 // Coping sits along the foreground screen wall, with a masonry gatepost on
 // each side of the traced opening. No geometry bridges the entrance.
 box(coping,leftFront-cx,2.91,(leftInner+gateLeft)/2-cz,.52,.16,gateLeft-leftInner+.15);
 for(const [x,z,h] of [[leftFront+.22,gateLeft-.23,2.85],[rightFront+.23,rightInner+.23,3.12]]){
  mass(rect(x-.26,z-.26,x+.26,z+.26),h,'Brick entrance pier');
  box(base,x-cx,h+.07,z-cz,.65,.15,.65);
 }
 // One short stack on the rear office ridge, as seen at the left of the photo.
 const stackZ=-57.8;
 mass(rect(rx-.4,stackZ-.43,rx+.4,stackZ+.43),2.0,'Rear office chimney',brick,8.4);
 box(red,rx-cx,10.27,stackZ-cz,1.02,.18,1.08);
 box(steel,rx-cx,10.42,stackZ-cz,.68,.035,.72);

 // Deterministic granite setts, in staggered courses, keep the courtyard
 // surface local to this building and below the walking collision threshold.
 const pixels=new Uint8Array(256*256*4);
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){
  const row=Math.floor(y/16),u=(x+(row%2)*16)%32;
  const mortar=u<1||y%16<1,grain=((x*73+y*37+x*y*3)%19)-9;
  const shade=mortar?85:143+((Math.floor((x+(row%2)*16)/32)*19+row*13)%29)+grain;
  const i=(y*256+x)*4;pixels.set([shade,shade,shade-6,255],i);
 }
 const setts=new THREE.DataTexture(pixels,256,256);setts.colorSpace=THREE.SRGBColorSpace;
 setts.wrapS=setts.wrapT=THREE.RepeatWrapping;setts.magFilter=THREE.LinearFilter;setts.needsUpdate=true;
 const court=[[rightFront,rightInner],[inner,rightInner],[inner,leftInner],
  [leftReturn,leftInner],[leftReturn,gateLeft],[rightFront,gateLeft],
  [231.3,gateLeft],[231.3,rightInner]];
 mass(court,.08,'Cobbled entrance courtyard',material(0xb1afa5,{map:setts}),.22);
 const courtMesh=building.getObjectByName('Cobbled entrance courtyard');worldUV(courtMesh.geometry,4);

 // Pixel lettering avoids external fonts or asynchronous texture requests.
 const glyphs={C:['01111','10000','10000','10000','10000','10000','01111'],A:['01110','10001','10001','11111','10001','10001','10001'],
  C:['01111','10000','10000','10000','10000','10000','01111'],D:['11110','10001','10001','10001','10001','10001','11110'],E:['11111','10000','10000','11110','10000','10000','11111'],
  F:['11111','10000','10000','11110','10000','10000','10000'],I:['111','010','010','010','010','010','111'],
  M:['10001','11011','10101','10101','10001','10001','10001'],N:['10001','11001','10101','10011','10001','10001','10001'],
  O:['01110','10001','10001','10001','10001','10001','01110'],P:['11110','10001','10001','11110','10000','10000','10000'],
  R:['11110','10001','10001','11110','10100','10010','10001'],S:['01111','10000','10000','01110','00001','00001','11110'],
  T:['11111','00100','00100','00100','00100','00100','00100'],' ':['000','000','000','000','000','000','000']};
 const signPixels=new Uint8Array(128*40*4);
 for(let y=0;y<40;y++)for(let x=0;x<128;x++)signPixels.set(x<2||x>125||y<2||y>37?[215,219,212,255]:[24,71,108,255],(y*128+x)*4);
 for(const [text,row] of [['ESTATES DEPARTMENT',7],['OFFICE',24]]){
  const width=[...text].reduce((n,c)=>n+glyphs[c][0].length+1,0)-1;let x=Math.floor((128-width)/2);
  for(const c of text){const g=glyphs[c];for(let y=0;y<7;y++)for(let u=0;u<g[y].length;u++)if(g[y][u]==='1')signPixels.set([242,242,221,255],((39-row-y)*128+x+u)*4);x+=g[0].length+1;}
 }
 const signTexture=new THREE.DataTexture(signPixels,128,40);signTexture.colorSpace=THREE.SRGBColorSpace;signTexture.needsUpdate=true;
 const signMat=new THREE.MeshStandardMaterial({map:signTexture,roughness:.85});
 for(const [wx,wz] of [[leftFront-.075,gateLeft-.82],[rightFront-.075,rightInner+.9]]){
  const sign=mesh(new THREE.PlaneGeometry(1.42,.52),signMat,wx-cx,2.04,wz-cz,'Estates department entrance plaque');sign.rotation.y=-Math.PI/2;
 }
 const dummy=new THREE.Object3D();
 for(const [mat,items] of batches){
  const batch=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,items.length);
  batch.name='Estates glazing, blue doors, brick bands and rainwater goods';
  batch.castShadow=true;batch.receiveShadow=true;batch.userData.orientedCollision=true;
  items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.rotation.set(0,b.r,0);dummy.scale.set(b.w,b.h,b.d);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});building.add(batch);
 }
 building.userData={...building.userData,source:ESTATES,footprint:ESTATES_FOOTPRINT,
  storeys:2,openings,doors:doors.map(d=>{const [x,,z]=estatesPoint(d.x,0,d.z);return {...d,x,z};}),
  courtyard:court.map(footprintPoint),ranges:ranges.map(s=>({name:s.name,footprint:s.points.map(footprintPoint),height:s.height})),
  replacedOSEdges:{sourceBuilding:1,sourceLoop:0,indices:p.map((_,i)=>i)}};
 return building;
}
