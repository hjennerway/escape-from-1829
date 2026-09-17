import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createIrbyAshley} from '../dist/irby-ashley.mjs';
const source=execFileSync('git',['show','HEAD:Browser/dist/irby-ashley.mjs'],{encoding:'utf8'})
 .replace(/from '(\.\/[^']+)'/g,(_,path)=>`from '${new URL('../dist/'+path.slice(2),import.meta.url).href}'`);
const beforeFactory=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).createIrbyAshley;
const material=color=>new THREE.MeshStandardMaterial({color});
const materials={brick:material(0x884433),roof:material(0x334455),worldUV:g=>g,material};
const before=beforeFactory(THREE,materials),after=createIrbyAshley(THREE,materials);
const meshNames=['Low east service room','Continuous garden range slate roof','West garden gable slate roof',
 'West garden gable brick gables','East garden gable slate roof','East garden gable brick gables',
 'Small east service projection slate roof','Corner to west ridge junction slate roof',
 'Quarter-octagonal garden corner','Quarter-octagonal corner slate roof','Canted garden window bay',
 'Canted garden bay slate roof','Garden gable chimney breast','Conservatory low brick wall',
 'Conservatory side glazing','Glazed courtyard lean-to roof'];
let vertices=0,instances=0;
for(const name of meshNames){
 const old=before.children.filter(o=>o.name===name),moved=after.children.filter(o=>o.name===name);
 assert.equal(moved.length,old.length,name);assert(old.length>0,name);
 for(let n=0;n<old.length;n++){
  const a=old[n],b=moved[n];a.updateMatrix();b.updateMatrix();
  const pa=a.geometry.attributes.position,pb=b.geometry.attributes.position;assert.equal(pa.count,pb.count,name);
  for(let i=0;i<pa.count;i++){
   const u=new THREE.Vector3().fromBufferAttribute(pa,i).applyMatrix4(a.matrix);u.z+=3;
   const v=new THREE.Vector3().fromBufferAttribute(pb,i).applyMatrix4(b.matrix);
   assert(u.distanceTo(v)<.00003,name+' shape preserved');vertices++;
  }
 }
}
const signature=matrix=>matrix.elements.map(v=>Math.round(v*10000)).join(',');
const oldBatches=before.children.filter(o=>o.isInstancedMesh),newBatches=after.children.filter(o=>o.isInstancedMesh);
for(let b=0;b<oldBatches.length;b++){
 const old=oldBatches[b],moved=newBatches[b],matrix=new THREE.Matrix4(),signatures=new Set();
 for(let i=0;i<moved.count;i++){moved.getMatrixAt(i,matrix);signatures.add(signature(matrix));}
 for(let i=0;i<old.count;i++){
  old.getMatrixAt(i,matrix);
  // Stay behind the connecting wings: their side trim and sash spacing are
  // regenerated as they shorten, while the garden-only details move rigidly.
  if(matrix.elements[14]+before.position.z>=-118)continue;
  matrix.elements[14]+=3;
  if(!signatures.has(signature(matrix))){
   const expected=matrix.elements.slice(),candidate=new THREE.Matrix4();let best={distance:Infinity};
   for(let j=0;j<moved.count;j++){moved.getMatrixAt(j,candidate);const distance=Math.max(...expected.map((v,k)=>Math.abs(v-candidate.elements[k])));if(distance<best.distance)best={distance,index:j,actual:candidate.elements.slice()};}
   assert(best.distance<.00003,'Rear detail changed: '+JSON.stringify({batch:b,index:i,expected,best}));
  }
  instances++;
 }
}
const fronts=[-98.6,-93.9];
const fixedEdges=object=>object.userData.footprint.filter(p=>fronts.some(z=>Math.abs(p[1]-z)<.001));
assert.deepEqual(fixedEdges(after),fixedEdges(before),'Yellow front-face endpoints stay fixed');
const fixedSashes=object=>object.userData.openings.filter(o=>fronts.some(z=>Math.abs(o.z+object.position.z-z-.035)<.001));
assert.equal(fixedSashes(before).length,7,'Expected both yellow faces and corridor end');
assert.deepEqual(fixedSashes(after),fixedSashes(before),'Front-face sashes stay fixed');
for(const name of ['Continuous garden range','West garden gable','East garden gable','Small east service projection']){
 const a=before.userData.roofs.find(r=>r.name===name),b=after.userData.roofs.find(r=>r.name===name);
 assert.deepEqual(b.rect,a.rect.map((v,i)=>i%2?v+3:v),name+' roof keeps exact plan proportions');
 assert.equal(a.rise,b.rise,name+' roof keeps its height');
}
const result={fixedFrontEndpoints:fixedEdges(after),fixedFrontSashes:fixedSashes(after).length,rearTranslation:[0,0,3],verifiedVertices:vertices,verifiedRearDetailInstances:instances,meshNames};
writeFileSync('Browser/artifacts/irby-red-orange-verification.json',JSON.stringify(result,null,2));
console.log('PASS: rigid rear translation preserves '+vertices+' mesh vertices and '+instances+' rear window/trim/frame instances.');
