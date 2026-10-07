// img17.jpg faces north towards the west forward wing, as marked in img17-loc.png.
// Dimensions are visual estimates. The fire exit follows the October 2026 close photos.
export const WEST_FORWARD_END_PHOTO_VIEW=Object.freeze({position:[-36.5,1.8,65],target:[-36.5,5.6,43],fov:52});
import {addWestForwardFireExit} from './west-forward-fire-exit.mjs';
export function addWestForwardEndPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,material,sash,door,rod,iron}){
  const start=model.userData.eastPhotoOpenings.length;
  const trim=material(0xd2d9d2),archBrick=material(0x80675b);
  const glass=material(0x78989f,{roughness:.48,metalness:.15}),frame=material(0xd3dcd8);
  const z=43.06,columns=[-39,-36.15,-33.3,-30.45];
  function opening(x,y,w,h,face){
    sash(face,x,y,z,0,w,h);
    // Segmental brick heads, with the straight lintel recessed behind the arch.
    box(brick,x,y+h/2+.085,z+.125,w+.25,.19,.14);
    const a=w/2+.15,shape=new THREE.Shape();
    shape.moveTo(-a,0);shape.quadraticCurveTo(0,.14,a,0);
    shape.lineTo(a,.16);shape.quadraticCurveTo(0,.32,-a,.16);shape.closePath();
    mesh(new THREE.ShapeGeometry(shape),archBrick,x,y+h/2+.04,z+.21);
  }
  for(const x of columns)opening(x,2.02,1.42,2.7,'west-forward-end-lower');
  for(const x of columns.slice(1))opening(x,6.32,1.42,2.95,'west-forward-end-upper');
  door(columns[0],z+.03,0,4.28);
  // A glazed upper door and a separate transom, with taller lights than a sash.
  box(glass,-39,6.15,43.36,1.16,1.36,.05);
  for(const x of [-39.58,-39.19,-38.81,-38.42])box(frame,x,6.15,43.4,.025,1.4,.05);
  for(const y of [5.45,6.85])box(frame,-39,y,43.4,1.2,.035,.05);
  box(glass,-39,7.71,43.14,1.42,.72,.06);
  for(const x of [-39.71,-39.237,-38.763,-38.29])box(frame,x,7.71,43.21,.035,.79,.08);
  for(const y of [7.32,8.1])box(frame,-39,y,43.21,1.49,.045,.08);
  model.userData.eastPhotoOpenings.push({face:'west-forward-end-transom',x:-39,y:7.71,z:43.06,w:1.42,h:.72});
  box(trim,-35,4.16,43.16,12.12,.28,.25);
  for(const [y,h,d] of [[8.38,.22,.26],[8.62,.25,.44],[8.82,.12,.58]])box(white,-35,y,43.1,12.3,h,d);
  box(iron,-35,8.92,43.39,12.6,.1,.11);
  for(const x of [-40.85,-29.12])box(iron,x,4.43,43.27,.065,8.8,.065,0,true);
  const assembly=new THREE.Group();assembly.name='West forward downpipe assembly';assembly.userData.downpipeAssembly=true;model.add(assembly);
  const downpipe=rod([-37.42,8.55,43.24],[-37.42,3.42,43.24],.035);downpipe.name='West forward downpipe';assembly.add(downpipe);
  assembly.add(rod([-37.42,3.42,43.24],[-37.13,3.22,43.24],.035));

  addWestForwardFireExit(THREE,{model,worldUV,brick,material});
  model.userData.westForwardEndPhotoOpenings=model.userData.eastPhotoOpenings.slice(start);
}
