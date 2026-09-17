import {ROAD_STYLE} from './road-style.mjs';

// The red outline in the user's September 17 aerial marks the rear ground
// between Parsons Lane (1829 Central) and the tree-lined open lawn.
export function createModernRearHardstanding(THREE,centralLane){
  const lane=centralLane.userData.centerline,bottomX=22,topX=124;
  const end=lane.at(-1);
  const segment=lane.findIndex((point,i)=>i>0&&point[0]>=bottomX&&lane[i-1][0]<=bottomX);
  const a=lane[segment-1],b=lane[segment];
  const bottomZ=a[1]+(b[1]-a[1])*(bottomX-a[0])/(b[0]-a[0]);
  // Follow the lane's bends to its centreline so no kerb or grass seam
  // divides the new asphalt from the existing road. The far edge follows
  // the slightly tapered outline in the supplied perspective view.
  const outline=[[topX,-164],[topX,end[1]],...lane.filter(([x])=>x>bottomX).reverse(),[bottomX,bottomZ],[bottomX,-156]];
  const shape=new THREE.Shape(outline.map(([x,z])=>new THREE.Vector2(x,-z)));
  const layer=ROAD_STYLE.asphaltLayer+1;
  const asphalt=new THREE.MeshStandardMaterial({color:ROAD_STYLE.asphalt,roughness:1,polygonOffset:true,polygonOffsetFactor:-layer,polygonOffsetUnits:-2*layer});
  const surface=new THREE.Mesh(new THREE.ShapeGeometry(shape),asphalt);
  surface.name='Modern rear hardstanding beside Parsons Lane';
  surface.rotation.x=-Math.PI/2;surface.position.y=.36;
  surface.receiveShadow=true;surface.renderOrder=3;
  surface.userData.outline=outline;
  return surface;
}
