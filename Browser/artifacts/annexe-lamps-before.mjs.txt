import {createConcreteLampTemplate} from './surviving-lamp-posts.mjs';
import {exteriorObstacles,obstacleContains} from './explore-controls.mjs';
import {REAR_LAMP_ROUTES} from './street-lamp-paths.mjs';

export const STREET_LAMP_SPACING=30;
export const LAMP_HEAD=[2.5,5.52,0];
export function visibleInScene(object){for(;object;object=object.parent)if(!object.visible)return false;return true;}
function segmentDistance(x,z,a,b){
 const dx=b[0]-a[0],dz=b[1]-a[1],length=dx*dx+dz*dz;
 const t=length?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/length)):0;
 return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);
}
export function sampleLampPath(points,spacing=STREET_LAMP_SPACING){
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
 const total=lengths.reduce((a,b)=>a+b,0),count=Math.max(1,Math.floor(total/spacing));
 if(total<10)return [];
 const samples=[];
 for(let n=0;n<count;n++){
  let distance=total*(n+.5)/count,index=0;
  while(index<lengths.length-1&&distance>lengths[index])distance-=lengths[index++];
  const a=points[index],b=points[index+1],length=lengths[index];if(length<1e-6)continue;
  samples.push({x:a[0]+(b[0]-a[0])*distance/length,z:a[1]+(b[1]-a[1])*distance/length,nx:-(b[1]-a[1])/length,nz:(b[0]-a[0])/length});
 }
 return samples;
}

// Build before batching/serialization. Each set stays beneath its actual road
// (including independently dated tails), so there is no second visibility map.
export function addRoadsideLampPosts(THREE,exterior,layouts){
 if(exterior.model.userData.streetLampsPrepared)return;
 const routes=[];
 layouts.roads.traverse(owner=>{if(owner.userData.lampPath)routes.push({owner,points:owner.userData.lampPath,width:owner.userData.width});});
 layouts.historicRoads.traverse(owner=>{if(owner.userData.centerline&&!/border|kerb/i.test(owner.name))routes.push({owner,points:owner.userData.centerline,width:owner.userData.width});});
 const rearOwner=layouts.historicRoads.children.find(o=>o.userData.estateSection==='Annexe');
 REAR_LAMP_ROUTES.forEach((points,i)=>{
  const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z)),false,'catmullrom',.5);
  routes.push({owner:rearOwner,points:curve.getPoints((points.length-1)*16).map(p=>[p.x,p.z]),width:6,name:'Annexe rear road '+(i+1)});
 });
 for(const owner of [layouts.entrance,layouts.countessRoundabout]){
  const outline=owner.userData.outline,area=outline.reduce((sum,a,i)=>{const b=outline[(i+1)%outline.length];return sum+a[0]*b[1]-b[0]*a[1];},0);
  routes.push({owner,points:[...outline,outline[0]],width:0,boundary:true,spacing:12,side:area>0?-1:1});
 }
 const obstacles=exteriorObstacles(THREE,exterior.model),occupied=[];
 exterior.model.traverse(o=>{if(o.userData.lampPost)occupied.push([o.position.x,o.position.z]);});
 const template=createConcreteLampTemplate(THREE),parts=[];
 template.updateMatrixWorld(true);
 template.traverse(o=>{if(o.isMesh)parts.push({name:o.name,geometry:o.geometry.clone().applyMatrix4(o.matrixWorld),material:o.material});});
 const matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion(),axis=new THREE.Vector3(0,1,0),scale=new THREE.Vector3(1,1,1);
 for(const route of routes){
  const fixtures=[];
  for(const [index,p] of sampleLampPath(route.points,route.spacing).entries()){
   // Try either verge when a building, tree trunk or crossing occupies one side.
   for(const side of (route.boundary?[route.side]:(index%2?[-1,1]:[1,-1]))){
    const offset=route.width/2+.95,x=p.x+p.nx*offset*side,z=p.z+p.nz*offset*side;
    if(occupied.some(q=>Math.hypot(x-q[0],z-q[1])<12)||obstacles.some(b=>obstacleContains(b,x,z,.75)))continue;
    if(routes.some(other=>other!==route&&!other.boundary&&other.points.slice(1).some((b,i)=>segmentDistance(x,z,other.points[i],b)<other.width/2+.65)))continue;
    fixtures.push({x,z,angle:-Math.atan2(-p.nz*side,-p.nx*side)});occupied.push([x,z]);break;
   }
  }
  if(!fixtures.length)continue;
  const group=new THREE.Group();group.name='Street lamps · '+(route.name??route.owner.name);
  group.userData.streetLamps=fixtures;route.owner.add(group);
  for(const part of parts){
   const mesh=new THREE.InstancedMesh(part.geometry,part.material,fixtures.length);mesh.name=part.name;
   mesh.castShadow=true;mesh.receiveShadow=true;
   if(part.name.startsWith('Pebbledash'))mesh.userData.collisionFootprint=[[-.17,-.17],[.17,-.17],[.17,.17],[-.17,.17]];
   fixtures.forEach((p,i)=>{rotation.setFromAxisAngle(axis,p.angle);matrix.compose(new THREE.Vector3(p.x,-.15,p.z),rotation,scale);mesh.setMatrixAt(i,matrix);});
   mesh.instanceMatrix.needsUpdate=true;group.add(mesh);
  }
 }
 exterior.model.userData.streetLampsPrepared=true;
}
