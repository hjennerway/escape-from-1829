// Keep detailed Escape bounds in the same compact format as timeline bounds.
// Mark the small tree-free subset without retaining a million-entry key map.
export function packEscapeCollision(withTrees,withoutTrees){
  const values=b=>[b.minX,b.maxX,b.minZ,b.maxZ,b.minY??-10000,b.maxY??10000,...(b.corners??[]).flatMap(p=>[p.x,p.z])];
  const key=v=>v.map(Math.fround).join(',');
  const bare=new Map(withoutTrees.map(b=>{const v=values(b);return [key(v),v];}));
  const bytes=Buffer.allocUnsafe(8+withTrees.reduce((n,b)=>n+32+(b.corners?.length??0)*8,0)+withoutTrees.reduce((n,b)=>n+32+(b.corners?.length??0)*8,0));
  let offset=8,count=0;
  function record(v,visible,bareVisible){
    for(let i=0;i<6;i++)bytes.writeFloatLE(v[i],offset+i*4);
    bytes.writeUInt16LE(visible,offset+24);bytes.writeUInt16LE(bareVisible,offset+26);bytes.writeUInt32LE((v.length-6)/2,offset+28);
    offset+=32;for(const n of v.slice(6)){bytes.writeFloatLE(n,offset);offset+=4;}count++;
  }
  // A repeated bound must keep its tree-free bit even after its first match.
  const matched=new Set();
  for(const b of withTrees){const v=values(b),k=key(v),visible=bare.has(k)||matched.has(k);if(bare.delete(k))matched.add(k);record(v,1,visible?1:0);}
  for(const v of bare.values())record(v,0,1);
  bytes.writeUInt32LE(0x4a313832,0);bytes.writeUInt32LE(count,4);
  return {bytes:bytes.subarray(0,offset),count};
}
