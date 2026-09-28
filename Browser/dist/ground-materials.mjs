// Shared, seamless ground detail. All scales are scene metres, independent of
// mesh UVs, road segment lengths, rotated buildings and instanced lawn boxes.
const textures=new WeakMap();
const TILE_SIZE=12;

function hash(x,y,seed){
 let n=Math.imul(x,374761393)^Math.imul(y,668265263)^seed;
 n=Math.imul(n^(n>>>13),1274126177);
 return ((n^(n>>>16))>>>0)/4294967295;
}
function noise(x,y,cells,seed){
 x*=cells;y*=cells;
 const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
 const u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
 const a=hash(ix%cells,iy%cells,seed),b=hash((ix+1)%cells,iy%cells,seed);
 const c=hash(ix%cells,(iy+1)%cells,seed),d=hash((ix+1)%cells,(iy+1)%cells,seed);
 return (a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v;
}

export function groundTexture(THREE,kind){
 let cache=textures.get(THREE);if(!cache){cache=new Map();textures.set(THREE,cache);}
 if(cache.has(kind))return cache.get(kind);
 const size=512,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size,patch=noise(u,v,12,1829)-.5;
  const grain=hash(x,y,kind==='grass'?731:1947)-.5;
  let value,red=1,green=1,blue=1;
  if(kind==='grass'){
   const tufts=noise(u,v,64,918)-.5;
   // Short narrow strokes and fine grain replace the old metre-wide blotches.
   const blades=noise(u,v,256,422)*noise(v,u,128,512)-.25;
   value=.515+patch*.12+tufts*.18+blades*.20+grain*.13;
   red=1.025;blue=.82;
  }else{
   const stones=noise(u,v,128,kind==='gravel'?281:593)-.5;
   const grit=noise(u,v,48,954)-.5;
   value=kind==='gravel'?.86+patch*.16+grit*.20+stones*.34+grain*.14:
    .86+patch*.13+grit*.09+stones*.15+grain*.12;
   if(kind==='gravel')blue=.96;
  }
  const offset=(y*size+x)*4;
  for(const [i,tint] of [red,green,blue].entries())data[offset+i]=Math.round(Math.max(0,Math.min(1,value*tint))*255);
  data[offset+3]=255;
 }
 // Resolve individual blades/chips at walking distance. Wrapped strokes keep
 // tile edges seamless; mipmaps blend them naturally in distant aerial views.
 if(kind==='grass'||kind==='gravel')for(let i=0;i<18000;i++){
  const cx=hash(i,0,92)*size,cy=hash(i,1,92)*size;
  const angle=hash(i,2,92)*Math.PI*2,dx=Math.cos(angle),dy=Math.sin(angle);
  const length=kind==='grass'?2+hash(i,3,92)*6:1+hash(i,3,92)*3;
  const shade=(hash(i,4,92)-.5)*(kind==='grass'?66:54);
  for(let step=0;step<length;step++){
   const x=(Math.round(cx+dx*step)+size)%size,y=(Math.round(cy+dy*step)+size)%size;
   const offset=(y*size+x)*4;
   for(let c=0;c<3;c++)data[offset+c]=Math.max(0,Math.min(255,data[offset+c]+shade));
  }
 }
 // Pixels are linear reflectance multipliers, not sRGB colour swatches.
 const map=new THREE.DataTexture(data,size,size);
 map.name='Estate '+kind+' detail';map.wrapS=map.wrapT=THREE.RepeatWrapping;
 map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearMipmapLinearFilter;
 map.generateMipmaps=true;map.anisotropy=16;map.needsUpdate=true;
 cache.set(kind,map);return map;
}

export function restoreGroundProjection(material){
 material.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
 vec4 groundWorldPosition = vec4(transformed, 1.0);
 #ifdef USE_INSTANCING
  groundWorldPosition = instanceMatrix * groundWorldPosition;
 #endif
 groundWorldPosition = modelMatrix * groundWorldPosition;
 vec2 groundUv = groundWorldPosition.xz / ${TILE_SIZE.toFixed(1)};
 #ifdef USE_MAP
  vMapUv = groundUv;
 #endif
 #ifdef USE_BUMPMAP
  vBumpMapUv = groundUv;
 #endif`);
 };
 material.customProgramCacheKey=()=>material.userData.estateGrass?'estate-grass-world-v2':'estate-ground-world-v1';
 material.needsUpdate=true;return material;
}

export function applyGroundSurface(THREE,material,kind){
 material.map=groundTexture(THREE,kind);
 material.userData.estateSurface=kind;
 if(kind!=='grass'){material.bumpMap=material.map;material.bumpScale=kind==='gravel'?.035:.018;}
 return restoreGroundProjection(material);
}
