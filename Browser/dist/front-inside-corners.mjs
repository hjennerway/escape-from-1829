// The yellow polyline in Research/front-inside-corners/shape.png, registered
// to the existing east wing's inner wall (x=32) and frontage (z=19.7).
// Dimensions are photo estimates; the west corner reflects the same plan.
export const FRONT_CORNER_OUTLINE=Object.freeze([
  [29.075,19.7],[29.075,17.3],[30.875,15.5],
  [33.65,15.5],[33.725,19.325],[32,21.05]
].map(Object.freeze));
export const FRONT_CORNER_VIEWS=Object.freeze({
  'front-corner-1':{position:[30.15,1.8,25.9],target:[31.15,4.4,17.2],fov:80},
  'front-corner-2':{position:[26.7,1.8,29.5],target:[31.4,4.3,17.4],fov:66},
  'front-corner-west':{position:[-26.7,1.8,29.5],target:[-31.4,4.3,17.4],fov:66},
  'front-corners':{position:[50,37,67],target:[26,6,18],fov:46}
});

// Subtract a convex vertical prism. Keeping the interpolated attributes lets
// the existing pitched slate roofs and brick textures end at the new walls.
const sideOf=(p,a,b)=>(b[0]-a[0])*(p[2]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
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
  const overlaps=(b,c)=>b.max.y>.5&&b.max.x>c.minX&&b.min.x<c.maxX&&b.max.z>15.5&&b.min.z<21.05;
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
    object.geometry=cutGeometry(THREE,oldGeometry,transform,object.material===roof?cut.roofOutline:cut.outline);
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
    function wallPoint(i,t=.5,offset=0){
      const a=points[i],b=points[i+1],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
      const nx=-side*dz/length,nz=side*dx/length;
      return {x:a[0]+t*dx+nx*offset,z:a[1]+t*dz+nz*offset,nx,nz,length,rotation:Math.atan2(nx,nz)};
    }
    // Shared offsets put both ends of each coping on the same mitre line.
    function copingPoint(i,t,offset){
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
      // Recess masonry remains unpainted below the white frontage's floor band.
      if(i<2){
        const band=wallPoint(i,.5,.045);box(coping,band.x,3.15,band.z,p.length+.08,.25,.19,p.rotation);
      }
    }
    wall(0,13.35);wall(1,13.35);wall(2,12.8);wall(3,8.6);wall(4,8.6);
    // Close the cut roof edges down to their supporting wall tops, using the
    // actual roof triangles so the old hips cannot bridge the open recess.
    const slate=model.children.filter(o=>o.isMesh&&o.material===roof);
    model.updateMatrixWorld(true);
    const ray=new THREE.Raycaster();
    for(const [i,height] of [[0,13.35],[1,13.35],[2,12.8],[3,8.6],[4,8.6]]){
      const vertices=[],uv=[],capVertices=[],orientation=wallPoint(i).rotation;
      const triangles=side===1?[[0,1,2],[0,2,3]]:[[0,2,1],[0,3,2]];
      const samples=Array.from({length:25},(_,k)=>k/24);
      // Carry the low coping over the slate overhang to the wing's eaves,
      // while keeping its masonry closure on the original wall footprint.
      if(i===4)for(let k=1;k<=4;k++)samples.push(1+.4/(33.725-32)*k/4);
      for(let k=0;k<samples.length-1;k++){
        const a=copingPoint(i,samples[k],-.015),b=copingPoint(i,samples[k+1],-.015);
        const top=p=>{ray.set(new THREE.Vector3(p.x,25,p.z),new THREE.Vector3(0,-1,0));return Math.max(height,ray.intersectObjects(slate,false)[0]?.point.y??height);};
        const ya=top(a),yb=top(b);
        const quad=[[a.x,height,a.z],[b.x,height,b.z],[b.x,yb,b.z],[a.x,ya,a.z]];
        if(samples[k]<1)for(const triangle of triangles)for(const n of triangle){
          const v=quad[n];vertices.push(...v);uv.push((v[0]*Math.cos(orientation)-v[2]*Math.sin(orientation))/1.7,v[1]/1.7);
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
    for(const y of [1.9,6.3])window(3,y,.88,2.35,.66);
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
    const drain=mesh(new THREE.BoxGeometry(.4,.025,.28),iron,side*31.4,.226,21.7);drain.name=label+' inside corner drain';
  }
  model.userData.frontInsideCornerOpenings=openings;
  model.userData.frontInsideCornerOutline=FRONT_CORNER_OUTLINE;
}
