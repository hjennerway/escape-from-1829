// Google Earth marker registered to the fixed 1829 entrance; see Research/landmark-placement.md.
// Its clock gable faces the estate's front (+Z), along the mapped nave axis.
import {addChurchFront} from './church-front.mjs';
export const ESCAPE_CHAPEL=Object.freeze({x:-4.9,z:-119.2,rotation:0});
export function createChapel(THREE,{brick,roof,stone,dark,worldUV}){
  const chapel=new THREE.Group();chapel.name='Old Chapel · brick Gothic chapel';
  chapel.position.set(ESCAPE_CHAPEL.x,0,ESCAPE_CHAPEL.z);chapel.rotation.y=ESCAPE_CHAPEL.rotation;
  const trim=new THREE.MeshStandardMaterial({color:0x71634e,roughness:1});
  const glazing=new THREE.MeshStandardMaterial({color:0x35484b,roughness:.55,metalness:.15});
  function mesh(g,m,x,y,z,parent=chapel){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function box(m,x,y,z,w,h,d,parent=chapel){return mesh(worldUV(new THREE.BoxGeometry(w,h,d)),m,x,y,z,parent);}
  function beam(a,b,width,mat=trim,parent=chapel){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),v=end.clone().sub(start);const o=mesh(new THREE.BoxGeometry(width,v.length(),width),mat,0,0,0,parent);o.position.copy(start).addScaledVector(v,.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
  function gable(w,d,eave,rise,x=0,z=0,parent=chapel){
    const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise);shape.closePath();
    mesh(worldUV(new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false})),brick,x,eave,z-d/2,parent);
    const slope=Math.atan2(rise,w/2),length=Math.hypot(w/2,rise)+.55;
    for(const side of [-1,1]){const o=box(roof,x+side*w/4,eave+rise/2,z,length,.22,d+.8,parent);o.rotation.z=-side*slope;}
    for(const end of [-1,1])for(const side of [-1,1])beam([x+side*(w/2+.15),eave,z+end*(d/2+.44)],[x,eave+rise+.16,z+end*(d/2+.44)],.24,trim,parent);
    box(dark,x,eave+rise+.18,z,.25,.22,d+.9,parent);
  }
  function arch(w,h){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(-w/2,h*.57);s.quadraticCurveTo(-w/2,h*.78,0,h);s.quadraticCurveTo(w/2,h*.78,w/2,h*.57);s.lineTo(w/2,0);s.closePath();return s;}
  function opening(x,y,z,w,h,rotation=0,door=false,parent=chapel){
    const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rotation;parent.add(g);
    mesh(new THREE.ShapeGeometry(arch(w+.5,h+.35)),trim,0,-.15,0,g);
    mesh(new THREE.ShapeGeometry(arch(w,h)),door?dark:glazing,0,0,.035,g);
    box(trim,0,-.13,.15,w+.65,.22,.42,g);
    if(door){for(const side of [-1,1])box(trim,side*.12,.9,.1,.06,.35,.07,g);}
    else {
      box(trim,0,h*.43,.075,.10,h*.86,.10,g);
      box(trim,0,h*.36,.075,w,.09,.10,g);
      for(const side of [-1,1])beam([side*w*.24,h*.57,.08],[0,h*.88,.08],.07,trim,g);
    }
  }
  box(stone,0,.45,0,10.5,.9,28.5);box(brick,0,4.6,0,10,8.4,28);
  gable(10,28,8.8,6.1);
  // Weathered plinth and eaves; five lancets and stepped buttresses on each side.
  for(const side of [-1,1]){
    box(trim,side*5,1.05,0,.22,.3,28.3);box(dark,side*5.18,8.75,0,.22,.25,28.6);
    for(const z of [-10.8,-5.5,0,5.5,10.8]){
      if(!(side===-1&&z===5.5))opening(side*5.035,2.0,z,1.8,5.3,side*Math.PI/2);
    }
    for(const z of [-13.5,-8.1,-2.75,2.75,8.1,13.5]){
      box(trim,side*5.45,.55,z,1.4,1.1,1.25);
      box(brick,side*5.4,2.1,z,1.15,3.0,.95);
      box(trim,side*5.4,3.6,z,1.3,.22,1.1);
      box(brick,side*5.22,5.0,z,.8,2.7,.85);
      const cap=box(trim,side*5.25,6.4,z,1.05,.25,1.05);cap.rotation.z=side*.25;
    }
  }
  opening(0,3,-14.04,3.1,8,Math.PI);
  addChurchFront(THREE,{chapel,brick,roof,worldUV});
  function cross(x,y,z){box(trim,x,y,z,.16,1.4,.18);box(trim,x,y+.22,z,.85,.15,.18);}
  cross(0,15.65,-14);
  // Projecting entrance porch on the west side of the nave.
  const porch=new THREE.Group();porch.position.set(-5,0,5.5);porch.rotation.y=-Math.PI/2;chapel.add(porch);
  box(brick,0,2.1,1.45,4.6,4.2,3.2,porch);gable(4.6,3.2,4.2,3.0,0,1.45,porch);
  opening(0,.35,3.08,2.4,4.7,0,true,porch);box(stone,0,.15,3.7,3.5,.3,1.4,porch);
  // Low vestry at the opposite end.
  box(brick,0,2,-15.7,6,4,3.4);gable(6,3.4,4,2.7,0,-15.7);opening(0,1.2,-17.44,1.4,2.4,Math.PI);
  return chapel;
}
