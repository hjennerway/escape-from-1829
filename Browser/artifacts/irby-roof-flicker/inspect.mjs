import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../../dist/aerial-layouts.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5);createAerialLayouts(THREE,exterior);exterior.model.updateMatrixWorld(true);
const objects=[],closures=[],boxes=new Map();
exterior.model.traverse(o=>{
 if(!o.isMesh||o.userData.aerialBatch||o.userData.buildingWindowProxy)return;
 for(let p=o;p;p=p.parent)if(p===exterior.trees||p===exterior.terrain)return;
 if(Array.isArray(o.material)||o.material.transparent)return;
 boxes.set(o,new THREE.Box3().setFromObject(o));
 if(o.userData.roofWallClosure&&o.name.startsWith('Eave closure:'))closures.push(o);
 else if(!o.userData.roofWallClosure)objects.push(o);
});
const ray=new THREE.Raycaster(),overlaps=[],counts=new Map();ray.far=.021;
const hitNormal=h=>{
 const transform=h.object.matrixWorld.clone();
 if(h.instanceId!==undefined){const instance=new THREE.Matrix4();h.object.getMatrixAt(h.instanceId,instance);transform.multiply(instance);}
 return h.normal.clone().applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(transform));
};
let samples=0;
for(const closure of closures){
 const nearby=objects.filter(o=>boxes.get(closure).clone().expandByScalar(.001).intersectsBox(boxes.get(o)));
 const p=closure.geometry.attributes.position,index=closure.geometry.index;
 for(let i=0;i<(index?.count??p.count);i+=3){
  const [a,b,c]=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,index?index.getX(i+j):i+j).applyMatrix4(closure.matrixWorld));
  const normal=b.clone().sub(a).cross(c.clone().sub(a)).multiplyScalar(Math.sign(closure.matrixWorld.determinant()));
  if(normal.lengthSq()<1e-12)continue;normal.normalize();
  for(const weights of [[.2,.3,.5],[.6,.2,.2],[.2,.6,.2]]){
   const point=a.clone().multiplyScalar(weights[0]).addScaledVector(b,weights[1]).addScaledVector(c,weights[2]);
   ray.set(point.clone().addScaledVector(normal,.02),normal.clone().negate());samples++;
   const hits=ray.intersectObjects(nearby,false).filter(h=>Math.abs(h.distance-.02)<.0003&&Math.abs(hitNormal(h).dot(normal))>.999);
   for(const h of hits){
    const path=o=>{const names=[];for(;o;o=o.parent)if(o.name)names.unshift(o.name);return names.join('/');};
    const pair=path(closure)+' vs '+path(h.object),entry={closure:path(closure),authored:path(h.object),point:point.toArray(),normal:normal.toArray(),distance:h.distance,triangle:i/3,face:h.faceIndex,instance:h.instanceId};
    entry.material={color:h.object.material.color?.getHex(),roof:h.object.material.userData.roofTilePixels,side:h.object.material.side};
    entry.authoredHits=hits.length;
    entry.vertices=[a,b,c].map(p=>p.toArray());entry.hitNormal=h.normal.toArray();
    counts.set(pair,(counts.get(pair)??0)+1);overlaps.push(entry);
   }
  }
 }
}
const hash=createHash('sha256');let authoredTriangles=0;
for(const o of objects){
 for(const [name,attribute] of Object.entries(o.geometry.attributes)){hash.update(name);hash.update(Buffer.from(attribute.array.buffer,attribute.array.byteOffset,attribute.array.byteLength));}
 if(o.geometry.index){const a=o.geometry.index.array;hash.update(Buffer.from(a.buffer,a.byteOffset,a.byteLength));}
 hash.update(JSON.stringify({name:o.name,world:o.matrixWorld.elements,color:o.material.color?.getHex(),side:o.material.side,visible:o.visible,cast:o.castShadow,receive:o.receiveShadow}));
 if(o.isInstancedMesh){const a=o.instanceMatrix.array;hash.update(Buffer.from(a.buffer,a.byteOffset,a.byteLength));}
 authoredTriangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);
}
const report={samples,closureMeshes:closures.length,overlapSamples:overlaps.length,originalMeshes:objects.length,authoredTriangles,originalGeometryHash:hash.digest('hex'),pairs:[...counts].sort((a,b)=>b[1]-a[1]),overlaps};
await writeFile(new URL((process.argv[2]??'before')+'-audit.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,overlaps:overlaps.slice(0,8)},null,2));
