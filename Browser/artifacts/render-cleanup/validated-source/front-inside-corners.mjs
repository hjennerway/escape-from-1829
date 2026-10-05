import {FRONT_BASEMENT_OUTER_FLIGHT} from './front-basement.mjs';
import {WEST_RANGE_PLAN} from './west-range-plan.mjs';
// The yellow polyline in Research/front-inside-corners/shape.png, registered
// to the existing east wing's inner wall (x=32) and frontage (z=19.7).
// Dimensions are photo estimates; the west corner reflects the same plan.
export const FRONT_CORNER_OUTLINE=Object.freeze([
  [29.075,19.7],[29.075,17.3],[30.875,15.5],
  [33.65,15.5],[33.725,19.325],[32,21.05]
].map(Object.freeze));
// Owner's yellow west-corner guide, 4 October 2026. The new lower section
// follows the landing-wall end, steps out at z=18.5 and meets the low wing.
export const WEST_CORNER_INFILL=Object.freeze({
  wallX:-FRONT_CORNER_OUTLINE[3][0],stepZ:18.5,wingX:-32,
  rearZ:FRONT_CORNER_OUTLINE[2][1],frontZ:WEST_RANGE_PLAN.innerFrontZ,
  left:WEST_RANGE_PLAN.innerRight,height:8.6,roofTop:8.83
});
export const FRONT_CORNER_VIEWS=Object.freeze({
  'front-corner-1':{position:[30.15,1.8,25.9],target:[31.15,4.4,17.2],fov:80},
  'front-corner-2':{position:[26.7,1.8,29.5],target:[31.4,4.3,17.4],fov:66},
  'front-corner-west':{position:[-26.7,1.8,29.5],target:[-31.4,4.3,17.4],fov:66},
  'front-corners':{position:[50,37,67],target:[26,6,18],fov:46}
});

// Subtract a convex vertical prism. Keeping the interpolated attributes lets
// the existing pitched slate roofs and brick textures end at the new walls.
const sideOf=(p,a,b)=>(b[0]-a[0])*(p[2]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
// Cut old slabs slightly behind the replacement wall skin. Their open
// triangle edges otherwise share its plane and show as pale/diagonal lines.
function clearanceOutline(outline,distance){
  const normals=outline.map((a,i)=>{
    const b=outline[(i+1)%outline.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    return [(b[1]-a[1])/length,(a[0]-b[0])/length];
  });
  return outline.map(([x,z],i)=>{
    const a=normals[(i+normals.length-1)%normals.length],b=normals[i];
    const scale=distance/(1+a[0]*b[0]+a[1]*b[1]);
    return [x+(a[0]+b[0])*scale,z+(a[1]+b[1])*scale];
  });
}
function splitPolygon(points,a,b){
  const inside=[],outside=[];
  for(let i=0;i<points.length;i++){
    const p=points[i],q=points[(i+1)%points.length],dp=sideOf(p,a,b),dq=sideOf(q,a,b);
    if(dp>=-1e-8)inside.push(p);
    if(dp<=1e-8)outside.push(p);
    if((dp>1e-8&&dq< -1e-8)||(dp< -1e-8&&dq>1e-8)){
      const t=dp/(dp-dq),cross=p.map((v,j)=>v+(q[j]-v)*t);
      inside.push(cross);outside.push(cross);
    }
  }
  return {inside,outside};
}
function subtract(points,outline){
  const fragments=[];let remainder=points;
  for(let i=0;i<outline.length&&remainder.length>=3;i++){
    const {inside,outside}=splitPolygon(remainder,outline[i],outline[(i+1)%outline.length]);
    if(outside.length>=3)fragments.push(outside);
    remainder=inside;
  }
  return fragments;
}
function cutGeometry(THREE,geometry,transform,outline){
  const source=geometry.index?geometry.toNonIndexed():geometry;
  const p=source.attributes.position,n=source.attributes.normal,uv=source.attributes.uv;
  const vertices=[],normals=[],tex=[],normalMatrix=new THREE.Matrix3().getNormalMatrix(transform);
  for(let i=0;i<p.count;i+=3){
    const triangle=[];
    for(let j=i;j<i+3;j++){
      const v=new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(transform);
      const normal=new THREE.Vector3().fromBufferAttribute(n,j).applyMatrix3(normalMatrix).normalize();
      triangle.push([...v.toArray(),...normal.toArray(),uv?.getX(j)??0,uv?.getY(j)??0]);
    }
    for(const polygon of subtract(triangle,outline))for(let k=1;k<polygon.length-1;k++){
      const tri=[polygon[0],polygon[k],polygon[k+1]];
      if(transform.determinant()<0)tri.reverse();
      for(const v of tri){vertices.push(...v.slice(0,3));normals.push(...v.slice(3,6));tex.push(...v.slice(6,8));}
    }
  }
  if(source!==geometry)source.dispose();
  const result=new THREE.BufferGeometry();
  result.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  result.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
  result.setAttribute('uv',new THREE.Float32BufferAttribute(tex,2));
  return result;
}
const reflectedOutline=side=>side===1?FRONT_CORNER_OUTLINE:FRONT_CORNER_OUTLINE.map(([x,z])=>[-x,z]).reverse();

export function refineFrontInsideCorners(THREE,{model,batches,box,mesh,worldUV,brick,white,roof,material,details}){
  // Perform the cut before adding the replacement masonry, openings and yard.
  model.updateMatrixWorld(true);
  const bounds=new THREE.Box3(),dummy=new THREE.Object3D();
  // Extend the two open ends through the slate overhang. Closing the roof cut
  // on the wall footprint leaves triangular roof tongues over the courtyard.
  const roofOutline=FRONT_CORNER_OUTLINE.map(p=>[...p]);
  roofOutline[0][1]=20.2;
  roofOutline[5]=[31.55,21.5];
  const cuts=[-1,1].map(side=>({side,outline:reflectedOutline(side),
    roofOutline:side===1?roofOutline:roofOutline.map(([x,z])=>[-x,z]).reverse(),
    minX:side<0?-33.725:29.075,maxX:side<0?-29.075:33.725}));
  // Owner's later purple/yellow west view: extend the flat back wall to the
  // pavilion, removing the short z=17 face and its cornice/roof overhang.
  const westBackZ=FRONT_CORNER_OUTLINE[2][1],westBackX=-FRONT_CORNER_OUTLINE[3][0];
  const westRootZ=WEST_RANGE_PLAN.innerFrontZ;
  const westJoin=[[-38.45,westBackZ],[westBackX,westBackZ],[westBackX,westRootZ],[-38.45,westRootZ]];
  cuts.push({side:-1,outline:westJoin,roofOutline:westJoin,minX:-38.45,maxX:westBackX,maxZ:westRootZ});
  for(const cut of cuts)cut.surfaceOutline=clearanceOutline(cut.outline,.04);
  const overlaps=(b,c)=>b.max.y>.5&&b.max.x>c.minX&&b.min.x<c.maxX&&b.max.z>15.5&&b.min.z<(c.maxZ??21.05);
  function clip(object,cut){
    const oldGeometry=object.geometry,transform=object.matrixWorld.clone();
    oldGeometry.computeBoundingBox();
    const local=oldGeometry.boundingBox;
    // Preserve the actual remaining ground footprint for walking collisions.
    const footprints=object.userData.collisionFootprints??[object.userData.collisionFootprint??[
      [local.min.x,local.min.z],[local.max.x,local.min.z],
      [local.max.x,local.max.z],[local.min.x,local.max.z]
    ]];
    object.userData.collisionFootprints=footprints.flatMap(polygon=>subtract(polygon.map(([x,z])=>{
      const p=new THREE.Vector3(x,0,z).applyMatrix4(transform);return [p.x,0,p.z];
    }),cut.outline).map(polygon=>polygon.map(p=>[p[0],p[2]])));
    object.geometry=cutGeometry(THREE,oldGeometry,transform,object.material===roof?cut.roofOutline:cut.surfaceOutline);
    object.position.set(0,0,0);object.rotation.set(0,0,0);object.scale.set(1,1,1);object.updateMatrixWorld(true);
    // All affected meshes are direct model children; geometry now uses estate coordinates.
    if(!object.geometry.attributes.position.count)object.removeFromParent();
  }
  for(const object of [...model.children]){
    if(!object.isMesh||object.isInstancedMesh||object.userData.frontCornerTrim)continue;
    bounds.setFromObject(object);
    for(const cut of cuts)if(overlaps(bounds,cut))clip(object,cut);
  }
  for(const [mat,items] of batches){
    const retained=[];
    for(const item of items){
      dummy.position.set(item.x,item.y,item.z);dummy.rotation.set(0,item.rotation,0);dummy.scale.set(item.w,item.h,item.d);dummy.updateMatrix();
      bounds.setFromCenterAndSize(new THREE.Vector3(),new THREE.Vector3(1,1,1)).applyMatrix4(dummy.matrix);
      const activeCuts=cuts.filter(c=>overlaps(bounds,c));
      if(!activeCuts.length){retained.push(item);continue;}
      const object=mesh(new THREE.BoxGeometry(1,1,1),mat);
      object.matrixWorld.copy(dummy.matrix);object.name='Front inside corner trimmed existing detail';
      for(const cut of activeCuts)clip(object,cut);
    }
    batches.set(mat,retained);
  }
  // The former generic principal-block sash at the back of each recess is
  // replaced by the photographed landing windows and door below.
  const inCut=o=>cuts.some(c=>c.outline.every((a,i)=>sideOf([o.x,0,o.z],a,c.outline[(i+1)%c.outline.length])>=-1e-8));
  const oldOpenings=model.userData.eastPhotoOpenings;
  oldOpenings.splice(0,oldOpenings.length,...oldOpenings.filter(o=>!inCut(o)));

  const {sash,frame,glass,iron,recess}=details;
  const coping=material(0xcbd2ce),asphalt=material(0x626864),blue=material(0x19354a);
  const openings=[];
  for(const side of [-1,1]){
    const label=side<0?'West':'East';
    const points=FRONT_CORNER_OUTLINE.map(([x,z])=>[side*x,z]);
    const {wallX,stepZ,wingX,rearZ,frontZ,left,height,roofTop}=WEST_CORNER_INFILL;
    const westRoot=[[wallX,rearZ],[wallX,stepZ],[wingX,stepZ],[wingX,frontZ]];
    function wallPoint(i,t=.5,offset=0){
      const root=side<0&&(i===3||i===4);
      const segment=i===3?0:2;
      const a=i===5?[westBackX,westBackZ]:root?westRoot[segment]:points[i],b=i===5?[-38,westBackZ]:root?westRoot[segment+1]:points[i+1],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
      const nx=-side*dz/length,nz=side*dx/length;
      return {x:a[0]+t*dx+nx*offset,z:a[1]+t*dz+nz*offset,nx,nz,length,rotation:Math.atan2(nx,nz)};
    }
    // Shared offsets put both ends of each coping on the same mitre line.
    function copingPoint(i,t,offset){
      if(i===5||(side<0&&(i===3||i===4||(i===2&&t===1))))return wallPoint(i,t,offset);
      const p=wallPoint(i,t);
      const vertex=t===0?i:t===1?i+1:null;
      if(vertex===null||vertex===0||vertex===points.length-1)return wallPoint(i,t,offset);
      const a=wallPoint(vertex-1),b=wallPoint(vertex),nx=a.nx+b.nx,nz=a.nz+b.nz;
      const scale=offset/(nx*b.nx+nz*b.nz);
      return {...p,x:p.x+nx*scale,z:p.z+nz*scale};
    }
    function wall(i,height){
      const p=wallPoint(i,.5,-.085);
      const body=mesh(worldUV(new THREE.BoxGeometry(p.length+.08,height,.17),1.7),brick,p.x,height/2,p.z,true);
      body.rotation.y=p.rotation;body.userData.orientedCollision=true;body.name=label+' inside corner brick facet '+i;
      // The continuous entrance course already follows the first two facets.
    }
    wall(0,13.35);wall(1,13.35);wall(2,12.8);
    if(side<0){
      // One solid footprint joins the pavilion and low wing, so its visible
      // stepped walls and ground-level walking collisions remain identical.
      const footprint=[[left,rearZ],...westRoot,[left,frontZ]];
      const prism=(bottom,top)=>{
        const shape=new THREE.Shape(footprint.map(([x,z])=>new THREE.Vector2(x,-z)));
        const g=new THREE.ExtrudeGeometry(shape,{depth:top-bottom,bevelEnabled:false});
        g.rotateX(-Math.PI/2);g.translate(0,bottom,0);return g;
      };
      const body=mesh(worldUV(prism(0,height),1.7),brick,0,0,0,true);
      body.name='West inside corner stepped infill masonry';body.userData.collisionFootprint=footprint;
      const cap=mesh(worldUV(prism(height,roofTop),3),material(0x444b4d),0,0,0,true);
      cap.name='West inside corner flat roof';
      // A single joined coping follows all three exposed sides of the roof.
      const positions=[];
      const normals=westRoot.slice(0,-1).map((a,i)=>{const b=westRoot[i+1],length=Math.hypot(b[0]-a[0],b[1]-a[1]);return [(b[1]-a[1])/length,(a[0]-b[0])/length];});
      const edgePoint=(i,offset)=>{
        const a=normals[Math.max(0,i-1)],b=normals[Math.min(i,normals.length-1)],scale=offset/(1+a[0]*b[0]+a[1]*b[1]);
        return [westRoot[i][0]+(a[0]+b[0])*scale,westRoot[i][1]+(a[1]+b[1])*scale];
      };
      for(let i=0;i<westRoot.length-1;i++){
        const q=[edgePoint(i,.045),edgePoint(i+1,.045)],r=[edgePoint(i,-.095),edgePoint(i+1,-.095)];
        for(const corners of [
          [[q[0][0],roofTop-.12,q[0][1]],[q[1][0],roofTop-.12,q[1][1]],[q[1][0],roofTop+.02,q[1][1]],[q[0][0],roofTop+.02,q[0][1]]],
          [[q[0][0],roofTop+.02,q[0][1]],[q[1][0],roofTop+.02,q[1][1]],[r[1][0],roofTop+.02,r[1][1]],[r[0][0],roofTop+.02,r[0][1]]]
        ])for(const triangle of [[0,2,1],[0,3,2]])for(const n of triangle)positions.push(...corners[n]);
      }
      const copingGeometry=new THREE.BufferGeometry();copingGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));copingGeometry.computeVertexNormals();
      mesh(copingGeometry,coping).name='West inside corner flat roof coping';
    }
    if(side>0){wall(3,8.6);wall(4,8.6);}
    if(side<0)wall(5,12.8);
    // Close the cut roof edges down to their supporting wall tops, using the
    // actual roof triangles so the old hips cannot bridge the open recess.
    const slate=model.children.filter(o=>o.isMesh&&o.material===roof);
    model.updateMatrixWorld(true);
    const ray=new THREE.Raycaster();
    for(const [i,height] of [[0,13.35],[1,13.35],[2,12.8],...(side>0?[[3,8.6],[4,8.6]]:[[5,12.8]])]){
      const vertices=[],uv=[],capVertices=[],centre=wallPoint(i,.5,-.085),orientation=centre.rotation;
      const triangles=side===1?[[0,1,2],[0,2,3]]:[[0,2,1],[0,3,2]];
      const samples=Array.from({length:25},(_,k)=>k/24);
      // Carry the low coping over the slate overhang to the wing's eaves,
      // while keeping its masonry closure on the original wall footprint.
      if(i===4)for(let k=1;k<=4;k++)samples.push(1+.4/(side<0?wallPoint(i).length:33.725-32)*k/4);
      for(let k=0;k<samples.length-1;k++){
        const a=copingPoint(i,samples[k],0),b=copingPoint(i,samples[k+1],0);
        const top=p=>{ray.set(new THREE.Vector3(p.x,25,p.z),new THREE.Vector3(0,-1,0));return Math.max(height,ray.intersectObjects(slate,false)[0]?.point.y??height);};
        // Sample just inside the slate: its cut boundary has no area for a
        // vertical ray, while the visible brick closure belongs on the wall.
        const ya=top(copingPoint(i,samples[k],-.015)),yb=top(copingPoint(i,samples[k+1],-.015));
        const quad=[[a.x,height,a.z],[b.x,height,b.z],[b.x,yb,b.z],[a.x,ya,a.z]];
        if(samples[k]<1)for(const triangle of triangles)for(const n of triangle){
          const v=quad[n];vertices.push(...v);uv.push(((v[0]-centre.x)*Math.cos(orientation)-(v[2]-centre.z)*Math.sin(orientation))/1.7,(v[1]-height/2)/1.7);
        }
        const fa=copingPoint(i,samples[k],.075),fb=copingPoint(i,samples[k+1],.075);
        const ra=copingPoint(i,samples[k],-.115),rb=copingPoint(i,samples[k+1],-.115);
        const frontA=[fa.x,ya-.1,fa.z],frontB=[fb.x,yb-.1,fb.z];
        const topA=[frontA[0],ya+.03,frontA[2]],topB=[frontB[0],yb+.03,frontB[2]];
        // Keep stepped roof contacts as brick returns, without turning a
        // horizontal coping into a tall vertical white stripe at the step.
        if(i!==0&&Math.abs(yb-ya)<.35)for(const corners of [[frontA,frontB,topB,topA],[topA,topB,[rb.x,yb+.03,rb.z],[ra.x,ya+.03,ra.z]]])
          for(const triangle of triangles)for(const n of triangle)capVertices.push(...corners[n]);
      }
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
      mesh(g,brick,0,0,0,true).name=label+' inside corner roof junction '+i;
      const cap=new THREE.BufferGeometry();cap.setAttribute('position',new THREE.Float32BufferAttribute(capVertices,3));cap.computeVertexNormals();
      mesh(cap,coping).name=label+' inside corner continuous coping '+i;
    }
    function window(i,y,w,h,t=.5){
      const p=wallPoint(i,t,.065),face=(side<0?'west':'east')+'-inside-corner-'+i;
      sash(face,p.x,y,p.z,p.rotation,w,h);openings.push({face,x:p.x,y,z:p.z,w,h,rotation:p.rotation,nx:p.nx,nz:p.nz});
    }
    // Short return, broad canted stair face, and narrower back landing stack.
    for(const [y,h] of [[1.45,2.15],[5.45,2.85],[9.85,2.9]])window(0,y,.88,h);
    for(const [y,h] of [[1.45,2.15],[5.45,2.85],[9.85,3.15]])window(1,y,1.32,h);
    window(2,5.6,.93,1.75,.66);window(2,10.25,.95,1.85,.42);window(2,2.05,.78,1.8,.79);
    for(const y of [1.9,6.3])window(3,y,.88,2.35,side<0?.5:.66);
    for(const y of [1.9,6.3])window(4,y,.82,2.35);
    // Single blue door with an upper dark glazed panel, as in both photos.
    const d=wallPoint(2,.24,.075),dw=.87,dh=2.55;
    box(recess,d.x,dh/2+.15,d.z,dw+.16,dh+.13,.11,d.rotation);
    box(blue,d.x+d.nx*.075,dh/2+.15,d.z+d.nz*.075,dw,dh,.09,d.rotation);
    box(glass,d.x+d.nx*.13,1.99,d.z+d.nz*.13,dw-.16,1.05,.04,d.rotation);
    for(const u of [-1,1])box(frame,d.x+Math.cos(d.rotation)*u*(dw+.07)/2+d.nx*.13,dh/2+.15,d.z-Math.sin(d.rotation)*u*(dw+.07)/2+d.nz*.13,.055,dh+.13,.06,d.rotation);
    for(const y of [.15,1.4,2.74])box(frame,d.x+d.nx*.14,y,d.z+d.nz*.14,dw+.13,.06,.06,d.rotation);
    const door=mesh(new THREE.BoxGeometry(dw+.3,.1,.45),coping,d.x,.24,d.z+.12);door.name=label+' inside corner door threshold';
    for(const i of [0,1,2]){
      const p=wallPoint(i,.025,.13),h=i===2?12.75:13.3;
      box(iron,p.x,h/2,p.z,.065,h,.065);
    }
    // Local asphalt court joins the existing wall walk and rounds onto grass.
    const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));
    shape.lineTo(side*32,-23.9);shape.lineTo(side*30.5,-25.1);shape.quadraticCurveTo(side*29.1,-24.6,side*28.5,-22.4);shape.lineTo(side*28.4,-19.7);shape.closePath();
    const court=mesh(new THREE.ShapeGeometry(shape),asphalt,0,.205,0);court.rotation.x=-Math.PI/2;court.name=label+' inside corner asphalt court';
    // The outer semi-basement stairs enter from this corner along the facade.
    // Remove the court above the treads and the end of the lower walk.
    const {outer,z,width}=FRONT_BASEMENT_OUTER_FLIGHT;
    const cut=[[28.4,z-width/2],[outer,z-width/2],[outer,z+width/2],[28.4,z+width/2]].map(([x,z])=>[side*x,z]);
    if(side<0)cut.reverse();
    court.updateMatrixWorld(true);const oldCourt=court.geometry;
    court.geometry=cutGeometry(THREE,oldCourt,court.matrixWorld,cut);oldCourt.dispose();
    court.position.set(0,0,0);court.rotation.set(0,0,0);
    const drain=mesh(new THREE.BoxGeometry(.4,.025,.28),iron,side*31.4,.226,21.7);drain.name=label+' inside corner drain';
  }
  model.userData.frontInsideCornerOpenings=openings;
  model.userData.frontInsideCornerOutline=FRONT_CORNER_OUTLINE;
}
