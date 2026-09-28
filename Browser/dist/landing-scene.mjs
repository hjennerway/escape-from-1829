import {buildAerialScene} from './aerial-scene.mjs';
import {createDayNight} from './day-night.mjs';

// Share the complete dated estate with the aerial view and loading stills.
// Keep full building detail for the arrival and escape cameras that reuse it.
export async function createLandingExterior(THREE,aspect,renderer){
  const {exterior}=await buildAerialScene(THREE,aspect,{detail:false});
  exterior.timeline.setPeriod(1916);
  // Navigation labels belong to the interactive map, not the title backdrop.
  exterior.layouts.roads.traverse(object=>{if(object.isSprite&&object.userData.roadName)object.visible=false;});
  if(renderer){
    let seed=1829;
    exterior.lighting=createDayNight(THREE,exterior,renderer,{twilight:true,random:()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32)});
    exterior.lighting.setNight(true);
  }
  return exterior;
}
