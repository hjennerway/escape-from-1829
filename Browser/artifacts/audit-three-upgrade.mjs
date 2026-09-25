import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';

const OLD=await import(pathToFileURL(resolve(process.argv[2]??'../.utmp/three-r160/vendor/three.module.js')));
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
const old=createEscapeExterior(OLD,1.5),current=createEscapeExterior(THREE,1.5);
function flatten(scene){scene.updateMatrixWorld(true);const list=[];scene.traverse(o=>list.push(o));return list;}
function geometry(g){
 g.computeBoundingBox();
 const p=g.attributes.position,rows=[],index=g.index;let area=0,volume=0;
 const count=index?.count??p.count,a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),cross=new THREE.Vector3();
 for(let i=0;i<count;i+=3){
  const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j);
  a.fromBufferAttribute(p,ids[0]);b.fromBufferAttribute(p,ids[1]);c.fromBufferAttribute(p,ids[2]);
  const twiceArea=cross.crossVectors(b.clone().sub(a),c.clone().sub(a)).length();area+=twiceArea/2;
  volume+=a.dot(cross.crossVectors(b,c))/6;
  if(twiceArea<1e-12)continue; // Revised primitive builders remove zero-area faces.
  const corners=ids.map(id=>Object.entries(g.attributes).sort().map(([key,attr])=>[key,...Array.from({length:attr.itemSize},(_,k)=>Math.round(attr.array[id*attr.itemSize+k]*1e6)/1e6)]));
  // Only cyclic rotations: reversing the face still fails this comparison.
  rows.push([0,1,2].map(j=>JSON.stringify([corners[j],corners[(j+1)%3],corners[(j+2)%3]])).sort()[0]);
 }
 return {bounds:[...g.boundingBox.min.toArray(),...g.boundingBox.max.toArray()],area,volume,triangles:count/3,canonical:createHash('sha256').update(rows.sort().join('\n')).digest('hex')};
}
const left=flatten(old.scene),right=flatten(current.scene),seen=new Set(),changes=[];
assert.equal(left.length,right.length);
const parentsA=new Map(left.map((o,i)=>[o,i])),parentsB=new Map(right.map((o,i)=>[o,i]));
for(let i=0;i<left.length;i++){
 const a=left[i],b=right[i];assert.equal(parentsA.get(a.parent),parentsB.get(b.parent),'Same parent hierarchy');assert.equal(a.name,b.name);assert.equal(a.type,b.type);assert.deepEqual(a.matrixWorld.elements,b.matrixWorld.elements,a.name+' transform');
 if(!a.isMesh)continue;
 assert.deepEqual([a.castShadow,a.receiveShadow],[b.castShadow,b.receiveShadow],a.name+' shadows');
 const material=m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.opacity,m.transparent,m.side];
 assert.deepEqual([a.material].flat().map(material),[b.material].flat().map(material),a.name+' material');
 if(a.isInstancedMesh){assert.equal(a.count,b.count);assert.deepEqual(a.instanceMatrix.array,b.instanceMatrix.array,a.name+' instances');}
 if(seen.has(a.geometry))continue;seen.add(a.geometry);
 const x=geometry(a.geometry),y=geometry(b.geometry);
 assert(x.bounds.every((v,j)=>Math.abs(v-y.bounds[j])<1e-6),a.name+' bounds');
 assert(Math.abs(x.area-y.area)<Math.max(1,x.area)*1e-6,a.name+' surface area');
 assert(Math.abs(x.volume-y.volume)<Math.max(1,Math.abs(x.volume))*1e-6,a.name+' oriented volume');
 if(x.canonical!==y.canonical||x.triangles!==y.triangles)changes.push({name:a.name,type:a.geometry.type,old:x,current:y});
}
const report={from:OLD.REVISION,to:THREE.REVISION,objects:left.length,geometries:seen.size,changes};
await writeFile(new URL('./three-upgrade/geometry-audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({objects:left.length,geometries:seen.size,nonIdenticalTriangulation:changes.length,examples:changes.slice(0,5)},null,2));
console.log('PASS: same source, exact hierarchy/transforms/materials/instances/shadow flags, matching bounds, surface area and oriented volume.');
