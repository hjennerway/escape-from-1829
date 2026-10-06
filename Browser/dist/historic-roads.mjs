import {matchEstateGrass} from './estate-grass.mjs';
import {applyGroundSurface} from './ground-materials.mjs';
import {missingHistoricFootprints} from './historic-footprints.mjs';
import {ROAD_STYLE} from './road-style.mjs';
import {trimAnnexeEntranceBorder} from './annexe-access.mjs';
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
 junction.polygonOffset=true;junction.polygonOffsetFactor=-6;junction.polygonOffsetUnits=-12;
 const islandGrass=grass.clone();
 matchEstateGrass(islandGrass,exterior.terrain.material);
 islandGrass.polygonOffset=true;islandGrass.polygonOffsetFactor=-7;islandGrass.polygonOffsetUnits=-14;
 // Separate close ground layers at the higher OS overview camera as well.
 for(const [mat,order] of [[gravel,1],[paving,2],[grass,3],[edge,ROAD_STYLE.edgeLayer],[asphalt,ROAD_STYLE.asphaltLayer],[kerb,8]]){mat.polygonOffset=true;mat.polygonOffsetFactor=-order;mat.polygonOffsetUnits=-order*2;}
 function polygon(name,points,mat,y,holes=[]){
  const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));
  for(const hole of holes)shape.holes.push(new THREE.Path(hole.map(([x,z])=>new THREE.Vector2(x,-z))));
  const geometry=new THREE.ShapeGeometry(shape);
  const uv=geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/3,uv.getY(i)/3);
  const mesh=new THREE.Mesh(geometry,mat);mesh.rotation.x=-Math.PI/2;mesh.position.y=y;mesh.name=name;mesh.receiveShadow=true;mesh.renderOrder=mat===asphalt?2:mat===edge?1:0;mesh.userData.surface=(mat===asphalt||mat===paving||mat===junction)?'black road':mat===gravel?'gravel':mat===grass||mat===islandGrass?'grass':'stone kerb';group.add(mesh);return mesh;
 }
 function ribbon(name,points,width,mat,y,renderPoints=points){
  const part=new THREE.Group();part.name=name;part.userData.centerline=points;part.userData.width=width;group.add(part);
  points=renderPoints;
  const trim=name==='Annexe front avenue border';
  const strip=points=>{for(const piece of trim?trimAnnexeEntranceBorder(points):[points])part.add(polygon(name+' surface',piece,mat,y));};
  // Straight strips with small round joints avoid gaps at bends; no spline drift.
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length<1e-6)continue;
   const ox=-dz/length*width/2,oz=dx/length*width/2;
   strip([[a[0]+ox,a[1]+oz],[a[0]-ox,a[1]-oz],[b[0]-ox,b[1]-oz],[b[0]+ox,b[1]+oz]]);
  }
  const geometry=new THREE.CircleGeometry(width/2,ROAD_STYLE.roundSegments);geometry.rotateX(-Math.PI/2);
  if(trim){for(const [x,z] of points)strip(Array.from({length:ROAD_STYLE.roundSegments},(_,i)=>{const a=i/ROAD_STYLE.roundSegments*Math.PI*2;return [x+Math.cos(a)*width/2,z+Math.sin(a)*width/2];}));geometry.dispose();return;}
  for(const [x,z] of points){const cap=new THREE.Mesh(geometry,mat);cap.position.set(x,y,z);cap.receiveShadow=true;cap.renderOrder=mat===asphalt?2:mat===edge?1:0;cap.userData.surface=mat===asphalt?'black road':'stone kerb';part.add(cap);}
 }
 for(const area of HISTORIC_GRAVEL)polygon(area.name,area.points,gravel,area.height??.265);
 // The service court meets the road without a pale border across its mouth.
 for(const area of HISTORIC_PAVING){
  const type=area.surface,mat=type==='junction edge'?edge:type==='junction'?junction:type==='asphalt apron'||area.name==='Tower service court'?asphalt:paving;
  const y=type==='junction edge'?.32:ROAD_STYLE.asphaltY;
  const mesh=polygon(area.name,area.points,mat,y,area.holes);if(type==='junction')mesh.renderOrder=3;
 }
 for(const area of HISTORIC_GRASS){const mesh=polygon(area.name,area.points,area.raisedIsland?islandGrass:grass,area.raisedIsland?.37:.31);if(area.raisedIsland)mesh.renderOrder=4;}
 for(const road of HISTORIC_ROADS)ribbon(road.name+' border',road.points,road.width+2*ROAD_STYLE.edgeWidth,edge,.32);
 for(const road of HISTORIC_ROADS)ribbon(road.name,road.points,road.width,asphalt,ROAD_STYLE.asphaltY);
 for(const edge of HISTORIC_KERBS)ribbon(edge.name,edge.points,edge.width??.32,kerb,.38,simplifyKerb(edge.points));
 // Retain OS reference metadata for placement and clearance checks without drawing ground outlines.
 group.userData.missingFootprints=missingHistoricFootprints(THREE,exterior);
 return group;
}
