import {addExteriorStairRail} from './exterior-stair-rail.mjs';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';

// Fitted to the two ground photographs in Research/west/forward-fire-exit-2026-10-05.
// Keep the F5 door and the established two parallel flight lanes.
export function addWestForwardFireExit(THREE,{model,worldUV,brick,material}){
  const stair=new THREE.Group();stair.name='West forward end masonry return stair';model.add(stair);
  const iron=material(0x202725,{roughness:.78,metalness:.35});
  const stone=material(0x656759,{roughness:.98}),yellow=material(0xd7bf34,{roughness:.9});
  const asphalt=material(0x4e5350,{roughness:1});
  function add(geometry,mat,x,y,z,name){
    const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(x,y,z);mesh.name=name;
    mesh.castShadow=mesh.receiveShadow=true;stair.add(mesh);return mesh;
  }
  function block(mat,x,y,z,w,h,d,name){return add(new THREE.BoxGeometry(w,h,d),mat,x,y,z,name);}
  function masonry(geometry,x,y,z,name){return add(worldUV(geometry,1.7),brick,x,y,z,name);}
  function guard(a,b){return addExteriorStairRail(THREE,stair,iron,a,b,{height:1.16,picketSpacing:.14,name:'West forward fire-exit iron guard'});}

  // Each hoop rises from the existing guarded edges; its crown leaves clear
  // headroom. It has no extra broad collision box across the flight mouth.
  function hoop(x,y,z,width,alongZ=true){
    const radius=width/2,spring=1.72,parts=[];
    for(const side of [-1,1]){
      const leg=new THREE.CylinderGeometry(.026,.026,spring,6);
      leg.translate(alongZ?0:side*radius,spring/2,alongZ?side*radius:0);parts.push(leg);
    }
    class Crown extends THREE.Curve{
      getPoint(t,target=new THREE.Vector3()){
        const side=-radius*Math.cos(t*Math.PI),height=spring+radius*Math.sin(t*Math.PI);
        return target.set(alongZ?0:side,height,alongZ?side:0);
      }
    }
    parts.push(new THREE.TubeGeometry(new Crown(),24,.026,6,false));
    const geometry=mergeGeometries(parts);for(const part of parts)part.dispose();
    const mesh=add(geometry,iron,x,y,z,'West forward fire-exit arched frame');
    mesh.userData.noWalkingCollision=true;
    mesh.userData.fireExitHoop={base:[x,y,z],width,alongZ};
  }
  function flight(x0,y0,x1,y1,z,frames){
    const count=12,run=Math.abs(x1-x0)/count,direction=Math.sign(x1-x0);
    for(let i=0;i<count;i++){
      const x=x0+(x1-x0)*(i+.5)/count,y=y0+(y1-y0)*(i+1)/count;
      masonry(new THREE.BoxGeometry(run+.012,y-.12,1.35),x,(y+.12)/2,z,'West forward end brick stair tread');
      block(stone,x,y+.015,z,run+.045,.085,1.4,'West forward fire-exit stone tread');
      // Dark stone riser face and a narrow yellow top/front nosing, as photographed.
      block(stone,x-direction*run/2,y-.073,z,.035,.17,1.4,'West forward fire-exit stone riser');
      block(yellow,x-direction*(run/2-.016),y+.061,z,.085,.012,1.38,'West forward fire-exit yellow nosing').userData.noWalkingCollision=true;
      block(yellow,x-direction*(run/2+.016),y+.029,z,.012,.052,1.38,'West forward fire-exit yellow nosing face').userData.noWalkingCollision=true;
    }
    for(const side of [-1,1])guard([x0,y0+.06,z+side*.7],[x1,y1+.06,z+side*.7]);
    for(const t of frames){
      const step=Math.ceil(t*count),y=y0+(y1-y0)*step/count+.058;
      hoop(x0+(x1-x0)*t,y,z,1.4);
    }
  }
  // Lower arches start halfway up: the high brick cheek at the stair foot
  // would otherwise bury their crowns. This matches the frontal photograph.
  flight(-39.35,.2,-45.05,2.24,46.05,[.5,.72,.94]);
  flight(-45.05,2.24,-39.35,4.28,44.5,[.25,.6,.95]);

  masonry(new THREE.BoxGeometry(1.45,2.12,2.95),-45.75,1.18,45.28,'West forward end intermediate landing');
  block(stone,-45.75,2.27,45.28,1.5,.08,3.02,'West forward fire-exit turning landing');
  block(iron,-39,4.25,44.135,2,.14,2.13,'West forward fire-exit door landing');
  // The photos show masonry under the balcony, rather than freestanding legs.
  masonry(new THREE.BoxGeometry(.48,4.04,.72),-39.9,2.14,43.64,'West forward fire-exit balcony brick pier');
  block(iron,-39,4.13,45.14,2,.2,.08,'West forward fire-exit balcony fascia');
  block(iron,-38.035,4.13,44.135,.08,.2,2.13,'West forward fire-exit balcony fascia');

  function cheek(x0,y0,x1,y1,z,depth,name){
    const shape=new THREE.Shape();shape.moveTo(x0,.12);shape.lineTo(x1,.12);
    shape.lineTo(x1,y1);shape.lineTo(x0,y0);shape.closePath();
    masonry(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false}),0,0,z-depth/2,name);
  }
  cheek(-45.05,2.21,-39.35,4.22,45.28,.22,'West forward fire-exit central brick cheek');
  cheek(-45.05,2.21,-39.35,.26,46.8,.18,'West forward fire-exit outer brick cheek');

  guard([-39.35,4.34,45.2],[-38.05,4.34,45.2]);
  guard([-38.05,4.34,45.2],[-38.05,4.34,43.14]);
  guard([-40,4.34,43.14],[-40,4.34,43.8]);
  for(const edge of [
    [[-46.5,2.3,43.77],[-46.5,2.3,46.79]],
    [[-46.5,2.3,46.79],[-45.05,2.3,46.79]],
    [[-46.5,2.3,43.77],[-45.05,2.3,43.77]]
  ])guard(...edge);
  hoop(-39,4.32,43.56,1.9,false);hoop(-39,4.32,44.89,1.9,false);
  // This apron stays within the old clear approach footprint.
  const apron=block(asphalt,-37.5,.22,47.65,19,.1,1.45,'West forward fire-exit asphalt approach');
  apron.userData.noWalkingCollision=true;model.add(apron);
  return stair;
}
