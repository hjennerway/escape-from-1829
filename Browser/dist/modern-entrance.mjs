import {VIVIENNE_LANE} from './road-centerlines.mjs';
export {VIVIENNE_LANE} from './road-centerlines.mjs';
import {FRONT_BOUNDARY} from './front-boundary-wall.mjs';
import {ROAD_STYLE} from './road-style.mjs';

export function lanePointAtX(x){
  for(let i=1;i<VIVIENNE_LANE.length;i++){
    const a=VIVIENNE_LANE[i-1],b=VIVIENNE_LANE[i];
    if(x>=Math.min(a[0],b[0])&&x<=Math.max(a[0],b[0])){
      const t=(x-a[0])/(b[0]-a[0]);return [x,a[1]+t*(b[1]-a[1])];
    }
  }
  throw new Error('Entrance lies outside the saved Vivienne Smith Lane path');
}

export const FRONT_ENTRANCE_VIEW=Object.freeze({position:[0,140,128],target:[0,0,51],fov:46});

export function createModernEntrance(THREE){
  const entrance=new THREE.Group();entrance.name='Curved 1829 entrance from Vivienne Smith Lane';
  const neckZ=FRONT_BOUNDARY.z+.5,halfNeck=1.6,halfMouth=17;
  const left=lanePointAtX(-halfMouth),right=lanePointAtX(halfMouth);
  const edgeOffset=3.3; // Match the pale near edge of the existing six-unit lane.
  const controlZ=neckZ+(Math.min(left[1],right[1])-edgeOffset-neckZ)*.67;
  const sides=[-1,1].map(side=>new THREE.CubicBezierCurve3(
    new THREE.Vector3(side*halfNeck,.36,neckZ),
    new THREE.Vector3(side*halfNeck,.36,controlZ),
    new THREE.Vector3(side*9,.36,lanePointAtX(side*9)[1]-edgeOffset),
    new THREE.Vector3(side*halfMouth,.36,lanePointAtX(side*halfMouth)[1]-edgeOffset)
  ).getPoints(32));
  // Follow the exact lane vertices across the mouth, including the slight bend near x=0.
  const mouth=[left,...VIVIENNE_LANE.filter(([x])=>x>left[0]&&x<right[0]),right];
  const outline=[[-halfNeck,FRONT_BOUNDARY.z-1],...sides[0].map(p=>[p.x,p.z]),...mouth,...sides[1].slice().reverse().map(p=>[p.x,p.z]),[halfNeck,FRONT_BOUNDARY.z-1]];
  const shape=new THREE.Shape(outline.map(([x,z])=>new THREE.Vector2(x,-z)));
  const asphalt=new THREE.MeshStandardMaterial({color:ROAD_STYLE.asphalt,roughness:1,polygonOffset:true,polygonOffsetFactor:-(ROAD_STYLE.asphaltLayer+1),polygonOffsetUnits:-2*(ROAD_STYLE.asphaltLayer+1)});
  const surface=new THREE.Mesh(new THREE.ShapeGeometry(shape),asphalt);surface.rotation.x=-Math.PI/2;surface.position.y=.36;surface.receiveShadow=true;surface.renderOrder=3;surface.name='Sweeping entrance asphalt';entrance.add(surface);
  const kerb=new THREE.MeshStandardMaterial({color:ROAD_STYLE.edge,roughness:1,polygonOffset:true,polygonOffsetFactor:-(ROAD_STYLE.asphaltLayer+1),polygonOffsetUnits:-2*(ROAD_STYLE.asphaltLayer+1)-1});
  // Kerbs follow only the curved sides: no transverse stripe across the lane mouth or gate.
  for(let side=0;side<2;side++){
    const points=[new THREE.Vector3((side===0?-1:1)*halfNeck,.375,FRONT_BOUNDARY.z-1),...sides[side]],positions=[],indices=[];
    for(let i=0;i<points.length;i++){
      const tangent=points[Math.min(i+1,points.length-1)].clone().sub(points[Math.max(0,i-1)]).normalize();
      const outward=new THREE.Vector3(tangent.z,0,-tangent.x).multiplyScalar(side===0?-.25:.25),p=points[i];
      positions.push(p.x,.375,p.z,p.x+outward.x,.375,p.z+outward.z);
      if(i>0){const n=i*2;if(side===0)indices.push(n-2,n-1,n,n-1,n+1,n);else indices.push(n-2,n,n-1,n-1,n,n+1);}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    const edge=new THREE.Mesh(geometry,kerb);edge.name=(side===0?'West':'East')+' curved entrance kerb';edge.receiveShadow=true;edge.renderOrder=4;entrance.add(edge);
  }
  entrance.userData={mouth,outline,neck:[0,FRONT_BOUNDARY.z-1],source:'User-circled satellite entrance; mouth registered to the unchanged saved lane path'};
  return entrance;
}
