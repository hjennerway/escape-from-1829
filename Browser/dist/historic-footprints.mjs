import {OS_BLUE_REGION,OS_FOOTPRINTS} from './historic-footprint-data.mjs';
// Source pixel axes differ from the previous alarm board by roughly -90°.
// Register from identified landmarks, rather than rotating the existing estate.
// A similarity fit preserves OS angles, scale, stepped walls and court openings.
export const HISTORIC_OS_REGISTRATION=Object.freeze({
 source:'Research/historic-footprints/clean.png',annotations:'Research/historic-footprints/annotated.png',
 reception:{pixel:[249,286],world:[0,19.5]},
 chapel:{pixel:[163,333],world:[-4.9,-119.2]},
 churton:{pixel:[205,337],world:[-44.3,-65.9]},
 a:-.6013081600905106,b:-1.285207184273794
});
export function historicOSPoint(u,v){const {a,b}=HISTORIC_OS_REGISTRATION;return [a*(u-249)+b*(v-286),19.5-b*(u-249)+a*(v-286)];}
export function pointInFootprint(p,polygon){
 let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[i],b=polygon[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }return inside;
}
// Whole building masses only: low landscape surfaces, hedges, facade trim and
// tree trunks cannot suppress a missing OS building. Rotated walls stay rotated.
export function existingBuildingFootprints(THREE,exterior){
 exterior.model.updateWorldMatrix(true,true);const footprints=[];
 exterior.model.traverse(o=>{
  if(!o.isMesh||o.isInstancedMesh)return;
  const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox;
  const world=b.clone().applyMatrix4(o.matrixWorld),size=b.getSize(new THREE.Vector3());
  if(world.min.y>1.6||world.max.y<3||size.x<2||size.z<2)return;
  if(!['BoxGeometry','CylinderGeometry'].includes(g.type)&&!o.userData.collisionFootprint)return;
  let corners;
  if(o.userData.collisionFootprint)corners=o.userData.collisionFootprint;
  else if(g.type==='CylinderGeometry')corners=Array.from({length:24},(_,i)=>[(b.min.x+b.max.x)/2+(size.x/2+.7)*Math.cos(i*Math.PI/12),(b.min.z+b.max.z)/2+(size.z/2+.7)*Math.sin(i*Math.PI/12)]);
  else corners=[[b.min.x-.7,b.min.z-.7],[b.max.x+.7,b.min.z-.7],[b.max.x+.7,b.max.z+.7],[b.min.x-.7,b.max.z+.7]];
  const polygon=corners.map(([x,z])=>{const p=new THREE.Vector3(x,0,z).applyMatrix4(o.matrixWorld);return [p.x,p.z];});
  footprints.push(polygon);
  // A newly modelled traced wall needs the same marker clearance as box walls.
  // Thin edge buffers suppress its brown ground trace without filling recesses.
  const padding=o.userData.historicOutlinePadding;
  if(padding)for(let i=0;i<polygon.length;i++){
   const a=polygon[i],b=polygon[(i+1)%polygon.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length<1e-6)continue;
   const dx=(b[0]-a[0])/length*padding,dz=(b[1]-a[1])/length*padding;
   footprints.push([[a[0]-dx-dz,a[1]-dz+dx],[b[0]+dx-dz,b[1]+dz+dx],[b[0]+dx+dz,b[1]+dz-dx],[a[0]-dx+dz,a[1]-dz-dx]]);
  }
 });return footprints;
}
function intersections(a,b,polygon){
 const ts=[],dx=b[0]-a[0],dz=b[1]-a[1];
 for(let i=0;i<polygon.length;i++){
  const c=polygon[i],d=polygon[(i+1)%polygon.length],ex=d[0]-c[0],ez=d[1]-c[1],den=dx*ez-dz*ex;if(Math.abs(den)<1e-8)continue;
  const qx=c[0]-a[0],qz=c[1]-a[1],t=(qx*ez-qz*ex)/den,u=(qx*dz-qz*dx)/den;
  if(t>0&&t<1&&u>=0&&u<=1)ts.push(t);
 }return ts;
}
export function missingHistoricFootprints(THREE,exterior){
 const occupied=existingBuildingFootprints(THREE,exterior),region=OS_BLUE_REGION.map(p=>historicOSPoint(...p)),segments=[];
 for(let building=0;building<OS_FOOTPRINTS.length;building++)for(let loopIndex=0;loopIndex<OS_FOOTPRINTS[building].loops.length;loopIndex++){
  const pixels=OS_FOOTPRINTS[building].loops[loopIndex],loop=pixels.map(p=>historicOSPoint(...p));
  for(let i=0;i<loop.length;i++){
   // The photo-corrected stores turn 90 degrees: retire their old OS edge
   // rather than leaving an orange outline of the superseded orientation.
   const towerEdges=exterior.towerBuildings?.userData.replacedOSEdges;
   if(towerEdges&&building===towerEdges.sourceBuilding&&loopIndex===towerEdges.sourceLoop&&towerEdges.indices.includes(i))continue;
   const irbyEdges=exterior.irbyAshley?.userData.replacedOSEdges;
   if(irbyEdges&&building===irbyEdges.sourceBuilding&&loopIndex===irbyEdges.sourceLoop&&irbyEdges.indices.includes(i))continue;
   const farndonEdges=exterior.farndonWard?.userData.replacedOSEdges;
   if(farndonEdges&&building===farndonEdges.sourceBuilding&&loopIndex===farndonEdges.sourceLoop&&farndonEdges.indices.includes(i))continue;
   const replaced=exterior.uptonFrithOscroft?.userData.replacedOSEdges;
   const isReplaced=replaced&&building===replaced.sourceBuilding&&loopIndex===replaced.sourceLoop;
   if(isReplaced&&i>=replaced.start&&i<replaced.end)continue;
   // Retire the superseded unequal range while preserving its adjoining complex.
   const a=isReplaced&&i===replaced.end?replaced.endPoint:loop[i],b=loop[(i+1)%loop.length],at=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
   const stops=[0,1,...intersections(a,b,region),...occupied.flatMap(p=>intersections(a,b,p))].sort((a,b)=>a-b);
   for(let k=1;k<stops.length;k++){
    const lo=stops[k-1],hi=stops[k];if(hi-lo<1e-6)continue;const middle=at((lo+hi)/2);
    if(!pointInFootprint(middle,region)||occupied.some(p=>pointInFootprint(middle,p)))continue;
    segments.push({name:`OS missing building ${building+1} · contour ${loopIndex+1}`,points:[at(lo),at(hi)],sourceBuilding:building,sourceLoop:loopIndex});
   }
  }
 }
 return {segments,occupied,region,source:HISTORIC_OS_REGISTRATION};
}
