import {clipTimelineGeometry} from './estate-timeline.mjs';
import {addAdminCorridorDetail} from './admin-corridor-detail.mjs';
import {finishWorkshopWindowReveals,CORRIDOR_FINISH} from './workshop-interior-finish.mjs';
import {ESCAPE_GALLERY,ESCAPE_CORRIDOR_RUNS} from './escape-corridor-plan.mjs';
import {miterCorridorWall} from './corridor-wall-joins.mjs';

// Escape changes the finished passage; the surveyed estate route stays fixed.
export const WORKSHOP_GALLERY=ESCAPE_GALLERY;

export function addWorkshopArchedWall(THREE,{group,a,b,resources,brick,finish,reveal,material,dark,isExposed=()=>true,height=8.84,liningTop=5.05,joins}){
 const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
 if(length<2)return false;
 const wall=new THREE.Group();wall.name='Workshop exterior with semicircular windows';wall.position.set(a[0],0,a[1]);wall.rotation.y=-Math.atan2(dz,dx);group.add(wall);
 const detailLength=Math.max(4,length);
 addAdminCorridorDetail(THREE,{corridor:wall,start:(length-detailLength)/2,end:(length+detailLength)/2,cz:.1425,depth:.285,height,brick,material,worldUV:g=>g,
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
export function galleryShellRemainders(THREE,object,resources,extraVolumes=[]){
 const g=WORKSHOP_GALLERY,result=[];
 // Keep authored concave courts open after clipping. A hull of an entire ward
 // bridges its inward corners and turns empty lawn into invisible masonry.
 const footprints=object.userData.collisionFootprints??(object.userData.collisionFootprint?[object.userData.collisionFootprint]:[]);
 const triangles=footprints.flatMap(points=>THREE.ShapeUtils.triangulateShape(points.map(([x,z])=>new THREE.Vector2(x,z)),[]).map(indices=>indices.map(i=>points[i])));
 let pieces=[object.geometry];
 // Clip in each run's local frame, so diagonal shells retain exact bounds.
 for(const run of [...ESCAPE_CORRIDOR_RUNS,...extraVolumes]){
 const dx=run.end[0]-run.start[0],dz=run.end[1]-run.start[1],length=Math.hypot(dx,dz),frame=new THREE.Matrix4().makeRotationY(-Math.atan2(dz,dx));frame.setPosition(run.start[0],0,run.start[1]);
 const transform=frame.clone().invert().multiply(object.matrixWorld),nextPieces=[],startPadding=run.startPadding??.32;
 for(const source of pieces){
 if(!source.boundingBox)source.computeBoundingBox();const bounds=source.boundingBox.clone().applyMatrix4(transform),half=run.half??(g.maxX-g.minX)/2+.32;
 if(bounds.min.y>=g.height||bounds.max.x<-startPadding||bounds.min.x>length+.32||bounds.max.z<-half||bounds.min.z>half){nextPieces.push(source);continue;}
 let rest=source;
 for(const [axis,edge,sign] of [['y',g.height,1],['x',-startPadding,-1],['x',length+.32,1],['z',-half,-1],['z',half,1]]){
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

