// A fixed shader light count avoids recompilation as lamps enter/leave range.
export const INTERIOR_LIGHT_LIMIT=12;
export function createInteriorLights(THREE,scene,lamps,{limit=INTERIOR_LIGHT_LIMIT}={}){
 const pool=Array.from({length:limit},()=>{
  const light=new THREE.PointLight(0xffffff,0,13,1.4);
  scene.add(light);return light;
 });
 const ranked=lamps.map(lamp=>({lamp,distance:0}));
 function update(player){
  for(const entry of ranked)entry.distance=entry.lamp.floor===player.floor?Math.hypot(entry.lamp.x-player.x,entry.lamp.z-player.z):Infinity;
  ranked.sort((a,b)=>a.distance-b.distance);
  // Fade before the first unselected lamp, so exchanging slots does not pop.
  const radius=Math.min(32,ranked[limit]?.distance??32);
  for(let i=0;i<pool.length;i++){
   const light=pool[i],entry=ranked[i];
   if(!entry||!Number.isFinite(entry.distance)){light.intensity=0;continue;}
   const lamp=entry.lamp,t=Math.max(0,Math.min(1,(radius-entry.distance)/5));
   light.position.set(lamp.x,lamp.y,lamp.z);light.color.setHex(lamp.color);
   light.intensity=14*t*t*(3-2*t);
  }
 }
 return {update,pool};
}
