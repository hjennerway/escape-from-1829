import {clipTimelineGeometry} from './estate-timeline.mjs';
import {addAdminCorridorDetail} from './admin-corridor-detail.mjs';
import {finishWorkshopWindowReveals,CORRIDOR_FINISH} from './workshop-interior-finish.mjs';
import {ESCAPE_GALLERY,ESCAPE_CORRIDOR_RUNS} from './escape-corridor-plan.mjs';
import {miterCorridorWall} from './corridor-wall-joins.mjs';

// Escape changes the finished passage; the surveyed estate route stays fixed.
export const WORKSHOP_GALLERY=ESCAPE_GALLERY;

// Fit the exposed walking gallery's roof to its actual wall width. Retained
// tower roofs cover the intervening service bays; low roof skirts must not
// project from the middle of those taller replacement walls.
export function addWorkshopGalleryRoof(THREE,{group,resources,gallery:g,segments,roof,brick,ridge,masonry}){
 const left=g.minX,right=g.maxX,cx=(left+right)/2,eave=g.height+.06,top=eave+.64,half=(right-left)/2+.22;
 const roofY=x=>top-.64*Math.abs(x-cx)/half;
 function face(points,triangles,material,name){
  const vertices=triangles.flatMap(t=>t.flatMap(i=>points[i])),geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(triangles.flatMap(t=>t.flatMap(i=>[points[i][0]/2.8,(points[i][1]+points[i][2])/2.8])),2));
  geometry.computeVertexNormals();resources.add(geometry);const mesh=new THREE.Mesh(geometry,material);mesh.name=name;
  mesh.castShadow=mesh.receiveShadow=true;mesh.userData.noWalkingCollision=true;group.add(mesh);
 }
 for(const {z0,z1,capStart=false,capEnd=false,startJoin,endJoin} of segments){
  if(z1<=z0)continue;
  for(const [a,b] of [[left-.22,cx],[cx,right+.22]])face([[a,roofY(a),z0],[b,roofY(b),z0],[b,roofY(b),z1],[a,roofY(a),z1]],[[0,2,1],[0,3,2]],roof,'Walking gallery continuous slate roof');
  masonry([left,z1],[left,z0],g.height,roofY(left),'Walking gallery west roof return');
  masonry([right,z0],[right,z1],g.height,roofY(right),'Walking gallery east roof return');
  for(const [a,b] of [[left-.22,left],[right,right+.22]])face([[a,roofY(a)-.025,z0],[b,roofY(b)-.025,z0],[b,roofY(b)-.025,z1],[a,roofY(a)-.025,z1]],[[0,1,2],[0,2,3]],brick,'Walking gallery opaque roof overhang');
  for(const [z,cap,reverse,join] of [[z0,capStart,true,startJoin],[z1,capEnd,false,endJoin]])if(cap){
   const xs=[...new Set([left,cx,right,...(join&&join.ridge>left&&join.ridge<right?[join.ridge]:[])])].sort((a,b)=>a-b);
   // An adjoining wider roof keeps its old ridge. Close the step to both
   // profiles, including their exact crossing, without a floating end slot.
   if(join){const edges=[...xs];for(let i=1;i<edges.length;i++){const a=edges[i-1],b=edges[i],da=roofY(a)-join.height(a),db=roofY(b)-join.height(b);if(da*db<0)xs.push(a+(b-a)*da/(da-db));}}
   xs.sort((a,b)=>a-b);const capY=x=>Math.max(roofY(x),join?.height(x)??g.height);
   for(let i=1;i<xs.length;i++){const a=xs[i-1],b=xs[i],triangles=[[0,1,2],[0,2,3]];
    face([[a,g.height,z],[b,g.height,z],[b,capY(b),z],[a,capY(a),z]],reverse?triangles.map(t=>[...t].reverse()):triangles,brick,'Walking gallery closed roof end');
   }
  }
  const geometry=new THREE.BoxGeometry(.18,.13,z1-z0);resources.add(geometry);const cap=new THREE.Mesh(geometry,ridge);cap.position.set(cx,top+.04,(z0+z1)/2);cap.name='Walking gallery roof ridge';cap.castShadow=cap.receiveShadow=true;cap.userData.noWalkingCollision=true;group.add(cap);
 }
}

export function addWorkshopArchedWall(THREE,{group,a,b,resources,brick,finish,reveal,material,dark,isExposed=()=>true,height=8.84,liningTop=5.05,joins,windowStride=1}){
 const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
 if(length<2)return false;
 const wall=new THREE.Group();wall.name='Workshop exterior with semicircular windows';wall.position.set(a[0],0,a[1]);wall.rotation.y=-Math.atan2(dz,dx);group.add(wall);
 const detailLength=Math.max(4,length);
 addAdminCorridorDetail(THREE,{corridor:wall,start:(length-detailLength)/2,end:(length+detailLength)/2,cz:.1425,depth:.285,height,brick,material,worldUV:g=>g,windowStride,windowReverse:dx<0||dx===0&&dz<0,
  omitWindow:distance=>[-.75,0,.75].some(offset=>!isExposed(a[0]+dx/length*(distance+offset)+dz/length*.4,a[1]+dz/length*(distance+offset)-dx/length*.4))});
 wall.traverse(o=>{if(o.isMesh){resources.add(o.geometry);if(o.material!==brick&&o.material!==finish)resources.add(o.material);}});
 // Use the established window assemblies on both faces, with the existing
 // photographed roof edges and rainwater fittings retained above them.
 for(const face of wall.children)for(const child of [...face.children])if(child.name!=='Corridor round-headed window')face.remove(child);
 finishWorkshopWindowReveals(THREE,{wall,resources,reveal});
 // Cosmetic glazing/backing must not act as an opaque shutter to the sun.
 wall.traverse(o=>{if(/window reveal|glazing/.test(o.name))o.castShadow=false;});
 const openings=(wall.userData.openings??[]).filter(o=>o.side===1);
 for(const [mat,offset,thickness,top,name] of [[brick,0,.24,height,'Workshop arched exterior masonry'],[finish,.2425,.045,liningTop,'Workshop arched painted lining']]){
  const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(length,0);shape.lineTo(length,top);shape.lineTo(0,top);shape.closePath();
  for(const o of openings){const p=new THREE.Path();p.moveTo(o.x-o.width/2,o.y);p.lineTo(o.x+o.width/2,o.y);p.lineTo(o.x+o.width/2,o.y+o.spring);p.absarc(o.x,o.y+o.spring,o.radius,0,Math.PI,false);p.closePath();shape.holes.push(p);}
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false,curveSegments:24}),pos=geometry.attributes.position,uv=geometry.attributes.uv;
  if(joins)miterCorridorWall(geometry,length,joins,0,offset);
  for(let i=0;i<pos.count;i++)uv.setXY(i,(Math.abs(dx)>Math.abs(dz)?a[0]+pos.getX(i)*dx/length:a[1]+pos.getX(i)*dz/length)/CORRIDOR_FINISH.textureWidth,pos.getY(i)/CORRIDOR_FINISH.textureHeight);
  resources.add(geometry);const mesh=new THREE.Mesh(geometry,mat);mesh.position.z=offset;mesh.name=name;mesh.castShadow=mesh.receiveShadow=true;mesh.userData.walkBarrier=mat===brick;mesh.userData.noWalkingCollision=mat!==brick;wall.add(mesh);
 }
 if(dark){
  const geometry=new THREE.BoxGeometry(length,.14,.045);resources.add(geometry);
  if(joins)miterCorridorWall(geometry,length,joins,length/2,.31);
  const skirting=new THREE.Mesh(geometry,dark);skirting.position.set(length/2,.11,.31);skirting.name='Workshop arched-wall skirting';skirting.castShadow=skirting.receiveShadow=true;skirting.userData.noWalkingCollision=true;wall.add(skirting);
 }
 group.userData.workshopWindowWalls??=[];group.userData.workshopWindowWalls.push({a,b,count:openings.length});
 return true;
}

// Remove passage volumes and any supplied room volumes from adjoining shells.
// Original vertex attributes survive; the caller retains originals for replay.
export function galleryShellRemainders(THREE,object,resources,extraVolumes=[],runs=ESCAPE_CORRIDOR_RUNS){
 const g=WORKSHOP_GALLERY,result=[];
 // Keep authored concave courts open after clipping. A hull of an entire ward
 // bridges its inward corners and turns empty lawn into invisible masonry.
 const footprints=object.userData.collisionFootprints??(object.userData.collisionFootprint?[object.userData.collisionFootprint]:[]);
 const triangles=footprints.flatMap(points=>THREE.ShapeUtils.triangulateShape(points.map(([x,z])=>new THREE.Vector2(x,z)),[]).map(indices=>indices.map(i=>points[i])));
 let pieces=[object.geometry];
 // Clip in each run's local frame, so diagonal shells retain exact bounds.
 for(const run of [...runs,...extraVolumes]){
 const dx=run.end[0]-run.start[0],dz=run.end[1]-run.start[1],length=Math.hypot(dx,dz),frame=new THREE.Matrix4().makeRotationY(-Math.atan2(dz,dx));frame.setPosition(run.start[0],0,run.start[1]);
 const transform=frame.clone().invert().multiply(object.matrixWorld),nextPieces=[],startPadding=run.startPadding??.32,endPadding=run.endPadding??.32;
 for(const source of pieces){
 if(!source.boundingBox)source.computeBoundingBox();const bounds=source.boundingBox.clone().applyMatrix4(transform),half=run.half??(g.maxX-g.minX)/2+.32;
 if(bounds.min.y>=g.height||bounds.max.x<-startPadding||bounds.min.x>length+endPadding||bounds.max.z<-half||bounds.min.z>half){nextPieces.push(source);continue;}
 let rest=source;
 for(const [axis,edge,sign] of [['y',g.height,1],['x',-startPadding,-1],['x',length+endPadding,1],['z',-half,-1],['z',half,1]]){
  const part=clipTimelineGeometry(THREE,rest,transform,edge,sign,axis);
  const next=clipTimelineGeometry(THREE,rest,transform,edge,-sign,axis,false);
  if(rest!==object.geometry)rest.dispose();rest=next;
  if(part.attributes.position.count)nextPieces.push(part);else part.dispose();
 }
 rest.dispose();}
 pieces=nextPieces;
 }
 for(const piece of pieces){const part=piece===object.geometry?piece.clone():piece;resources.add(part);const mesh=object.clone();mesh.geometry=part;mesh.name=object.name+' outside accessible gallery';mesh.visible=true;delete mesh.userData.aerialBatchSource;
   // Clipped diagonal ranges need their actual projected boundary, since a
   // rotated bounding rectangle can otherwise protrude into the open passage.
   const points=new Map(),p=part.attributes.position;for(let i=0;i<p.count;i++)points.set(p.getX(i)+','+p.getZ(i),[p.getX(i),p.getZ(i)]);const sorted=[...points.values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
   const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);function half(list){const hull=[];for(const point of list){while(hull.length>1&&cross(hull.at(-2),hull.at(-1),point)<=1e-7)hull.pop();hull.push(point);}hull.pop();return hull;}
   const hull=[...half(sorted),...half([...sorted].reverse())];
   if(triangles.length){
    // Each remainder is clipped by convex half-spaces. Intersect that envelope
    // with the original footprint's triangles, preserving every concave gap.
    mesh.userData.collisionFootprints=triangles.map(triangle=>{
     let polygon=triangle;
     for(let i=0;i<hull.length&&polygon.length;i++){
      const a=hull[i],b=hull[(i+1)%hull.length],distance=p=>cross(a,b,p),next=[];
      for(let j=0;j<polygon.length;j++){
       const p=polygon[j],q=polygon[(j+1)%polygon.length],dp=distance(p),dq=distance(q),inside=dp>=-1e-7;
       if(inside)next.push(p);
       if(inside!==(dq>=-1e-7)){const t=dp/(dp-dq);next.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}
      }
      polygon=next;
     }
     return polygon;
    }).filter(p=>p.length>=3&&Math.abs(p.reduce((area,a,i)=>{const b=p[(i+1)%p.length];return area+a[0]*b[1]-b[0]*a[1];},0))>1e-8);
    delete mesh.userData.collisionFootprint;
   }else mesh.userData.collisionFootprint=hull;
   result.push(mesh);
 }
 return result;
}

