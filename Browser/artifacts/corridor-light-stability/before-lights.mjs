// Stable, cached shadow slots keep nearby tubes and windows illuminating the
// actual room without transmitting through walls or recompiling every shader.
// Ten local shadow samplers plus the estate sun leave room for material maps
// within WebGL2's guaranteed sixteen fragment texture units.
export const WORKSHOP_LIGHT_LIMIT=6;
export const WORKSHOP_WINDOW_LIGHT_LIMIT=4;
export function createWorkshopLights(THREE,group,lamps,{exterior}={}){
 function slots(count,name){return Array.from({length:count},(_,i)=>{
  const light=new THREE.SpotLight(0xffe3b4,0,16,1.22,.7,2);light.name=name+' '+i;
  light.castShadow=true;light.shadow.mapSize.set(256,256);light.shadow.bias=-.00015;light.shadow.normalBias=.015;
  light.shadow.camera.near=.08;light.shadow.camera.far=16;light.shadow.autoUpdate=false;light.shadow.needsUpdate=true;
  // Even unused slots need a valid depth texture before this shader samples
  // its fixed shadow array; null cached maps can suppress another slot's light.
  light.target.position.set(0,-1,0);
  light.userData.noWalkingCollision=true;light.target.userData.noWalkingCollision=true;
  group.add(light,light.target);return light;
 });}
 const pool=slots(WORKSHOP_LIGHT_LIMIT,'Workshop fixture light'),windowPool=slots(WORKSHOP_WINDOW_LIGHT_LIMIT,'Workshop daylight through window');
 const windows=[];group.updateMatrixWorld(true);
 group.traverse(wall=>{
  if(wall.name==='Workshop exterior with semicircular windows')for(const o of wall.userData.openings??[]){
   if(o.side!==1)continue;
   const inward=new THREE.Vector3(0,0,1).transformDirection(wall.matrixWorld),position=wall.localToWorld(new THREE.Vector3(o.x,o.y+(o.spring+o.radius)/2,o.z)).addScaledVector(inward,.26);
   windows.push({fixture:wall,id:wall.uuid+':'+o.x,x:position.x,y:position.y,z:position.z,inward});
  }
  if(wall.name==='Inner sash glass'){
   const p=wall.getWorldPosition(new THREE.Vector3());windows.push({fixture:wall,id:wall.uuid,x:p.x+.2,y:p.y,z:p.z,inward:new THREE.Vector3(1,0,0)});wall.castShadow=false;
  }
 });
 const sun=exterior?.scene?.children.find(o=>o.isDirectionalLight),sky=exterior?.scene?.children.find(o=>o.isHemisphereLight);
 const direction=new THREE.Vector3(),target=new THREE.Vector3(),colour=new THREE.Color();
 function invalidate(){for(const light of [...pool,...windowPool])light.shadow.needsUpdate=true;}
 function assign(lights,sources,actor,configure){
  const ranked=sources.map(source=>({source,distance:Math.hypot(source.x-actor.x,source.z-actor.z)})).sort((a,b)=>a.distance-b.distance);
  const radius=Math.min(28,ranked[lights.length]?.distance??28),chosen=ranked.slice(0,lights.length),ids=new Set(chosen.map(e=>e.source.id??e.source.fixture.uuid));
  const free=lights.filter(light=>!ids.has(light.userData.fixture));
  for(const light of free){light.intensity=0;delete light.userData.fixture;}
  for(const {source,distance} of chosen){
   const id=source.id??source.fixture.uuid,light=lights.find(l=>l.userData.fixture===id)??free.shift();
   const changed=light.userData.fixture!==id;light.userData.fixture=id;
   const t=Math.max(0,Math.min(1,(radius-distance)/5));
   const previous=light.target.position.clone();
   light.position.set(source.x,source.y,source.z);configure(light,source,t*t*(3-2*t));
   light.target.updateMatrixWorld(true);
   if(changed||previous.distanceToSquared(light.target.position)>1e-8)light.shadow.needsUpdate=true;
  }
 }
 function update(actor){
  assign(pool,lamps,actor,(light,source,fade)=>{
   light.target.position.set(source.x,.04,source.z);light.intensity=85*fade;
  });
  if(sun)direction.copy(sun.target.position).sub(sun.position).normalize();else direction.set(.4,-.8,.2).normalize();
  assign(windowPool,windows,actor,(light,source,fade)=>{
   const direct=Math.max(0,direction.dot(source.inward))*(sun?.intensity??2.8),ambient=sky?.intensity??1.5;
   // Sunlit apertures follow the estate sun; shaded apertures admit its sky.
   target.copy(source.inward).multiplyScalar(ambient).addScaledVector(direction,direct);target.y-=ambient*.45;target.normalize();
   light.target.position.copy(light.position).addScaledVector(target,6);
   colour.copy(sky?.color??new THREE.Color(0xbacbd5)).multiplyScalar(ambient).add((sun?.color??new THREE.Color(0xffe2b7)).clone().multiplyScalar(direct)).multiplyScalar(1/Math.max(.001,ambient+direct));
   light.color.copy(colour);light.intensity=14*(ambient+direct)*fade;
  });
 }
 update({x:lamps[0]?.x??0,z:lamps[0]?.z??0});
 return {lamps,pool,windows,windowPool,update,invalidate,dispose(){for(const light of [...pool,...windowPool])light.shadow.dispose();}};
}
