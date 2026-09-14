// 20260913_171036.jpg and the user's plan: approach from +Z, split along X,
// then turn towards -Z onto the doorstep. Dimensions are visual estimates.
export const FRONT_STEPS_VIEW=Object.freeze({position:[8,6,36],target:[0,2.6,23],fov:48});

export function addFrontSteps(THREE,{model,material}){
  const stairs=new THREE.Group();stairs.name='Front entrance split staircase';model.add(stairs);
  const sandstone=material(0x79665c),tread=material(0xb8b8aa),iron=material(0x344b55);
  const ground=.18,top=1.8,rise=(top-ground)/8,mid=ground+4*rise;
  function block(name,mat,x,z,w,d,height){
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,height-ground,d),mat);
    m.position.set(x,(height+ground)/2,z);m.name=name;m.castShadow=m.receiveShadow=true;stairs.add(m);return m;
  }
  function slab(name,x,z,w,d,height){
    block(name,sandstone,x,z,w,d,height-.065);
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,.065,d),tread);
    m.position.set(x,height-.0325,z);m.name=name+' surface';m.castShadow=m.receiveShadow=true;stairs.add(m);
  }
  function parapet(name,a,b,width){
    const dx=b[0]-a[0],dz=b[2]-a[2],length=Math.hypot(dx,dz),angle=-Math.atan2(dz,dx);
    const shape=new THREE.Shape();shape.moveTo(0,ground);shape.lineTo(length,ground);
    shape.lineTo(length,b[1]-.065);shape.lineTo(0,a[1]-.065);shape.closePath();
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:false});geometry.translate(0,0,-width/2);
    const wall=new THREE.Mesh(geometry,sandstone);wall.position.set(a[0],0,a[2]);wall.rotation.y=angle;
    wall.name=name;wall.castShadow=wall.receiveShadow=true;stairs.add(wall);
    const delta=new THREE.Vector3(dx,b[1]-a[1],dz);
    const cap=new THREE.Mesh(new THREE.BoxGeometry(delta.length(),.065,width+.035),tread);
    cap.position.set((a[0]+b[0])/2,(a[1]+b[1])/2-.0325,(a[2]+b[2])/2);
    cap.rotation.set(0,angle,0);cap.rotateZ(Math.atan2(b[1]-a[1],length));
    cap.name=name+' coping';cap.castShadow=cap.receiveShadow=true;stairs.add(cap);
  }
  function rail(a,b){
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
    const m=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,delta.length(),8),iron);
    m.position.copy(start).addScaledVector(delta,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
    m.name='Doorstep iron balustrade';stairs.add(m);
  }
  // Broad upper doorstep, with side entries outside the portico columns.
  slab('Front doorway landing',0,21.7,7.8,3.7,top);
  slab('Front stair branching landing',0,25.2,2.2,1.2,mid);
  for(let i=0;i<4;i++)slab('Front approach step '+(i+1),0,27.2-i*.4,2.2,.4,ground+(i+1)*rise);
  for(const side of [-1,1]){
    const label=side<0?'Left':'Right';
    for(let i=0;i<4;i++)slab(label+' lateral step '+(i+1),side*(1.3+i*.4),25.2,.4,1.2,mid+(i+1)*rise);
    // The second 90-degree turn is level with the doorstep, not another flight.
    slab(label+' forward return landing',side*3.3,24.1,1.2,3.4,top);
    // Solid red-brown masonry cheeks and pale coping follow the photographed stairs.
    parapet(label+' approach parapet',[side*1.27,ground+rise+.65,27.4],[side*1.27,mid+.65,25.8],.34);
    parapet(label+' lateral parapet',[side*1.1,mid+.65,26],[side*2.7,top+.65,26],.4);
    slab(label+' outer return parapet',side*4.07,24.1,.34,3.8,top+.65);
    slab(label+' turning parapet',side*3.3,26,1.2,.4,top+.65);
  }
  // Close the front edge of the raised doorstep; access is from either side.
  for(const y of [top+.12,top+.86])rail([-2.68,y,23.48],[2.68,y,23.48]);
  for(let i=0;i<=22;i++){const x=-2.68+i*5.36/22;rail([x,top,23.48],[x,top+.86,23.48]);}
  return stairs;
}
