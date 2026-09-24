import {KML_13_ADDITIONS} from '../dist/kml-13-data.mjs';
import {KML_12_ADDITIONS} from '../dist/kml-12-data.mjs';
import {createHash} from 'node:crypto';
export function jarmanProtected(THREE,root){
 root.updateMatrixWorld(true);const rows=[],instance=new THREE.Matrix4();
 root.traverse(o=>{
  // Later additive Oakmere work is independently checked by test-oakmere-court.
  for(let p=o;p;p=p.parent)if(p.name==='Oakmere rear court additions')return;
  for(let p=o;p;p=p.parent)if(p.userData.lampPost||p.userData.willowTree||(p.userData.oakTree?.name==='Oak21'&&p.userData.oakTree.longitude===-2.903725817733399))return;
  // Exclude only the ten later mapped additions, keeping the older baseline intact.
  for(let p=o;p;p=p.parent){
   const tree=p.userData.oakTree??p.userData.adminPineTree;
   if(tree&&[...KML_12_ADDITIONS,...KML_13_ADDITIONS].some(point=>point.name===tree.name&&point.coordinates[0]===tree.longitude&&point.coordinates[1]===tree.latitude))return;
  }
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
