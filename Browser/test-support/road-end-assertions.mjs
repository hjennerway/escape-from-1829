import assert from 'node:assert/strict';

export function assertRoadEndSurface(mesh){
 const {kind,columns}=mesh.userData.roadEndFade,{position:p,color:c,normal:n}=mesh.geometry.attributes;
 assert.equal(c.itemSize,4,'Ground fades retain vertex alpha, including compiled scenes');
 assert.equal(c.count,p.count);
 if(kind==='edge'){
  assert(!mesh.material.transparent&&mesh.material.depthWrite,'Kerbs remain solid instead of ghosting above the lawn');
  const stride=columns+1,rows=p.count/stride;
  for(let i=0;i<p.count;i++){
   assert(Number.isFinite(p.getX(i))&&Number.isFinite(p.getY(i))&&Number.isFinite(p.getZ(i)));
   assert(n.getY(i)>.99,'The solid kerb ramp faces upward');
   assert.equal(c.getW(i),1,'Stone stays opaque along the complete taper');
  }
  for(let column=0;column<stride;column++){
   assert(Math.abs(p.getY(column)-.32)<1e-6,'Solid kerbs meet the original border');
   assert(p.getY(p.count-stride+column)<-.15,'The kerb toe disappears below the actual lawn');
  }
  const span=row=>Math.hypot(p.getX(row*stride+columns)-p.getX(row*stride),p.getZ(row*stride+columns)-p.getZ(row*stride));
  assert(span(rows-1)<span(0)*.6,'The buried kerb narrows towards its toe');
  for(let row=1;row<rows;row++){
   const a=(row-1)*stride,b=row*stride,distance=Math.hypot(p.getX(b)-p.getX(a),p.getZ(b)-p.getZ(a));
   assert(p.getY(b)<=p.getY(a)+1e-6,'Kerbs slope continuously into the lawn');
   assert((p.getY(a)-p.getY(b))/distance<.14,'The kerb lowers gradually without a vertical end step');
  }
  const side=mesh.children.find(o=>o.userData.roadEndSide);
  assert(side&&!side.material.transparent&&side.material.depthWrite&&!side.material.polygonOffset,'Solid sides close the stone without transparency or depth pull-through');
  const q=side.geometry.attributes.position,alpha=side.geometry.attributes.color,normal=side.geometry.attributes.normal;
  assert.equal(q.count,(rows-1)*12,'Both sides of the tapered stone meet the ground');
  for(let i=0;i<q.count;i++){
   assert(Number.isFinite(q.getX(i))&&Number.isFinite(q.getY(i))&&Number.isFinite(q.getZ(i)));
   assert.equal(alpha.getW(i),1,'The kerb sides never fade');
   assert(Math.abs(normal.getY(i))<.01,'Kerb sides stay vertical');
  }
  for(let i=0;i<q.count;i+=6){
   const column=i<q.count/2?0:columns,row=(i/6)%(rows-1);
   for(const [j,station] of [[i,row],[i+2,row+1]]){
    const k=station*stride+column;
    assert(Math.hypot(q.getX(j)-p.getX(k),q.getY(j)-p.getY(k),q.getZ(j)-p.getZ(k))<1e-6,'Stone sides meet the sloping top');
   }
   assert(q.getY(i+1)<-.17,'Solid kerbs extend beneath the lawn');
  }
  return;
 }
 assert(mesh.material.vertexColors&&mesh.material.transparent&&!mesh.material.depthWrite,'Fades reveal the terrain without occluding other ground layers');
 assert(!mesh.userData.groundContactClosed,'No opaque skirt may replace the faded perimeter');
 let partial=0;
 for(let i=0;i<p.count;i++){
  assert(Number.isFinite(p.getX(i))&&Number.isFinite(p.getY(i))&&Number.isFinite(p.getZ(i)));
  assert(n.getY(i)>.99,'Road and sloping gravel face upward');
  assert(c.getW(i)>=0&&c.getW(i)<=1);
  if(c.getW(i)>0&&c.getW(i)<1)partial++;
 }
 assert(partial>columns*2,'A transition has several rows of gradual coverage');
 for(let i=0;i<=columns;i++){
  assert.equal(c.getW(i),1,'The transition meets the opaque road without a seam');
  assert.equal(c.getW(c.count-1-i),0,'No solid edge at the last row');
  if(kind==='gravel')assert(Math.abs(p.getY(p.count-1-i)+.145)<1e-6,'Gravel descends to five millimetres above the lawn');
 }
 const stride=columns+1,rows=p.count/stride;
 assert(p.getY(stride)<p.getY(0),'The gradient starts at the road seam, including asphalt and kerbs');
 assert(p.getY(p.count-stride)<p.getY(0)-.1,'Every fading layer descends instead of overhanging the gravel');
 for(let row=1;row<rows;row++){
  const a=(row-1)*stride,b=row*stride;
  assert(p.getY(b)<=p.getY(a)+1e-6,'The road drops continuously towards the lawn');
  const distance=Math.hypot(p.getX(b)-p.getX(a),p.getZ(b)-p.getZ(a));
  assert((p.getY(a)-p.getY(b))/distance<.05,'The drop remains a gentle gradient');
 }
 if(kind!=='gravel'){
  const side=mesh.children.find(o=>o.userData.roadEndSide);
  assert(side,'The verge and asphalt supports continue into the fade');
  assert(side.material.transparent&&!side.material.depthWrite&&!side.material.polygonOffset,'Side supports fade without pulling through the sloping top');
  const q=side.geometry.attributes.position,alpha=side.geometry.attributes.color,normal=side.geometry.attributes.normal;
  for(let i=0;i<q.count;i++)assert(Number.isFinite(q.getX(i))&&Number.isFinite(q.getY(i))&&Number.isFinite(q.getZ(i))&&Math.abs(normal.getY(i))<.01,'Fade supports retain finite, vertical faces');
  for(let i=0;i<q.count;i+=6){
   assert(q.getY(i+2)<=q.getY(i)+1e-6,'Side supports follow the descending top');
   if(kind==='asphalt')assert(q.getY(i)-q.getY(i+1)<.021,'Asphalt closes only its thin rim above the verge');
   else assert(q.getY(i+1)<-.15,'The fading verge continues below the lawn');
   for(const [j,column] of [[i,0],[i+2,1]]){
    const station=Math.floor((i/6)%(rows-1))+column;
    assert(Math.abs(q.getY(j)-p.getY(station*stride))<1e-6,'Side supports meet the sloping top exactly');
   }
   for(let j=i;j<i+6;j++)assert(alpha.getW(j)>=0&&alpha.getW(j)<=1,'Side support coverage stays feathered');
  }
  assert(alpha.getW(0)===1&&alpha.getW(alpha.count-1)===0,'Side supports dissolve instead of ending at a solid corner');
 }
}

// Check the actual supporting triangles, including restored compiled sources.
// A skirt across a fade seam creates the pale step visible through the blend.
export function assertRoadEndJoins(THREE,roots){
 const contacts=[],fades=[];
 for(const root of roots){root.updateWorldMatrix(true,true);root.traverse(mesh=>{
  if(mesh.userData.groundContact)contacts.push(mesh);
  if(mesh.userData.roadEndFade?.kind==='gravel')fades.push(mesh);
 });}
 const ray=new THREE.Raycaster();ray.near=0;ray.far=.12;
 for(const mesh of fades){
  const p=mesh.geometry.attributes.position,stride=mesh.userData.roadEndFade.columns+1;
  const left=new THREE.Vector3().fromBufferAttribute(p,0).applyMatrix4(mesh.matrixWorld);
  const right=new THREE.Vector3().fromBufferAttribute(p,stride-1).applyMatrix4(mesh.matrixWorld);
  const center=left.clone().lerp(right,.5),ahead=new THREE.Vector3().fromBufferAttribute(p,stride).applyMatrix4(mesh.matrixWorld);
  const direction=ahead.sub(left);direction.y=0;direction.normalize();
  const across=right.clone().sub(left).normalize(),half=left.distanceTo(right)/2;
  for(const offset of [-half-.3,-half+.1,0,half-.1,half+.3])for(const y of [0,.15,.30]){
   const origin=center.clone().addScaledVector(across,offset).addScaledVector(direction,.06);origin.y=y;
   ray.set(origin,direction.clone().negate());
   assert.equal(ray.intersectObjects(contacts,false).length,0,'No vertical road/kerb face crosses '+mesh.name);
  }
 }
 assert(fades.length,'Inspect actual grass-facing road seams');
 return fades.length;
}
