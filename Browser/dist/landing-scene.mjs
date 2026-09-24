import {buildAerialScene} from './aerial-scene.mjs';

// Share the complete dated estate with the aerial view and loading stills.
// Keep full building detail for the arrival and escape cameras that reuse it.
export async function createLandingExterior(THREE,aspect){
  const {exterior}=await buildAerialScene(THREE,aspect,{detail:false});
  exterior.timeline.setPeriod(1916);
  // Navigation labels belong to the interactive map, not the title backdrop.
  exterior.layouts.roads.traverse(object=>{if(object.isSprite&&object.userData.roadName)object.visible=false;});
  return exterior;
}
