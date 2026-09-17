// Copies share the actual GPU instance attributes as well as their geometry.
// Only the tree's position, rotation, scale and optional leaf colours differ.
export function copyTreeTemplate(THREE,source){
  let copy;
  if(source.isInstancedMesh){
    copy=new THREE.InstancedMesh(source.geometry,source.material,0);
    copy.count=source.count;copy.instanceMatrix=source.instanceMatrix;copy.instanceColor=source.instanceColor;
    copy.boundingBox=source.boundingBox?.clone()??null;copy.boundingSphere=source.boundingSphere?.clone()??null;
  }else if(source.isMesh)copy=new THREE.Mesh(source.geometry,source.material);
  else copy=source.isLOD?new THREE.LOD():new THREE.Group();
  copy.name=source.name;copy.position.copy(source.position);copy.quaternion.copy(source.quaternion);copy.scale.copy(source.scale);
  copy.castShadow=source.castShadow;copy.receiveShadow=source.receiveShadow;copy.visible=source.visible;
  if(source.isLOD){
    for(const level of source.levels)copy.addLevel(copyTreeTemplate(THREE,level.object),level.distance,level.hysteresis);
  }else for(const child of source.children)copy.add(copyTreeTemplate(THREE,child));
  return copy;
}

// Bake several small sprays onto one cutout for distant foliage. Enlarging a
// single leaf/needle image would make the leaves visibly oversized at each LOD.
// The shared cluster images retain fine texture with fewer overlapping planes.
function clusterTexture(THREE,texture,count){
  const source=texture.image,resolution=256,pixels=new Uint8Array(resolution*resolution*4),sprays=[];
  for(let i=0;i<count;i++){
    const angle=i*2.399963229728653,radius=.48*Math.sqrt(i/count);
    sprays.push({x:Math.cos(angle)*radius,y:Math.sin(angle)*radius,c:Math.cos(angle),s:Math.sin(angle),scale:count===4?.65:.43});
  }
  for(let y=0;y<resolution;y++)for(let x=0;x<resolution;x++){
    const px=x/(resolution-1)*2-1,py=y/(resolution-1)*2-1,index=(y*resolution+x)*4;
    for(const spray of sprays){
      const dx=px-spray.x,dy=py-spray.y,u=(dx*spray.c+dy*spray.s)/spray.scale,v=(-dx*spray.s+dy*spray.c)/spray.scale;
      if(Math.abs(u)>1||Math.abs(v)>1)continue;
      const offset=(Math.round((v+1)/2*(source.height-1))*source.width+Math.round((u+1)/2*(source.width-1)))*4;
      if(!source.data[offset+3])continue;
      for(let channel=0;channel<4;channel++)pixels[index+channel]=source.data[offset+channel];
    }
  }
  const result=new THREE.DataTexture(pixels,resolution,resolution);result.colorSpace=texture.colorSpace;
  result.generateMipmaps=true;result.minFilter=THREE.LinearMipmapLinearFilter;result.magFilter=THREE.LinearFilter;result.needsUpdate=true;
  return result;
}

// Every stride samples the whole crown (rather than truncating the top tiers).
// Larger clusters retain canopy coverage as sub-pixel leaves become unnecessary.
export function addFoliageLevels(THREE,group,full,{medium=95,far=210}={}){
  const lod=new THREE.LOD();lod.name=full.name+' detail';
  lod.addLevel(full,0);
  const matrix=new THREE.Matrix4(),scale=new THREE.Vector3();
  for(const [stride,size,distance] of [[4,1.65,medium],[12,2.5,far]]){
    const material=full.material.clone();material.map=clusterTexture(THREE,full.material.map,stride);material.alphaTest=.28;
    const reduced=new THREE.InstancedMesh(full.geometry,material,Math.ceil(full.count/stride));
    reduced.name=full.name+` 1/${stride}`;
    // Coverage-preserving thinning, deterministically distributed within tufts.
    for(let i=0;i<reduced.count;i++){
      const source=Math.min(full.count-1,i*stride+(i*7%stride));
      full.getMatrixAt(source,matrix);matrix.scale(scale.setScalar(size));reduced.setMatrixAt(i,matrix);
      if(full.instanceColor){const colour=new THREE.Color();full.getColorAt(source,colour);reduced.setColorAt(i,colour);}
    }
    reduced.castShadow=full.castShadow;reduced.receiveShadow=full.receiveShadow;reduced.visible=false;
    reduced.computeBoundingSphere();lod.addLevel(reduced,distance,.15);
  }
  full.computeBoundingSphere();group.add(lod);return lod;
}

export function placeTreeCopies(THREE,trees,template,specs,metadataKey,recolour){
  const base=specs[0];
  for(let index=0;index<specs.length;index++){
    const spec=specs[index],group=index?copyTreeTemplate(THREE,template):template;
    group.traverse(object=>{object.name=object.name.replace(base.name,spec.name);});
    group.position.set(spec.x,template.position.y,spec.z);
    group.rotation.y=spec.rotation??index*2.399963229728653;
    group.scale.set(spec.radius/base.radius,spec.height/base.height,spec.radius/base.radius);
    group.userData[metadataKey]={...spec};
    if(index&&recolour)recolour(group,spec);
    trees.add(group);
  }
}
