import {matchEstateGrass} from './estate-grass.mjs';
import {applyGroundSurface} from './ground-materials.mjs';
import {missingHistoricFootprints} from './historic-footprints.mjs';
import {ROAD_STYLE} from './road-style.mjs';
import {trimAnnexeEntranceBorder} from './annexe-access.mjs';
import {prepareRoadEnds,createRoadEndFades} from './road-end-fades.mjs';
import {createRoadRibbonGeometry,roadRibbonPolygons} from './road-ribbon.mjs';
import {HISTORIC_ROADS_SOURCE,HISTORIC_ROADS,HISTORIC_GRAVEL,HISTORIC_PAVING,HISTORIC_GRASS,HISTORIC_KERBS} from './historic-road-layout.mjs';
export * from './historic-road-layout.mjs';
// Ramer-Douglas-Peucker in the ground plane, with exact junction endpoints.
// The 5mm bound is much smaller than the 320mm stone edge width.
export function simplifyKerb(points,tolerance=.005){
 if(points.length<3)return points;
 const keep=new Set([0,points.length-1]),stack=[[0,points.length-1]];
 while(stack.length){const [first,last]=stack.pop(),a=points[first],b=points[last],dx=b[0]-a[0],dz=b[1]-a[1],length=dx*dx+dz*dz;let index=-1,error=tolerance*tolerance;
  for(let i=first+1;i<last;i++){const p=points[i],t=length?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/length)):0,d=(p[0]-a[0]-t*dx)**2+(p[1]-a[1]-t*dz)**2;if(d>error){error=d;index=i;}}
  if(index>=0){keep.add(index);stack.push([first,index],[index,last]);}
 }
 return [...keep].sort((a,b)=>a-b).map(i=>points[i]);
}
export function createHistoricRoads(THREE,exterior){
 const group=new THREE.Group();group.name='Historic roads and surfaces';group.userData.source=HISTORIC_ROADS_SOURCE;
 const material=color=>new THREE.MeshStandardMaterial({color,roughness:1});
 const asphalt=material(ROAD_STYLE.asphalt),paving=material(ROAD_STYLE.asphalt),gravel=material(0xb4b3aa),grass=material(0x60784b),kerb=material(ROAD_STYLE.edge),edge=material(ROAD_STYLE.edge);
 matchEstateGrass(grass,exterior.terrain.material);
 // Junction resurfacing uses depth bias over coplanar road end caps. Keeping
 // the actual asphalt level shared avoids visible supporting edges at joins.
 const junction=asphalt.clone();
 for(const mat of [asphalt,paving,junction])applyGroundSurface(THREE,mat,'asphalt');
 applyGroundSurface(THREE,gravel,'gravel');
 junction.polygonOffset=true;junction.polygonOffsetFactor=0;junction.polygonOffsetUnits=-12;
 const islandGrass=grass.clone();
 matchEstateGrass(islandGrass,exterior.terrain.material);
 islandGrass.polygonOffset=true;islandGrass.polygonOffsetFactor=0;islandGrass.polygonOffsetUnits=-14;
 // Constant bias orders close overlays without pulling buried borders through
 // roads or drawing lawn over raised kerbs at shallow walking angles.
 for(const [mat,order] of [[gravel,1],[paving,2],[grass,3],[edge,ROAD_STYLE.edgeLayer],[asphalt,ROAD_STYLE.asphaltLayer],[kerb,8]]){mat.polygonOffset=true;mat.polygonOffsetFactor=0;mat.polygonOffsetUnits=-order*2;}
 function polygon(name,points,mat,y,holes=[]){
  const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));
  for(const hole of holes)shape.holes.push(new THREE.Path(hole.map(([x,z])=>new THREE.Vector2(x,-z))));
  const geometry=new THREE.ShapeGeometry(shape);
  const uv=geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/3,uv.getY(i)/3);
  const mesh=new THREE.Mesh(geometry,mat);mesh.rotation.x=-Math.PI/2;mesh.position.y=y;mesh.name=name;mesh.receiveShadow=true;mesh.renderOrder=mat===asphalt?2:mat===edge?1:0;mesh.userData.surface=(mat===asphalt||mat===paving||mat===junction)?'black road':mat===gravel?'gravel':mat===grass||mat===islandGrass?'grass':'stone kerb';group.add(mesh);return mesh;
 }
 function ribbon(name,points,width,mat,y,renderPoints=points,ends={}){
  const part=new THREE.Group();part.name=name;part.userData.centerline=points;part.userData.width=width;group.add(part);
  const trim=name==='Annexe front avenue border';
  if(trim){for(const outline of roadRibbonPolygons(renderPoints,width,ends))for(const piece of trimAnnexeEntranceBorder(outline))part.add(polygon(name+' surface',piece,mat,y));return;}
  const mesh=new THREE.Mesh(createRoadRibbonGeometry(THREE,renderPoints,width,y,ends),mat);
  mesh.name=name+' surface';mesh.receiveShadow=true;mesh.renderOrder=mat===asphalt?2:mat===edge?1:0;
  mesh.userData.surface=mat===asphalt?'black road':'stone kerb';part.add(mesh);
 }
 function joinedKerb(spec){
  const {points,width,joinHeight,blendLength}=spec,distances=[0],positions=[],uv=[],indices=[];
  for(let i=1;i<points.length;i++)distances.push(distances[i-1]+Math.hypot(...points[i].map((v,k)=>v-points[i-1][k])));
  for(let i=0;i<points.length;i++){
   const p=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)];
   const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
   // A continuous strip has no overlapping segment caps. Ease its top down
   // to the existing road-border level at both ends rather than adding a step.
   const t=Math.min(1,distances[i]/blendLength,(distances.at(-1)-distances[i])/blendLength);
   const y=joinHeight+(.38-joinHeight)*t*t*(3-2*t);
   for(const side of [-1,1]){positions.push(p[0]-dz/length*width/2*side,y,p[1]+dx/length*width/2*side);uv.push(distances[i],(side+1)/2);}
   if(i){const j=i*2;indices.push(j-2,j-1,j,j-1,j+1,j);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
  const mesh=new THREE.Mesh(geometry,kerb);mesh.name=spec.name;mesh.receiveShadow=true;
  mesh.userData={surface:'stone kerb',centerline:points,width};group.add(mesh);
 }
 for(const area of HISTORIC_GRAVEL)polygon(area.name,area.points,gravel,area.height??.265);
 // The service court meets the road without a pale border across its mouth.
 for(const area of HISTORIC_PAVING){
  const type=area.surface,mat=type==='junction edge'?edge:type==='junction'?junction:type==='asphalt apron'||area.name==='Tower service court'?asphalt:paving;
  const y=type==='junction edge'?.32:ROAD_STYLE.asphaltY;
  const mesh=polygon(area.name,area.points,mat,y,area.holes);if(type==='junction')mesh.renderOrder=3;
 }
 for(const area of HISTORIC_GRASS){const mesh=polygon(area.name,area.points,area.raisedIsland?islandGrass:grass,area.raisedIsland?.37:.31);if(area.raisedIsland)mesh.renderOrder=4;}
 for(const road of HISTORIC_ROADS){
  const ends=prepareRoadEnds(road.name,road.points);
  ribbon(road.name+' border',road.points,road.width+2*ROAD_STYLE.edgeWidth,edge,.32,ends.points,ends);
  ribbon(road.name,road.points,road.width,asphalt,ROAD_STYLE.asphaltY,ends.points,ends);
  if(ends.fades.length)group.add(createRoadEndFades(THREE,road.name,road.width,ends));
 }
 for(const edge of HISTORIC_KERBS){if(edge.joinHeight!==undefined)joinedKerb(edge);else ribbon(edge.name,edge.points,edge.width??.32,kerb,.38,simplifyKerb(edge.points));}
 // Retain OS reference metadata for placement and clearance checks without drawing ground outlines.
 group.userData.missingFootprints=missingHistoricFootprints(THREE,exterior);
 return group;
}
