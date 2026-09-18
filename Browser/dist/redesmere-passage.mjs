// 20260912_172245.jpg and 20260913_171133.jpg, located by bridge-loc.png.
// Separate 1829 / Redesmere rooflines with a narrow masonry head across the
// open lane. Dimensions are visual estimates, in the estate's scene units.
export const REDESMERE_PASSAGE_VIEW=Object.freeze({position:[80,1.8,47],target:[80,5.8,17],fov:70});
export function addRedesmerePassage(THREE,{model,mesh:makeMesh,worldUV,white,brick,material}){
  // Keep the connecting head, trim and jambs together across the ward boundary.
  const passage=new THREE.Group();passage.name='1829 Redesmere passage head';model.add(passage);
  const mesh=(...args)=>{const part=makeMesh(...args);passage.add(part);return part;};
  const boxes=[];
  const box=(mat,x,y,z,w,h,d)=>boxes.push({x,y,z,w,h,d});
  const left=69.75,right=79.55,x=(left+right)/2,width=right-left,z=8.5;
  const underside=4,top=6,depth=1.3;
  const coping=material(0x696761);
  mesh(worldUV(new THREE.BoxGeometry(width,top-underside,depth),1.7),brick,x,(top+underside)/2,z,true).name='1829 Redesmere brick lintel';
  // Whitewashed face, broad lower head and a dentilled cornice beneath the
  // exposed brick parapet, as seen from both ends of the passage.
  for(const side of [-1,1]){
    const face=z+side*(depth/2+.035);
    box(white,x,4.7,face,width,1.4,.07);
    box(white,x,4.13,face+side*.06,width,.26,.2);
    box(white,x,5.36,face+side*.08,width+.08,.18,.24);
    for(let px=left+.25;px<right;px+=.42)box(white,px,5.17,face+side*.1,.19,.2,.24);
  }
  mesh(new THREE.BoxGeometry(width+.15,.12,depth+.15),coping,x,top+.06,z,true).name='1829 Redesmere lintel coping';
  // Narrow masonry jambs bear on the two buildings, leaving the lane clear.
  for(const px of [left+.16,right-.16])box(white,px,underside/2,z,.32,underside,depth);
  const trim=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),white,boxes.length),transform=new THREE.Object3D();
  trim.name='1829 Redesmere passage trim and jambs';trim.receiveShadow=true;
  boxes.forEach(({x,y,z,w,h,d},i)=>{transform.position.set(x,y,z);transform.scale.set(w,h,d);transform.updateMatrix();trim.setMatrixAt(i,transform.matrix);});
  passage.add(trim);
}

// The front of the end range is blank brick all the way down to the ground.
// Two low slate hips sit in front of the retained taller Redesmere building.
export function addRedesmereEndRange(THREE,{box,mesh,worldUV,brick,material,hipRoof}){
  const left=79.55,right=99.8,back=10,front=22,eaves=4.55;
  const width=right-left,depth=front-back,x=(left+right)/2,z=(back+front)/2;
  mesh(worldUV(new THREE.BoxGeometry(width,eaves,depth),1.7),brick,x,eaves/2,z,true).name='Redesmere windowless brick end range';
  const cornice=material(0xa6a18e),gutter=material(0x414645);
  box(cornice,x,eaves-.08,z,width+.18,.16,depth+.18);
  for(const [a,b] of [[left,89.05],[89.05,right]]){
    hipRoof((a+b)/2,z,b-a,depth,eaves+.12,1.95).name='Redesmere low end slate roof';
  }
  box(gutter,x,eaves+.03,front+.27,width+.55,.18,.22);
  // Short central brick parapet belongs to the taller building behind.
  mesh(worldUV(new THREE.BoxGeometry(4.8,1.4,.35),1.7),brick,87.4,9.4,10.08,true).name='Redesmere rear stepped parapet';
}
