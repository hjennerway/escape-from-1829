import * as T from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../../dist/aerial-layouts.mjs';
import {writeFile} from 'node:fs/promises';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const e=createEscapeExterior(T,1.5);createAerialLayouts(T,e);e.model.updateMatrixWorld(true);
const roofs=[],supports=[];e.model.traverse(o=>{if(!o.isMesh)return;if(o.material?.userData.roofTilePixels)roofs.push(o);else supports.push(o);});
const ray=new T.Raycaster(),report=[];let edges=0;
for(const o of roofs){
 if(o.isInstancedMesh)continue;
 const p=o.geometry.attributes.position,index=o.geometry.index,map=new Map(),v=Array.from({length:p.count},(_,i)=>new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));
 const key=i=>v[i].toArray().map(n=>Math.round(n*1e4)).join(',');
 for(let i=0;i<(index?.count??p.count);i+=3){const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j),[a,b,c]=ids.map(j=>v[j]);if(b.clone().sub(a).cross(c.clone().sub(a)).y<1e-6)continue;
  for(let j=0;j<3;j++){const a=ids[j],b=ids[(j+1)%3],ka=key(a),kb=key(b),id=ka<kb?ka+'|'+kb:kb+'|'+ka;
   if(map.has(id))map.get(id).count++;else map.set(id,{a,b,c:ids[(j+2)%3],count:1});}
 }
 for(const edge of map.values()){
  if(edge.count!==1)continue;const a=v[edge.a],b=v[edge.b];if(Math.abs(a.y-b.y)>.005)continue;edges++;
  const mid=a.clone().lerp(b,.5),dir=b.clone().sub(a).setY(0).normalize(),inside=new T.Vector3(-dir.z,0,dir.x);if(inside.dot(v[edge.c].clone().sub(mid))<0)inside.negate();
  const nearby=supports.filter(s=>{s.geometry.computeBoundingBox();const box=new T.Box3().setFromObject(s);return box.min.y<=mid.y+.001&&box.max.y>=mid.y-.8&&box.min.x<=mid.x+1&&box.max.x>=mid.x-1&&box.min.z<=mid.z+1&&box.max.z>=mid.z-1;});
  const rows=[];for(const inset of [0,.1,.2,.3,.4,.5,.65,.8]){const q=mid.clone().addScaledVector(inside,inset);ray.set(q.clone().setY(mid.y+.002),new T.Vector3(0,-1,0));const hit=ray.intersectObjects(nearby,false)[0];rows.push({inset,y:hit?.point.y,name:hit?.object.name,colour:hit?.object.material.color?.getHexString(),gap:hit?mid.y-hit.point.y:null});}
  const touch=rows.find(r=>r.y!==undefined&&r.gap<.8);if(touch&&(touch.inset>.05||touch.gap>.015))report.push({name:o.name,parent:o.parent.name,a:a.toArray(),b:b.toArray(),rows});
 }
}
await writeFile(new URL('before-audit.json',import.meta.url),JSON.stringify({roofs:roofs.length,edges,open:report},null,2));
console.log(JSON.stringify({roofs:roofs.length,edges,open:report.length,samples:report.slice(0,20)},null,2));
