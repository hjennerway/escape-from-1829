import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../../dist/aerial-layouts.mjs';
import {writeFileSync} from 'node:fs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const e=createEscapeExterior(THREE,1.5);createAerialLayouts(THREE,e);e.model.updateMatrixWorld(true);
const meshes=[],gables=[];e.model.traverse(o=>{if(!o.isMesh)return;for(let p=o;p;p=p.parent)if(p===e.trees)return;meshes.push(o);if(/gable|pediment/i.test(o.name)&&!o.isInstancedMesh&&!/slate|roof|underside|coping|verge|porch|walls|plinth|band|trim|doorway/i.test(o.name))gables.push(o);});
const ray=new THREE.Raycaster(),gaps=[],checked=[];
for(const o of gables){
 const p=o.geometry.attributes.position,index=o.geometry.index,seen=new Set();
 for(let i=0;i<(index?.count??p.count);i+=3){
  const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,index?index.getX(i+j):i+j).applyMatrix4(o.matrixWorld));
  const n=v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).normalize().multiplyScalar(Math.sign(o.matrixWorld.determinant()));if(Math.abs(n.y)>.001)continue;
  for(let j=0;j<3;j++){
   const a=v[j],b=v[(j+1)%3],c=v[(j+2)%3];
   if(Math.abs(a.y-b.y)>.002||a.y<1.2||c.y<a.y+.2||a.distanceTo(b)<.8)continue;
   const span=b.clone().sub(a),fraction=c.clone().sub(a).dot(span)/span.lengthSq();
   if(fraction<.05||fraction>.95)continue;
   const key=[a,b].map(p=>p.toArray().map(n=>+n.toFixed(3)).join(',')).sort().join('|');if(seen.has(key))continue;seen.add(key);
   for(const t of [.13,.31,.57,.79,.91]){
    const q=a.clone().lerp(b,t);q.y-=.035;
    ray.set(q.clone().addScaledVector(n,.7),n.clone().negate());ray.far=1.4;
    const hits=ray.intersectObjects(meshes,false),row={name:o.name,point:q.toArray(),normal:n.toArray(),hit:hits[0]?.object.name};
    checked.push(row);if(!hits.length){
     ray.ray.origin.y-=.3;const below=ray.intersectObjects(meshes,false)[0];
     ray.ray.origin.y+=.4;const above=ray.intersectObjects(meshes,false)[0];
     // The rear cap of an extruded gable can lie inside a solid wall. Inspect
     // both sides so a back-face-only miss is not mistaken for an opening.
     ray.set(q.clone().addScaledVector(n,-.7),n.clone());
     const reverse=ray.intersectObjects(meshes,false)[0];
     if(below&&above&&!reverse)gaps.push({...row,below:below.object.name,above:above.object.name});
    }
   }
  }
 }
}
writeFileSync(new URL((process.argv[2]??'after')+'-estate-gable-audit.json',import.meta.url),JSON.stringify({checked:checked.length,gaps,probes:checked},null,2)+'\n');
console.log(JSON.stringify({checked:checked.length,gaps:gaps.length,byName:gaps.reduce((r,g)=>(r[g.name]=(r[g.name]??0)+1,r),{})},null,2));
