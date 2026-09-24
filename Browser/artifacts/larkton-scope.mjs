import {createHash} from 'node:crypto';
export function larktonProtected(THREE,annexe){
 annexe.updateMatrixWorld(true);const rows=[],instance=new THREE.Matrix4();
 annexe.traverse(o=>{
  if(!o.isMesh)return;
  for(let p=o;p&&p!==annexe;p=p.parent)if(p.userData.wardId==='larkton-jodrell')return;
  const h=createHash('sha256');for(const [key,a] of Object.entries(o.geometry.attributes).sort()){h.update(key);h.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
  if(o.geometry.index)h.update(Buffer.from(o.geometry.index.array.buffer));const geometry=h.digest('hex');
  const local=o.matrix.clone();for(let p=o.parent;p&&p!==annexe;p=p.parent)local.premultiply(p.matrix);
  const record=m=>rows.push(JSON.stringify([o.name,geometry,[o.material].flat().map(m=>m.color?.getHex()),m.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow]));
  if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);record(new THREE.Matrix4().multiplyMatrices(local,instance));}else record(local);
 });
 return {count:rows.length,sha256:createHash('sha256').update(rows.sort().join('\n')).digest('hex'),root:annexe.matrix.toArray().map(n=>n||0)};
}
