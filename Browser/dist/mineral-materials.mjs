// Mineral finishes only: retain the existing palette and already-authored maps.
// These colours belong to the model's stone, coping and rendered-wall materials,
// rather than its separately coloured timber frames, glazing and metalwork.
const stoneColours=new Set([0xa39f8a,0xc8c6b7,0x989a91,0xb7ac90,0xa29c89,0xb4ac96,
 0xaca997,0x9e9683,0xb8b8aa,0x79665c,0x8e9188,0xaaa697,0xaaa799,0xb5ae99,
 0xd4ceba,0xcecaba,0xb2b6af,0xb9b5a5,0x9d998a,0xb4ae98,0x71634e,0x766557,
 0x534e40,0xb8b9af,0xd8dad1,0xc0b69c]);
const renderColours=new Set([0xe1e3dc,0xd6d0ba,0xcbd4d1,0xd2d9d2,0xd8ddd5,
 0xc8c7b7,0xbab9ab,0xe1e3d9,0xd6d9d1,0xe0d9bc,0xded7bb,0xc4a47e]);
const maps=new WeakMap();
function hash(x,y){let n=Math.imul(x,374761393)^Math.imul(y,668265263)^1829;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
function noise(x,y,cells){
 x*=cells;y*=cells;const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
 const u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
 const a=hash(ix%cells,iy%cells),b=hash((ix+1)%cells,iy%cells),c=hash(ix%cells,(iy+1)%cells),d=hash((ix+1)%cells,(iy+1)%cells);
 return (a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v;
}
function texture(THREE,kind){
 let cache=maps.get(THREE);if(!cache){cache=new Map();maps.set(THREE,cache);}
 if(cache.has(kind))return cache.get(kind);
 const size=512,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size,grain=hash(x,y)-.5,cloud=noise(u,v,8)-.5,pores=noise(u,v,96)-.5;
  const value=kind==='render'?.93+cloud*.085+pores*.09+grain*.08:
   .89+cloud*.16+(noise(u,v,28)-.5)*.10+pores*.15+grain*.10;
  const shade=Math.round(Math.min(1,Math.max(0,value))*255),i=(y*size+x)*4;
  data.set([shade,shade,shade,255],i);
 }
 const map=new THREE.DataTexture(data,size,size);map.name='Estate '+kind+' grain';
 map.wrapS=map.wrapT=THREE.RepeatWrapping;map.generateMipmaps=true;
 map.minFilter=THREE.LinearMipmapLinearFilter;map.magFilter=THREE.LinearFilter;map.anisotropy=16;map.needsUpdate=true;
 cache.set(kind,map);return map;
}

export function restoreMineralProjection(material){
 material.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 vMineralPosition;\nvarying vec3 vMineralNormal;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
 vec4 mineralPosition=vec4(transformed,1.0);
 #ifdef USE_INSTANCING
  mineralPosition=instanceMatrix*mineralPosition;
 #endif
 vMineralPosition=(modelMatrix*mineralPosition).xyz;
 vMineralNormal=inverseTransformDirection(transformedNormal,viewMatrix);`);
  shader.fragmentShader='varying vec3 vMineralPosition;\nvarying vec3 vMineralNormal;\n'+shader.fragmentShader;
  // Triplanar sampling keeps the same grain on vertical walls, curved columns,
  // horizontal treads and mouldings without stretching their existing box UVs.
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
 vec3 mineralWeights=pow(abs(normalize(vMineralNormal)),vec3(4.0));
 mineralWeights/=max(dot(mineralWeights,vec3(1.0)),.0001);
 vec3 mineralPosition=vMineralPosition/3.0;
 vec3 mineralGrain=texture2D(map,mineralPosition.yz).rgb*mineralWeights.x
  +texture2D(map,mineralPosition.xz).rgb*mineralWeights.y
  +texture2D(map,mineralPosition.xy).rgb*mineralWeights.z;
 diffuseColor.rgb*=mineralGrain;`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`
 normal=perturbNormalArb(-vViewPosition,normal,vec2(dFdx(mineralGrain.r),dFdy(mineralGrain.r))*bumpScale,faceDirection);`);
 };
 material.customProgramCacheKey=()=> 'estate-mineral-triplanar-v1';material.needsUpdate=true;
 return material;
}

export function applyMineralFinish(THREE,material){
 if(!material.isMeshStandardMaterial||material.map||material.transparent||material.metalness>0||material.roughness<.8)return material;
 const color=material.color.getHex(),kind=stoneColours.has(color)?'stone':renderColours.has(color)?'render':null;
 if(!kind)return material;
 material.userData.mineralFinish=kind;material.map=texture(THREE,kind);
 material.bumpMap=material.map;material.bumpScale=kind==='stone'?.045:.018;
 return restoreMineralProjection(material);
}

export function finishEstateMinerals(THREE,root){
 const materials=new Set();root.traverse(o=>{for(const material of [o.material].flat())if(material)materials.add(material);});
 for(const material of materials)applyMineralFinish(THREE,material);
}
