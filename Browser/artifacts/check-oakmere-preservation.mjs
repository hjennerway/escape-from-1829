import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const e=createEscapeExterior(THREE,16/9);e.scene.updateMatrixWorld(true);
let annexe=e.annexe;
if(process.argv.includes('--save-original')){
 // annexe.mjs was clean at the beginning of this task. Capture that original
 // annexe alone: other tasks are actively changing different estate buildings.
 const source=execFileSync('git',['show','HEAD:Browser/dist/annexe.mjs'],{encoding:'utf8'});
 assert(!source.includes('addOakmereElevation'),'Capture requires the original, pre-refinement revision');
 const {createAnnexe}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const worldUV=(g,scale)=>{const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,(Math.abs(n.getX(i))>.5?p.getZ(i):p.getX(i))/scale,(Math.abs(n.getY(i))>.5?p.getZ(i):p.getY(i))/scale);return g;};
 const hipRoof=(x,z,w,d,y,rise)=>{
  const b=e.annexe.userData.ranges.find(b=>b.x===x&&b.z===z&&b.w===w&&b.d===d&&b.h===y&&b.rise===rise);
  assert(b,'Saved host roofs and range dimensions must still agree');return e.annexe.getObjectByName(b.name+' slate roof').clone();
 };
 annexe=createAnnexe(THREE,{brick:e.annexe.getObjectByName('Central hall brick walls').material,roof:e.annexe.getObjectByName('Central hall slate roof').material,material:(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.9,...extra}),worldUV,hipRoof});
 annexe.updateMatrixWorld(true);
}
const records=[],matrix=new THREE.Matrix4(),world=new THREE.Matrix4(),position=new THREE.Vector3();
const digest=s=>createHash('sha256').update(s).digest('hex');
annexe.traverse(o=>{
 if(!o.isMesh)return;
 for(let p=o;p;p=p.parent)if(p.name==='Oakmere lawn elevation')return;
 const hash=createHash('sha256');
 for(const [key,a] of Object.entries(o.geometry.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
 if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer));
 const geometry=hash.digest('hex'),materials=[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]);
 const record=transform=>{
  if(o.isInstancedMesh){
   position.setFromMatrixPosition(transform);annexe.worldToLocal(position);
   // Only the old west-facing sash rectangles are replaced. The spine's
   // structure, roof, trims, pipes, other faces and all neighbours stay fixed.
   if(position.x<-8.08&&position.x>-8.45&&position.z>-51&&position.z<-9&&position.y>.5&&position.y<8.1)return;
  }
  records.push(JSON.stringify([geometry,materials,transform.elements.map(n=>+n.toFixed(8)),o.castShadow,o.receiveShadow,!!o.userData.orientedCollision]));
 };
 if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);record(world.multiplyMatrices(o.matrixWorld,matrix));}else record(o.matrixWorld);
});
const result={primitives:records.length,geometry:digest(records.sort().join('\n'))};
const path=new URL('./oakmere-protected-geometry.json',import.meta.url);
if(process.argv.includes('--save-original'))writeFileSync(path,JSON.stringify(result,null,2)+'\n');
else assert.deepEqual(result,JSON.parse(readFileSync(path)),'Annexe geometry outside the replaced elevation must match the pre-edit baseline');
console.log(result);
