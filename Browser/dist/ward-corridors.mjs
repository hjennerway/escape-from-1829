import {createCorridorRun,FARNDON_CORRIDOR} from './farndon-corridor.mjs';

// Red reference: diagonal spine with three short, axis-aligned ward branches.
// Centre the diagonal between the registered OS corridor edges; its 45-degree
// direction is the exception to the surrounding square building footprints.
export const WARD_CORRIDOR_NODES=Object.freeze({
 farndon:[FARNDON_CORRIDOR.x,-117.1],elbow:[75.1,-198.3],
 upton:[38.15764920096168,-198.3],grafton:[78.82,-152.2],
 graftonJunction:[121.2,-152.2],witby:[100.3,-198.5],witbyJunction:[100.3,-173.1]
});
const n=WARD_CORRIDOR_NODES;
export const WARD_CORRIDOR_RUNS=Object.freeze([
 {name:'Diagonal ward corridor',start:n.farndon,end:n.elbow},
 {name:'Upton Frith Oscroft corridor',start:n.elbow,end:n.upton},
 {name:'Grafton corridor',start:n.graftonJunction,end:n.grafton},
 {name:'Witby corridor',start:n.witbyJunction,end:n.witby}
]);

export function addWardCorridors(THREE,{corridor,...materials}){
 const group=new THREE.Group();group.name='Grafton Witby and Upton connecting corridors';corridor.add(group);
 group.userData.reference='Research/admin-corridor/ward-routes-reference.png';
 group.userData.runs=WARD_CORRIDOR_RUNS;
 // These old OS edges described the superseded elbow beside Upton/Witby.
 corridor.userData.replacedOSEdges={sourceBuilding:0,sourceLoop:0,indices:[128,129,130]};
 for(const run of WARD_CORRIDOR_RUNS){
  group.add(createCorridorRun(THREE,{...materials,...run}));
  const dx=run.end[0]-run.start[0],dz=run.end[1]-run.start[1],length=Math.hypot(dx,dz),half=FARNDON_CORRIDOR.width/2;
  const corners=[[-1,run.start],[1,run.start],[1,run.end],[-1,run.end]].map(([side,p])=>[p[0]-side*dz/length*half,p[1]+side*dx/length*half]);
  const footprint={minX:Math.min(...corners.map(p=>p[0])),maxX:Math.max(...corners.map(p=>p[0])),minZ:Math.min(...corners.map(p=>p[1])),maxZ:Math.max(...corners.map(p=>p[1])),corners};
  corridor.userData.footprints.push(footprint);
  for(const key of ['minX','minZ'])corridor.userData.footprint[key]=Math.min(corridor.userData.footprint[key],footprint[key]);
  for(const key of ['maxX','maxZ'])corridor.userData.footprint[key]=Math.max(corridor.userData.footprint[key],footprint[key]);
 }
 // Close the small outside corner at the diagonal-to-Upton elbow with a
 // bevelled wall and slate slopes meeting the shared ridge point.
 const w=FARNDON_CORRIDOR.width/2,overhang=.22,y=FARNDON_CORRIDOR.height;
 const offsets=[[-w,0],[0,-w],[w/Math.SQRT2,-w/Math.SQRT2],[w,0],[0,w],[-w/Math.SQRT2,w/Math.SQRT2]];
 const shape=new THREE.Shape(offsets.map(([x,z])=>new THREE.Vector2(x,-z)));
 const wallGeometry=new THREE.ExtrudeGeometry(shape,{depth:y,bevelEnabled:false});wallGeometry.rotateX(-Math.PI/2);
 const brick=materials.brick.clone();brick.color.set(0xc7a391);
 const wall=new THREE.Mesh(materials.worldUV(wallGeometry,1.7),brick);wall.name='Ward corridor elbow walls';
 wall.position.set(n.elbow[0],0,n.elbow[1]);wall.userData.collisionFootprint=offsets;wall.castShadow=true;wall.receiveShadow=true;group.add(wall);
 const positions=[],uv=[],top=y+.06+FARNDON_CORRIDOR.rise;
 for(let i=0;i<offsets.length;i++){
  const a=offsets[i].map(v=>v*(w+overhang)/w),b=offsets[(i+1)%offsets.length].map(v=>v*(w+overhang)/w);
  const points=[[0,top,0],[a[0],y+.06,a[1]],[b[0],y+.06,b[1]]];
  const normal=new THREE.Vector3().crossVectors(new THREE.Vector3(...points[1]).sub(new THREE.Vector3(...points[0])),new THREE.Vector3(...points[2]).sub(new THREE.Vector3(...points[0])));
  if(normal.y<0)points.reverse();
  for(const p of points){positions.push(...p);uv.push(p[0]/2.8,(p[2]+p[1])/2.8);}
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();
 const roof=new THREE.Mesh(geometry,materials.roof);roof.name='Ward corridor elbow slate roof';roof.position.copy(wall.position);roof.castShadow=true;roof.receiveShadow=true;group.add(roof);
 return group;
}
