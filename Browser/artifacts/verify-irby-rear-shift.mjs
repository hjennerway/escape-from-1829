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
   const u=new THREE.Vector3().fromBufferAttribute(pa,i).applyMatrix4(a.matrix);u.z+=7;
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
  if(matrix.elements[14]+before.position.z>=-122.9)continue;
  matrix.elements[14]+=7;
  if(!signatures.has(signature(matrix))){
   const expected=matrix.elements.slice(),candidate=new THREE.Matrix4();let best={distance:Infinity};
   for(let j=0;j<moved.count;j++){moved.getMatrixAt(j,candidate);const distance=Math.max(...expected.map((v,k)=>Math.abs(v-candidate.elements[k])));if(distance<best.distance)best={distance,index:j,actual:candidate.elements.slice()};}
   assert(best.distance<.00003,'Rear detail changed: '+JSON.stringify({batch:b,index:i,expected,best}));
  }
  instances++;
 }
}
const result={rearTranslation:[0,0,7],verifiedVertices:vertices,verifiedRearDetailInstances:instances,meshNames};
writeFileSync('Browser/artifacts/irby-rear-shift-verification.json',JSON.stringify(result,null,2));
console.log('PASS: rigid rear translation preserves '+vertices+' mesh vertices and '+instances+' rear window/trim/frame instances.');
