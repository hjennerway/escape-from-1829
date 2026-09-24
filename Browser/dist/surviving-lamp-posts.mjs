import {LAMP_POSTS} from './kml-11-data.mjs';

// Shared low-poly concrete column based on the user's September 24 photograph.
// Hidden base, overall height and arm bearing are estimates; KML fixes positions.
export function addSurvivingLampPosts(THREE,model){
 const template=new THREE.Group();
 const size=64,pixels=new Uint8Array(size*size*4);let seed=1915;
 for(let i=0;i<size*size;i++){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const grain=seed/2**32,value=grain<.12?87:grain>.86?163:122+Math.floor(grain*22);
  pixels.set([value,value-3,value-7,255],i*4);
 }
 const texture=new THREE.DataTexture(pixels,size,size);texture.colorSpace=THREE.SRGBColorSpace;
 texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.generateMipmaps=true;
 texture.minFilter=THREE.LinearMipmapLinearFilter;texture.needsUpdate=true;
 const concrete=new THREE.MeshStandardMaterial({color:0xb4b0a7,map:texture,roughness:1});
 const casing=new THREE.MeshStandardMaterial({color:0x737675,roughness:.88});
 const diffuser=new THREE.MeshStandardMaterial({color:0xbabdb5,roughness:.7});
 // Four-sided tapered concrete shaft becomes a swept swan-neck at the top.
 // Rings follow the bend, avoiding overlapping segment joints.
 const path=[[0,0,.17],[0,3.5,.13],[.12,4.55,.12],[.34,5.2,.115],[.66,5.63,.105],[1.08,5.88,.095],[1.52,5.97,.085],[1.97,5.92,.075],[2.28,5.8,.07]];
 const vertices=[],uv=[],indices=[];
 for(let i=0;i<path.length;i++){
  const [x,y,r]=path[i],a=path[Math.max(0,i-1)],b=path[Math.min(path.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
  for(const [side,z] of [[-1,-1],[1,-1],[1,1],[-1,1]]){
   vertices.push(x+side*r*dy/length,y-side*r*dx/length,z*r);
   uv.push(z===side?0:.7,y*2+x);
  }
  if(i)for(let j=0;j<4;j++){const a=(i-1)*4+j,b=(i-1)*4+(j+1)%4,c=i*4+(j+1)%4,d=i*4+j;indices.push(a,b,d,b,c,d);}
 }
 indices.push(0,2,1,0,3,2);const end=(path.length-1)*4;indices.push(end,end+1,end+2,end,end+2,end+3);
 for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
 const column=new THREE.Mesh(geometry,concrete);column.name='Pebbledash concrete column and curved arm';column.castShadow=true;column.receiveShadow=true;template.add(column);
 const head=new THREE.Group();head.position.set(2.48,5.76,0);head.rotation.z=-.23;template.add(head);
 function part(name,geometry,material,y){const mesh=new THREE.Mesh(geometry,material);mesh.name=name;mesh.position.y=y;mesh.castShadow=true;mesh.receiveShadow=true;head.add(mesh);}
 part('Slim rectangular lamp housing',new THREE.BoxGeometry(.95,.17,.28),casing,0);
 part('Recessed lamp underside',new THREE.BoxGeometry(.77,.035,.21),diffuser,-.085);
 for(const spec of LAMP_POSTS){
  const lamp=template.clone(true);lamp.name=spec.name;lamp.position.set(spec.x,-.15,spec.z);
  lamp.userData={lampPost:{...spec},estateSection:'Surviving lamp posts'};model.add(lamp);
 }
}
