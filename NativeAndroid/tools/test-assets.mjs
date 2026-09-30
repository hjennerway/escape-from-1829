import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {modelSourceHash} from '../../Browser/model-build-inputs.mjs';
import {walkable,path} from '../../Browser/dist/core.mjs';
import {obstacleContains} from '../../Browser/dist/explore-controls.mjs';

const generated=new URL('../Unity/Assets/NativePrototype/Generated/',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('manifest.json',generated)));
assert.equal(manifest.schema,1);
assert.equal(manifest.sourceHash,await modelSourceHash(),'Native geometry must match current model source.');
const layoutBytes=await readFile(new URL('layout.json',generated));
assert.equal(manifest.layoutHash,createHash('sha256').update(layoutBytes).digest('hex'));
assert.deepEqual(layoutBytes,await readFile(new URL('../../Browser/dist/layout.json',import.meta.url)));
const layout=JSON.parse(layoutBytes);
let totalTriangles=0;
for(const name of ['outdoor','indoor','guard']){
  const bytes=await readFile(new URL(name+'.glb',generated));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.assetHashes[name+'.glb']);
  assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(4),2);assert.equal(bytes.readUInt32LE(8),bytes.length);
  const jsonLength=bytes.readUInt32LE(12),root=JSON.parse(bytes.subarray(20,20+jsonLength).toString());
  const binaryStart=28+jsonLength;
  assert.equal(bytes.readUInt32LE(24+jsonLength),0x004e4942);
  let triangles=0;
  for(const mesh of root.meshes)for(const primitive of mesh.primitives){
    assert.equal(primitive.mode??4,4);
    const attributes=primitive.attributes;
    for(const [name,width] of [['POSITION',3],['NORMAL',3],['TEXCOORD_0',2]]){
      const accessor=root.accessors[attributes[name]],view=root.bufferViews[accessor.bufferView];
      assert.equal(accessor.componentType,5126);assert.equal(accessor.type,'VEC'+width);
      assert.equal(accessor.count,root.accessors[attributes.POSITION].count);
      const start=binaryStart+view.byteOffset+(accessor.byteOffset??0),stride=view.byteStride??width*4;
      assert(start+(accessor.count-1)*stride+width*4<=bytes.length);
      for(let i=0;i<accessor.count;i++)for(let c=0;c<width;c++)assert(Number.isFinite(bytes.readFloatLE(start+i*stride+c*4)));
    }
    if(primitive.indices!==undefined){
      const accessor=root.accessors[primitive.indices],view=root.bufferViews[accessor.bufferView];
      const size=accessor.componentType===5125?4:accessor.componentType===5123?2:accessor.componentType===5121?1:0;
      assert(size>0);assert.equal(accessor.count%3,0);
      const start=binaryStart+view.byteOffset+(accessor.byteOffset??0);
      for(let i=0;i<accessor.count;i++){
        const index=size===4?bytes.readUInt32LE(start+i*size):size===2?bytes.readUInt16LE(start+i*size):bytes.readUInt8(start+i*size);
        assert(index<root.accessors[attributes.POSITION].count);
      }
      triangles+=accessor.count/3;
    }else triangles+=root.accessors[attributes.POSITION].count/3;
  }
  if(name==='outdoor')assert.equal(triangles,manifest.outdoor.triangles+2);
  if(name==='indoor')assert.equal(triangles,manifest.indoor.triangles);
  for(const node of root.nodes)assert.equal(node.matrix,undefined,'Unity importer uses baked transforms.');
  totalTriangles+=triangles;
}
const spawn={x:layout.spawn.x*layout.cellSize,z:layout.spawn.z*layout.cellSize};
assert(walkable(layout,spawn.x,spawn.z,.34));assert.equal(layout.exits.length,7);
for(const exit of layout.exits)assert(path(layout,spawn,{x:exit.x*layout.cellSize,z:exit.z*layout.cellSize}).length>0,'Every prototype exit is reachable.');
const sourceObstacles=manifest.obstacles.map(b=>({...b,...(b.corners?{corners:b.corners.map(p=>[p.x,p.z])}:{})}));
assert(!sourceObstacles.some(b=>obstacleContains(b,0,40)), 'Exterior start is clear.');
assert(manifest.obstacles.length>0);
console.log(`PASS: native GLB data, texture/node contract, ${totalTriangles.toLocaleString()} finite triangles, current source fingerprints, shared navigation, seven exits and outdoor spawn.`);
