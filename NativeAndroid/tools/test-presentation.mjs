import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('../Unity/Assets/NativePrototype/',import.meta.url);
const bytes=await readFile(new URL('Generated/outdoor.glb',root));
const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
const materials=gltf.materials.map(m=>m.extras?.nativeSurface).filter(Boolean);
assert(materials.filter(m=>m.offsetFactor<0&&m.offsetUnits<0).length>8,'Layered roads retain signed depth bias');
assert(gltf.nodes.filter(n=>n.extras?.preciseSurface).length>100,'Thin ground surfaces retain full coordinate precision');
const wind=gltf.materials.map((m,i)=>m.extras?.nativeSurface?.wind?i:-1).filter(i=>i>=0);
assert.equal(wind.length,2,'Both copper and green lawn foliage retain wind');
let animated=0;
for(const mesh of gltf.meshes)for(const primitive of mesh.primitives)if(wind.includes(primitive.material)){
 const a=gltf.accessors[primitive.attributes.TEXCOORD_1],v=gltf.bufferViews[a.bufferView];assert.equal(a.type,'VEC2');
 const start=28+bytes.readUInt32LE(12)+v.byteOffset+(a.byteOffset??0),stride=v.byteStride??8;
 let moving=false;for(let i=0;i<a.count;i++){const amount=bytes.readFloatLE(start+i*stride+4);assert(Number.isFinite(amount));if(amount>0)moving=true;}assert(moving);animated++;
}
assert(animated>=4,'Front-lawn foliage batches retain animated leaves');
const first=gltf.meshes[0].primitives[0],accessor=gltf.accessors[first.attributes.POSITION];
assert(Math.max(...accessor.max)>5000&&Math.min(...accessor.min)<-5000,'Countryside extends beyond the estate in both directions');
for(const name of ['arial','arial-bold','georgia','georgia-italic']){
 const data=JSON.parse(await readFile(new URL('Presentation/'+name+'.json',root)));const glyphs=new Map(data.glyphs.map(g=>[g.index,g]));
 for(const c of 'CHESHIRE COUNTY ASYLUMTorch: ONOFF○●←→↗')if(c!=='←')assert(glyphs.has(c.codePointAt(0)),name+' glyph '+c);
 assert(data.size===(name==='georgia'?160:80));for(const g of data.glyphs){assert(g.x>=0&&g.y>=0&&g.x+g.width<=data.width&&g.y+g.height<=data.height);assert(g.advance>=0);}
}
console.log(`PASS: countryside, precise road layers, ${animated} wind meshes, and all four browser font atlases.`);
