import {addFoliageLevels,placeTreeCopies} from './tree-templates.mjs';
import {KML_WILLOW_TREES} from './kml-tree-data.mjs';

// Seeded willow template using the shared generator's GPU copies and foliage LOD.
export function addWillowTrees(THREE,trees){
 const group=new THREE.Group();group.name=KML_WILLOW_TREES[0].name;group.position.y=-.15;
 const bark=new THREE.MeshStandardMaterial({color:0x655c49,roughness:1});
 const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),stems=[],sprays=[];
 let seed=182911;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
 function branch(a,b,r){const start=new THREE.Vector3(...a),delta=new THREE.Vector3(...b).sub(start);dummy.position.copy(start).addScaledVector(delta,.5);dummy.quaternion.setFromUnitVectors(up,delta.clone().normalize());dummy.scale.set(r,delta.length(),r);dummy.updateMatrix();stems.push(dummy.matrix.clone());}
 branch([0,0,0],[.25,5,0],.8);branch([.25,4.8,0],[-.3,10,0],.48);
 for(let n=0;n<18;n++){
  const a=n*2.39996,reach=3.5+random()*3,top=11+random()*3;
  const elbow=[Math.cos(a)*reach*.65,top-1.5,Math.sin(a)*reach*.65];
  branch([0,4+n%3,0],elbow,.23);branch(elbow,[Math.cos(a)*reach,top,Math.sin(a)*reach],.11);
  for(let j=0;j<10;j++){
   const angle=a+(random()-.5)*.7,r=reach*(.7+random()*.35),y=top+random();
   const length=5+random()*5;
   const end=[Math.cos(angle)*(r+.8),Math.max(2,y-length),Math.sin(angle)*(r+.8)];
   branch([Math.cos(angle)*r,y,Math.sin(angle)*r],end,.018);
   for(let k=0;k<20;k++){
    const t=k/20;
    sprays.push([Math.cos(angle)*(r+t*.8)+(random()-.5)*.5,y+(end[1]-y)*t,Math.sin(angle)*(r+t*.8)+(random()-.5)*.5,angle+random(),.65+random()*.3]);
   }
  }
 }
 const limbs=new THREE.InstancedMesh(new THREE.CylinderGeometry(.65,1,1,6),bark,stems.length);limbs.name=group.name+' trunk and drooping branches';stems.forEach((m,i)=>limbs.setMatrixAt(i,m));limbs.castShadow=true;limbs.receiveShadow=true;group.add(limbs);
 // Narrow lance-shaped leaves on a hanging spray, baked once for all copies.
 const size=128,pixels=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/(size-1)*2-1,v=y/(size-1)*2-1;
  let leaf=Math.abs(u)<.012;
  for(let n=0;n<6;n++)for(const side of [-1,1]){const dy=v-(-.75+n*.29),dx=u-side*(.12+dy*.35);if(Math.abs(dy)<.22&&Math.abs(dx)<.055*(1-Math.abs(dy)/.22))leaf=true;}
  if(leaf){const i=(y*size+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=210+Math.floor(35*(1-Math.abs(u)));pixels[i+3]=255;}
 }
 const texture=new THREE.DataTexture(pixels,size,size);texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.needsUpdate=true;
 const material=new THREE.MeshStandardMaterial({color:0x81914f,map:texture,alphaTest:.35,roughness:1,side:THREE.DoubleSide});
 const crown=new THREE.InstancedMesh(new THREE.PlaneGeometry(1.3,2),material,sprays.length);crown.name=group.name+' hanging leaf sprays';
 sprays.forEach(([x,y,z,yaw,s],i)=>{dummy.position.set(x,y,z);dummy.rotation.set(.1,yaw,.12*Math.sin(i));dummy.scale.setScalar(s);dummy.updateMatrix();crown.setMatrixAt(i,dummy.matrix);});
 crown.castShadow=true;crown.receiveShadow=true;addFoliageLevels(THREE,group,crown);
 placeTreeCopies(THREE,trees,group,KML_WILLOW_TREES,'willowTree');
}
