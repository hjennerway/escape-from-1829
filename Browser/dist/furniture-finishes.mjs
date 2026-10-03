// Shared, filtered surface variation for the imported and medical furnishings.
// R contains irregular timber fibres; G/B contain isotropic stain/fine wear.
const textures=new WeakMap();
function hash(x,y,seed){
 let n=Math.imul(x,374761393)^Math.imul(y,668265263)^seed;
 n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;
}
function noise(u,v,nx,ny,seed){
 const x=u*nx,y=v*ny,ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
 const sx=fx*fx*fx*(fx*(fx*6-15)+10),sy=fy*fy*fy*(fy*(fy*6-15)+10);
 const sample=(a,b)=>hash((a%nx+nx)%nx,(b%ny+ny)%ny,seed);
 const a=sample(ix,iy),b=sample(ix+1,iy),c=sample(ix,iy+1),d=sample(ix+1,iy+1);
 return (a+(b-a)*sx)*(1-sy)+(c+(d-c)*sx)*sy;
}
function finishTexture(THREE){
 if(textures.has(THREE))return textures.get(THREE);
 const size=256,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size,warped=u+(noise(u,v,5,7,17)-.5)*.055;
  const fibres=noise(warped,v,58,3,11)*.55+noise(warped,v,117,7,31)*.30+noise(u,v,23,2,37)*.15;
  const stain=noise(u,v,5,5,43)*.65+noise(u,v,13,13,59)*.35;
  const fine=noise(u,v,64,64,71)*.7+hash(x,y,89)*.3;
  data.set([Math.round(fibres*255),Math.round(stain*255),Math.round(fine*255),255],(y*size+x)*4);
 }
 const texture=new THREE.DataTexture(data,size,size);texture.name='Furniture irregular fibres and wear';
 texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.generateMipmaps=true;
 texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;
 texture.anisotropy=8;texture.needsUpdate=true;textures.set(THREE,texture);return texture;
}
export function applyFurnitureFinish(THREE,material,{kind='wood',tint='',cacheKey=kind}={}){
 const texture=finishTexture(THREE),wood=kind==='wood';
 material.userData.furnitureFinish=kind;
 material.onBeforeCompile=shader=>{
  shader.uniforms.furnitureFinishMap={value:texture};
  const varyings='\nvarying vec3 vFurnitureFinishPosition;\nvarying vec3 vFurnitureFinishNormal;';
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>'+varyings)
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvFurnitureFinishPosition=position;\nvFurnitureFinishNormal=normal;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>'+varyings+'\nuniform sampler2D furnitureFinishMap;')
   .replace('#include <color_fragment>',`#include <color_fragment>
    ${tint}
    vec3 furnitureWeights=pow(abs(normalize(vFurnitureFinishNormal)),vec3(8.0));
    furnitureWeights/=max(dot(furnitureWeights,vec3(1.0)),.0001);
    vec3 furniturePosition=vFurnitureFinishPosition*.65;
    // Fibres follow Y on upright faces and X on horizontal boards. Wear is
    // isotropic, so painted/enamelled/metal surfaces never inherit wood lines.
    vec3 furnitureSurface=texture2D(furnitureFinishMap,furniturePosition.zy).rgb*furnitureWeights.x
     +texture2D(furnitureFinishMap,furniturePosition.zx).rgb*furnitureWeights.y
     +texture2D(furnitureFinishMap,furniturePosition.xy).rgb*furnitureWeights.z-vec3(.5);
    diffuseColor.rgb*=${wood?'.965+furnitureSurface.r*.065+furnitureSurface.g*.045+furnitureSurface.b*.012':kind==='metal'?'.985+furnitureSurface.g*.025+furnitureSurface.b*.012':'.975+furnitureSurface.g*.028+furnitureSurface.b*.010'};
   `)
   .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
    roughnessFactor=clamp(roughnessFactor+furnitureSurface.g*${kind==='metal'?'.045':'.025'},.04,1.0);
   `);
 };
 material.customProgramCacheKey=()=>`furniture-finish-v2-${kind}-${cacheKey}`;
 return material;
}
