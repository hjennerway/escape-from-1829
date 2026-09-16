import {matchEstateGrass} from './estate-grass.mjs';
import {missingHistoricFootprints} from './historic-footprints.mjs';
import {ROAD_STYLE} from './road-style.mjs';
import {HISTORIC_ROADS_SOURCE,HISTORIC_ROADS,HISTORIC_GRAVEL,HISTORIC_PAVING,HISTORIC_GRASS,HISTORIC_KERBS} from './historic-road-layout.mjs';
export * from './historic-road-layout.mjs';
export function createHistoricRoads(THREE,exterior){
 const group=new THREE.Group();group.name='Historic roads and surfaces';group.userData.source=HISTORIC_ROADS_SOURCE;
 const material=color=>new THREE.MeshStandardMaterial({color,roughness:1});
 const asphalt=material(ROAD_STYLE.asphalt),paving=material(ROAD_STYLE.asphalt),gravel=material(0xb4b3aa),grass=material(0x60784b),brown=material(0x87542f),kerb=material(ROAD_STYLE.edge),edge=material(ROAD_STYLE.edge);
 matchEstateGrass(grass,exterior.terrain.material);
 const islandGrass=grass.clone();
 matchEstateGrass(islandGrass,exterior.terrain.material);
 islandGrass.polygonOffset=true;islandGrass.polygonOffsetFactor=-6;islandGrass.polygonOffsetUnits=-12;
 // Separate close ground layers at the higher OS overview camera as well.
 for(const [mat,order] of [[gravel,1],[paving,2],[grass,3],[edge,ROAD_STYLE.edgeLayer],[asphalt,ROAD_STYLE.asphaltLayer],[brown,5],[kerb,6]]){mat.polygonOffset=true;mat.polygonOffsetFactor=-order;mat.polygonOffsetUnits=-order*2;}
 // Deterministic stone flecks, at world scale, remain legible on close approach.
 const size=64,data=new Uint8Array(size*size*4);let seed=1829;
 for(let i=0;i<size*size;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=175+(seed%66);data.set([v,v,Math.max(0,v-7),255],i*4);}
 const texture=new THREE.DataTexture(data,size,size);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.needsUpdate=true;gravel.map=texture;
 function polygon(name,points,mat,y,holes=[]){
  const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));
  for(const hole of holes)shape.holes.push(new THREE.Path(hole.map(([x,z])=>new THREE.Vector2(x,-z))));
  const geometry=new THREE.ShapeGeometry(shape);
  const uv=geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/3,uv.getY(i)/3);
  const mesh=new THREE.Mesh(geometry,mat);mesh.rotation.x=-Math.PI/2;mesh.position.y=y;mesh.name=name;mesh.receiveShadow=true;mesh.renderOrder=mat===asphalt?2:mat===edge?1:0;mesh.userData.surface=(mat===asphalt||mat===paving)?'black road':mat===gravel?'gravel':mat===grass||mat===islandGrass?'grass':mat===kerb||mat===edge?'stone kerb':'provisional brown outline';group.add(mesh);return mesh;
 }
 function ribbon(name,points,width,mat,y){
  const part=new THREE.Group();part.name=name;part.userData.centerline=points;part.userData.width=width;group.add(part);
  // Straight strips with small round joints avoid gaps at bends; no spline drift.
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length<1e-6)continue;
   const ox=-dz/length*width/2,oz=dx/length*width/2;
   part.add(polygon(name+' surface',[[a[0]+ox,a[1]+oz],[a[0]-ox,a[1]-oz],[b[0]-ox,b[1]-oz],[b[0]+ox,b[1]+oz]],mat,y));
  }
  const geometry=new THREE.CircleGeometry(width/2,ROAD_STYLE.roundSegments);geometry.rotateX(-Math.PI/2);
  for(const [x,z] of points){const cap=new THREE.Mesh(geometry,mat);cap.position.set(x,y,z);cap.receiveShadow=true;cap.renderOrder=mat===asphalt?2:mat===edge?1:0;cap.userData.surface=mat===asphalt?'black road':mat===kerb||mat===edge?'stone kerb':'provisional brown outline';part.add(cap);}
 }
 for(const area of HISTORIC_GRAVEL)polygon(area.name,area.points,gravel,.265);
 // The service court meets the road without a pale border across its mouth.
 for(const area of HISTORIC_PAVING){
  const type=area.surface,mat=type==='junction edge'?edge:type==='junction'||type==='asphalt apron'||area.name==='Tower service court'?asphalt:paving;
  const y=type==='junction'?.36:type==='junction edge'?.32:type==='asphalt apron'||area.name==='Tower service court'?.345:.28;
  const mesh=polygon(area.name,area.points,mat,y,area.holes);if(type==='junction')mesh.renderOrder=3;
 }
 for(const area of HISTORIC_GRASS){const mesh=polygon(area.name,area.points,area.raisedIsland?islandGrass:grass,area.raisedIsland?.37:.31);if(area.raisedIsland)mesh.renderOrder=4;}
 for(const road of HISTORIC_ROADS)ribbon(road.name+' border',road.points,road.width+2*ROAD_STYLE.edgeWidth,edge,.32);
 for(const road of HISTORIC_ROADS)ribbon(road.name,road.points,road.width,asphalt,.34);
 for(const edge of HISTORIC_KERBS)ribbon(edge.name,edge.points,.32,kerb,.38);
 const missing=missingHistoricFootprints(THREE,exterior);group.userData.missingFootprints=missing;
 for(const segment of missing.segments)ribbon(segment.name,segment.points,.8,brown,.33);
 return group;
}
