import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {ESCAPE_CORRIDOR_POLYGONS,unionPolygons} from '../../Browser/dist/escape-corridor-plan.mjs';
import {TOWER_WORKSHOPS} from '../../Browser/dist/tower-workshops.mjs';
import {WORKSHOP_GALLERY} from '../../Browser/dist/workshop-gallery.mjs';

// Use the same ceiling ray and joined footprint as the browser's latest fix.
// This Resources shader shares the native surface properties; switching it
// during Escape leaves historical exploration materials intact.
const directory=new URL('../Unity/Assets/Resources/',import.meta.url);
const number=n=>n.toFixed(8);
const loops=unionPolygons([...ESCAPE_CORRIDOR_POLYGONS,TOWER_WORKSHOPS.workshopOutline]);
const edges=loops.flatMap(loop=>loop.flatMap((a,i)=>{
  const b=loop[(i+1)%loop.length];if(Math.abs(b[1]-a[1])<1e-8)return [];
  return [`if((ceilingHit.y>${number(a[1])})!=(ceilingHit.y>${number(b[1])}) && ceilingHit.x<${number(a[0])}+(ceilingHit.y-(${number(a[1])}))*${number((b[0]-a[0])/(b[1]-a[1]))}) inside=!inside;`];
})).join('\n            ');
const lighting=`
        static float3 nativeWorkshopWorld;
        bool nativeWorkshopCeilingBlocks(float3 direction){
            if(direction.y<=0 || nativeWorkshopWorld.y>=${number(WORKSHOP_GALLERY.ceiling-.05)})return false;
            float2 ceilingHit=float2(nativeWorkshopWorld.x,-nativeWorkshopWorld.z)+float2(direction.x,-direction.z)*((${number(WORKSHOP_GALLERY.ceiling-.05)}-nativeWorkshopWorld.y)/direction.y);
            bool inside=false;
            ${edges}
            return inside;
        }
        half4 LightingWorkshop(SurfaceOutputStandard s,half3 viewDir,UnityGI gi){
            if(_WorldSpaceLightPos0.w==0 && nativeWorkshopCeilingBlocks(_WorldSpaceLightPos0.xyz))gi.light.color=0;
            return LightingStandard(s,viewDir,gi);
        }
        void LightingWorkshop_GI(SurfaceOutputStandard s,UnityGIInput data,inout UnityGI gi){LightingStandard_GI(s,data,gi);}
`;
let shader=await readFile(new URL('../Unity/Assets/Shaders/NativeSurface.shader',import.meta.url),'utf8');
shader=shader.replace('Escape1829/NativeSurface','Escape1829/NativeWorkshopSurface')
 .replaceAll('shader_feature_local','multi_compile_local')
 .replace('surface surf Standard','surface surf Workshop exclude_path:deferred')
 .replace('#include "Weather.cginc"','#include "../Shaders/Weather.cginc"\n        #include "UnityPBSLighting.cginc"')
 .replace('        void surf(Input IN, inout SurfaceOutputStandard o)',lighting+'\n        void surf(Input IN, inout SurfaceOutputStandard o)')
 .replace('            fixed4 c = finishSample','            nativeWorkshopWorld=IN.worldPos;\n            fixed4 c = finishSample');
await mkdir(directory,{recursive:true});await writeFile(new URL('NativeWorkshopSurface.shader',directory),shader);
console.log(`PASS: native workshop shader uses the current ${loops.length} joined ceiling loops / ${edges.split('\n').length} ray edges.`);
