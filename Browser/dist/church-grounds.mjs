import {ESCAPE_CHAPEL} from './chapel.mjs';

// Fit the four approaches and rounded churchyard in Research/church/googleearth.png
// to the existing church and saved Parsons Lane edges. Coordinates are church-local.
export const CHURCH_VIEWS=Object.freeze({
 church:{position:[-43,112,-142],target:[-5,0,-123],fov:38},
 'church-plan':{position:[-5,108,-123.01],target:[-5,0,-123],fov:43},
 'church-ground':{position:[-23,1.8,-130],target:[-10,4,-116],fov:58},
 'church-front':{position:[-4.9,7,-70],target:[-4.9,10,-105.2],fov:40}
});

function curve(start,segments,steps=20){
 const points=[start];let a=start;
 for(const [b,c,d] of segments){
  for(let i=1;i<=steps;i++){const t=i/steps,q=1-t;points.push([0,1].map(k=>q*q*q*a[k]+3*q*q*t*b[k]+3*q*t*t*c[k]+t*t*t*d[k]));}
  a=d;
 }
 return points;
}

// An open horseshoe: the clock end meets the existing lane, while the far end
// sweeps well clear of the vestry. The side walks divide the inner lawn into bays.
export const CHURCH_PERIMETER=curve([12.4,15.8],[
 [[14.2,15.4],[14.8,13.2],[14.8,10]],
 [[14.8,3],[14.8,-6],[14.5,-11.5]],
 [[14.2,-19.8],[8.7,-27.3],[1,-28]],
 [[-6.7,-28.7],[-13.5,-23],[-14.7,-16]],
 [[-15.2,-10],[-15,-1],[-14.8,6]],
 [[-14.7,11],[-14.8,14],[-11.7,15]]
]);
export const CHURCH_APPROACHES=Object.freeze([
 {name:'Church garden rear approach',points:[[5.15,-11.5],[14.5,-11.5]],width:1.7},
 {name:'Church garden front approach',points:[[5.15,6],[14.8,6]],width:1.7},
 {name:'Church lane rear approach',points:[[-5.15,-11.5],[-14.94,-11.5]],width:1.7},
 {name:'Church porch approach',points:[[-9.3,5.5],[-14.8,5.5]],width:2.1}
]);
export const CHURCH_LANE_LINKS=Object.freeze([
 {name:'Church front lane link',points:curve([-14.8,6],[[[-15.1,9],[-17.2,10],[-18.97,10.5]]]),width:1.8},
 {name:'Church rear lane link',points:curve([-14.7,-16],[[[-16.3,-16.3],[-17.1,-18],[-15.98,-21]]]),width:1.8}
]);

export function createChurchGrounds(THREE){
 const grounds=new THREE.Group();grounds.name='Church grounds · curved lawns and four approaches';
 grounds.position.set(ESCAPE_CHAPEL.x,0,ESCAPE_CHAPEL.z);grounds.rotation.y=ESCAPE_CHAPEL.rotation;
 grounds.userData.reference='Research/church/googleearth.png';
 // Fine weathered paving contrasts with the darker carriageway. Open grass
 // areas use the terrain itself, keeping their colour and texture continuous.
 const paving=new THREE.MeshStandardMaterial({color:0x777b79,roughness:1});
 const edging=new THREE.MeshStandardMaterial({color:0x96998f,roughness:1});
 for(const [mat,layer] of [[edging,1],[paving,2]]){
  mat.polygonOffset=true;mat.polygonOffsetFactor=-layer;mat.polygonOffsetUnits=-2*layer;
 }
 const size=64,data=new Uint8Array(size*size*4);let seed=1829;
 for(let i=0;i<size*size;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=222+seed%29;data.set([v,v,v,255],i*4);}
 const texture=new THREE.DataTexture(data,size,size);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.needsUpdate=true;paving.map=texture;
 function ribbon(name,points,width,mat,y){
  const positions=[],indices=[],uvs=[];
  // Averaged segment normals make one continuous strip, with no overlapping
  // coplanar triangles or chains of circular patches around the curves.
  for(let i=0;i<points.length;i++){
   const a=points[Math.max(0,i-1)],b=points[i],c=points[Math.min(points.length-1,i+1)];
   const dx=c[0]-a[0],dz=c[1]-a[1],length=Math.hypot(dx,dz);
   const ox=-dz/length*width/2,oz=dx/length*width/2;
   for(const side of [-1,1]){const x=b[0]+side*ox,z=b[1]+side*oz;positions.push(x,y,z);uvs.push(x/2,z/2);}
   if(i){const n=2*i;indices.push(n-2,n-1,n,n-1,n+1,n);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();
  const mesh=new THREE.Mesh(geometry,mat);mesh.name=name;mesh.receiveShadow=true;grounds.add(mesh);return mesh;
 }
 const paths=[{name:'Church curved perimeter walk',points:CHURCH_PERIMETER,width:2},...CHURCH_APPROACHES,...CHURCH_LANE_LINKS];
 // All edge strips precede the paving, so a crossing never shows a kerb through it.
 for(const path of paths)ribbon(path.name+' edging',path.points,path.width+.18,edging,.16);
 for(const path of paths){const mesh=ribbon(path.name,path.points,path.width,paving,.175);mesh.userData={surface:'footpath',centerline:path.points,width:path.width};}
 return grounds;
}
