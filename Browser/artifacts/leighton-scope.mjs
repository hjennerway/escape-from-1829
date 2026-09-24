import {KML_12_ADDITIONS} from '../dist/kml-12-data.mjs';
import {createHash} from 'node:crypto';
export function leightonProtected(THREE,model){
 model.updateMatrixWorld(true);const rows=[],instance=new THREE.Matrix4();
 model.traverse(o=>{
  if(!o.isMesh)return;
  // Later mapped trees are additive; preserve the original surroundings exactly.
  for(let p=o;p;p=p.parent){
   const tree=p.userData.oakTree??p.userData.adminPineTree;
   if(tree&&KML_12_ADDITIONS.some(point=>point.name===tree.name&&point.coordinates[0]===tree.longitude&&point.coordinates[1]===tree.latitude))return;
  }
  for(let p=o;p;p=p.parent)if(p.userData.wardId==='leighton-newton')return;
  const h=createHash('sha256');for(const [k,a] of Object.entries(o.geometry.attributes).sort()){h.update(k);h.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}if(o.geometry.index)h.update(Buffer.from(o.geometry.index.array.buffer));
  const geometry=h.digest('hex'),local=o.matrixWorld;
  const record=m=>rows.push(JSON.stringify([o.name,geometry,[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness]),m.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow,!!o.userData.orientedCollision]));
  if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);record(new THREE.Matrix4().multiplyMatrices(local,instance));}else record(local);
 });return {count:rows.length,sha256:createHash('sha256').update(rows.sort().join('\n')).digest('hex')};
}
