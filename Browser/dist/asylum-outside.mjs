import {exteriorObstacles,createObstacleIndex,obstacleContains} from './explore-controls.mjs';
// Sample the existing rendered treads/decks; no duplicate outside stair model.
export function createAsylumOutside(THREE,exterior){
 let obstacles,indices,supports,walkSurfaces;
 function refresh(){
  // Aerial batching retains its hidden originals for inspection. Use those
  // sources for collision/support, then restore the exact render visibility.
  const visibility=[];
  exterior.model.traverse(o=>{if(o.userData.aerialBatch||o.userData.aerialBatchSource){visibility.push([o,o.visible]);o.visible=!!o.userData.aerialBatchSource;}});
  try{
  obstacles=exteriorObstacles(THREE,exterior.model);
  walkSurfaces=obstacles.walkSurfaces;supports=new Map();
  // The masonry return stair's solid bases are walkable treads, not walls.
  const masonry=exterior.model.getObjectByName('West forward end masonry return stair');
  const boxes=[];
  masonry?.traverse(o=>{if(o.isMesh){const b=new THREE.Box3().setFromObject(o);boxes.push(b);}});
  obstacles=obstacles.filter(b=>!boxes.some(c=>Math.abs(c.min.x-b.minX)<.02&&Math.abs(c.max.x-b.maxX)<.02&&Math.abs(c.min.z-b.minZ)<.02&&Math.abs(c.max.z-b.maxZ)<.02));
  const heights=new Map(),key=b=>[b.min.x,b.max.x,b.min.z,b.max.z].map(n=>n.toFixed(3)).join(','),matrix=new THREE.Matrix4(),world=new THREE.Matrix4();
  function remember(geometry,transform){
   if(!geometry.boundingBox)geometry.computeBoundingBox();const local=geometry.boundingBox,b=local.clone().applyMatrix4(transform);heights.set(key(b),{minY:b.min.y,maxY:b.max.y});
   if(geometry.type!=='BoxGeometry'||b.max.y>9.1||b.max.x<-85||b.min.x>85||b.max.z<-48||b.min.z>74||b.max.y-b.min.y>.35||b.max.x-b.min.x<.18||b.max.z-b.min.z<.18)return;
   const corners=[[local.min.x,local.min.z],[local.max.x,local.min.z],[local.max.x,local.max.z],[local.min.x,local.max.z]].map(([x,z])=>{const p=new THREE.Vector3(x,local.max.y,z).applyMatrix4(transform);return [p.x,p.z];});
   const surface={corners,height:b.max.y,minX:b.min.x,maxX:b.max.x,minZ:b.min.z,maxZ:b.max.z};
   for(let x=Math.floor(Math.max(-85,b.min.x)/6);x<=Math.floor(Math.min(85,b.max.x)/6);x++)for(let z=Math.floor(Math.max(-48,b.min.z)/6);z<=Math.floor(Math.min(74,b.max.z)/6);z++){const k=x+','+z;if(!supports.has(k))supports.set(k,[]);supports.get(k).push(surface);}
  }
  exterior.model.traverseVisible(o=>{if(!o.isMesh||o.userData.noWalkingCollision)return;if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);world.multiplyMatrices(o.matrixWorld,matrix);remember(o.geometry,world);}}else remember(o.geometry,o.matrixWorld);});
  for(const b of obstacles)Object.assign(b,heights.get([b.minX,b.maxX,b.minZ,b.maxZ].map(n=>n.toFixed(3)).join(','))??{minY:-Infinity,maxY:Infinity});
  indices=new Map();
  }finally{for(const [o,visible] of visibility)o.visible=visible;}
 }
 refresh();
 function indexAt(height){const bucket=Math.round(height*4)/4;if(!indices.has(bucket))indices.set(bucket,createObstacleIndex(obstacles.filter(b=>b.maxY>bucket+.35&&b.minY<bucket+1.5),12,.27));return indices.get(bucket);}
 function heightAt(x,z,height,trend=0){
  const surface=walkSurfaces.find(s=>obstacleContains(s,x,z,1e-7));
  if(surface)return surface.height;
  const nearby=supports.get(Math.floor(x/6)+','+Math.floor(z/6))??[];
  let candidates=nearby.filter(s=>s.height<=height+.48&&s.height>=height-2.1&&obstacleContains(s,x,z,1e-7));
  // Two photographed rear flights share a half-landing and overlap in plan.
  // Carry the approach's descent through the return onto the lower flight.
  const rearReturn=Math.abs(Math.abs(x)-21.9)<.75&&z>-30.8&&z<-24.8&&height>2.5;
  if(trend<0&&rearReturn){const down=candidates.filter(s=>s.height<=height+.025&&s.height>=height-.5);if(down.length)candidates=down;}
  if(trend>0&&rearReturn){const up=candidates.filter(s=>s.height>=height-.025);if(up.length)candidates=up;}
  const hit=candidates.sort(rearReturn&&trend>0?(a,b)=>Math.abs(a.height-height)-Math.abs(b.height-height):(a,b)=>b.height-a.height)[0];
  if(hit)return hit.height;
  return 0;
 }
 function update(actor,dx,dz,dt){
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.08));
  for(let i=0;i<steps;i++)for(const [mx,mz] of [[dx/steps,0],[0,dz/steps]]){
   if(!mx&&!mz)continue;
   const x=actor.x+mx,z=actor.z+mz;if(indexAt(actor.y).contains(x,z))continue;
   const y=heightAt(x,z,actor.y,actor.verticalTrend??0),prior=actor.y;
   if(y>actor.y+.48)continue;
   actor.x=x;actor.z=z;actor.y=y<actor.y-.5?Math.max(y,actor.y-5*dt/steps):y;
   if(Math.abs(actor.y-prior)>.05)actor.verticalTrend=Math.sign(actor.y-prior);
  }
 }
 return {refresh,heightAt,update,clear:(x,z,y=0)=>!indexAt(y).contains(x,z)};
}
