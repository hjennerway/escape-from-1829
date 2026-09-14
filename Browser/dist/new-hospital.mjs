// Dark building footprints traced from the user's enlarged fire-alarm map.
// Pale grey map areas are roads. Three closed courts and four open wing courts
// replace the earlier six-pavilion interpretation. Heights remain photo estimates.
import {photoDetailPrimitives} from './photo-detail-primitives.mjs';

// Register the map against the existing estate, keeping all three landmarks fixed.
// Pixel locations: Reception (654,504), chapel (608,302), water tower (787,373).
export function hospitalMapPoint(u,v){
  const du=u-654,dv=v-504,det=(-46)*(-131)-133*(-202);
  const chapel=(du*(-131)-133*dv)/det,tower=((-46)*dv-du*(-202))/det;
  return [-6*chapel+150*tower,13-133*chapel-66*tower];
}
const centre=hospitalMapPoint(1050,422);
export const NEW_HOSPITAL=Object.freeze({x:centre[0],z:centre[1]});
export const NEW_HOSPITAL_VIEW=Object.freeze({position:[centre[0]-135,167,centre[1]+199],target:[centre[0],3,centre[1]],fov:53});
export const NEW_HOSPITAL_PLAN_VIEW=Object.freeze({position:[centre[0],290,centre[1]+.01],target:[centre[0],0,centre[1]],fov:49});
export const NEW_HOSPITAL_SITE_VIEW=Object.freeze({position:[215,400,-4.99],target:[215,0,-5],fov:67});
const ground=hospitalMapPoint(914,445),look=hospitalMapPoint(984,438);
export const NEW_HOSPITAL_GROUND_VIEW=Object.freeze({position:[ground[0],1.8,ground[1]],target:[look[0],5,look[1]],fov:62});
// Centre lines of the dark masonry ranges, recorded in source-map pixels.
// The four wing outlines deliberately omit their fourth edge.
export const HOSPITAL_COURTS=Object.freeze([
  {name:'West central court',closed:true,points:[[982,415],[1014,438],[988,469],[956,446]]},
  {name:'East central court',closed:true,points:[[1042,393],[1090,428],[1072,452],[1023,417]]},
  {name:'North central court',closed:true,points:[[1081,308],[1108,331],[1070,371],[1042,348]]},
  {name:'South west wing',closed:false,points:[[955,488],[935,514],[989,554],[1011,529]]},
  {name:'South east wing',closed:false,points:[[1090,469],[1072,463],[1056,518],[1084,527]]},
  {name:'East wing',closed:false,points:[[1106,444],[1103,434],[1159,430],[1160,459]]},
  {name:'North east wing',closed:false,points:[[1124,325],[1154,294],[1180,317],[1158,345]]}
]);

export function createNewHospital(THREE,{brick,roof,white,steel,material,worldUV,hipRoof}){
  const model=new THREE.Group();model.name='New hospital · map-traced courtyard complex';
  model.position.set(NEW_HOSPITAL.x,0,NEW_HOSPITAL.z);
  const batches=new Map(),blocks=[];
  function local(p){const [x,z]=hospitalMapPoint(...p);return [x-NEW_HOSPITAL.x,z-NEW_HOSPITAL.z];}
  function box(mat,x,y,z,w,h,d,rotation=0){if(!batches.has(mat))batches.set(mat,[]);batches.get(mat).push({x,y,z,w,h,d,rotation});}
  function mesh(geo,mat,x=0,y=0,z=0,shadow=false){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;model.add(m);return m;}
  const {sash,door,iron,stone}=photoDetailPrimitives(THREE,{model,box,mesh,white,steel,material});
  const band=material(0xcac7b6),redCourse=material(0x793d30),road=material(0xa6a89f),leaf=material(0x506443),bark=material(0x5a4e3d);
  function range(name,a,b,d=7.3,h=8.8){
    const p=local(a),q=local(b),dx=q[0]-p[0],dz=q[1]-p[1];
    const block={name,x:(p[0]+q[0])/2,z:(p[1]+q[1])/2,w:Math.hypot(dx,dz)+d*.55,d,h,rotation:Math.atan2(-dz,dx)};
    blocks.push(block);return block;
  }
  for(const court of HOSPITAL_COURTS){
    const count=court.closed?4:3;
    for(let i=0;i<count;i++)range(court.name+' range '+(i+1),court.points[i],court.points[(i+1)%4],court.closed?7.3:8.1,i===3?4.3:8.8);
  }
  // Short, irregular links belong to the footprint; the broad pale strips
  // beside them remain roads rather than being turned into building wings.
  for(const [name,a,b] of [
    ['Western central link',[994,423],[1013,397]],
    ['Central hall',[1013,397],[1033,408]],
    ['Northern connecting range',[1013,397],[1048,355]],
    ['South west neck',[978,462],[955,488]],
    ['South east neck',[1072,450],[1072,465]],
    ['East neck',[1088,432],[1106,435]],
    ['North east neck',[1105,330],[1126,325]]
  ])range(name,a,b,name==='Central hall'?11:5.2,name==='Central hall'?9.5:4.3);
  const entrance=blocks.find(b=>b.name==='Central hall');
  // Coordinate conversion within each rotated masonry range.
  function point(b,u,n){const c=Math.cos(b.rotation),s=Math.sin(b.rotation);return [b.x+c*u+s*n,b.z-s*u+c*n];}
  function occupied(x,y,z,self){return blocks.some(b=>{
    if(b===self||y>b.h+.12)return false;
    const dx=x-b.x,dz=z-b.z,c=Math.cos(b.rotation),s=Math.sin(b.rotation);
    return Math.abs(c*dx-s*dz)<b.w/2+.03&&Math.abs(s*dx+c*dz)<b.d/2+.03;
  });}
  for(const b of blocks){
    const {name,x,z,w,d,h,rotation}=b;
    const wall=mesh(worldUV(new THREE.BoxGeometry(w,h,d),1.7),brick,x,h/2,z,true);wall.rotation.y=rotation;wall.name=name+' brick walls';wall.userData.orientedCollision=true;
    box(redCourse,x,.26,z,w+.08,.52,d+.08,rotation);
    if(h>7)box(band,x,4.25,z,w+.14,.18,d+.14,rotation);
    box(band,x,h-.05,z,w+.24,.2,d+.24,rotation);box(iron,x,h+.09,z,w+.35,.09,d+.35,rotation);
    const cap=hipRoof(x,z,w,d,h+.15,h>7?2.6:1.35);model.add(cap);cap.rotation.y=rotation;cap.name=name+' slate roof';
    for(const side of [-1,1])for(const face of ['long','end']){
      const span=face==='long'?w:d,count=Math.max(1,Math.floor((span-2)/3.15));
      for(let i=0;i<count;i++){
        const along=(i-(count-1)/2)*3.15;
        const [px,pz]=face==='long'?point(b,along,side*(d/2+.05)):point(b,side*(w/2+.05),along);
        const angle=rotation+(face==='long'?(side<0?Math.PI:0):side*Math.PI/2);
        for(const y of h>7?[2,6.5]:[1.85]){
          if([-.8,0,.8].some(t=>[.05,.8].some(n=>occupied(px+Math.cos(angle)*t+Math.sin(angle)*n,y,pz-Math.sin(angle)*t+Math.cos(angle)*n,b))))continue;
          if(b===entrance&&face==='long'&&side<0&&Math.abs(along)<2&&y===2)continue;
          sash('new-hospital-'+name,px,y,pz,angle,1.17,h>7?2.55:2.3);
          model.userData.eastPhotoOpenings.at(-1).rotation=angle;
        }
      }
    }
    for(const side of [-1,1]){
      const [px,pz]=point(b,side*(w/2-.6),d/2+.16);
      if(!occupied(px,h/2,pz,b))box(iron,px,h/2,pz,.075,h,.075);
    }
  }
  const [doorX,doorZ]=point(entrance,0,-entrance.d/2-.08);
  door(doorX,doorZ,entrance.rotation+Math.PI);
  const doorstep=point(entrance,0,-entrance.d/2-.6);
  box(stone,doorstep[0],.13,doorstep[1],3,.26,1,entrance.rotation);
  // Photo-based tall corbelled stacks and paired pots retain the same styles.
  function chimney(b,u){
    const [x,z]=point(b,u,0),base=b.h+1.9,h=2.65;
    const stack=mesh(worldUV(new THREE.BoxGeometry(1.6,h,1.05),1.7),brick,x,base+h/2,z,true);stack.rotation.y=b.rotation;stack.name='New hospital chimney stack';
    for(const dy of [0,.22])box(brick,x,base+h+dy,z,1.84,.16,1.3,b.rotation);
    for(const offset of [-.43,.43]){
      const [px,pz]=point(b,u+offset,0);
      mesh(new THREE.CylinderGeometry(.14,.18,.8,8),redCourse,px,base+h+.65,pz,true);
      mesh(new THREE.CylinderGeometry(.18,.18,.12,8),redCourse,px,base+h+1.06,pz,true);
      mesh(new THREE.CircleGeometry(.115,8),iron,px,base+h+1.125,pz).rotation.x=-Math.PI/2;
    }
  }
  for(const b of blocks)if(b.h>7){chimney(b,0);if(b.w>33)chimney(b,b.w*.29);}
  // Pale road network traced separately from the dark building outlines.
  function strip(a,b,width=4.5){const p=local(a),q=local(b),dx=q[0]-p[0],dz=q[1]-p[1];box(road,(p[0]+q[0])/2,.03,(p[1]+q[1])/2,Math.hypot(dx,dz)+width/2,.12,width,Math.atan2(-dz,dx));}
  const roads=[
    [[858,516],[895,489],[923,458],[960,412],[1003,367],[1045,316],[1098,261]],
    [[895,489],[918,537],[968,570],[1023,578],[1080,566],[1128,532],[1165,482],[1186,422],[1193,361],[1189,329]],
    [[960,412],[983,396],[995,405]],
    [[923,458],[948,476],[927,504]],
    [[1189,329],[1158,360],[1139,347]],
    [[1165,482],[1176,448],[1177,421],[1109,417],[1095,428]],
    [[1080,566],[1097,527],[1094,493],[1104,462],[1089,447]]
  ];
  for(const line of roads)for(let i=1;i<line.length;i++)strip(line[i-1],line[i]);
  // The connecting drive reaches the established eastern grounds in world space.
  const linkStart=local([858,516]);const old=[115-NEW_HOSPITAL.x,59-NEW_HOSPITAL.z];
  const dx=linkStart[0]-old[0],dz=linkStart[1]-old[1];box(road,(linkStart[0]+old[0])/2,.03,(linkStart[1]+old[1])/2,Math.hypot(dx,dz),.12,4.5,Math.atan2(-dz,dx));
  // Modest planting keeps the seven courtyard voids and road junctions readable.
  for(const p of [[987,440],[1057,424],[1076,339],[974,523],[1078,493],[1134,445],[1153,318],[947,551],[1109,531]]){
    const [x,z]=local(p);if(occupied(x,1,z,null))continue;
    mesh(new THREE.CylinderGeometry(.13,.2,3.5,6),bark,x,1.75,z);
    mesh(new THREE.IcosahedronGeometry(1.8,1),leaf,x,4.1,z,true);
  }
  const dummy=new THREE.Object3D();
  for(const [mat,items] of batches){const m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,items.length);m.receiveShadow=true;
    for(let i=0;i<items.length;i++){const b=items[i];dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.rotation.set(0,b.rotation,0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);}model.add(m);
  }
  model.userData.newHospitalOpenings=model.userData.eastPhotoOpenings;
  model.userData.ranges=blocks;
  model.userData.courts=HOSPITAL_COURTS;
  return model;
}
