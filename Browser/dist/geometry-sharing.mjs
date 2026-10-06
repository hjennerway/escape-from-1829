// Exact byte sharing: hashes select candidates; a byte comparison decides equality.
// Only construction/serialization calls use this pool. Live instance buffers stay private.
export function createBufferPool(){
 const buckets=new Map();let savedBytes=0;
 return {get savedBytes(){return savedBytes;},share(array){
  const bytes=new Uint8Array(array.buffer,array.byteOffset,array.byteLength);let hash=2166136261;
  for(const byte of bytes)hash=Math.imul(hash^byte,16777619);
  const key=array.constructor.name+':'+array.length+':'+hash,bucket=buckets.get(key)??[];
  for(const candidate of bucket){
   if(candidate===array)return array;
   const other=new Uint8Array(candidate.buffer,candidate.byteOffset,candidate.byteLength);
   if(bytes.every((value,i)=>value===other[i])){savedBytes+=bytes.length;return candidate;}
  }
  bucket.push(array);buckets.set(key,bucket);return array;
 }};
}

// Preserve every attribute bit, seam, normal and triangle while indexing duplicates.
export function indexExactGeometry(THREE,geometry){
 if(geometry.index)return geometry;
 const entries=Object.entries(geometry.attributes);
 if(entries.some(([,a])=>a.isInterleavedBufferAttribute||a.isInstancedBufferAttribute))throw Error('Unsupported exact indexing attribute');
 const count=geometry.attributes.position.count,vertices=new Map(),indices=[],unique=[];
 const words=entries.map(([,a])=>new Uint8Array(a.array.buffer,a.array.byteOffset,a.array.byteLength));
 for(let i=0;i<count;i++){
  const key=entries.map(([,a],j)=>{const stride=a.itemSize*a.array.BYTES_PER_ELEMENT;return words[j].subarray(i*stride,(i+1)*stride).join(',');}).join('|');
  let index=vertices.get(key);if(index===undefined){index=unique.length;vertices.set(key,index);unique.push(i);}indices.push(index);
 }
 for(const [name,a] of entries){
  const values=new a.array.constructor(unique.length*a.itemSize);
  unique.forEach((source,i)=>values.set(a.array.subarray(source*a.itemSize,(source+1)*a.itemSize),i*a.itemSize));
  geometry.setAttribute(name,new THREE.BufferAttribute(values,a.itemSize,a.normalized).setUsage(a.usage));
 }
 geometry.setIndex(indices);return geometry;
}
