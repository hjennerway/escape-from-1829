import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {modelSourceHash} from '../../Browser/model-build-inputs.mjs';
import {walkable,path} from '../../Browser/dist/core.mjs';
import {makeFloors} from '../../Browser/dist/floors.mjs';
import {routeBetweenFloors} from '../../Browser/dist/floors.mjs';
import {buildAsylumLayout,stairRoute} from '../../Browser/dist/asylum-layout.mjs';
import {exportNavigation} from './navigation-export.mjs';
import {obstacleContains} from '../../Browser/dist/explore-controls.mjs';
const generated=new URL('../Unity/Assets/NativePrototype/Generated/',import.meta.url);
const sha=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(await readFile(new URL('manifest.json',generated)));
assert.equal(manifest.schema,3);assert.equal(manifest.sourceHash,await modelSourceHash());
for(const [name,hash] of Object.entries(manifest.interiorHashes))assert.equal(sha(await readFile(new URL('../../Browser/dist/'+name,import.meta.url))),hash,'Current interior source: '+name);
const layoutBytes=await readFile(new URL('layout.json',generated));assert.equal(sha(layoutBytes),manifest.layoutHash);
const planBytes=await readFile(new URL('../../Browser/dist/asylum-plan.json',import.meta.url));assert.equal(sha(planBytes),manifest.planHash);
assert.deepEqual(await readFile(new URL('asylum-plan.json',generated)),planBytes);
const layout=buildAsylumLayout(JSON.parse(planBytes)),floors=makeFloors(layout);let triangleTotal=0;
assert.deepEqual(JSON.parse(layoutBytes),JSON.parse(JSON.stringify(exportNavigation(floors,stairRoute))),'Native walls, cells, stairs, rails, lights and doors exactly match the reviewed browser plan');
const collisions=await readFile(new URL('jump-collision.bytes',generated));assert.equal(sha(collisions),manifest.assetHashes['jump-collision.bytes']);
assert.equal(collisions.readUInt32LE(0),0x4a313832);assert.equal(collisions.readUInt32LE(4),manifest.jumpBounds);let collisionOffset=8;
for(let i=0;i<manifest.jumpBounds;i++){const values=Array.from({length:6},(_,k)=>collisions.readFloatLE(collisionOffset+k*4));assert(values.every(Number.isFinite));assert(values[0]<=values[1]&&values[2]<=values[3]&&values[4]<=values[5]);const visible=collisions.readUInt16LE(collisionOffset+24),bare=collisions.readUInt16LE(collisionOffset+26);assert(visible>0&&visible<8192&&(bare&~visible)===0);const corners=collisions.readUInt32LE(collisionOffset+28);assert(corners===0||corners>=3);collisionOffset+=32+corners*8;}
assert.equal(collisionOffset,collisions.length);assert(manifest.jumpBounds>100000,'Exact rendered details remain in the packed collision export');
const selectionBounds=[];
for(const name of ['outdoor','indoor','guard','selection']){
  const bytes=await readFile(new URL(name+'.glb',generated));assert.equal(sha(bytes),manifest.assetHashes[name+'.glb']);
  assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(4),2);assert.equal(bytes.readUInt32LE(8),bytes.length);
  const length=bytes.readUInt32LE(12),root=JSON.parse(bytes.subarray(20,20+length)),binary=28+length;assert.equal(bytes.readUInt32LE(24+length),0x004e4942);
  let triangles=0;
  for(const mesh of root.meshes)for(const primitive of mesh.primitives){
    assert.equal(primitive.mode??4,4);const count=root.accessors[primitive.attributes.POSITION].count;
    for(const [attribute,width] of [['POSITION',3],['NORMAL',3],['TEXCOORD_0',2]]){
      const a=root.accessors[primitive.attributes[attribute]],v=root.bufferViews[a.bufferView],start=binary+v.byteOffset+(a.byteOffset??0),stride=v.byteStride??width*4;
      assert.equal(a.count,count);assert.equal(a.componentType,5126);assert.equal(a.type,'VEC'+width);assert(start+(count-1)*stride+width*4<=bytes.length);
      for(let i=0;i<count;i++)for(let c=0;c<width;c++)assert(Number.isFinite(bytes.readFloatLE(start+i*stride+c*4)));
    }
    const a=root.accessors[primitive.indices];assert(a,'Geometry is welded and indexed');assert.equal(a.count%3,0);
    const v=root.bufferViews[a.bufferView],start=binary+v.byteOffset+(a.byteOffset??0),size=a.componentType===5125?4:a.componentType===5123?2:1;
    for(let i=0;i<a.count;i++){const index=size===4?bytes.readUInt32LE(start+i*size):size===2?bytes.readUInt16LE(start+i*size):bytes[start+i];assert(index<count);}
    triangles+=a.count/3;
  }
  assert.equal(triangles,manifest[name].triangles);triangleTotal+=triangles;
  for(const node of root.nodes)assert.equal(node.matrix,undefined);
  const names=root.nodes.map(n=>n.name);
  if(name==='selection')for(const node of root.nodes)if(node.mesh!==undefined){
    assert(node.extras.preciseSurface,'Highlights retain exact surface positions');
    const primitive=root.meshes[node.mesh].primitives[0],position=root.accessors[primitive.attributes.POSITION];
    selectionBounds[Number(node.name.slice(10))]={min:position.min,max:position.max};
  }
  if(name==='outdoor'){for(let i=0;i<manifest.meshFlags.length;i++)assert(names.includes('estate-'+i));}
  if(name==='indoor')for(let f=0;f<floors.length;f++){
    assert(names.some(n=>n?.startsWith(`floor-${f}-core-`)));
    assert(root.materials.some(m=>m.extras?.nativeSurface?.ceiling),'Ceilings retain their varied projection');
    assert.equal(root.materials.filter(m=>m.extras?.nativeSurface?.mural).length,2,'Grindley paint stays on basement brick and plaster');
  }
  if(name==='guard')for(const joint of ['Pelvis','Upper body','Head','Key ring','Left hip','Right hip','Left knee','Right knee','Left ankle','Right ankle','Left shoulder','Right shoulder','Left elbow','Right elbow'])assert(names.includes(joint),'Preserve guard joint '+joint);
}
assert.deepEqual(manifest.periods.map(p=>p.year),[1829,1849,1856,1860,1870,1896,1912,1915,1916,1938,2010,2016,2021]);
for(const p of manifest.periods){
  assert(p.meshes.length>0);assert.equal(new Set(p.meshes).size,p.meshes.length);assert(p.meshes.every(i=>i>=0&&i<manifest.meshFlags.length));
  assert(p.obstaclesNoTrees.length<p.obstacles.length);assert(p.walkSurfaces.length>0);assert(p.buildings.every(b=>b.index>=0&&b.index<manifest.buildings.length));
  assert(p.supportIds.length>0&&p.supportIds.every(i=>i>=0&&i<manifest.supportLibrary.length));
  for(const b of p.buildings){const bounds=selectionBounds[b.selectionMesh];assert(bounds,'Every historical building has exact highlight geometry');for(const [axis,min,max] of [[0,'minX','maxX'],[1,'minY','maxY'],[2,'minZ','maxZ']]){assert(Math.abs(bounds.min[axis]-b[min])<.001);assert(Math.abs(bounds.max[axis]-b[max])<.001);}}
  const obstacles=p.obstacles.map(b=>({...b,corners:b.corners?.map(v=>[v.x,v.z])}));assert(!obstacles.some(b=>obstacleContains(b,0,40)));
}
assert(manifest.meshFlags.length<manifest.periods.reduce((n,p)=>n+p.meshes.length,0)/3,'Most periods reuse shared meshes');
const spawn={x:layout.spawn.x*layout.cellSize,z:layout.spawn.z*layout.cellSize};assert(walkable(layout,spawn.x,spawn.z,.34));
assert.equal(floors.length,4);assert.equal(floors.reduce((n,f)=>n+f.exits.length,0),23);
for(let f=0;f<floors.length;f++)for(const exit of floors[f].exits){const to={...exit.inside,floor:f};
  assert(routeBetweenFloors(floors,{...spawn,floor:0},to).length>0,'Reachable exit '+f+' / '+exit.name);
}
for(const [src,hash] of Object.entries(manifest.imageHashes)){
  assert.equal(sha(await readFile(new URL('../../Browser/dist/'+src.replace(/^\.\//,''),import.meta.url))),hash);
  const key=src.replace(/^\.\//,'').replace(/\.[^.]+$/,'').replaceAll('/','_');const png=await readFile(new URL('../Unity/Assets/Resources/Archive/'+key+'.png',import.meta.url));
  assert.equal(png.subarray(1,4).toString(),'PNG');assert(png.readUInt32BE(16)>16&&png.readUInt32BE(20)>16);
}
assert.equal(Object.keys(manifest.imageHashes).length,73);assert(manifest.wallArt.length>=22);assert.equal(manifest.buildings.length,34);
for(const art of manifest.wallArt)assert(art.floor>=0&&art.floor<floors.length);
console.log(`PASS: ${triangleTotal.toLocaleString()} finite native triangles, 13 shared periods, four floors / 23 reachable doors, exact navigation, preserved guard rig, collision heights and 73 verified local pictures.`);
