import {WILLOWS} from './willows.mjs';
import {KML_WILLOW_TREES} from './kml-tree-data.mjs';
import {matchEstateGrass} from './estate-grass.mjs';

// Scenic context, not surveyed planting: keep all relief outside the mapped
// grounds and the walking boundary, including the outlying Willows building.
export const COUNTRYSIDE_BOUNDS=Object.freeze({minX:-260,maxX:Math.max(680,WILLOWS.x+110,...KML_WILLOW_TREES.map(t=>t.x+110)),minZ:-340,maxZ:Math.max(330,WILLOWS.z+110,...KML_WILLOW_TREES.map(t=>t.z+110))});
export function distanceFromEstate(x,z){
 const b=COUNTRYSIDE_BOUNDS;
 return Math.hypot(Math.max(b.minX-x,0,x-b.maxX),Math.max(b.minZ-z,0,z-b.maxZ));
}
export function countrysideHeight(x,z){
 const fade=Math.min(1,distanceFromEstate(x,z)/280),ease=fade*fade*(3-2*fade);
 return -.15+ease*(16+8*Math.sin(x*.0031+z*.0017)+5*Math.sin(z*.0061-x*.0014)+3*Math.cos(x*.009+z*.003));
}

export function createCountryside(THREE,exterior){
 const group=new THREE.Group();group.name='Distant countryside';group.userData.scenicBackdrop=true;
 const b=COUNTRYSIDE_BOUNDS;
 function perimeter(t,d){
  const width=b.maxX-b.minX+2*d,depth=b.maxZ-b.minZ+2*d,length=2*(width+depth);let p=((t%1)+1)%1*length;
  if(p<width)return [b.minX-d+p,b.minZ-d];p-=width;
  if(p<depth)return [b.maxX+d,b.minZ-d+p];p-=depth;
  if(p<width)return [b.maxX+d-p,b.maxZ+d];p-=width;
  return [b.minX-d,b.maxZ+d-p];
 }
 const rings=[0,25,60,110,180,280,420,620,900,1300,1800,2500,3500,4800,6500],segments=256,positions=[],indices=[];
 for(const distance of rings)for(let i=0;i<segments;i++){
  const [x,z]=perimeter(i/segments,distance);positions.push(x,countrysideHeight(x,z),z);
 }
 for(let ring=0;ring<rings.length-1;ring++)for(let i=0;i<segments;i++){
  const a=ring*segments+i,c=ring*segments+(i+1)%segments,d=a+segments,e=c+segments;
  indices.push(a,c,d,c,e,d);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(positions.length/3*2),2));geometry.setIndex(indices);geometry.computeVertexNormals();
 const groundMaterial=exterior.terrain?.material.clone()??new THREE.MeshStandardMaterial({color:0x667752,roughness:1});
 if(exterior.terrain)matchEstateGrass(groundMaterial,exterior.terrain.material);
 groundMaterial.userData.estateGrass=true;
 const ground=new THREE.Mesh(geometry,groundMaterial);ground.name='Rolling meadows beyond the estate';ground.receiveShadow=false;group.add(ground);

 let seed=182906;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
 const trees=[],hedges=[];
 for(let layer=0;layer<4;layer++){
  const distance=[100,350,780,1400][layer],count=420+layer*90;
  for(let i=0;i<count;i++){
   const t=i/count;if(Math.sin(t*47+layer*2.1)<-.5||random()<.12)continue;
   const d=distance+Math.sin(t*39+layer)*38+(random()-.5)*(75+layer*30);
   const [x,z]=perimeter(t,d);trees.push({x:x+(random()-.5)*18,z:z+(random()-.5)*18,h:12+random()*14,r:5+random()*7,turn:random()*Math.PI*2,tint:random()});
  }
 }
 // Interrupted, gently wandering hedgerows define fields outside the estate.
 for(const distance of [65,235,570]){
  const count=Math.ceil((2*(b.maxX-b.minX+b.maxZ-b.minZ)+8*distance)/15);
  for(let i=0;i<count;i++){
  const t=i/count;if(Math.sin(t*31+distance)<-.25)continue;
  const [x,z]=perimeter(t,distance+Math.sin(t*51)*13),next=perimeter(t+.001,distance+Math.sin((t+.001)*51)*13);
  hedges.push({x,z,h:1.6+random()*1.3,r:9,turn:Math.atan2(next[0]-x,next[1]-z),tint:random()});
  }
 }
 const crownGeometry=new THREE.IcosahedronGeometry(1,1),p=crownGeometry.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),roughness=1+.16*Math.sin(x*17+y*9+z*13);p.setXYZ(i,x*roughness,y*roughness,z*roughness);}
 const foliage=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1});
 const crowns=new THREE.InstancedMesh(crownGeometry,foliage,trees.length+hedges.length),trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.18,.45,1,5),new THREE.MeshStandardMaterial({color:0x4b4b3c,roughness:1}),trees.length);
 crowns.name='Distant tree belts and field hedges';trunks.name='Distant tree trunks';
 const dummy=new THREE.Object3D(),color=new THREE.Color();
 for(const [i,t] of [...trees,...hedges].entries()){
  const hedge=i>=trees.length,base=countrysideHeight(t.x,t.z)-.6;
  dummy.position.set(t.x,base+t.h*(hedge?.45:.65),t.z);dummy.rotation.set(0,t.turn,0);dummy.scale.set(hedge?2.3:t.r,t.h*(hedge?.65:.43),hedge?t.r:t.r*.85);dummy.updateMatrix();crowns.setMatrixAt(i,dummy.matrix);
  color.setHSL(.23+t.tint*.055,.19+t.tint*.12,.16+t.tint*.075);crowns.setColorAt(i,color);
  if(!hedge){dummy.position.y=base+t.h*.25;dummy.scale.set(1,t.h*.5,1);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);}
 }
 crowns.computeBoundingSphere();trunks.computeBoundingSphere();group.add(crowns,trunks);exterior.scene.add(group);
 return {group,ground,trees,hedges,bounds:b};
}
