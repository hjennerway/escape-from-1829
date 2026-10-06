import * as T from '../../dist/vendor/three.module.js';
import {readFile,writeFile} from 'node:fs/promises';
const importSaved=async name=>{
 const url=new URL('before-'+name,import.meta.url),source=(await readFile(url,'utf8')).replace(/from '(\.\/[^']+)'/g,(_,path)=>"from '"+new URL('../../dist/'+path.slice(2),import.meta.url).href+"'");
 return import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
};
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const {createEscapeExterior}=await importSaved('escape-exterior.mjs'),{createAerialLayouts}=await importSaved('aerial-layouts.mjs');
const e=createEscapeExterior(T,1.5);createAerialLayouts(T,e);e.model.updateMatrixWorld(true);
const objects=[];e.model.traverse(o=>{if(o.isMesh)objects.push(o);});
const audit=JSON.parse(await readFile(new URL('before-audit.json',import.meta.url),'utf8')),rays=[],ray=new T.Raycaster();
for(const edge of audit.open){
 if(edge.rows[0].gap!==null)continue;
 const support=edge.rows.find(r=>r.gap!==null&&r.gap<.85);if(!support||support.inset<.075)continue;
 const a=new T.Vector3(...edge.a),b=new T.Vector3(...edge.b),mid=a.clone().lerp(b,.5),dir=b.clone().sub(a).setY(0).normalize();
 for(const sign of [-1,1]){
  const start=mid.clone().addScaledVector(new T.Vector3(-dir.z,0,dir.x),sign*.025).setY(mid.y-.5);
  ray.set(start.clone().setY(mid.y+.1),new T.Vector3(0,-1,0));ray.far=.2;
  if(!ray.intersectObjects(objects,false).some(h=>h.object.material?.userData.roofTilePixels&&Math.abs(h.point.y-mid.y)<.05))continue;
  ray.set(start,new T.Vector3(0,1,0));ray.far=.55;
  if(ray.intersectObjects(objects,false).length)continue;
  rays.push({roof:edge.name||edge.parent,origin:start.toArray(),direction:[0,1,0],distance:.55});
 }
}
const unique=rays.filter((r,i)=>rays.findIndex(q=>q.origin.every((n,j)=>Math.abs(n-r.origin[j])<.00001))===i);
await writeFile(new URL('../../test-support/roof-wall-rays.json',import.meta.url),JSON.stringify(unique,null,2)+'\n');
console.log('Frozen '+unique.length+' independent rays through formerly open eaves.');
