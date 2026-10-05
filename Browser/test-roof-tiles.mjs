import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {ROOF_TILE_WIDTH,ROOF_TILE_COURSE,roofTileUV} from './dist/roof-tile-uv.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:text=>({width:text.length*16}),strokeText(){},fillText(){}})})};
let triangles=0,meshes=0;const failures=[],families=new Set();
function check(geometry,matrix,material,name){
 const p=geometry.attributes.position,uv=geometry.attributes.uv,index=geometry.index;
 const pixels=material.userData.roofTilePixels,image=material.map.image;
 for(let i=0;i<(index?.count??p.count);i+=3){
  const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j);
  const [a,b,c]=ids.map(id=>new THREE.Vector3().fromBufferAttribute(p,id).applyMatrix4(matrix));
  const e1=b.sub(a),e2=c.sub(a),normal=e1.clone().cross(e2);
  if(normal.lengthSq()<1e-16)continue;normal.normalize();
  if(Math.abs(normal.y)<.001||Math.abs(normal.y)>.999999)continue;
  triangles++;
  const du1=uv.getX(ids[1])-uv.getX(ids[0]),dv1=uv.getY(ids[1])-uv.getY(ids[0]);
  const du2=uv.getX(ids[2])-uv.getX(ids[0]),dv2=uv.getY(ids[2])-uv.getY(ids[0]),det=du1*dv2-du2*dv1;
  const u=e1.clone().multiplyScalar(dv2).addScaledVector(e2,-dv1).divideScalar(det);
  const v=e2.clone().multiplyScalar(du1).addScaledVector(e1,-du2).divideScalar(det);
  const width=u.length()*pixels[0]/image.width,course=v.length()*pixels[1]/image.height;
  if(!Number.isFinite(width)||Math.abs(u.y)/u.length()>.0005||Math.abs(u.dot(v))/(u.length()*v.length())>.0005||
   Math.abs(width-ROOF_TILE_WIDTH)>.0003||Math.abs(course-ROOF_TILE_COURSE)>.0003){
   failures.push({name,triangle:i/3,width,course,horizontalError:Math.abs(u.y)/u.length()});
  }
 }
}
let exterior;
if(process.argv.includes('--compiled')){
 const {readFile}=await import('node:fs/promises'),{gunzipSync}=await import('node:zlib');
 const {decodeModel}=await import('./dist/model-binary.mjs'),{restoreAerialScene}=await import('./dist/aerial-scene.mjs');
 const {modelSourceHash}=await import('./model-build-inputs.mjs');
 const manifest=JSON.parse(await readFile(new URL('./dist/compiled/manifest.json',import.meta.url),'utf8'));
 assert.equal(manifest.sourceHash,await modelSourceHash(),'Compiled tile checks require current model sources');
 const raw=gunzipSync(await readFile(new URL('./dist/compiled/'+manifest.file,import.meta.url)));
 ({exterior}=restoreAerialScene(THREE,decodeModel(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength)),1.5));
}else{
 exterior=createEscapeExterior(THREE,1.5);
 createAerialLayouts(THREE,exterior);
}
exterior.scene.updateMatrixWorld(true);
const referenceMap=exterior.model.getObjectByName('West end continuous slate roof').material.map;
exterior.model.traverse(mesh=>{
 if(!mesh.isMesh)return;
 const material=mesh.material;
 if(material?.map===referenceMap)assert(material.userData.roofTilePixels,'Shared slate clones must retain tile metadata');
 if(!material?.userData.roofTilePixels)return;
 families.add(material.map);meshes++;
 if(mesh.isInstancedMesh){
  for(let i=0;i<mesh.count;i++){
   const instance=new THREE.Matrix4();mesh.getMatrixAt(i,instance);
   check(mesh.geometry,mesh.matrixWorld.clone().multiply(instance),material,mesh.name+' instance '+i);
  }
 }else check(mesh.geometry,mesh.matrixWorld,material,mesh.name);
});
assert(meshes>310&&triangles>1900,'Survey must cover every tiled roof family, late service buildings and dormant periods');
assert.equal(families.size,2,'Shared slate and independently weathered outhouse tiles');
// Shared indexed vertices, nonuniform scale and rotation must all be handled.
const shape=new THREE.BufferGeometry();shape.setAttribute('position',new THREE.Float32BufferAttribute([
 -2,0,-2,2,0,-2,2,0,2,-2,0,2,0,2,0],3));shape.setIndex([0,1,4,1,2,4,2,3,4,3,0,4]);shape.computeVertexNormals();
const matrix=new THREE.Matrix4().compose(new THREE.Vector3(200,10,-80),new THREE.Quaternion().setFromEuler(new THREE.Euler(.05,.63,-.08)),new THREE.Vector3(1.5,.7,2));
const material=exterior.model.getObjectByName('West end continuous slate roof').material;
const mapped=roofTileUV(THREE,shape,matrix,material);
assert(mapped.attributes.position.count>shape.attributes.position.count,'Shared hip vertices split for independent face UVs');
check(mapped,matrix,material,'indexed transformed hip');
const precise=roofTileUV(THREE,shape,matrix,material,true);
check(precise,matrix,material,'indexed transformed hip with local UVs');
for(let i=0;i<mapped.index.count;i++){
 const a=mapped.index.getX(i),b=precise.index.getX(i);
 for(const name of ['position','normal'])for(let axis=0;axis<3;axis++)
  assert.equal(mapped.attributes[name].array[a*3+axis],precise.attributes[name].array[b*3+axis],'Local UVs preserve roof geometry');
 for(let axis=0;axis<2;axis++){
  const delta=mapped.attributes.uv.array[a*2+axis]-precise.attributes.uv.array[b*2+axis];
  assert(Math.abs(delta-Math.round(delta))<.00001,'Local UVs preserve the repeating tile phase');
 }
}
assert.deepEqual(failures,[],'Every tiled slope needs horizontal long edges, perpendicular courses and the same physical tile size');
console.log(`PASS: ${meshes} tiled meshes, ${triangles} sloping triangles, two tile families; horizontal rows and uniform physical scale.`);
