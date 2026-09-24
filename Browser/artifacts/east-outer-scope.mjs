import {createHash} from 'node:crypto';
import {ANNEXE_MAP_SCALE} from '../dist/annexe.mjs';
// Compare the retained east wing independently of other ongoing estate work.
// The rectangle includes removed ranges and newly exposed adjoining sashes.
export function eastOuterProtected(THREE,annexe){
 const group=annexe.userData.eastFrontWing,rows=[],instance=new THREE.Matrix4();
 group.updateMatrixWorld(true);
 group.traverse(o=>{
  // Later additive Oakmere work is independently checked by test-oakmere-court.
  for(let p=o;p;p=p.parent)if(p.name==='Oakmere rear court additions')return;
  if(!o.isMesh)return;
  for(let p=o;p&&p!==group;p=p.parent)if(p.name==='East outer veranda')return;
  const local=o.matrix.clone();for(let p=o.parent;p&&p!==group;p=p.parent)local.premultiply(p.matrix);
  const hash=createHash('sha256');for(const [k,a] of Object.entries(o.geometry.attributes).sort()){hash.update(k);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
  if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer));const geometry=hash.digest('hex');
  const record=m=>{
   const p=new THREE.Vector3().setFromMatrixPosition(m);
   // Source map units multiplied by ANNEXE_MAP_SCALE.
   const x=p.x/ANNEXE_MAP_SCALE,z=p.z/ANNEXE_MAP_SCALE;
   if(x>=76&&x<=101&&z>=-18&&z<=12)return;
   rows.push(JSON.stringify([o.name,geometry,[o.material].flat().map(m=>[m.color?.getHex(),m.roughness,m.metalness,m.side]),m.elements.map(v=>+v.toFixed(6))]));
  };
  if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);record(new THREE.Matrix4().multiplyMatrices(local,instance));}else record(local);
 });
 return {primitives:rows.length,sha256:createHash('sha256').update(rows.sort().join('\n')).digest('hex')};
}
