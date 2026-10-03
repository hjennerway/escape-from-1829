// Furniture footprints are shared by placement, walking, navigation and sight.
export function furnitureContains(item,x,z,radius=0){
 const c=Math.cos(item.rotation),s=Math.sin(item.rotation),dx=x-item.x,dz=z-item.z;
 const u=c*dx-s*dz,v=s*dx+c*dz;
 const a=Math.max(0,Math.abs(u)-item.width/2),b=Math.max(0,Math.abs(v)-item.depth/2);
 return a*a+b*b<=radius*radius;
}
export function furnitureNear(floor,x,z){return floor.furnitureIndex?.get(Math.floor(x/4)+','+Math.floor(z/4))??floor.furnitureObstacles??[];}
export function furnitureBlocks(floor,x,z,radius){return furnitureNear(floor,x,z).some(item=>furnitureContains(item,x,z,radius));}
export function indexFurniture(floor){
 floor.furnitureIndex=new Map();
 for(const item of floor.furnitureObstacles){
  const extent=Math.hypot(item.width,item.depth)/2+.8;
  for(let x=Math.floor((item.x-extent)/4);x<=Math.floor((item.x+extent)/4);x++)for(let z=Math.floor((item.z-extent)/4);z<=Math.floor((item.z+extent)/4);z++){
   const key=x+','+z;if(!floor.furnitureIndex.has(key))floor.furnitureIndex.set(key,[]);floor.furnitureIndex.get(key).push(item);
  }
 }
}
export function furnitureOccludes(floor,a,b){
 const ay=(a.y??floor.elevation)+1.5,by=(b.y??floor.elevation)+1.5;
 return (floor.furnitureObstacles??[]).some(item=>{
  const c=Math.cos(item.rotation),s=Math.sin(item.rotation),dx=a.x-item.x,dz=a.z-item.z;
  const origin=[c*dx-s*dz,ay-floor.elevation,s*dx+c*dz];
  const vx=b.x-a.x,vz=b.z-a.z,direction=[c*vx-s*vz,by-ay,s*vx+c*vz];
  const lo=[-item.width/2,item.y,-item.depth/2],hi=[item.width/2,item.y+item.height,item.depth/2];
  let enter=0,leave=1;
  for(let axis=0;axis<3;axis++){
   if(Math.abs(direction[axis])<1e-8){if(origin[axis]<lo[axis]||origin[axis]>hi[axis])return false;continue;}
   const p=(lo[axis]-origin[axis])/direction[axis],q=(hi[axis]-origin[axis])/direction[axis];
   enter=Math.max(enter,Math.min(p,q));leave=Math.min(leave,Math.max(p,q));if(enter>leave)return false;
  }
  return leave>0&&enter<1;
 });
}
