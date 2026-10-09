import {createTowerWorkshops} from './tower-workshops.mjs';
import {asylumSignTexture,asylumSignGeometry} from './asylum-sign-paint.mjs';
import {existsInYear} from './estate-periods.mjs';

export function createExploreWorkshops(THREE,exterior,walker,timeline){
 let workshops=null,resources=new Set();
 function sign(text,x,y,z,angle=0,width=1.5){
  const texture=asylumSignTexture(THREE,text.split('\n'),{name:text+' door sign'});
  const material=new THREE.MeshStandardMaterial({map:texture,roughness:.94});
  const geometry=asylumSignGeometry(THREE,width,width*320/1024,.008);
  for(const resource of [texture,material,geometry])resources.add(resource);
  const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.rotation.y=angle;mesh.userData.noWalkingCollision=true;return mesh;
 }
 function sync(){
  walker.outside.setObstacles(workshops?[...workshops.solids,...workshops.doorObstacles()]:[]);
  exterior.invalidateShadows();
 }
 return {
  get workshops(){return workshops;},
  refresh(){
   const opened=Object.fromEntries((workshops?.doors??[]).map(d=>[d.id,workshops.isOpen(d.id)]));
   workshops?.dispose();for(const resource of resources)resource.dispose();resources=new Set();workshops=null;
   // Disposal restores original mesh states; reapply the selected date before
   // rebuilding shells and static shadows, including after tree visibility changes.
   timeline.setPeriod(timeline.period.year);
   if(existsInYear('The Main',timeline.period.year)){
    workshops=createTowerWorkshops(THREE,exterior,walker.outside,resources,sign,{explore:true});
    workshops.sync(opened['tower-door'],opened);
   }
   // Fitting the workshops already refreshes the complete estate's obstacles.
   // With no fittings, refresh here so the visible period still owns collisions.
   if(!workshops)walker.setObstacles();sync();
  },
  nearbyDoor(actor){
   if(!actor.outside||!workshops)return null;
   let nearest=null,distance=2.1;
   for(const door of workshops.doors){
    const d=Math.hypot(actor.x-door.x,actor.z-door.z,(actor.y??0));
    if(d<distance){nearest={...door,workshop:true,action:(workshops.isOpen(door.id)?'Close':'Open')+' door'};distance=d;}
   }
   return nearest;
  },
  useDoor(door){if(!workshops)return false;workshops.setDoorOpen(door.id,!workshops.isOpen(door.id));return true;},
  update(dt,actor){if(workshops?.update(Math.min(.1,Math.max(0,dt)),actor))sync();}
 };
}
