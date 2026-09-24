import {createHash} from 'node:crypto';

export function removedCardenBayPart(o,m){
 let east=false;for(let p=o.parent;p;p=p.parent)if(p.name==='East mirrored side details')east=true;
 if(east&&/canted bay/.test(o.name))return true;
 return o.isInstancedMesh&&o.parent?.name==='The annexe'&&m.elements[12]>28.6&&m.elements[12]<40.4&&m.elements[14]>-17.5&&m.elements[14]<-4.5&&m.elements[13]<4.6;
}

// Latest annotation permits replacing the east bay and shortening the raised
// spine at the hall join. Freeze every original primitive outside that scope.
export function cardenCorrectionSnapshot(THREE,annexe,{excludeConcurrentJarman=false}={}){
 annexe.updateMatrixWorld(true);const rows=[],instance=new THREE.Matrix4();
 annexe.traverse(o=>{
  // Later additive Oakmere work is independently checked by test-oakmere-court.
  for(let p=o;p;p=p.parent)if(p.name==='Oakmere rear court additions')return;
  if(!o.isMesh)return;
  if(excludeConcurrentJarman)for(let p=o;p&&p!==annexe;p=p.parent)if(p.name==='West court front elevation')return;
  for(let p=o;p&&p!==annexe;p=p.parent)if(['Carden side elevation','Oakmere lawn elevation'].includes(p.name))return;
  if(/^Central rear (spine|low hall link)/.test(o.name))return;
  const local=o.matrix.clone();for(let p=o.parent;p&&p!==annexe;p=p.parent)local.premultiply(p.matrix);
  const h=createHash('sha256');for(const [key,a] of Object.entries(o.geometry.attributes).sort()){h.update(key);h.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
  if(o.geometry.index)h.update(Buffer.from(o.geometry.index.array.buffer));
  const geometry=h.digest('hex'),materials=[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]);
  const record=m=>{
   if(removedCardenBayPart(o,m))return;
   const x=m.elements[12],z=m.elements[14];
   if(o.parent===annexe&&(o.isInstancedMesh||o.name==='Terracotta chimney pot')&&Math.abs(x)<8.6&&z>-33&&z<-7.7)return;
   rows.push(JSON.stringify([o.name,geometry,materials,m.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow,!!o.userData.orientedCollision]));
  };
  if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);record(new THREE.Matrix4().multiplyMatrices(local,instance));}else record(local);
 });
 return {primitives:rows.length,sha256:createHash('sha256').update(rows.sort().join('\n')).digest('hex'),root:annexe.matrix.toArray().map(n=>n||0)};
}
