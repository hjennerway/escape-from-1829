import {createHash} from 'node:crypto';
import {LARKTON_SHIFT} from '../dist/annexe-larkton-recess.mjs';
import {ANNEXE_MAP_SCALE} from '../dist/annexe.mjs';
export function recessProtected(THREE,annexe){
 annexe.updateMatrixWorld(true);const rows=[],instance=new THREE.Matrix4();
 annexe.traverse(o=>{
  // Later additive Oakmere work is independently checked by test-oakmere-court.
  for(let p=o;p;p=p.parent)if(p.name==='Oakmere rear court additions')return;
  if(!o.isMesh)return;
  let ward=false;
  for(let p=o;p&&p!==annexe;p=p.parent){if(p.name==='Larkton recessed ward entrance')return;if(p.userData.wardId==='larkton-jodrell')ward=true;}
  if(ward&&o.name.startsWith('West court outer link'))return;
  const h=createHash('sha256');for(const [k,a] of Object.entries(o.geometry.attributes).sort()){h.update(k);h.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}if(o.geometry.index)h.update(Buffer.from(o.geometry.index.array.buffer));const geometry=h.digest('hex');
  const local=o.matrix.clone();for(let p=o.parent;p&&p!==annexe;p=p.parent)local.premultiply(p.matrix);
  if(ward&&annexe.userData.larktonRecess)local.elements[12]-=LARKTON_SHIFT*ANNEXE_MAP_SCALE;
  const record=m=>{
   const x=m.elements[12]/ANNEXE_MAP_SCALE,z=m.elements[14]/ANNEXE_MAP_SCALE;
   // Old link's anonymous trim, window and chimney-pot instances. Only this
   // ward is eligible; the complete neighbouring Tarvin geometry is protected.
   if(ward&&x>=-68.3&&x<=-57.7&&z>=-8.3&&z<=1.4)return;
   rows.push(JSON.stringify([o.name,geometry,[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness]),m.elements.map(n=>+n.toFixed(5)),o.castShadow,o.receiveShadow]));
  };
  if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);record(new THREE.Matrix4().multiplyMatrices(local,instance));}else record(local);
 });
 return {count:rows.length,sha256:createHash('sha256').update(rows.sort().join('\n')).digest('hex')};
}
