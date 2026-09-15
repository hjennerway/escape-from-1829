// Freestanding tapered brick chimney in chimney/img1.jpg.
// The chimney stays at the latest red X while the yellow-marked buildings move towards main/admin.
// Position and diameter are marked-photo estimates; height retains the user's exact 1.3 ratio.
import {ESCAPE_WATER_TOWER} from './water-tower.mjs';
export const ESTATE_CHIMNEY=Object.freeze({x:177.5,z:-35.5,height:ESCAPE_WATER_TOWER.height*1.3,baseRadius:2.45,topRadius:1.23});
export function createEstateChimney(THREE,{brick,material}){
  const chimney=new THREE.Group();chimney.name='Freestanding brick chimney';chimney.position.set(ESTATE_CHIMNEY.x,0,ESTATE_CHIMNEY.z);
  const masonry=brick.clone();masonry.color.set(0xc4a18d);
  const soot=brick.clone();soot.color.set(0x655950);
  const inside=material(0x242521,{side:THREE.DoubleSide}),dark=material(0x181c1a);
  const {height,baseRadius,topRadius}=ESTATE_CHIMNEY;
  function cylinder(rt,rb,h,y,mat,name,open=false){
    const g=new THREE.CylinderGeometry(rt,rb,h,48,1,open),uv=g.attributes.uv;
    // Continuous circumferential brick courses, with a seam at the rear.
    for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*Math.PI*(rt+rb)/1.7,uv.getY(i)*h/1.7);
    const o=new THREE.Mesh(g,mat);o.position.y=y;o.name=name;o.castShadow=true;o.receiveShadow=true;
    o.userData.collisionFootprint=Array.from({length:48},(_,i)=>{const a=i*Math.PI/24;return [Math.sin(a)*Math.max(rt,rb),Math.cos(a)*Math.max(rt,rb)];});
    chimney.add(o);return o;
  }
  cylinder(2.75,2.8,.8,.4,masonry,'Chimney brick foundation');
  const shaftTop=height-1.6;
  cylinder(topRadius,baseRadius,shaftTop-.8,(shaftTop+.8)/2,masonry,'Tapered brick chimney shaft',true);
  cylinder(topRadius,topRadius,1.6,height-.8,soot,'Soot-darkened chimney crown',true);
  cylinder(topRadius+.08,topRadius+.08,.22,height-.11,soot,'Chimney rim',true);
  cylinder(topRadius-.24,topRadius-.24,1.4,height-.7,inside,'Dark chimney throat',true);
  const rim=new THREE.Mesh(new THREE.RingGeometry(topRadius-.24,topRadius+.08,48),soot);rim.rotation.x=-Math.PI/2;rim.position.y=height;rim.name='Open masonry chimney lip';chimney.add(rim);
  const opening=new THREE.Mesh(new THREE.CircleGeometry(topRadius-.24,48),dark);opening.rotation.x=-Math.PI/2;opening.position.y=height-1.4;opening.name='Recessed chimney opening';chimney.add(opening);
  chimney.userData.height=height;chimney.userData.reference='Research/tower-buildings/central-hall-footprint-correction.png red X; fixed during the later building slide (15 September 2026); chimney/img1.jpg; 1.3 times the water-tower height';
  return chimney;
}
