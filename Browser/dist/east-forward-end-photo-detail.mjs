// redesmere-edge/img1.jpg looks north from the road marked in img1-loc.png.
// The end elevation belongs to 1829; Redesmere is beyond the right-hand lane.
// Proportions and camera placement are visual estimates, not a measured survey.
export const EAST_FORWARD_END_PHOTO_VIEW=Object.freeze({position:[40,1.8,78],target:[40,5.1,26],fov:62});

export function addEastForwardEndPhotoDetails(THREE,{model,box,mesh,worldUV,brick,material,sash,rod,iron}){
  const start=model.userData.eastPhotoOpenings.length;
  const trim=material(0xd2d9d2),archBrick=material(0x80675b);
  const front=43.06,centre=35,width=12;
  // The entire end has exposed brick; white walls belong to the side return
  // and taller recessed buildings. Replace the old five-column window grid.
  for(const x of [30.65,33.55,36.45,39.35])for(const [y,h] of [[2.05,2.7],[6.35,2.95]]){
    sash('east-forward-end',x,y,front,0,1.35,h);
    box(brick,x,y+h/2+.08,front+.12,1.62,.2,.15);
    const a=.83,arch=new THREE.Shape();
    arch.moveTo(-a,0);arch.quadraticCurveTo(0,.17,a,0);
    arch.lineTo(a,.16);arch.quadraticCurveTo(0,.33,-a,.16);arch.closePath();
    mesh(new THREE.ShapeGeometry(arch),archBrick,x,y+h/2+.045,front+.21).name='East forward end segmental window head';
  }
  box(trim,centre,4.15,front+.09,width+.1,.27,.27);
  for(const [y,h,d] of [[8.36,.18,.26],[8.59,.25,.44],[8.8,.12,.58]])box(trim,centre,y,front+.03,width+.3,h,d);
  box(iron,centre,8.91,front+.33,width+.6,.1,.11);
  for(const x of [29.15,40.85])box(iron,x,4.43,front+.21,.07,8.8,.07);
  box(brick,centre,.23,front+.035,width,.26,.17);

  // Open grassy verge, low irregular hedge and a slim young tree. Gravel
  // and plain ironwork retain the established circa-1900 grounds treatment.
  const gravel=material(0x99917b),bark=material(0x655c4c),leaf=material(0x526446);
  box(gravel,centre,.21,44.5,width+.8,.1,1.5);
  for(let i=0;i<58;i++){
    const x=32+i*1.13,z=49+Math.sin(i*2.3)*.24;
    const shrub=mesh(new THREE.IcosahedronGeometry(1,1),leaf,x,.73+Math.sin(i*1.7)*.07,z,true);
    shrub.scale.set(.85,.52,.62);shrub.rotation.y=i*1.9;
  }
  const treeX=59,treeZ=46.3;
  mesh(new THREE.CylinderGeometry(.045,.085,3.8,7),bark,treeX,1.9,treeZ,true).name='East front verge young tree';
  for(let i=0;i<7;i++){
    const angle=i*2.4,y=1.7+i*.25;
    rod([treeX,y,treeZ],[treeX+Math.sin(angle)*(.75+i*.04),y+.9,treeZ+Math.cos(angle)*.7],.018,bark);
  }
  model.userData.eastForwardEndPhotoOpenings=model.userData.eastPhotoOpenings.slice(start);
}
