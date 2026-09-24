import {createHash} from 'node:crypto';
import {isTowerPart} from '../dist/annexe-tower-height.mjs';
export function cardenHeightSnapshot(THREE,a){
 a.updateMatrixWorld(true);const protectedRows=[],conservatory=[],towerRows=[],matrix=new THREE.Matrix4(),towers=a.userData.ranges.filter(b=>/^(East|West) square tower$/.test(b.name));
 a.traverse(o=>{
  // Later additive Oakmere work is independently checked by test-oakmere-court.
  for(let p=o;p;p=p.parent)if(p.name==='Oakmere rear court additions')return;
  if(!o.isMesh)return;
  const ancestors=[];for(let p=o;p&&p!==a;p=p.parent)ancestors.push(p.name);
  if(ancestors.includes('West court front elevation'))return;
  const inCarden=ancestors.includes('Carden side elevation');
  const h=createHash('sha256');for(const [key,v] of Object.entries(o.geometry.attributes).sort()){h.update(key);h.update(Buffer.from(v.array.buffer,v.array.byteOffset,v.array.byteLength));}if(o.geometry.index)h.update(Buffer.from(o.geometry.index.array.buffer));
  const geometry=h.digest('hex'),materials=[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]);
  const local=o.matrix.clone();for(let p=o.parent;p&&p!==a;p=p.parent)local.premultiply(p.matrix);
  const record=m=>{
   const entry=[o.name,geometry,materials,m.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow,!!o.userData.orientedCollision];
   const x=m.elements[12],y=m.elements[13],z=m.elements[14];
   if(isTowerPart(a,o,m,towers))towerRows.push(entry);
   else if(!inCarden)protectedRows.push(entry);
   if(inCarden&&((/conservatory/.test(o.name)&&!/low rear link/.test(o.name))||(o.isInstancedMesh&&x>=29.16&&y<6.7&&z<=-17.99&&z>=-30.2)))conservatory.push(entry);
  };
  if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);record(new THREE.Matrix4().multiplyMatrices(local,matrix));}else record(local);
 });
 const digest=rows=>({primitives:rows.length,sha256:createHash('sha256').update(rows.map(r=>JSON.stringify(r)).sort().join('\n')).digest('hex')});
 return {protected:digest(protectedRows),conservatory:digest(conservatory),towerRows,root:a.matrix.toArray(),conservatoryFootprint:a.userData.cardenElevation.userData.conservatoryFootprint};
}
