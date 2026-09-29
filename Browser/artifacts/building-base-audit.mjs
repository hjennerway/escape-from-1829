import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../dist/aerial-layouts.mjs';
import {writeFileSync} from 'node:fs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const e=createEscapeExterior(THREE,1.6),l=createAerialLayouts(THREE,e);e.scene.updateMatrixWorld(true);
const visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
const meshes=[],bases=[];
e.model.traverse(o=>{
 if(!o.isMesh||!visible(o))return;
 for(let p=o;p;p=p.parent)if(p===e.trees)return;
 if(o.isInstancedMesh)return;
 const b=new THREE.Box3().setFromObject(o);
 if(b.min.y<.5&&b.max.y>.09)meshes.push(o);
 if(b.min.y>-.2&&b.min.y<.025&&b.max.y>.2&&(/plinth|foundation|weathered base/i.test(o.name)||o.userData.collisionFootprint))bases.push(o);
});
const ray=new THREE.Raycaster(),support=new THREE.Raycaster(),duplicates=new Map(),floating=[];
for(const o of bases){
 const b=new THREE.Box3().setFromObject(o);floating.push({name:o.name,parent:o.parent.name,bottom:b.min.y,top:b.max.y});
 const p=o.geometry.attributes.position,n=o.geometry.attributes.normal,index=o.geometry.index;
 const seen=new Set();
 for(let k=0;k<(index?.count??p.count);k+=3){
  const ids=[0,1,2].map(j=>index?index.getX(k+j):k+j),v=ids.map(i=>new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));
  const normal=new THREE.Vector3().fromBufferAttribute(n,ids[0]).transformDirection(o.matrixWorld);
  if(Math.abs(normal.y)>.05||Math.min(...v.map(v=>v.y))>.12||Math.max(...v.map(v=>v.y))<.12)continue;
  const cuts=[];for(let i=0;i<3;i++){const a=v[i],b=v[(i+1)%3];if((a.y-.12)*(b.y-.12)<0)cuts.push(a.clone().lerp(b,(.12-a.y)/(b.y-a.y)));}
  if(cuts.length!==2)continue;
  const point=cuts[0].add(cuts[1]).multiplyScalar(.5),key=point.toArray().map(n=>n.toFixed(2)).join(',');if(seen.has(key))continue;seen.add(key);
  ray.set(point.clone().addScaledVector(normal,.12),normal.clone().negate());ray.far=.125;
  const hits=ray.intersectObjects(meshes,false);if(!hits.length||Math.abs(hits[0].distance-.12)>.002)continue;
  const names=[...new Set(hits.filter(h=>Math.abs(h.distance-.12)<.001).map(h=>h.object.name+' @ '+h.object.parent.name))].sort();
  if(names.length>1){
   const origin=point.clone().addScaledVector(normal,.08);origin.y=40;
   support.set(origin,new THREE.Vector3(0,-1,0));
   const groundY=support.intersectObjects(meshes,false)[0]?.point.y??-.15;
   const materials=hits.filter(h=>Math.abs(h.distance-.12)<.001).map(h=>h.object.material);
   const identicalSolid=materials.every(m=>!m.map&&m.color?.equals(materials[0].color));
   duplicates.set(names.join(' | '),{names,point:point.toArray(),groundY,visibleConflict:groundY<.119&&!identicalSolid});
  }
 }
}
const result={bases:floating,duplicates:[...duplicates.values()]};
writeFileSync(new URL('building-base-audit-'+(process.argv[2]??'before')+'.json',import.meta.url),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
