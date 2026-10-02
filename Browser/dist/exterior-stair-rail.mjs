// One authored edge supplies both visible ironwork and its continuous guard.
// Endpoints are at deck/tread height; openings are left to each stair builder.
export function addExteriorStairRail(THREE,parent,material,a,b,{height=1.1,name='Exterior stair guard',createMesh}={}){
 const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
 const positions=[],normals=[],uvs=[];
 function bar(p,q,width){
  const axis=q.clone().sub(p),g=new THREE.BoxGeometry(width,axis.length(),width).toNonIndexed();
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),axis.normalize()));
  g.translate((p.x+q.x)/2,(p.y+q.y)/2,(p.z+q.z)/2);
  positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);uvs.push(...g.attributes.uv.array);g.dispose();
 }
 for(const rise of [.12,height])bar(start.clone().add(new THREE.Vector3(0,rise,0)),end.clone().add(new THREE.Vector3(0,rise,0)),.045);
 const count=Math.max(1,Math.ceil(Math.hypot(delta.x,delta.z)/.2));
 for(let i=0;i<=count;i++){
  const p=start.clone().lerp(end,i/count);bar(p,p.clone().add(new THREE.Vector3(0,height,0)),i===0||i===count?.045:.028);
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
 const mesh=createMesh?createMesh(geometry,material):new THREE.Mesh(geometry,material);mesh.name=name;mesh.castShadow=mesh.receiveShadow=true;
 mesh.userData.stairGuard={a,b,height};parent.add(mesh);return mesh;
}

// Subdivide slopes so a high endpoint cannot obstruct a lower crossing or
// another flight. Apply the owning mesh's transform, including reflections.
export function stairGuardObstacles(THREE,guard,transform){
 const a=new THREE.Vector3(...guard.a).applyMatrix4(transform),b=new THREE.Vector3(...guard.b).applyMatrix4(transform);
 const height=new THREE.Vector3(0,guard.height,0).applyMatrix4(transform).y-new THREE.Vector3().applyMatrix4(transform).y;
 const length=Math.hypot(b.x-a.x,b.z-a.z),dx=(b.x-a.x)/length,dz=(b.z-a.z)/length,r=.025*transform.getMaxScaleOnAxis();
 const count=Math.max(1,Math.ceil(a.distanceTo(b)/.15)),parts=[];
 for(let i=0;i<count;i++){
  const p=a.clone().lerp(b,i/count),q=a.clone().lerp(b,(i+1)/count);
  const corners=[[p.x-dx*r-dz*r,p.z-dz*r+dx*r],[q.x+dx*r-dz*r,q.z+dz*r+dx*r],[q.x+dx*r+dz*r,q.z+dz*r-dx*r],[p.x-dx*r+dz*r,p.z-dz*r-dx*r]];
  const part={corners,minX:Math.min(...corners.map(v=>v[0])),maxX:Math.max(...corners.map(v=>v[0])),minZ:Math.min(...corners.map(v=>v[1])),maxZ:Math.max(...corners.map(v=>v[1]))};
  Object.defineProperties(part,{minY:{value:Math.min(p.y,q.y)-.03},maxY:{value:Math.max(p.y,q.y)+height+.025}});parts.push(part);
 }
 return parts;
}
