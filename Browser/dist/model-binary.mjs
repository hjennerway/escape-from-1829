// Small Three.js scene container: JSON metadata followed by aligned, shared
// typed buffers. Geometry is stored as final vertices, never primitive recipes.
export const MODEL_FORMAT=1;
const magic='1829BIN1',types={Float32Array,Float64Array,Uint32Array,Uint16Array,Uint8Array,Int32Array,Int16Array,Int8Array,Uint8ClampedArray};
const align=value=>Math.ceil(value/8)*8;

export function encodeModel(data){
  const arrays=[],ids=new Map(),uuids=new Map();let length=0;
  const json=JSON.stringify(data,(_key,value)=>{
    if(ArrayBuffer.isView(value)){
      if(!types[value.constructor.name])throw new Error('Unsupported model buffer');
      if(!ids.has(value)){ids.set(value,arrays.length);arrays.push({value,offset:length});length=align(length+value.byteLength);}
      const id=ids.get(value),{offset}=arrays[id];
      return {$buffer:id,type:value.constructor.name,offset,length:value.length};
    }
    // Stable IDs make identical source builds byte-for-byte reproducible.
    if(typeof value==='string'&&/^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(value)){
      if(!uuids.has(value))uuids.set(value,'model-'+uuids.size);
      return uuids.get(value);
    }
    return value;
  });
  const text=new TextEncoder().encode(json),start=align(12+text.length),result=new Uint8Array(start+length);
  result.set(new TextEncoder().encode(magic));new DataView(result.buffer).setUint32(8,text.length,true);result.set(text,12);
  for(const {value,offset} of arrays)result.set(new Uint8Array(value.buffer,value.byteOffset,value.byteLength),start+offset);
  return result;
}

export function decodeModel(buffer){
  if(!(buffer instanceof ArrayBuffer)||buffer.byteLength<12||new TextDecoder().decode(new Uint8Array(buffer,0,8))!==magic)throw new Error('Invalid precompiled model header');
  const length=new DataView(buffer).getUint32(8,true),start=align(12+length),arrays=new Map();
  if(start>buffer.byteLength)throw new Error('Truncated model metadata');
  return JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,12,length)),(_key,value)=>{
    if(value&&Object.hasOwn(value,'$buffer')){
      const Type=types[value.type];
      if(!Type||!Number.isSafeInteger(value.offset)||value.offset<0||!Number.isSafeInteger(value.length)||value.length<0||value.offset%8||start+value.offset+value.length*Type.BYTES_PER_ELEMENT>buffer.byteLength)throw new Error('Invalid precompiled model buffer');
      if(!arrays.has(value.$buffer))arrays.set(value.$buffer,new Type(buffer,start+value.offset,value.length));
      return arrays.get(value.$buffer);
    }
    return value;
  });
}

const attribute=a=>({array:a.array,itemSize:a.itemSize,normalized:a.normalized,usage:a.usage,...(a.isInstancedBufferAttribute?{meshPerAttribute:a.meshPerAttribute}:{})});
const sphere=b=>b?{center:b.center.toArray(),radius:b.radius}:null;
const box=b=>b?{min:b.min.toArray(),max:b.max.toArray()}:null;

export function serializeScene(THREE,scene,camera){
  scene.updateMatrixWorld(true);camera.updateMatrix();
  const meta=Object.fromEntries(['geometries','materials','textures','images','shapes','skeletons','animations','nodes'].map(key=>[key,{}]));
  const geometries=new Map(),sources=new Map(),nodes=new Map(),canvasTextures=new Set();
  scene.traverse(object=>{
    nodes.set(object.uuid,object);
    const g=object.isSprite?null:object.geometry;
    if(g&&!geometries.has(g.uuid)){
      if(Object.values(g.attributes).some(a=>a.isInterleavedBufferAttribute)||Object.keys(g.morphAttributes).length)throw new Error('Unsupported geometry in model build: '+object.name);
      if(!g.boundingBox)g.computeBoundingBox();if(!g.boundingSphere)g.computeBoundingSphere();
      geometries.set(g.uuid,{uuid:g.uuid,name:g.name,attributes:Object.fromEntries(Object.entries(g.attributes).map(([key,a])=>[key,attribute(a)])),index:g.index?attribute(g.index):null,groups:g.groups,drawRange:{start:g.drawRange.start,count:Number.isFinite(g.drawRange.count)?g.drawRange.count:null},box:box(g.boundingBox),sphere:sphere(g.boundingSphere)});
      meta.geometries[g.uuid]={uuid:g.uuid};
    }
    for(const material of [object.material].flat())if(material)for(const texture of Object.values(material))if(texture?.isTexture){
      const source=texture.source,image=texture.image;
      if(image?.getContext)canvasTextures.add(texture.uuid);
      if(sources.has(source.uuid))continue;
      let pixels=image?.data;
      if(image?.getContext){
        const raw=image.getContext('2d').getImageData(0,0,image.width,image.height).data;
        pixels=new Uint8Array(raw.length);
        // Canvas textures start at the top; binary texture rows start at the bottom.
        for(let y=0;y<image.height;y++)pixels.set(raw.subarray(y*image.width*4,(y+1)*image.width*4),(image.height-1-y)*image.width*4);
      }
      if(!pixels)throw new Error('Texture must be baked before compiling: '+texture.name);
      sources.set(source.uuid,{uuid:source.uuid,data:pixels,width:image.width,height:image.height});meta.images[source.uuid]={uuid:source.uuid};
    }
  });
  const object=scene.toJSON(meta).object,cameraData=camera.toJSON(meta).object;
  function metadata(value){
    // Ward/building metadata contains live scene references. Serializing them
    // as objects would duplicate entire subtrees and lose identity on loading.
    if(value?.isObject3D){if(!nodes.has(value.uuid))throw new Error('Detached node in model metadata: '+value.name);return {$node:value.uuid};}
    if(Array.isArray(value))return value.map(metadata);
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,metadata(item)]));
    return value;
  }
  function extras(data){
    const node=nodes.get(data.uuid);
    if(data.userData)data.userData=metadata(data.userData);
    if(node.isInstancedMesh){data.instanceMatrix=attribute(node.instanceMatrix);if(node.instanceColor)data.instanceColor=attribute(node.instanceColor);data.instanceBounds={box:box(node.boundingBox),sphere:sphere(node.boundingSphere)};}
    if(node.isDirectionalLight)data.target=node.target.uuid;
    for(const child of data.children??[])extras(child);
  }
  extras(object);
  const textures=Object.values(meta.textures);for(const texture of textures)if(canvasTextures.has(texture.uuid))texture.flipY=false;
  return {revision:THREE.REVISION,object,camera:cameraData,geometries:[...geometries.values()],images:[...sources.values()],textures,materials:Object.values(meta.materials)};
}

export function deserializeScene(THREE,data){
  if(data.revision!==THREE.REVISION)throw new Error('Precompiled model uses a different Three.js revision');
  const attributes=new WeakMap();
  function attr(a,instance=false){
    if(!attributes.has(a.array))attributes.set(a.array,new (instance||a.meshPerAttribute!==undefined?THREE.InstancedBufferAttribute:THREE.BufferAttribute)(a.array,a.itemSize,a.normalized,a.meshPerAttribute??1).setUsage(a.usage));
    return attributes.get(a.array);
  }
  const readBox=b=>b?new THREE.Box3(new THREE.Vector3(...b.min),new THREE.Vector3(...b.max)):null;
  const readSphere=b=>b?new THREE.Sphere(new THREE.Vector3(...b.center),b.radius):null;
  const geometries={};
  for(const g of data.geometries){
    const geometry=new THREE.BufferGeometry();geometry.uuid=g.uuid;geometry.name=g.name;
    for(const [key,a] of Object.entries(g.attributes))geometry.setAttribute(key,attr(a));
    if(g.index)geometry.setIndex(attr(g.index));geometry.groups=g.groups;geometry.setDrawRange(g.drawRange.start,g.drawRange.count??Infinity);
    geometry.boundingBox=readBox(g.box);geometry.boundingSphere=readSphere(g.sphere);geometries[g.uuid]=geometry;
  }
  const loader=new THREE.ObjectLoader(),images={};
  for(const image of data.images)images[image.uuid]=new THREE.Source({data:image.data,width:image.width,height:image.height});
  const textures=loader.parseTextures(data.textures,images),materials=loader.parseMaterials(data.materials,textures);
  const scene=loader.parseObject(data.object,geometries,materials,textures,{}),camera=loader.parseObject(data.camera,{}, {}, {}, {}),nodes=new Map();
  scene.traverse(object=>{
    nodes.set(object.uuid,object);
    // ObjectLoader intentionally leaves decomposed transforms unset for static nodes.
    // Controls, bounding checks and our named view helpers still use these values.
    if(!object.matrixAutoUpdate)object.matrix.decompose(object.position,object.quaternion,object.scale);
  });
  function metadata(value){
    if(value?.$node){const node=nodes.get(value.$node);if(!node)throw new Error('Missing metadata node');return node;}
    if(Array.isArray(value))return value.map(metadata);
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,metadata(item)]));
    return value;
  }
  function restore(spec){
    const object=nodes.get(spec.uuid);
    object.userData=metadata(spec.userData??{});
    if(object.isInstancedMesh){object.instanceMatrix=attr(spec.instanceMatrix,true);object.instanceColor=spec.instanceColor?attr(spec.instanceColor,true):null;object.boundingBox=readBox(spec.instanceBounds.box);object.boundingSphere=readSphere(spec.instanceBounds.sphere);}
    if(object.isDirectionalLight)object.target=nodes.get(spec.target);
    for(const child of spec.children??[])restore(child);
  }
  restore(data.object);scene.updateMatrixWorld(true);
  return {scene,camera,nodes};
}
