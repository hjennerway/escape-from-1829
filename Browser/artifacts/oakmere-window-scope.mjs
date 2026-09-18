import {createHash} from 'node:crypto';

// Only individual sash parts inside the owner's three marked window areas may
// change. Broad masonry courses, downpipes, roofs and the opposite face remain
// in the fingerprint, even when they belong to the same instanced mesh.
export function windowEditPart(object,matrix){
 if(!object.isInstancedMesh)return false;
 const [x,y,z]=[matrix.elements[12],matrix.elements[13],matrix.elements[14]];
 const [w,h,d]=[matrix.elements[0],matrix.elements[5],matrix.elements[10]].map(Math.abs);
 if(w>3||h>4.2||d>.3)return false;
 if(object.parent?.name==='Oakmere lawn elevation')
  return z>.67&&z<1.2&&Math.abs(x)<21&&((y>.7&&y<5.3)||(y>6.9&&y<11.5));
 if(object.parent?.name==='Oakmere west lawn elevation'){
  const blue=[9.3,16].some(centre=>Math.abs(x-centre)<1.1)&&y>6&&y<9.6&&z>.67&&z<.95;
  const red=x>21.7&&x<28.3&&y>.6&&y<3.9&&z>1.125&&z<1.4;
  return blue||red;
 }
 return false;
}

export function protectedWindowGeometry(THREE,annexe){
 annexe.updateMatrixWorld(true);
 const records=[],instance=new THREE.Matrix4(),world=new THREE.Matrix4();
 annexe.traverse(object=>{
  if(!object.isMesh)return;
  const hash=createHash('sha256');
  for(const [key,a] of Object.entries(object.geometry.attributes).sort()){
   hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));
  }
  if(object.geometry.index)hash.update(Buffer.from(object.geometry.index.array.buffer));
  const geometry=hash.digest('hex'),materials=[object.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]);
  const record=matrix=>records.push(JSON.stringify([object.name,geometry,materials,matrix.elements.map(n=>+n.toFixed(8)),object.castShadow,object.receiveShadow,!!object.userData.orientedCollision]));
  if(object.isInstancedMesh)for(let i=0;i<object.count;i++){
   object.getMatrixAt(i,instance);
   if(!windowEditPart(object,instance))record(world.multiplyMatrices(object.matrixWorld,instance));
  }else record(object.matrixWorld);
 });
 return {primitives:records.length,sha256:createHash('sha256').update(records.sort().join('\n')).digest('hex')};
}
