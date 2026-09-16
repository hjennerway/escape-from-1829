import {MODERN_ROAD_PATHS,MODERN_ROADS_SOURCE} from './modern-road-data.mjs';
import {roadCenterline} from './road-centerlines.mjs';
import {createRoadLabel} from './road-labels.mjs';
import {ROAD_STYLE} from './road-style.mjs';

export function createModernRoads(THREE){
  const roads=new THREE.Group();roads.name='Modern roads · Google Earth paths';
  roads.userData.source=MODERN_ROADS_SOURCE;
  const asphalt=new THREE.MeshStandardMaterial({color:ROAD_STYLE.asphalt,roughness:1,polygonOffset:true,polygonOffsetFactor:-ROAD_STYLE.asphaltLayer,polygonOffsetUnits:-2*ROAD_STYLE.asphaltLayer});
  const edge=new THREE.MeshStandardMaterial({color:ROAD_STYLE.edge,roughness:1,polygonOffset:true,polygonOffsetFactor:-ROAD_STYLE.edgeLayer,polygonOffsetUnits:-2*ROAD_STYLE.edgeLayer});
  // Widths are visual estimates; use the shared, refined scene centrelines.
  function ribbon(points,width,y,material){
    const positions=[],indices=[];
    for(let i=1;i<points.length;i++){
      const [ax,az]=points[i-1],[bx,bz]=points[i],dx=bx-ax,dz=bz-az,length=Math.hypot(dx,dz);
      if(length<.0001)continue;
      const ox=-dz/length*width/2,oz=dx/length*width/2,n=positions.length/3;
      positions.push(ax+ox,y,az+oz,ax-ox,y,az-oz,bx+ox,y,bz+oz,bx-ox,y,bz-oz);
      indices.push(n,n+2,n+1,n+1,n+2,n+3);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    const group=new THREE.Group(),surface=new THREE.Mesh(geometry,material);surface.receiveShadow=true;surface.renderOrder=material===asphalt?2:1;group.add(surface);
    const capGeometry=new THREE.CircleGeometry(width/2,ROAD_STYLE.roundSegments);capGeometry.rotateX(-Math.PI/2);
    for(const [x,z] of points){const cap=new THREE.Mesh(capGeometry,material);cap.position.set(x,y,z);cap.receiveShadow=true;cap.renderOrder=surface.renderOrder;group.add(cap);}
    return group;
  }
  for(const path of MODERN_ROAD_PATHS){
    const road=new THREE.Group(),points=roadCenterline(path);
    road.name=path.name;road.userData.centerline=points;road.userData.coordinates=path.coordinates;
    // Historic ends at the eastern crossing; Modern also includes the tail.
    const sharedPoints=path.name==='Vivienne Smith Lane'?points.slice(0,12):points;
    road.add(ribbon(sharedPoints,6+2*ROAD_STYLE.edgeWidth,.32,edge),ribbon(sharedPoints,6,.34,asphalt),createRoadLabel(THREE,path.name,points));
    if(path.name==='Vivienne Smith Lane'){
      const tail=new THREE.Group();tail.name='Vivienne Smith Lane eastern continuation';tail.userData.modernOnly=true;
      tail.add(ribbon(points.slice(11),6+2*ROAD_STYLE.edgeWidth,.32,edge),ribbon(points.slice(11),6,.34,asphalt));road.add(tail);
    }
    roads.add(road);
  }
  return roads;
}
