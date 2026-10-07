import {asylumSignTexture,asylumSignGeometry} from './asylum-sign-paint.mjs';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {segmentDistance} from './asylum-layout.mjs';
import {stairConnection,stairRoute,stairWell} from './asylum-stairs.mjs';

export const STAIR_SIGN_WIDTH=1.42,STAIR_SIGN_HEIGHT=.43,STAIR_SIGN_DEPTH=.035,STAIR_SIGN_Y=1.88;
const names=['Ground Floor','First Floor','Basement','Second Floor'];

// The well's front is solid masonry between the two flight mouths. A separate
// straight flight needs its own plaque beside its actual arrival/departure.
export function asylumStairSigns(floor){
 const signs=[];
 for(const source of floor.stairs){
  const connections=source.connections.filter(c=>c.includes(floor.id)),wells=new Set();
  for(const pair of connections){
   const stair=stairConnection(source,...pair),well=stairWell(stair);
   if(well){
    const key=JSON.stringify(well);if(wells.has(key))continue;wells.add(key);
    signs.push({stairId:source.id,x:(well.minX+well.maxX)/2,z:well.minZ-STAIR_SIGN_DEPTH/2-.002,rotation:Math.PI,wall:{a:[well.minX,well.minZ],b:[well.maxX,well.minZ],face:true}});
   }else{
    const route=stairRoute(stair,floor.levelElevations[pair[0]],floor.levelElevations[pair[1]],...pair),portal=pair[0]===floor.id?route[0]:route.at(-1);
    const candidates=floor.walls.flatMap(w=>{
     // Scheduled upper walls can be tested against their real windows. Older
     // procedural exterior windows are avoided altogether for these plaques.
     if(w.exterior&&floor.windowMode!=='scheduled')return [];
     const dx=w.b[0]-w.a[0],dz=w.b[1]-w.a[1],length=Math.hypot(dx,dz),margin=STAIR_SIGN_WIDTH/2+.15;
     if(length<margin*2)return [];
     const ux=dx/length,uz=dz/length,t=Math.max(margin,Math.min(length-margin,(portal[0]-w.a[0])*ux+(portal[2]-w.a[1])*uz));
     const x=w.a[0]+ux*t,z=w.a[1]+uz*t;
     if((floor.windows??[]).some(p=>segmentDistance(p.x,p.z,w.a,w.b)<.1&&Math.hypot(x-p.x,z-p.z)<(p.width+STAIR_SIGN_WIDTH)/2+.15))return [];
     const side=(portal[0]-x)*-uz+(portal[2]-z)*ux>=0?1:-1,nx=-uz*side,nz=ux*side,offset=.09+STAIR_SIGN_DEPTH/2+.002;
     return [{x:x+nx*offset,z:z+nz*offset,rotation:Math.atan2(nx,nz),wall:w,distance:Math.hypot(portal[0]-x,portal[2]-z)}];
    }).sort((a,b)=>a.distance-b.distance);
    if(!candidates.length)throw Error('No stair sign wall on floor '+floor.id+' beside '+source.id);
    const {distance,...mount}=candidates[0];signs.push({stairId:source.id,...mount});
   }
  }
 }
 return signs.map(sign=>({...sign,floor:floor.id,text:names[floor.id],y:STAIR_SIGN_Y,width:STAIR_SIGN_WIDTH,height:STAIR_SIGN_HEIGHT}));
}


export function addAsylumStairSigns(THREE,scene,floor,document=globalThis.document){
 const signs=asylumStairSigns(floor);if(!signs.length)return;
 const texture=asylumSignTexture(THREE,[names[floor.id]],{seed:1829+floor.id*719,name:'Distressed '+names[floor.id]+' stair sign',document}),material=new THREE.MeshStandardMaterial({map:texture,color:texture?0xffffff:0xc6b997,roughness:.94});material.name='Asylum floor signs';
 const parts=signs.map(sign=>{
  const geometry=asylumSignGeometry(THREE,sign.width,sign.height,STAIR_SIGN_DEPTH);
  geometry.rotateY(sign.rotation);geometry.translate(sign.x,sign.y,sign.z);return geometry;
 });
 const mesh=new THREE.Mesh(mergeGeometries(parts),material);mesh.name='Asylum StairFloorSigns';mesh.userData.labels=signs;scene.add(mesh);for(const part of parts)part.dispose();
}
