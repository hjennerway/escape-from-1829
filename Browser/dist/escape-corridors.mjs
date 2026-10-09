import {ESCAPE_GALLERY as defaultGallery,ESCAPE_CORRIDOR_X as cx,ESCAPE_CORRIDOR_RUNS as defaultRuns,ESCAPE_CORRIDOR_POLYGONS as defaultPolygons,ESCAPE_CORRIDOR_DOORS as defaultDoors,containsPoint,unionPolygons} from './escape-corridor-plan.mjs';
import {ESCAPE_WATER_TOWER as tower} from './water-tower.mjs';
import {addWorkshopArchedWall} from './workshop-gallery.mjs';
import {paintAsylumSign,asylumSignGeometry} from './asylum-sign-paint.mjs';
import {WORKSHOP_DOOR_BASE,WORKSHOP_DOOR_HEIGHT,WORKSHOP_DOOR_HEAD} from './workshop-door-dimensions.mjs';
import {createDoorLockFactory} from './door-lock.mjs';
import {corridorWallJoins} from './corridor-wall-joins.mjs';
import {addExploreEntranceEnvelope} from './explore-corridor-entrance.mjs';
import {addExploreIrbyEntrance,irbyFloorBoundaries} from './explore-irby-entrance.mjs';

export function relativeArrow(forward,direction){
 const length=Math.hypot(...direction),dot=(forward[0]*direction[0]+forward[1]*direction[1])/length;
 if(dot>.92)return '↑';
 if(dot<-.92)return '↓';
 return forward[0]*direction[1]-forward[1]*direction[0]>0?'→':'←';
}
// Red X locations. Each suspended board faces an approaching corridor route.
// Vectors describe the first leg after the junction, in the viewer's frame.
export const ESCAPE_DIRECTION_SIGNS=[
 {id:'admin',run:'gallery',point:[cx,7],forward:[0,1],routes:[['Main/admin',[0,1]],['Redesmere',[-1,0]],['Hospital kitchen',[-1,0]]]},
 {id:'workshops',run:'gallery',point:[cx,-38.5],forward:[0,-1],routes:[['Farndon',[0,-1]],['Irby / Ashley',[0,-1]],['Repair workshop',[-1,0]],['Machine workshop',[1,0]]]},
 {id:'irby-west',run:'gallery',point:[cx,-69.5],forward:[0,1],routes:[['Tower workshops',[0,1]],['Main/admin',[0,1]],['Irby / Ashley',[1,0]]]},
 {id:'irby-east',run:'irby',point:[cx+4,-66.6],forward:[-1,0],routes:[['Tower workshops',[0,1]],['Farndon',[0,-1]],['Hale / Daresbury',[0,-1]]]},
 {id:'hale',run:'hale-1',point:[142,-95.405],forward:[1,0],routes:[['Farndon',[0,-1]],['Tower workshops',[0,1]],['Irby / Ashley',[0,1]]]},
 {id:'farndon',run:'gallery',point:[cx,-122],forward:[0,1],routes:[['Main/admin',[0,1]],['Tower workshops',[0,1]],['Upton / Frith / Oscroft',[-1,0]],['Grafton / Edge',[-1,0]]]},
 {id:'grafton-spine',run:'diagonal',point:[133,-140.4],forward:[-Math.SQRT1_2,-Math.SQRT1_2],routes:[['Grafton / Edge',[-1,0]],['Witby',[-1,-1]],['Upton / Frith / Oscroft',[-1,-1]]]},
 {id:'grafton-branch',run:'grafton',point:[126,-142.88972881355932],forward:[1,0],routes:[['Farndon',[1,1]],['Witby',[-1,-1]],['Upton / Frith / Oscroft',[-1,-1]]]},
 {id:'witby',run:'diagonal',point:[118.5,-154.9],forward:[-Math.SQRT1_2,-Math.SQRT1_2],routes:[['Witby',[0,-1]],['Upton',[-1,-1]],['Frith / Oscroft',[-1,-1]]]}
];
// The reverse approach can lead to a different set of destinations. World
// route vectors stay fixed; lettering and arrows are painted for each viewer.
const reverseRoutes={
 admin:[['Farndon',[0,-1]],['Tower workshops',[0,-1]],['Irby / Ashley',[0,-1]],['Redesmere',[-1,0]]],
 workshops:[['Main/admin',[0,1]],['Redesmere',[0,1]],['Repair workshop',[-1,0]],['Machine workshop',[1,0]]],
 'irby-west':[['Farndon',[0,-1]],['Hale / Daresbury',[0,-1]],['Irby / Ashley',[1,0]]],
 'irby-east':[['Irby / Ashley',[1,0]],['Tower workshops',[0,1]],['Farndon',[0,-1]]],
 hale:[['Hale / Daresbury / Huxley / Dunham',[-1,0]],['Farndon',[0,-1]],['Tower workshops',[0,1]]],
 farndon:[['Farndon',[0,-1]],['Upton / Frith / Oscroft',[-1,0]],['Grafton / Edge',[-1,0]]],
 'grafton-spine':[['Farndon',[1,1]],['Tower workshops',[1,1]],['Grafton / Edge',[-1,0]]],
 witby:[['Farndon',[1,1]],['Grafton / Edge',[1,1]],['Witby',[0,-1]]]
};

export function addEscapeCorridors(THREE,{group,workshopOutline,resources,brick,finish,reveal,paint,dark,floor,timber,metal,box,panel,material,isExposed,runs=defaultRuns,polygons=defaultPolygons,doors=defaultDoors,gallery:g=defaultGallery,entrance=null,irbyEntrance=null}){
 const loops=unionPolygons([...polygons,workshopOutline]);group.userData.corridorLoops=loops;group.userData.corridorRuns=runs;
 const half=(g.maxX-g.minX)/2,locked=[],signs=[],lamps=[],openingDoors=[],caps=[...doors,...[entrance,irbyEntrance].filter(Boolean)];
 const doorCorners=caps.flatMap(({point,toward})=>{
  const dx=toward[0]-point[0],dz=toward[1]-point[1],length=Math.hypot(dx,dz);
  return [-1,1].map(side=>[point[0]+side*dz/length*half,point[1]-side*dx/length*half]);
 });
 const addDoorLock=createDoorLockFactory(THREE,resources);
 for(const loop of loops)for(let i=0;i<loop.length;i++){
  const a=loop[i],b=loop[(i+1)%loop.length],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),mid=[(a[0]+b[0])/2-dz/length*1e-4,(a[1]+b[1])/2+dx/length*1e-4];
  if(!polygons.some(p=>containsPoint(mid,p)))continue;
  if(caps.some(d=>Math.hypot((a[0]+b[0])/2-d.point[0],(a[1]+b[1])/2-d.point[1])<.01))continue;
  if(Math.abs(a[0]-g.minX)<1e-5&&Math.abs(b[0]-g.minX)<1e-5){
   const north=tower.z-tower.width/2,south=tower.z+tower.width/2;
   if(Math.max(a[1],b[1])>north&&Math.min(a[1],b[1])<south){
    for(const [lo,hi] of [[Math.min(a[1],b[1]),north],[south,Math.max(a[1],b[1])]])if(hi>lo)addWall([g.minX,hi],[g.minX,lo]);
    continue;
   }
  }
  // At a real, unmodelled ward contact the masonry remains closed. Artificial
  // Escape cutoffs are absent from Explore's extended runs and leave no cap.
  const terminal=runs.some(r=>[r.start,r.end].some(p=>Math.hypot((a[0]+b[0])/2-p[0],(a[1]+b[1])/2-p[1])<.01));
  addWall(a,b,terminal);
 }
 function addWall(a,b,terminal=false){
  const joins=corridorWallJoins(a,b,loops);
  // Locked caps have timber frames and inset headers, not a mitred return
  // wall. Square these ends so the lining continues behind each header.
  if(doorCorners.some(p=>Math.hypot(p[0]-a[0],p[1]-a[1])<1e-5))joins.start=0;
  if(doorCorners.some(p=>Math.hypot(p[0]-b[0],p[1]-b[1])<1e-5))joins.end=0;
  if(!terminal&&addWorkshopArchedWall(THREE,{group,a,b,resources,brick,finish,reveal,material,dark,height:g.height,liningTop:g.ceiling-.05,isExposed,joins,windowStride:2}))return;
  const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);
  const at=offset=>[[a[0]-dz/l*offset,a[1]+dx/l*offset],[b[0]-dz/l*offset,b[1]+dx/l*offset]];
  panel(...at(.12),.04,g.height,brick,'Connecting corridor masonry',true,.24,{...joins,offset:.12});
  panel(...at(.265),.04,g.ceiling-.05,finish,'Connecting corridor painted lining',false,.045,{...joins,offset:.265});
 }
 function surface(boundaries,y,m,name,down=false){
  const shapes=boundaries.map(points=>new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)))),geometry=new THREE.ShapeGeometry(shapes);geometry.rotateX(-Math.PI/2);
  const pos=geometry.attributes.position,uv=geometry.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,pos.getX(i)/4,pos.getZ(i)/4);
  if(down){const index=geometry.index;for(let i=0;i<index.count;i+=3){const a=index.getX(i);index.setX(i,index.getX(i+2));index.setX(i+2,a);}geometry.computeVertexNormals();}
  resources.add(geometry);const mesh=new THREE.Mesh(geometry,m);mesh.position.y=y;mesh.name=name;mesh.receiveShadow=true;
  // This joined ceiling replaces the clipped low estate roofs. It must also
  // close the sunlight volume; otherwise sun reaches blank walls from above.
  mesh.castShadow=down;mesh.userData.noWalkingCollision=true;group.add(mesh);
 }
 surface(irbyEntrance?irbyFloorBoundaries(loops,irbyEntrance.point):loops,.04,floor,'Continuous escape corridor and workshop floor');
 surface(loops,g.ceiling-.05,paint,'Connected escape corridor ceiling',true);
 const lamp=material(0xe5d6ad,{emissive:0xffe4ac,emissiveIntensity:1.4});
 for(const run of runs){const dx=run.end[0]-run.start[0],dz=run.end[1]-run.start[1],length=Math.hypot(dx,dz),angle=-Math.atan2(dz,dx);
  for(let t=4;t<length-2;t+=10){const x=run.start[0]+dx*t/length,z=run.start[1]+dz*t/length;if(run.id==='gallery'&&z>-60.3&&z<-26.6||ESCAPE_DIRECTION_SIGNS.some(s=>Math.hypot(s.point[0]-x,s.point[1]-z)<2.3))continue;
   const housing=box(dark,[1.5,.07,.24],[x,g.ceiling-.17,z],'Corridor lamp housing');housing.rotation.y=angle;
   const tube=box(lamp,[1.4,.08,.15],[x,g.ceiling-.24,z],'Corridor ceiling lamp');tube.rotation.y=angle;tube.userData.lamp={x,y:g.ceiling-.49,z};lamps.push({fixture:tube,...tube.userData.lamp});
  }
 }
 for(const door of doors){
  const dx=door.toward[0]-door.point[0],dz=door.toward[1]-door.point[1],l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l;
  const parent=new THREE.Group();parent.name=door.title;parent.position.set(door.point[0],0,door.point[1]);parent.rotation.y=Math.atan2(ux,uz);group.add(parent);
  const w=half*2-.575,head=WORKSHOP_DOOR_HEAD,h=WORKSHOP_DOOR_HEIGHT;
  for(const side of [-1,1]){
   box(timber,[w/2,h,.06],[side*w/4,WORKSHOP_DOOR_BASE+h/2,0],'Locked corridor door leaf',parent);
   for(const y of [1,2.65])for(const face of [-1,1])box(dark,[w/2-.28,1.1,.008],[side*w/4,y,face*.038],'Locked door recessed panel',parent);
   for(const face of [-1,1])box(metal,[.07,.24,.10],[side*.16,1.8,face*.12],'Locked double door handle',parent);
   box(metal,[.045,.055,.20],[side*(w/2-.06),h-.35,0],'Locked door hinge',parent);
  }
  // A narrow timber rebate seals the meeting edge, including floating-point
  // precision at diagonal doors after batching into world-space vertices.
  box(timber,[.018,h,.075],[0,WORKSHOP_DOOR_BASE+h/2,0],'Double door meeting rebate',parent);
  // Bring the inner jamb face 15 mm into the opening. Leaving it exactly on
  // the finished side-wall plane caused the reported vertical depth flicker.
  for(const side of [-1,1])box(timber,[.16,head,.28],[side*(w/2+.065),head/2,0],'Double door jamb',parent);
  box(timber,[w+.32,.04,.3],[0,head-.02,0],'Double door lintel',parent);
  // Bury the header ends in the surrounding masonry, avoiding coplanar cut
  // faces on the adjoining wall at the edge of each closed pair.
  const headerHalf=w/2+.04;
  panel([door.point[0]-uz*headerHalf,door.point[1]+ux*headerHalf],[door.point[0]+uz*headerHalf,door.point[1]-ux*headerHalf],head,g.ceiling-.05,finish,'Locked door masonry header');
  parent.updateMatrixWorld(true);
  // Oriented collision follows the actual whole pair and survives jump checks.
  for(const o of parent.children){o.userData.noWalkingCollision=false;o.userData.walkBarrier=true;o.userData.orientedCollision=true;}
  const plaque=makeSign(['LOCKED',door.title.split(' · ')[0]],1.65,.5,1829+locked.length);plaque.position.set(0,2.65,.052);parent.add(plaque);
  addDoorLock(parent,{id:door.id,width:w,height:1.85,depth:.08});
  locked.push({...door,x:door.point[0]+ux*1.8,z:door.point[1]+uz*1.8,y:1.35});
 }
 if(entrance){
  const [x,z]=entrance.point,width=1.8,head=WORKSHOP_DOOR_HEAD,h=WORKSHOP_DOOR_HEIGHT;
  const parent=new THREE.Group();parent.name='Explore Main/admin corridor entrance';parent.position.set(x,0,z);group.add(parent);
  for(const side of [-1,1]){
   const a=x+side*(width/2+.08),b=x+side*half;
   panel([Math.min(a,b),z],[Math.max(a,b),z],.04,g.ceiling-.05,finish,'Admin entrance side wall');
   const jamb=box(timber,[.16,head,.28],[side*(width/2+.08),head/2,0],'Admin entrance door jamb',parent);
   jamb.userData.noWalkingCollision=false;jamb.userData.walkBarrier=true;
  }
  panel([x-width/2-.08,z],[x+width/2+.08,z],head,g.ceiling-.05,finish,'Admin entrance masonry header');
  box(timber,[width+.32,.06,.30],[0,head-.03,0],'Admin entrance lintel',parent);
  const pivot=new THREE.Group();pivot.name='Main/admin corridor opening door';pivot.position.set(-width/2,WORKSHOP_DOOR_BASE,0);parent.add(pivot);
  const leaf=box(timber,[width-.025,h,.06],[(width-.025)/2,h/2,0],'Admin corridor door leaf',pivot);
  for(const face of [-1,1]){
   for(const y of [.95,2.6])box(dark,[width-.3,1.1,.008],[width/2,y,face*.038],'Admin door recessed panel',pivot);
   box(metal,[.07,.24,.1],[width-.18,1.8,face*.10],'Admin door handle',pivot);
   const plaque=makeSign(['TOWER CORRIDOR'],1.4,.3,1829);plaque.position.set(width/2,2.6,face*.049);if(face<0)plaque.rotation.y=Math.PI;pivot.add(plaque);
  }
  openingDoors.push({...entrance,x,z,y:1.35,pivot,leaf,side:1});
  addExploreEntranceEnvelope(THREE,{group,resources,gallery:g,entrance,width,head,brick:entrance.brickMaterial??brick,roof:entrance.roofMaterial??dark,panel});
 }
 if(irbyEntrance)openingDoors.push(addExploreIrbyEntrance(THREE,{group,resources,gallery:g,entrance:irbyEntrance,brick:irbyEntrance.brickMaterial??brick,roof:irbyEntrance.roofMaterial??dark,finish,box,panel,material}));
 function signMaterial(lines,seed){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=80+lines.length*144;
  const ctx=canvas.getContext('2d');paintAsylumSign(ctx,[],{seed,height:canvas.height});ctx.fillStyle='#342f24';ctx.textAlign='left';ctx.textBaseline='middle';
  lines.forEach((line,i)=>{let size=64;ctx.font=`${size}px Georgia, 'Times New Roman', serif`;while(size>16&&ctx.measureText(line.toUpperCase()).width>870)ctx.font=`${--size}px Georgia, 'Times New Roman', serif`;ctx.fillText(line.toUpperCase(),78,112+i*144);});
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;texture.name=lines.join(' / ');resources.add(texture);
  const mat=new THREE.MeshStandardMaterial({map:texture,roughness:.94});resources.add(mat);
  return mat;
 }
 function makeSign(lines,width,height,seed,backLines){
  const mat=signMaterial(lines,seed);
  if(backLines){
   const back=signMaterial(backLines,seed),edge=material(0xb8aa89),geo=new THREE.BoxGeometry(width,height,.035);resources.add(geo);
   const mesh=new THREE.Mesh(geo,[edge,edge,edge,edge,mat,back]);mesh.userData.noWalkingCollision=true;return mesh;
  }
  const geo=asylumSignGeometry(THREE,width,height,.018);resources.add(geo);const mesh=new THREE.Mesh(geo,mat);mesh.userData.noWalkingCollision=true;return mesh;
 }
 for(const spec of ESCAPE_DIRECTION_SIGNS){
  const point=spec.point,backForward=spec.forward.map(n=>-n),backRoutes=reverseRoutes[spec.id]??spec.routes;
  const lines=spec.routes.map(([title,direction])=>relativeArrow(spec.forward,direction)+'  '+title),backLines=backRoutes.map(([title,direction])=>relativeArrow(backForward,direction)+'  '+title),height=.26*Math.max(lines.length,backLines.length);
  const mesh=makeSign(lines,2.55,height,1931+signs.length*131,backLines);mesh.name='Corridor direction sign · '+spec.id;
  mesh.position.set(point[0],g.ceiling-.12-height/2,point[1]);mesh.rotation.y=Math.atan2(-spec.forward[0],-spec.forward[1]);mesh.userData.directionSign={...spec,lines,backLines,backRoutes,point};group.add(mesh);signs.push(mesh.userData.directionSign);
  for(const side of [-1,1])box(metal,[.035,.12,.035],[point[0]-spec.forward[1]*side, g.ceiling-.06,point[1]+spec.forward[0]*side],'Direction sign suspension');
 }
 group.userData.directionSigns=signs;group.userData.lockedCorridorDoors=locked;group.userData.gallery=g;
 group.updateMatrixWorld(true);group.userData.galleryWindows=[];
 group.traverse(wall=>{if(wall.name!=='Workshop exterior with semicircular windows')return;for(const o of wall.userData.openings??[]){if(o.side!==1)continue;const p=wall.localToWorld(new THREE.Vector3(o.x,o.y,o.z));if(Math.min(Math.abs(p.x-g.minX),Math.abs(p.x-g.maxX))<.4)group.userData.galleryWindows.push({...o,x:p.x,y:p.y,z:p.z});}});
 return {loops,locked,signs,lamps,openingDoors};
}
