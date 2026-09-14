// 20260912_172245.jpg and 20260913_171133.jpg, located by bridge-loc.png.
// Separate 1829 / Redesmere rooflines with a narrow masonry head across the
// open lane. Dimensions are visual estimates, in the estate's scene units.
export const REDESMERE_PASSAGE_VIEW=Object.freeze({position:[76,1.8,46],target:[76,6.1,18.5],fov:58});
export function addRedesmerePassage(THREE,{box,mesh,worldUV,white,brick,material}){
  const left=69.75,right=79.55,x=(left+right)/2,width=right-left,z=19;
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
}
