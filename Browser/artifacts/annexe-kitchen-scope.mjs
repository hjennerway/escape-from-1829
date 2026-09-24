import {createHash} from 'node:crypto';
import {ANNEXE,ANNEXE_SITE} from '../dist/annexe.mjs';

// Freeze every primitive outside the three rear ranges being revised. In
// particular, both earlier Oakmere photo assemblies remain protected even
// where they overlap that area. Compare in the annexe's local coordinates.
export function protectedKitchenGeometry(THREE,annexe){
 annexe.updateMatrixWorld(true);
 const instance=new THREE.Matrix4(),matrix=new THREE.Matrix4(),records=[];
 // Legacy drives stay fixed in world space. Compare them in the original
 // entrance-centred frame used by this snapshot, not the translated building.
 const c=Math.cos(ANNEXE.rotation),s=Math.sin(ANNEXE.rotation),[x,z]=ANNEXE.frontAnchor;
 const driveInverse=annexe.matrixWorld.clone().setPosition(new THREE.Vector3(
  ANNEXE_SITE.x+(ANNEXE_SITE.scale-ANNEXE.scale)*(c*x+s*z),0,
  ANNEXE_SITE.z+(ANNEXE_SITE.scale-ANNEXE.scale)*(-s*x+c*z)
 )).invert();
 annexe.traverse(o=>{
  // Later additive Oakmere work is independently checked by test-oakmere-court.
  for(let p=o;p;p=p.parent)if(p.name==='Oakmere rear court additions')return;
  if(!o.isMesh)return;
  let protectedDetail=false;
  for(let p=o;p&&p!==annexe;p=p.parent){
   if(p.name==='Annexe rear kitchen and paving')return;
   if(p.name==='Oakmere lawn elevation'||p.name==='Oakmere west lawn elevation')protectedDetail=true;
  }
  if(!protectedDetail&&/^Rear court (front|back|east)/.test(o.name))return;
  const hash=createHash('sha256');
  for(const [key,a] of Object.entries(o.geometry.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
  if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer));
  const geometry=hash.digest('hex'),materials=[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]);
  const local=o.matrix.clone();
  for(let p=o.parent;p&&p!==annexe;p=p.parent)local.premultiply(p.matrix);
  if(o.name==='Annexe drive')local.multiplyMatrices(driveInverse,o.matrixWorld);
  const record=m=>{
   const [x,,z]=new THREE.Vector3().setFromMatrixPosition(m).toArray();
   // Unnamed facade instances of the front/back/east rear-court ranges.
   if(!protectedDetail&&o.isInstancedMesh&&o.parent===annexe&&x>-32&&x<24&&z>-73&&z<-31.8)return;
   // Generic chimney pots of those same ranges.
   if(!protectedDetail&&o.name==='Terracotta chimney pot'&&x>-32&&x<24&&z>-73&&z<-31.8)return;
   records.push(JSON.stringify([o.name,geometry,materials,m.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow,!!o.userData.orientedCollision]));
  };
  if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);record(matrix.multiplyMatrices(local,instance));}else record(local);
 });
 return {primitives:records.length,sha256:createHash('sha256').update(records.sort().join('\n')).digest('hex')};
}
