// Distant-only derivatives of the existing licensed furniture; source meshes stay intact.
import * as THREE from 'three';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {MeshoptSimplifier} from 'three/addons/libs/meshopt_simplifier.module.js';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('./dist/models/furniture/',import.meta.url),records=[];
await MeshoptSimplifier.ready;
for(const name of ['windsor_chair','panca_50']){
 const source=await readFile(new URL(name+'.gltf',root)),gltf=JSON.parse(source),binary=await readFile(new URL(gltf.buffers[0].uri,root)),primitive=gltf.meshes[0].primitives[0],geometry=new THREE.BufferGeometry();
 for(const [semantic,key] of [['POSITION','position'],['NORMAL','normal'],['COLOR_0','color']]){
  const a=gltf.accessors[primitive.attributes[semantic]],view=gltf.bufferViews[a.bufferView],start=(view.byteOffset??0)+(a.byteOffset??0),bytes=binary.subarray(start,start+a.count*12);
  geometry.setAttribute(key,new THREE.BufferAttribute(new Float32Array(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)),3));
 }
 const welded=mergeVertices(geometry,1e-6),p=welded.attributes.position,normal=welded.attributes.normal;
 const [indices,error]=MeshoptSimplifier.simplifyWithAttributes(welded.index.array,p.array,3,normal.array,3,[.05,.05,.05],null,Math.floor(welded.index.count*.35/3)*3,.004,['Permissive']);
 // Compact by copying original attribute bits; retain the full source bounds.
 welded.computeBoundingBox();const bounds=welded.boundingBox.clone(),[remap,unique]=MeshoptSimplifier.compactMesh(indices);
 for(const [key,a] of Object.entries(welded.attributes)){
  const values=new a.array.constructor(unique*a.itemSize);remap.forEach((target,i)=>{if(target!==0xffffffff)values.set(a.array.subarray(i*a.itemSize,(i+1)*a.itemSize),target*a.itemSize);});welded.setAttribute(key,new THREE.BufferAttribute(values,a.itemSize));
 }
 const attributes={},buffers=[],views=[],accessors=[];let offset=0;
 for(const [semantic,key] of [['POSITION','position'],['NORMAL','normal'],['COLOR_0','color']]){
  const a=welded.attributes[key],data=Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength);attributes[semantic]=accessors.length;buffers.push(data);views.push({buffer:0,byteOffset:offset,byteLength:data.length,target:34962});accessors.push({bufferView:views.length-1,componentType:5126,count:a.count,type:'VEC3'});offset+=data.length;
 }
 accessors[0].min=bounds.min.toArray();accessors[0].max=bounds.max.toArray();
 const data=Buffer.from(indices.buffer,indices.byteOffset,indices.byteLength);buffers.push(data);views.push({buffer:0,byteOffset:offset,byteLength:data.length,target:34963});accessors.push({bufferView:views.length-1,componentType:indices instanceof Uint32Array?5125:5123,count:indices.length,type:'SCALAR'});
 const result={...gltf,buffers:[{uri:name+'_distant.bin',byteLength:offset+data.length}],bufferViews:views,accessors,meshes:[{primitives:[{attributes,indices:accessors.length-1,material:0}]}],extras:{...gltf.extras,distantOnly:true,maxRelativeError:.004}};
 await writeFile(new URL(name+'_distant.gltf',root),JSON.stringify(result)+'\n');await writeFile(new URL(name+'_distant.bin',root),Buffer.concat(buffers));
 const files=[];for(const path of [name+'_distant.gltf',name+'_distant.bin']){const bytes=await readFile(new URL(path,root));files.push({path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}
 records.push({source:name,sourceHash:createHash('sha256').update(source).update(binary).digest('hex'),trianglesBefore:geometry.attributes.position.count/3,trianglesAfter:indices.length/3,error,license:name==='panca_50'?'GPL-3.0':'MIT',files});
}
await writeFile(new URL('lod-manifest.json',root),JSON.stringify({generator:'Browser/build-furniture-lod.mjs',records},null,2)+'\n');console.log(JSON.stringify(records,null,2));
