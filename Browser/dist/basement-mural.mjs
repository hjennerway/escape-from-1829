// Owner-supplied upright Grindley mural, on B7's south face beside S5.
// Blend paint into the masonry shader so it retains the wall relief and
// lighting without a floating plane, depth fighting or extra collision.
const cache=new WeakMap();
export const BASEMENT_MURAL={centerX:-34.65,wallZ:1.39,heightFraction:.8,sourceWidth:475,sourceHeight:542,crop:[10,0,466,532],feather:.10};
// Follow the painted outline, excluding the photographed ceiling/plaster.
// Coordinates refer to the unchanged supplied PNG; fading happens at render time.
const outline=[[25,0],[72,10],[125,26],[194,45],[280,68],[359,92],[453,119],
 [462,177],[466,264],[458,334],[415,379],[358,417],[287,461],[260,502],
 [219,528],[182,532],[141,520],[110,506],[76,491],[41,469],[43,416],
 [51,364],[31,310],[19,278],[10,242],[16,183],[21,98]];

export function basementMuralMaterials(THREE,base,ceilingHeight,document=globalThis.document){
 if(cache.has(base))return cache.get(base);
 const p=BASEMENT_MURAL,[left,top,right,bottom]=p.crop;
 const height=ceilingHeight*p.heightFraction,width=height*(right-left)/(bottom-top),y=(ceilingHeight-height)/2;
 const ready={value:0};
 const texture=document?new THREE.TextureLoader().load(new URL('./art/grindley-basement-mural.png',import.meta.url).href,()=>{ready.value=1;}):new THREE.Texture();
 texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 const points=outline.map(([x,y])=>new THREE.Vector2((x-left)/(right-left),(bottom-y)/(bottom-top)));
 const result={...base};
 for(const kind of ['Brick','Plaster']){
  const original=base[kind],material=original.clone();
  material.name='Basement '+kind+' with Grindley mural';
  material.onBeforeCompile=shader=>{
   original.onBeforeCompile(shader);
   Object.assign(shader.uniforms,{muralMap:{value:texture},muralReady:ready,muralOutline:{value:points}});
   shader.fragmentShader=`
    uniform sampler2D muralMap;
    uniform float muralReady;
    uniform vec2 muralOutline[${points.length}];
    float muralMask(vec2 uv){
      float distanceToEdge=100.0;bool inside=false;
      for(int i=0,j=${points.length-1};i<${points.length};j=i,i++){
        vec2 a=muralOutline[i],b=muralOutline[j];
        vec2 edge=(b-a)*vec2(${width},${height});
        vec2 offset=(uv-a)*vec2(${width},${height});
        distanceToEdge=min(distanceToEdge,length(offset-edge*clamp(dot(offset,edge)/dot(edge,edge),0.0,1.0)));
        if((a.y>uv.y)!=(b.y>uv.y)){
          if(uv.x<(b.x-a.x)*(uv.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
        }
      }
      return inside?smoothstep(0.0,${p.feather.toFixed(3)},distanceToEdge):0.0;
    }
   `+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`
    #include <color_fragment>
    vec2 muralUv=(vFinishPosition.xy-vec2(${p.centerX-width/2},${y}))/vec2(${width},${height});
    if(muralReady>.5&&abs(vFinishPosition.z-${p.wallZ})<.005&&vFinishNormal.z>.5&&
       all(greaterThanEqual(muralUv,vec2(0.0)))&&all(lessThanEqual(muralUv,vec2(1.0)))){
      vec2 sourceUv=vec2(${left/p.sourceWidth},${(p.sourceHeight-bottom)/p.sourceHeight})+
                    muralUv*vec2(${(right-left)/p.sourceWidth},${(bottom-top)/p.sourceHeight});
      vec4 paint=texture2D(muralMap,sourceUv);
      diffuseColor.rgb=mix(diffuseColor.rgb,paint.rgb,paint.a*muralMask(muralUv));
    }
   `);
  };
  material.customProgramCacheKey=()=>original.customProgramCacheKey()+'-grindley-mural-v1';
  material.userData.mural={height,width,bottom:y,top:y+height,centerX:p.centerX,wallZ:p.wallZ};
  result[kind]=material;
 }
 cache.set(base,result);return result;
}
