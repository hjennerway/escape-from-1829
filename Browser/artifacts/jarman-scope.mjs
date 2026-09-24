import {createHash} from 'node:crypto';
export function jarmanProtected(THREE,root){
 root.updateMatrixWorld(true);const rows=[],instance=new THREE.Matrix4();
 root.traverse(o=>{
  if(!o.isMesh)return;
  for(let p=o;p;p=p.parent)if(p.name==='West court front elevation')return;
  const hash=createHash('sha256');
  for(const [key,a] of Object.entries(o.geometry.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
  if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer));
  const geometry=hash.digest('hex'),materials=[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]);
  const record=m=>rows.push(JSON.stringify([o.name,geometry,materials,m.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow,!!o.userData.orientedCollision]));
  if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);record(new THREE.Matrix4().multiplyMatrices(o.matrixWorld,instance));}else record(o.matrixWorld);
 });
 return {primitives:rows.length,sha256:createHash('sha256').update(rows.sort().join('\n')).digest('hex')};
}
