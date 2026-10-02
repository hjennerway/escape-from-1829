// Sweep one closed solid along a facade: shared corner offsets keep both the
// top and underside continuous, without overlapping bars or internal caps.
export function addFacadeCourse(THREE,{mesh,worldUV},name,material,line,y,height,width){
  const normals=line.slice(1).map((b,i)=>{
    const a=line[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
    return [-dz/length,dx/length];
  });
  const offset=distance=>line.map(([x,z],i)=>{
    const a=normals[Math.max(0,i-1)],b=normals[Math.min(i,normals.length-1)];
    const nx=a[0]+b[0],nz=a[1]+b[1],scale=distance/(nx*b[0]+nz*b[1]);
    return [x+nx*scale,z+nz*scale];
  });
  const left=offset(width/2),right=offset(-width/2),outline=[...left,...right.toReversed()];
  const shape=new THREE.Shape(outline.map(([x,z])=>new THREE.Vector2(x,-z)));
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,steps:1,curveSegments:1});
  geometry.rotateX(-Math.PI/2);geometry.translate(0,y-height/2,0);
  const part=mesh(worldUV(geometry,1.7),material,0,0,0,true);part.name=name;
  part.userData.facadeCourse={line,y,height,width};
  part.userData.collisionFootprints=line.slice(1).map((_,i)=>[left[i],left[i+1],right[i+1],right[i]]);
  // These are already fitted to the final facade, including the court bends.
  part.userData.frontCornerTrim=true;
  return part;
}

// Older ward builders instance their horizontal stone courses with windows.
// Join adjacent course ends before detail batching and collision extraction.
// Only thin, level, pale bars of the same material and vertical span qualify;
// frames, full wall/roof slabs, planting and ironwork are left in their builders.
export function joinInstancedFacadeCourses(THREE,model){
 const cross=(a,b)=>a.x*b.z-a.z*b.x,epsilon=1e-4,batches=[];
 model.traverse(o=>{if(o.isInstancedMesh&&o.geometry.type==='BoxGeometry'&&!o.instanceColor&&o.material?.color)batches.push(o);});
 for(const batch of batches){
  const color=batch.material.color;if(Math.min(color.r,color.g,color.b)<.3)continue;
  const runs=[],matrix=new THREE.Matrix4(),position=new THREE.Vector3(),scale=new THREE.Vector3(),quaternion=new THREE.Quaternion();
  const p=batch.geometry.parameters;
  for(let index=0;index<batch.count;index++){
   batch.getMatrixAt(index,matrix);matrix.premultiply(batch.matrix);
   if(Math.abs(matrix.elements[1])+Math.abs(matrix.elements[9])+Math.abs(matrix.elements[4])+Math.abs(matrix.elements[6])>epsilon)continue;
   matrix.decompose(position,quaternion,scale);
   const w=Math.abs(scale.x*p.width),h=Math.abs(scale.y*p.height),d=Math.abs(scale.z*p.depth),width=Math.min(w,d),length=Math.max(w,d);
   if(h<.08||h>.6||width>.65||length<1.5||length<width*3)continue;
   const axis=new THREE.Vector3(w>=d?1:0,0,w>=d?0:1).transformDirection(matrix),normal=new THREE.Vector3(-axis.z,0,axis.x);
   const ends=[-1,1].map(sign=>({sign,point:position.clone().addScaledVector(axis,sign*length/2),matches:[]}));
   runs.push({index,center:position.clone(),y:position.y,h,width,length,axis,normal,ends});
  }
  for(let i=0;i<runs.length;i++)for(let j=i+1;j<runs.length;j++){
   const a=runs[i],b=runs[j],den=cross(a.axis,b.axis);
   if(Math.abs(a.y-b.y)>epsilon||Math.abs(a.h-b.h)>epsilon||Math.abs(den)<.35)continue;
   const delta=b.center.clone().sub(a.center),along=cross(delta,b.axis)/den;
   const point=a.center.clone().addScaledVector(a.axis,along),reach=Math.max(a.width,b.width)*.85;
   const ea=a.ends.find(e=>e.point.distanceTo(point)<reach),eb=b.ends.find(e=>e.point.distanceTo(point)<reach);
   if(ea&&eb){ea.matches.push({run:b,end:eb,point});eb.matches.push({run:a,end:ea,point});}
  }
  for(const run of runs)for(const end of run.ends){
   const match=end.matches[0];end.join=end.matches.length===1&&match.end.matches.length===1?match:null;
  }
  const joined=runs.filter(r=>r.ends.some(e=>e.join));if(!joined.length)continue;
  const groups=new Map();
  for(const run of joined){
   const key=run.y.toFixed(4)+','+run.h.toFixed(4);
   if(!groups.has(key))groups.set(key,{positions:[],footprints:[],joins:[]});
   const group=groups.get(key),corners=run.ends.map(end=>[-1,1].map(side=>{
    const joint=end.join,point=(joint?.point??end.point).clone().addScaledVector(run.normal,side*run.width/2);
    if(joint){
     const otherSide=-end.sign*joint.end.sign*side;
     const other=joint.point.clone().addScaledVector(joint.run.normal,otherSide*joint.run.width/2);
     point.addScaledVector(run.axis,cross(other.sub(point),joint.run.axis)/cross(run.axis,joint.run.axis));
    }
    return [point.x,point.z];
   }));
   const outline=[corners[0][0],corners[1][0],corners[1][1],corners[0][1]];
   // X/Z winding reverses when viewed along +Y.
   const vertices=[...outline.map(([x,z])=>[x,run.y-run.h/2,z]),...outline.map(([x,z])=>[x,run.y+run.h/2,z])];
   const faces=[[3,2,1,0],[4,5,6,7],[0,1,5,4],[2,3,7,6]];
   if(!run.ends[0].join)faces.push([3,0,4,7]);
   if(!run.ends[1].join)faces.push([1,2,6,5]);
   for(const [a,b,c,d] of faces)for(const i of [a,c,b,a,d,c])group.positions.push(...vertices[i]);
   group.footprints.push(outline);
   for(const end of run.ends)if(end.join&&run.index<end.join.run.index)group.joins.push({point:end.join.point.toArray(),a:run.axis.clone().multiplyScalar(-end.sign).toArray(),b:end.join.run.axis.clone().multiplyScalar(-end.join.end.sign).toArray(),width:Math.min(run.width,end.join.run.width),height:run.h});
  }
  for(const {positions,footprints,joins} of groups.values()){
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();
   const pos=geometry.attributes.position,norm=geometry.attributes.normal,uv=[];
   for(let i=0;i<pos.count;i++)uv.push((Math.abs(norm.getX(i))>.5?pos.getZ(i):pos.getX(i))/1.7,(Math.abs(norm.getY(i))>.5?pos.getZ(i):pos.getY(i))/1.7);
   geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
   const part=new THREE.Mesh(geometry,batch.material);part.name=(batch.name||'Estate')+' joined stone courses';part.castShadow=batch.castShadow;part.receiveShadow=batch.receiveShadow;
   part.userData.collisionFootprints=footprints;part.userData.facadeBoxJoins=joins;batch.parent.add(part);
  }
  const removed=new Set(joined.map(r=>r.index));let count=0;
  for(let i=0;i<batch.count;i++)if(!removed.has(i)){batch.getMatrixAt(i,matrix);batch.setMatrixAt(count++,matrix);}
  batch.count=count;batch.instanceMatrix.needsUpdate=true;batch.boundingBox=null;batch.boundingSphere=null;
 }
}
