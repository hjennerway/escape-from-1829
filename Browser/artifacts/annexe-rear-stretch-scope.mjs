import {createHash} from 'node:crypto';

export function rearStretchSnapshot(THREE,annexe){
 annexe.updateMatrixWorld(true);
 const inverse=annexe.matrixWorld.clone().invert(),instance=new THREE.Matrix4(),matrix=new THREE.Matrix4();
 function fingerprint(root,protectedOnly=false){
  const records=[],localInverse=root===annexe?inverse:root.matrixWorld.clone().invert();
  root.traverse(o=>{
   if(!o.isMesh)return;
   if(protectedOnly){
    for(let p=o;p&&p!==annexe;p=p.parent)if(['Rear court west assembly','Oakmere west lawn elevation','Annexe rear kitchen and paving','Oakmere','Leighton/Newton'].includes(p.name))return;
    if(/^Rear court |^Rear service court link/.test(o.name))return;
   }
   const hash=createHash('sha256');
   for(const [key,a] of Object.entries(o.geometry.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
   if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer));
   const geometry=hash.digest('hex'),materials=[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]);
   const local=new THREE.Matrix4().multiplyMatrices(localInverse,o.matrixWorld);
   // Rear ward groups are translated in their generated coordinates. Remove
   // their common displacement using the original range centre as an anchor.
   if(root!==annexe)local.elements[14]-=root.userData.ranges[0].z-root.position.z;
   const record=m=>{
    const x=m.elements[12],z=m.elements[14];
    if(protectedOnly&&o.parent===annexe&&(o.isInstancedMesh||o.name==='Terracotta chimney pot')&&x>-44&&x<25&&z<-31.8&&z>-110)return;
    records.push(JSON.stringify([o.name,geometry,materials,m.elements.map(n=>+n.toFixed(5)),o.castShadow,o.receiveShadow,!!o.userData.orientedCollision]));
   };
   if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);record(matrix.multiplyMatrices(local,instance));}else record(local);
  });
  return {primitives:records.length,sha256:createHash('sha256').update(records.sort().join('\n')).digest('hex')};
 }
 return {front:fingerprint(annexe,true),root:annexe.matrix.toArray(),
  wings:Object.fromEntries(['oakmere','leighton-newton'].map(id=>[id,fingerprint(annexe.userData.wards[id])])),
  ranges:annexe.userData.ranges.map(({name,x,z,w,d,h,r})=>({name,x,z,w,d,h,r}))};
}
