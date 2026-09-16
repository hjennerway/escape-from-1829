import {addAdminCorridorDetail} from './admin-corridor-detail.mjs';

// The blue route leaves the east/west admin connector at a right angle,
// follows the tower's existing service ranges and meets Farndon's rear wing.
export const FARNDON_CORRIDOR=Object.freeze({x:156.3,startZ:9.8,endZ:-147.5,width:5.4,height:3.6,rise:.64});
export const FARNDON_CORRIDOR_VIEWS=Object.freeze({
 'farndon-corridor':{position:[205,178,142],target:[170,2,-65],fov:49},
 'farndon-corridor-plan':{position:[158,275,-68.99],target:[158,0,-69],fov:48},
 'ward-corridors':{position:[149,196,32],target:[94,0,-147],fov:49},
 'ward-corridors-plan':{position:[78,265,-160.99],target:[78,0,-161],fov:48}
});
export const FARNDON_CORRIDOR_WALK=Object.freeze({position:[166,1.8,-113],target:[157,2,-143],fov:62});
export const WARD_CORRIDOR_WALK=Object.freeze({position:[111,1.8,-188],target:[99,2,-196],fov:62});

export function createCorridorRun(THREE,{name,start,end,width=5.4,height=3.6,rise=.64,detailRanges,brick,roof,material,worldUV}){
 const length=Math.hypot(end[0]-start[0],end[1]-start[1]),route={width,height,rise};
 const branch=new THREE.Group();branch.name=name;
 branch.position.set(start[0],0,start[1]);branch.rotation.y=Math.atan2(start[1]-end[1],end[0]-start[0]);
 branch.userData.centerline=[start,end];branch.userData.width=width;
 const masonry=brick.clone();masonry.color.set(0xc7a391);
 const ridge=material(0x895040);
 function mesh(g,m,x,y,z,name){const o=new THREE.Mesh(g,m);o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;branch.add(o);return o;}
 mesh(worldUV(new THREE.BoxGeometry(length,route.height,route.width),1.7),masonry,length/2,route.height/2,0,name+' walls').userData.orientedCollision=true;
 // Full-length ridge meets the existing corridor ridge at the T junction;
 // the other end slips beneath Farndon's taller roof, with no terminal hip.
 const half=route.width/2+.22,eave=route.height+.06,top=eave+route.rise;
 const vertices=[[0,eave,-half],[length,eave,-half],[0,top,0],[length,top,0],[0,eave,half],[length,eave,half]];
 const positions=[],uv=[];
 for(const face of [[0,2,1],[1,2,3],[2,4,3],[3,4,5]])for(const i of face){const [x,y,z]=vertices[i];positions.push(x,y,z);uv.push(x/2.8,(z+y)/2.8);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
 mesh(g,roof,0,0,0,name+' slate roof');
 mesh(new THREE.BoxGeometry(length,.13,.18),ridge,length/2,top+.04,0,name+' ridge');
 for(const [a,b] of detailRanges??[[0,length]]){
  addAdminCorridorDetail(THREE,{corridor:branch,start:a,end:b,cz:0,depth:route.width,height:route.height,brick,material,worldUV});
 }
 return branch;
}

export function addFarndonCorridor(THREE,{corridor,...materials}){
 const route=FARNDON_CORRIDOR;
 const branch=createCorridorRun(THREE,{...materials,name:'Straight corridor to Farndon',start:[route.x,route.startZ],end:[route.x,route.endZ],
  // Only the exposed runs have windows; the middle passes through tower ranges.
  detailRanges:[[6.6,-16.6],[-74.1,-147.3]].map(([south,north])=>[route.startZ-south,route.startZ-north])});
 branch.userData.route=route;corridor.add(branch);
 branch.userData.footprint={minX:route.x-route.width/2,maxX:route.x+route.width/2,minZ:route.endZ,maxZ:route.startZ};
 corridor.userData.footprints.push(branch.userData.footprint);
 corridor.userData.footprint={...corridor.userData.footprint,minZ:route.endZ};
 return branch;
}
