// img17.jpg faces north towards the west forward wing, as marked in img17-loc.png.
// Dimensions are visual estimates. Modern aerials, signs and yellow nosings are omitted.
export const WEST_FORWARD_END_PHOTO_VIEW=Object.freeze({position:[-36.5,1.8,65],target:[-36.5,5.6,43],fov:52});
export function addWestForwardEndPhotoDetails(THREE,{model,box,mesh,worldUV,white,brick,material,sash,door,rod,iron}){
  const start=model.userData.eastPhotoOpenings.length;
  const trim=material(0xd2d9d2),archBrick=material(0x80675b),gravel=material(0x939080);
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
  for(const [y,h,d] of [[8.38,.22,.26],[8.62,.25,.44],[8.82,.12,.58]])box(trim,-35,y,43.1,12.3,h,d);
  box(iron,-35,8.92,43.39,12.6,.1,.11);
  for(const x of [-40.85,-29.12])box(iron,x,4.43,43.27,.065,8.8,.065);
  rod([-37.42,8.55,43.24],[-37.42,3.42,43.24],.035);
  rod([-37.42,3.42,43.24],[-37.13,3.22,43.24],.035);

  // Returning masonry flights at the left of the photo. Solid bases provide
  // walking collisions; exterior stairs remain non-climbable scenery.
  const stair=new THREE.Group();stair.name='West forward end masonry return stair';model.add(stair);
  function masonry(geometry,x,y,z,name){
    const m=mesh(worldUV(geometry,1.7),brick,x,y,z,true);m.name=name;stair.attach(m);return m;
  }
  function rail(a,b,r=.025){rod(a,b,r);stair.attach(model.children[model.children.length-1]);}
  function flight(x0,y0,x1,y1,depth){
    const n=12,step=Math.abs(x1-x0)/n;
    for(let i=0;i<n;i++){
      const t=(i+.5)/n,x=x0+(x1-x0)*t,y=y0+(y1-y0)*(i+1)/n;
      masonry(new THREE.BoxGeometry(step+.015,y-.12,1.35),x,(y+.12)/2,depth,'West forward end brick stair tread');
      box(trim,x,y+.025,depth,step+.05,.055,1.4);
      for(const s of [-1,1]){
        box(iron,x,y+.53,depth+s*.7,.03,1.06,.03);
        box(iron,x-step*.25,y+.53,depth+s*.7,.025,1.06,.025);
      }
    }
    for(const s of [-1,1])rail([x0,y0+1.1,depth+s*.7],[x1,y1+1.1,depth+s*.7]);
  }
  flight(-39.35,.2,-45.05,2.24,46.05);
  flight(-45.05,2.24,-39.35,4.28,44.5);
  masonry(new THREE.BoxGeometry(1.45,2.12,2.95),-45.75,1.18,45.28,'West forward end intermediate landing');
  box(trim,-45.75,2.27,45.28,1.5,.08,3.02);
  box(iron,-39,4.25,44.02,2,.14,1.9);
  for(const x of [-39.95,-38.05])rail([x,.2,44.92],[x,5.38,44.92],.05);
  rail([-39.95,5.38,44.92],[-38.05,5.38,44.92]);
  for(let i=1;i<13;i++)box(iron,-39.95+i*1.9/13,4.83,44.92,.025,1.1,.025);
  rail([-38.05,5.38,44.92],[-38.05,5.38,43.14]);
  for(let i=0;i<11;i++)box(iron,-38.05,4.83,43.2+i*.16,.025,1.1,.025);
  for(const edge of [[[-46.45,3.34,43.78],[-46.45,3.34,46.78]],[[-46.45,3.34,46.78],[-45.05,3.34,46.78]]]){
    rail(...edge);
    const a=new THREE.Vector3(...edge[0]),b=new THREE.Vector3(...edge[1]),count=Math.ceil(a.distanceTo(b)/.16);
    for(let i=0;i<=count;i++){const p=a.clone().lerp(b,i/count);box(iron,p.x,p.y-.53,p.z,.025,1.06,.025);}
  }
  box(gravel,-37.5,.22,47.65,19,.1,1.45);
  model.userData.westForwardEndPhotoOpenings=model.userData.eastPhotoOpenings.slice(start);
}
