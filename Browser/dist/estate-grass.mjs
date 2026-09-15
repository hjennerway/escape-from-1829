// Share the terrain's colour and texture, projected at its original world scale.
// World coordinates also keep rotated lawns and scaled instances from stretching
// the mottling or restarting the pattern at a grass island's boundary.
export function matchEstateGrass(material,terrainMaterial){
 material.color.copy(terrainMaterial.color);
 material.map=terrainMaterial.map;
 material.roughness=terrainMaterial.roughness;
 material.userData.estateGrass=true;
 material.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
#ifdef USE_MAP
 vec4 grassWorldPosition = vec4(transformed, 1.0);
 #ifdef USE_INSTANCING
  grassWorldPosition = instanceMatrix * grassWorldPosition;
 #endif
 grassWorldPosition = modelMatrix * grassWorldPosition;
 vMapUv = (grassWorldPosition.xz * vec2(1.0, -1.0) + vec2(2000.0)) / 100.0;
#endif`);
 };
 material.customProgramCacheKey=()=> 'estate-grass-world-v1';
 material.needsUpdate=true;
 return material;
}
