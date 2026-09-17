import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {encodeModel,decodeModel,serializeScene,deserializeScene} from './dist/model-binary.mjs';

const values=new Float32Array([1.5,-2,3]),bytes=encodeModel({values,shared:values,index:new Uint16Array([0,1,2])});
const decoded=decodeModel(bytes.buffer);
assert.equal(decoded.values,decoded.shared,'Shared typed buffers must stay shared');
assert.deepEqual([...decoded.values],[1.5,-2,3]);assert(decoded.index instanceof Uint16Array);
assert.throws(()=>decodeModel(bytes.buffer.slice(0,9)),/header/);
assert.throws(()=>decodeModel(bytes.buffer.slice(0,-5)),/buffer/);
const broken=bytes.slice();new DataView(broken.buffer).setUint32(8,0xffffffff,true);
assert.throws(()=>decodeModel(broken.buffer),/metadata/);

function fixture(){
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(46,1.3,.5,2000);
  scene.background=new THREE.Color(0xb5c7cd);scene.fog=new THREE.FogExp2(0xb5c7cd,.0019);
  const light=new THREE.DirectionalLight(0xffe2b7,2.8);light.target.position.set(23,0,-10);scene.add(light,light.target);
  const geometry=new THREE.BoxGeometry(2,3,4);geometry.attributes.position.setX(0,2.75);geometry.setDrawRange(0,30);
  const texture=new THREE.DataTexture(new Uint8Array([255,30,10,255,0,10,250,180]),2,1);texture.colorSpace=THREE.SRGBColorSpace;texture.repeat.set(3,4);
  const material=new THREE.MeshStandardMaterial({color:0x8090a0,map:texture,roughness:.72,alphaTest:.2});
  const mesh=new THREE.InstancedMesh(geometry,material,2);mesh.name='Template';mesh.position.set(3,1,-9);mesh.rotation.y=.7;mesh.castShadow=true;
  mesh.setMatrixAt(0,new THREE.Matrix4().makeTranslation(1,2,3));mesh.setMatrixAt(1,new THREE.Matrix4().makeScale(2,3,4));mesh.setColorAt(0,new THREE.Color(0x123456));
  const copy=new THREE.InstancedMesh(geometry,material,0);copy.count=mesh.count;copy.instanceMatrix=mesh.instanceMatrix;copy.instanceColor=mesh.instanceColor;copy.name='Copy';copy.position.x=8;
  const lod=new THREE.LOD();lod.name='Foliage';lod.addLevel(mesh,0);lod.addLevel(copy,100,.15);scene.add(lod);
  scene.userData.selected={tree:mesh,copies:[copy]};
  scene.updateMatrixWorld(true);scene.traverse(o=>{o.matrixAutoUpdate=false;});
  return {scene,camera};
}
const {scene,camera}=fixture(),encoded=encodeModel(serializeScene(THREE,scene,camera)),snapshot=decodeModel(encoded.buffer);
const restored=deserializeScene(THREE,snapshot),a=restored.scene.getObjectByName('Template'),b=restored.scene.getObjectByName('Copy');
assert.equal(a.geometry,b.geometry);assert.equal(a.material,b.material);
assert.equal(restored.scene.userData.selected.tree,a);assert.equal(restored.scene.userData.selected.copies[0],b);
assert.equal(a.instanceMatrix,b.instanceMatrix);assert.equal(a.instanceColor,b.instanceColor);
assert.deepEqual(a.instanceMatrix.array,scene.getObjectByName('Template').instanceMatrix.array);
assert.equal(a.geometry.attributes.position.getX(0),2.75,'Modified primitive vertices must not be regenerated');
assert.deepEqual(a.geometry.drawRange,{start:0,count:30});
assert.deepEqual(a.position.toArray(),[3,1,-9]);assert.equal(a.castShadow,true);assert.equal(a.matrixAutoUpdate,false);
assert.deepEqual([...a.material.map.image.data],[255,30,10,255,0,10,250,180]);assert.equal(a.material.map.colorSpace,THREE.SRGBColorSpace);
assert.deepEqual(a.material.map.repeat.toArray(),[3,4]);assert.equal(a.material.alphaTest,.2);
assert.equal(restored.scene.getObjectByName('Foliage').levels[1].hysteresis,.15);
assert.deepEqual(restored.scene.children[0].target.position.toArray(),[23,0,-10]);
assert.equal(restored.camera.fov,46);assert.equal(restored.scene.fog.density,.0019);
const second=fixture();assert.deepEqual(encodeModel(serializeScene(THREE,second.scene,second.camera)),encoded,'Random Three UUIDs must not change build output');
assert.throws(()=>deserializeScene(THREE,{...snapshot,revision:'different'}),/revision/);
console.log('PASS: binary round-trip, exact modified vertices, shared geometry/instance buffers, textures, lights, LOD, bounds, deterministic builds and malformed data.');
