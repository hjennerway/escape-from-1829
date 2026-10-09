import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {jarmanProtected} from '../jarman-scope.mjs';
import {leightonProtected} from '../leighton-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const stage=process.argv[2],e=createEscapeExterior(THREE,1.5),admin=e.mainAdmin;
e.model.updateMatrixWorld(true);
const jpath=new URL('../../../Research/jarman/protected-geometry.json',import.meta.url),lpath=new URL('../../../Research/leighton-newton/protected-before.json',import.meta.url);
const jbefore=JSON.parse(readFileSync(jpath)),lbefore=JSON.parse(readFileSync(lpath));
const complete={jarman:jarmanProtected(THREE,e.model),leighton:leightonProtected(THREE,e.model)};
if(stage==='before'){
 assert.deepEqual(complete.jarman,jbefore,'The saved pre-edit Admin reproduces the Jarman reference');
 assert.deepEqual(complete.leighton,lbefore.geometry,'The saved pre-edit Admin reproduces the Leighton reference');
}
admin.removeFromParent();
const outside={jarman:jarmanProtected(THREE,e.model),leighton:leightonProtected(THREE,e.model)};
e.model.add(admin);e.model.updateMatrixWorld(true);
function adminPreserved(){
 const rows=[],removed=[],instance=new THREE.Matrix4(),world=new THREE.Matrix4(),bounds=new THREE.Box3();
 admin.traverse(o=>{
  if(!o.isMesh||o.userData.roofWallClosure)return;
  o.geometry.computeBoundingBox();const h=createHash('sha256');
  for(const [key,a] of Object.entries(o.geometry.attributes).sort()){h.update(key);h.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
  if(o.geometry.index)h.update(Buffer.from(o.geometry.index.array.buffer,o.geometry.index.array.byteOffset,o.geometry.index.array.byteLength));
  const geometry=h.digest('hex'),materials=[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]);
  const record=matrix=>{
   bounds.copy(o.geometry.boundingBox).applyMatrix4(matrix);
   const oldBand=o.material.color?.getHex()===0xb5ae99&&Math.abs(bounds.min.y-2.535)<1e-4&&Math.abs(bounds.max.y-2.665)<1e-4;
   if(oldBand||o.name==='Admin continuous low side band'){removed.push({name:o.name,min:bounds.min.toArray(),max:bounds.max.toArray()});return;}
   rows.push(JSON.stringify([o.name,geometry,materials,matrix.elements.map(n=>+n.toFixed(6)),o.castShadow,o.receiveShadow,!!o.userData.orientedCollision]));
  };
  if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);world.multiplyMatrices(o.matrixWorld,instance);record(world);}else record(o.matrixWorld);
 });
 return {retained:{count:rows.length,sha256:createHash('sha256').update(rows.sort().join('\n')).digest('hex')},removed};
}
const kept=adminPreserved(),report={complete,outside,admin:kept,openings:admin.userData.openings,ranges:admin.userData.ranges};
if(stage==='after'){
 const before=JSON.parse(readFileSync(new URL('before-audit.json',import.meta.url)));
 assert.deepEqual(outside,before.outside,'Every non-Admin protected primitive remains exact');
 assert.deepEqual(kept.retained,before.admin.retained,'Every Admin primitive outside the old/new band remains exact');
 assert.deepEqual(report.openings,before.openings,'All Admin windows retain their positions and proportions');
 assert.deepEqual(report.ranges,before.ranges,'All Admin footprints and roofs retain their dimensions');
 assert.equal(before.admin.removed.length,3);assert.equal(kept.removed.length,1);
 const wall=admin.getObjectByName('Rear flat court block walls');wall.position.x+=.01;admin.updateMatrixWorld(true);
 assert.notDeepEqual(adminPreserved().retained,kept.retained,'A 1 cm unrelated Admin wall change is still rejected');
 wall.position.x-=.01;admin.updateMatrixWorld(true);
 writeFileSync(jpath,JSON.stringify(complete.jarman,null,2)+'\n');lbefore.geometry=complete.leighton;writeFileSync(lpath,JSON.stringify(lbefore,null,2)+'\n');
 report.passed=true;report.negativeControl=true;
}
writeFileSync(new URL(stage+'-audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({stage,complete,outside,retained:kept.retained,changedBandPrimitives:kept.removed.length,passed:report.passed},null,2));
