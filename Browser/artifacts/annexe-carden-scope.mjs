import {createHash} from 'node:crypto';

// The only pre-existing meshes changed by the Carden photo refinement are
// the upper spine masonry and its roof. All other original geometry is frozen,
// including the front, both towers, belfry, rear kitchen and ward ranges.
export function protectedCardenGeometry(THREE,annexe){
 annexe.updateMatrixWorld(true);
 const rows=[],instance=new THREE.Matrix4(),matrix=new THREE.Matrix4();
 annexe.traverse(o=>{
  if(!o.isMesh)return;
  let frontShift=0;
  // Independently normalize the concurrent, separately tested east-link restoration.
  for(let p=o;p&&p!==annexe;p=p.parent){
   if(p.name==='Carden side elevation'||p.name==='East court entrance link')return;
   if(p.name==='East outer ward assembly'||p.name==='Picton/Carden')frontShift+=p.position.x;
  }
  if(['Oakmere raised spine upper masonry','Oakmere raised spine slate roof'].includes(o.name))return;
  const hash=createHash('sha256');
  for(const [key,a] of Object.entries(o.geometry.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
  if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer));
  const geometry=hash.digest('hex'),materials=[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]);
  const local=o.matrix.clone();for(let p=o.parent;p&&p!==annexe;p=p.parent)local.premultiply(p.matrix);local.elements[12]-=frontShift;
  const record=m=>rows.push(JSON.stringify([o.name,geometry,materials,m.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow,!!o.userData.orientedCollision]));
  if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);record(matrix.multiplyMatrices(local,instance));}else record(local);
 });
 return {primitives:rows.length,sha256:createHash('sha256').update(rows.sort().join('\n')).digest('hex'),root:annexe.matrix.toArray().map(n=>n||0)};
}
