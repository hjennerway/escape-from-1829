import {createHash} from 'node:crypto';

// Undo only the two authorized rigid translations, then compare every old
// primitive. The new reflected link is checked separately by the regression.
export function frontLinkSnapshot(THREE,annexe,{includeCarden=false}={}){
 annexe.updateMatrixWorld(true);
 const rows=[],instance=new THREE.Matrix4();
 annexe.traverse(o=>{
  // Later additive Oakmere work is independently checked by test-oakmere-court.
  for(let p=o;p;p=p.parent)if(p.name==='Oakmere rear court additions')return;
  if(!o.isMesh)return;
  // Concurrent Carden work owns this new elevation and these two old meshes.
  if(!includeCarden&&['Oakmere raised spine upper masonry','Oakmere raised spine slate roof'].includes(o.name))return;
  let shift=0;
  for(let p=o.parent;p&&p!==annexe;p=p.parent){
   if(p.name==='East court entrance link'||(!includeCarden&&p.name==='Carden side elevation'))return;
   if(p.name==='East outer ward assembly'||p.name==='Picton/Carden')shift+=p.position.x;
  }
  const hash=createHash('sha256');
  for(const [key,a] of Object.entries(o.geometry.attributes).sort()){
   hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));
  }
  if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer));
  const geometry=hash.digest('hex'),local=o.matrix.clone();
  for(let p=o.parent;p&&p!==annexe;p=p.parent)local.premultiply(p.matrix);
  local.elements[12]-=shift;
  const record=m=>rows.push(JSON.stringify([o.name,geometry,[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]),m.elements.map(n=>+n.toFixed(5)),o.castShadow,o.receiveShadow,!!o.userData.orientedCollision]));
  if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);record(new THREE.Matrix4().multiplyMatrices(local,instance));}else record(local);
 });
 return {primitives:rows.length,sha256:createHash('sha256').update(rows.sort().join('\n')).digest('hex'),root:annexe.matrix.toArray(),ranges:annexe.userData.ranges.map(({name,x,z,w,d,h,r})=>({name,x,z,w,d,h,r}))};
}
