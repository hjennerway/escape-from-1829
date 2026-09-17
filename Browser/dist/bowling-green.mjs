// Estimated from the user's blue outline beside Hale's western elevation.
// Keep the green inside the two end returns and clear of the next tree at x=80.
export const BOWLING_GREEN=Object.freeze({minX:84,maxX:114.6,minZ:-119,maxZ:-77.4});

export function createBowlingGreen(THREE){
 const group=new THREE.Group();group.name='Hale bowling green';
 const {minX,maxX,minZ,maxZ}=BOWLING_GREEN,w=maxX-minX,d=maxZ-minZ;
 const edge=new THREE.MeshStandardMaterial({color:0x405432,roughness:1});
 const turf=[0x4a6238,0x4e663b].map(color=>new THREE.MeshStandardMaterial({color,roughness:1}));
 function patch(name,x,z,width,depth,y,material){
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),material);
  mesh.name=name;mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);
  mesh.receiveShadow=true;group.add(mesh);
 }
 // Flush grass edging and subdued mowing bands; no raised walking obstacles.
 patch('Bowling green grass edging',(minX+maxX)/2,(minZ+maxZ)/2,w,d,-.12,edge);
 const inset=.35,stripes=10,stripeDepth=(d-inset*2)/stripes;
 for(let i=0;i<stripes;i++)patch('Bowling green mown strip '+(i+1),
  (minX+maxX)/2,minZ+inset+(i+.5)*stripeDepth,w-inset*2,stripeDepth,-.10,turf[i%2]);
 return group;
}
