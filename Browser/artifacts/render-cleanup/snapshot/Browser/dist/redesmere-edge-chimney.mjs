// redesmere_chimney/img1.jpg and img2.jpg; the marked views locate the
// chimney at the outer (+X), front (+Z) corner of the low Redesmere range.
// Render colour, proportions and position are photo-based estimates.
export const REDESMERE_CHIMNEY_VIEWS=Object.freeze({
  'redesmere-chimney':{position:[119,2,48],target:[91,5,17],fov:56},
  'redesmere-chimney-lawn':{position:[130,2,-7],target:[97,5,7],fov:58}
});

export function addRedesmereEdgeChimney(THREE,{model,material}){
  const chimney=new THREE.Group();chimney.name='Redesmere low-range edge chimney';
  chimney.position.set(100.55,0,20.1);model.add(chimney);
  const render=material(0xc4a47e),cap=material(0x97775b),soot=material(0x39332e);
  function part(name,geometry,mat,y,x=0,z=0){
    const object=new THREE.Mesh(geometry,mat);object.name=name;
    object.position.set(x,y,z);object.castShadow=true;object.receiveShadow=true;
    chimney.add(object);return object;
  }
  const segments=32;
  part('Redesmere chimney rendered foot',new THREE.CylinderGeometry(.975,.975,.5,segments),render,.25);
  // Circular rendered shaft with the same height and a gentle taper.
  part('Redesmere chimney pale tapered shaft',new THREE.CylinderGeometry(.74,.875,8.65,segments),render,4.725);
  part('Redesmere chimney neck',new THREE.CylinderGeometry(.815,.815,.2,segments),render,9.05);
  part('Redesmere chimney lower cap',new THREE.CylinderGeometry(1.015,1.015,.16,segments),cap,9.23);
  part('Redesmere chimney cap step',new THREE.CylinderGeometry(.925,.925,.18,segments),render,9.4);
  part('Redesmere chimney broad coping',new THREE.CylinderGeometry(1.08,1.08,.14,segments),cap,9.56);
  // Short circular flue rims with recessed dark openings.
  for(const x of [-.46,.46]){
    part('Redesmere chimney flue rim',new THREE.CylinderGeometry(.295,.295,.27,segments,1,true),cap,9.765,x);
    const inside=new THREE.CylinderGeometry(.185,.185,.25,segments,1,true);
    const innerSoot=material(0x39332e,{side:THREE.BackSide});
    part('Redesmere chimney flue inner wall',inside,innerSoot,9.775,x);
    const lip=new THREE.RingGeometry(.185,.295,segments);lip.rotateX(-Math.PI/2);
    part('Redesmere chimney flue lip',lip,cap,9.9,x);
    part('Redesmere chimney recessed flue',new THREE.CylinderGeometry(.185,.185,.03,segments),soot,9.65,x);
  }
  return chimney;
}
