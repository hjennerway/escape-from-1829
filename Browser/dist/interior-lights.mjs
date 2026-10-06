// A fixed shader light count avoids recompilation as lamps enter/leave range.
export const INTERIOR_LIGHT_LIMIT=12;
export function createInteriorLights(THREE,scene,lamps,{limit=INTERIOR_LIGHT_LIMIT}={}){
 const pool=Array.from({length:limit},()=>{
  const light=new THREE.PointLight(0xffffff,0,13,1.4);
  scene.add(light);return light;
 });
 const ranked=lamps.map(lamp=>({lamp,distance:0,weight:1}));
 function update(player){
  // Walking keeps the departure floor until the actor steps clear of the
  // flight. Blend by the actual route elevations so the arrival landing is
  // already lit when reached, in either direction and on basement stairs.
  const stair=player.stair,lowerY=stair?.route?.[0]?.[1],upperY=stair?.route?.at(-1)?.[1];
  const climbing=Number.isFinite(player.y)&&upperY>lowerY;
  const height=climbing?Math.max(0,Math.min(1,(player.y-lowerY)/(upperY-lowerY))):0;
  const upperWeight=height*height*(3-2*height);
  for(const entry of ranked){
   const floor=entry.lamp.floor;
   entry.weight=climbing?(floor===stair.lower?1-upperWeight:floor===stair.upper?upperWeight:0):Number(floor===player.floor);
   // The continuous penalty keeps fading lamps out of the limited pool.
   // Multiplying distance alone would let a zero-distance lamp occupy a
   // slot even when its contribution was arbitrarily close to zero.
   entry.distance=entry.weight>0?Math.hypot(entry.lamp.x-player.x,entry.lamp.z-player.z)-8*Math.log(entry.weight):Infinity;
  }
  ranked.sort((a,b)=>a.distance-b.distance);
  // Fade before the first unselected lamp, so exchanging slots does not pop.
  const radius=Math.min(32,ranked[limit]?.distance??32);
  for(let i=0;i<pool.length;i++){
   const light=pool[i],entry=ranked[i];
   if(!entry||!Number.isFinite(entry.distance)){light.intensity=0;continue;}
   const lamp=entry.lamp,t=Math.max(0,Math.min(1,(radius-entry.distance)/5));
   light.position.set(lamp.x,lamp.y,lamp.z);light.color.setHex(lamp.color);
   light.intensity=14*entry.weight*t*t*(3-2*t);
  }
 }
 return {update,pool};
}
