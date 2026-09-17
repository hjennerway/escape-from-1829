import {earthToScene} from './earth-registration.mjs';
import {ROAD_STYLE} from './road-style.mjs';

// Countess Mini Roundabout Polygon in 1829 (8).kml, including its closing point.
// Saved LookAt coordinates describe the camera, not the road footprint.
export const COUNTESS_ROUNDABOUT_COORDINATES=Object.freeze([
  [-2.897103716155058,53.21135700892636,0],
  [-2.897245186268792,53.21131112723965,0],
  [-2.897233768712522,53.21121482818584,0],
  [-2.897165073338122,53.21117351989098,0],
  [-2.897020650346817,53.21117009062836,0],
  [-2.896956366996044,53.21122009663579,0],
  [-2.896935673743333,53.21129106101402,0],
  [-2.897000955421366,53.21134723876816,0],
  [-2.897103716155058,53.21135700892636,0]
].map(Object.freeze));
export const COUNTESS_ROUNDABOUT_OUTLINE=Object.freeze(COUNTESS_ROUNDABOUT_COORDINATES.slice(0,-1)
  .map(([longitude,latitude])=>Object.freeze(earthToScene(latitude,longitude))));

// One centroid anchors both the painted centre and the Modern road approach.
export const COUNTESS_ROUNDABOUT_CENTER=Object.freeze((()=>{
  let twiceArea=0,cx=0,cz=0;
  for(let i=0;i<COUNTESS_ROUNDABOUT_OUTLINE.length;i++){
    const [x,z]=COUNTESS_ROUNDABOUT_OUTLINE[i],[nx,nz]=COUNTESS_ROUNDABOUT_OUTLINE[(i+1)%COUNTESS_ROUNDABOUT_OUTLINE.length];
    const cross=x*nz-nx*z;twiceArea+=cross;cx+=(x+nx)*cross;cz+=(z+nz)*cross;
  }
  return [cx/(3*twiceArea),cz/(3*twiceArea)];
})());

export function createCountessRoundabout(THREE){
  const group=new THREE.Group();group.name='Countess Mini Roundabout';
  group.userData={outline:COUNTESS_ROUNDABOUT_OUTLINE,coordinates:COUNTESS_ROUNDABOUT_COORDINATES,
    source:'1829 (8).kml · Countess Mini Roundabout · Polygon'};
  const shape=new THREE.Shape(COUNTESS_ROUNDABOUT_OUTLINE.map(([x,z])=>new THREE.Vector2(x,-z)));
  const layer=ROAD_STYLE.asphaltLayer+1;
  const asphalt=new THREE.MeshStandardMaterial({color:ROAD_STYLE.asphalt,roughness:1,
    polygonOffset:true,polygonOffsetFactor:-layer,polygonOffsetUnits:-2*layer});
  const surface=new THREE.Mesh(new THREE.ShapeGeometry(shape),asphalt);
  surface.name='Countess roundabout asphalt';surface.rotation.x=-Math.PI/2;surface.position.y=.36;
  surface.receiveShadow=true;surface.renderOrder=3;group.add(surface);
  // The KML only defines the outer road edge. The flat white centre is an
  // illustrative mini-roundabout marking, with an estimated 1.5-unit radius.
  const paint=new THREE.Mesh(new THREE.CircleGeometry(1.5,48),new THREE.MeshStandardMaterial({
    color:0xe8e7df,roughness:1,polygonOffset:true,polygonOffsetFactor:-layer-1,polygonOffsetUnits:-2*(layer+1)}));
  paint.name='Countess roundabout painted centre';paint.rotation.x=-Math.PI/2;
  paint.position.set(COUNTESS_ROUNDABOUT_CENTER[0],.38,COUNTESS_ROUNDABOUT_CENTER[1]);paint.receiveShadow=true;paint.renderOrder=4;
  group.add(paint);return group;
}
