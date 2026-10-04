import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const stage=process.argv[2];
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,16/9);model.updateMatrixWorld(true);
const sidelights=[];
model.traverse(group=>{for(const o of group.userData.eastPhotoOpenings??[]){
 if(!o.face.endsWith('sidelight')&&!(o.face==='west-end-middle'&&o.w<1))continue;
 const r=o.face.startsWith('west-end-')?-Math.PI/2:o.face.startsWith('west-wing-')?Math.PI:0;
 sidelights.push({...o,centre:new THREE.Vector3(o.x,o.y,o.z).applyMatrix4(group.matrixWorld),normal:new THREE.Vector3(Math.sin(r),0,Math.cos(r)).transformDirection(group.matrixWorld),tangent:new THREE.Vector3(Math.cos(r),0,-Math.sin(r)).transformDirection(group.matrixWorld)});
}});
const rows=[],bars=[],local=new THREE.Matrix4(),world=new THREE.Matrix4(),centre=new THREE.Vector3(),scale=new THREE.Vector3();
function geometryHash(g){const h=createHash('sha256');for(const [name,a] of Object.entries(g.attributes).sort()){h.update(name);h.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}if(g.index)h.update(Buffer.from(g.index.array.buffer,g.index.array.byteOffset,g.index.array.byteLength));return h.digest('hex');}
model.traverse(o=>{
 if(!o.isMesh)return;
 const geometry=geometryHash(o.geometry),materials=[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]);
 const record=m=>{
  centre.setFromMatrixPosition(m);scale.setFromMatrixScale(m);
  const row=JSON.stringify([o.name,geometry,materials,m.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow,o.userData.collisionFootprint,o.userData.collisionFootprints,!!o.userData.orientedCollision]);
  if(o.material.color?.getHex()===0xd3dcd8&&Math.abs(scale.x-.025)<1e-6&&Math.abs(scale.z-.05)<1e-6){
   const window=sidelights.find(w=>Math.abs(centre.y-w.y)<1e-5&&Math.abs(scale.y-w.h)<1e-5&&Math.abs(centre.clone().sub(w.centre).dot(w.normal)-.115)<1e-5&&Math.abs(centre.clone().sub(w.centre).dot(w.tangent))<w.w/3);
   if(window){bars.push({face:window.face,offset:+centre.clone().sub(window.centre).dot(window.tangent).toFixed(6)});return;}
  }
  rows.push(row);
 };
 if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,local);world.multiplyMatrices(o.matrixWorld,local);record(world);}else record(o.matrixWorld);
});
const openings=[];model.traverse(o=>{if(o.userData.eastPhotoOpenings)openings.push(o.userData.eastPhotoOpenings);});
const result={unchanged:{primitives:rows.length,sha256:createHash('sha256').update(rows.sort().join('\n')).digest('hex')},openings,bars};
writeFileSync(new URL(stage+'-scope.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
if(stage==='after'){
 const before=JSON.parse(readFileSync(new URL('before-scope.json',import.meta.url),'utf8'));
 assert.deepEqual(result.unchanged,before.unchanged,'Every surface other than the 22 sidelights\' vertical bars stays exact');
 assert.deepEqual(result.openings,before.openings,'All window widths, heights and positions stay exact');
 assert.equal(before.bars.length,44);assert.equal(result.bars.length,22);assert(result.bars.every(b=>Math.abs(b.offset)<1e-5),'Centred bars allow only Float32 instance rounding');
 console.log('PASS: '+rows.length+' other primitives and all opening dimensions unchanged; 44 third-position bars replaced by 22 centred bars.');
}else console.log('Saved original window dimensions and unaffected geometry:',rows.length);
