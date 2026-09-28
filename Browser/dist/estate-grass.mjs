import {restoreGroundProjection} from './ground-materials.mjs';
// Share the terrain's colour and texture, projected at the same world scale.
// World coordinates also keep rotated lawns and scaled instances from stretching
// the mottling or restarting the pattern at a grass island's boundary.
export function matchEstateGrass(material,terrainMaterial){
 material.color.copy(terrainMaterial.color);
 material.map=terrainMaterial.map;
 material.roughness=terrainMaterial.roughness;
 material.userData.estateGrass=true;
 material.userData.estateSurface='grass';
 return restoreGroundProjection(material);
}
