import {exteriorObstacles,createObstacleIndex,obstacleContains} from './explore-controls.mjs';
import {createObstacleJump} from './jump.mjs';
// Sample the existing rendered treads/decks; no duplicate outside stair model.
export function createAsylumOutside(THREE,exterior){
 let obstacles,indices,supports,walkSurfaces,jumper,jumpObstacles;
 const safePositions=new WeakMap();
 function refresh(){
  // Aerial batching retains its hidden originals for inspection. Use those
  // sources for collision/support, then restore the exact render visibility.
  const visibility=[];
  exterior.model.traverse(o=>{if(o.userData.aerialBatch||o.userData.aerialBatchSource){visibility.push([o,o.visible]);o.visible=!!o.userData.aerialBatchSource;}});
  try{
  obstacles=exteriorObstacles(THREE,exterior.model);
  jumpObstacles=obstacles.jumpObstacles;jumper?.setIndex(createObstacleIndex(jumpObstacles,12,.27));
  walkSurfaces=obstacles.walkSurfaces;supports=new Map();
  // The masonry return stair's solid bases are walkable treads, not walls.
  const masonry=exterior.model.getObjectByName('West forward end masonry return stair');
  const boxes=[];
  masonry?.traverse(o=>{if(o.isMesh){const b=new THREE.Box3().setFromObject(o);boxes.push(b);}});
  obstacles=obstacles.filter(b=>!boxes.some(c=>Math.abs(c.min.x-b.minX)<.02&&Math.abs(c.max.x-b.maxX)<.02&&Math.abs(c.min.z-b.minZ)<.02&&Math.abs(c.max.z-b.maxZ)<.02));
  const matrix=new THREE.Matrix4(),world=new THREE.Matrix4();
  function remember(geometry,transform){
   if(!geometry.boundingBox)geometry.computeBoundingBox();const local=geometry.boundingBox,b=local.clone().applyMatrix4(transform);
   if(geometry.type!=='BoxGeometry'||b.max.y>9.1||b.max.x<-85||b.min.x>85||b.max.z<-48||b.min.z>74||b.max.y-b.min.y>.35||b.max.x-b.min.x<.18||b.max.z-b.min.z<.18)return;
   const corners=[[local.min.x,local.min.z],[local.max.x,local.min.z],[local.max.x,local.max.z],[local.min.x,local.max.z]].map(([x,z])=>{const p=new THREE.Vector3(x,local.max.y,z).applyMatrix4(transform);return [p.x,p.z];});
   const surface={corners,height:b.max.y,minX:b.min.x,maxX:b.max.x,minZ:b.min.z,maxZ:b.max.z};
   for(let x=Math.floor(Math.max(-85,b.min.x)/6);x<=Math.floor(Math.min(85,b.max.x)/6);x++)for(let z=Math.floor(Math.max(-48,b.min.z)/6);z<=Math.floor(Math.min(74,b.max.z)/6);z++){const k=x+','+z;if(!supports.has(k))supports.set(k,[]);supports.get(k).push(surface);}
  }
  exterior.model.traverseVisible(o=>{if(!o.isMesh||o.userData.noWalkingCollision)return;if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);world.multiplyMatrices(o.matrixWorld,matrix);remember(o.geometry,world);}}else remember(o.geometry,o.matrixWorld);});
  for(const b of obstacles)if(b.minY===undefined)Object.assign(b,{minY:-Infinity,maxY:Infinity});
  indices=new Map();
  }finally{for(const [o,visible] of visibility)o.visible=visible;}
 }
 refresh();
 function indexAt(height){const bucket=Math.round(height*4)/4;if(!indices.has(bucket))indices.set(bucket,createObstacleIndex(obstacles.filter(b=>b.maxY>bucket+.35&&b.minY<bucket+1.5),12,.27));return indices.get(bucket);}
 function clearHeightChange(x,z,from,to){
  // Check every collision-height bucket, including the eventual landing.
  // Checking only the old height lets a descent enter a retaining wall and
  // leaves every following horizontal move blocked from inside that wall.
  for(let bucket=Math.round(Math.min(from,to)*4);bucket<=Math.round(Math.max(from,to)*4);bucket++)if(indexAt(bucket/4).contains(x,z))return false;
  return true;
 }
 function heightAt(x,z,height,trend=0){
  const surface=walkSurfaces.find(s=>obstacleContains(s,x,z,1e-7));
  const nearby=supports.get(Math.floor(x/6)+','+Math.floor(z/6))??[];
  let candidates=nearby.filter(s=>s.height<=height+.48&&s.height>=height-2.1&&obstacleContains(s,x,z,1e-7));
  // A sunken-path outline can overlap the coping or a raised landing above
  // it. Keep reachable support above that path instead of pulling feet into
  // the retaining wall. The declared path still supplies its exact floor.
  if(surface&&surface.height<=height+.48)candidates.push(surface);
  // Two photographed rear flights share a half-landing and overlap in plan.
  // Carry the approach's descent through the return onto the lower flight.
  const rearReturn=Math.abs(Math.abs(x)-21.9)<.75&&z>-30.8&&z<-24.8&&height>2.5;
  if(trend<0&&rearReturn){const down=candidates.filter(s=>s.height<=height+.025&&s.height>=height-.5);if(down.length)candidates=down;}
  if(trend>0&&rearReturn){const up=candidates.filter(s=>s.height>=height-.025);if(up.length)candidates=up;}
  const hit=candidates.sort(rearReturn&&trend>0?(a,b)=>Math.abs(a.height-height)-Math.abs(b.height-height):(a,b)=>b.height-a.height)[0];
  if(hit)return hit.height;
  return surface?.height??0;
 }
 function remember(actor){safePositions.set(actor,{x:actor.x,y:actor.y,z:actor.z,verticalTrend:actor.verticalTrend??0});}
 function recover(actor){
  if(!indexAt(actor.y).contains(actor.x,actor.z)){remember(actor);return;}
  const last=safePositions.get(actor);
  // Recover old embedded poses locally, without a restart or a remote spawn.
  // Never cross an obstacle that did not already overlap the starting pose.
  const bucket=Math.round(actor.y*4)/4,blocking=obstacles.filter(b=>b.maxY>bucket+.35&&b.minY<bucket+1.5&&obstacleContains(b,actor.x,actor.z,.27));
  const others=createObstacleIndex(obstacles.filter(b=>!blocking.includes(b)&&b.maxY>bucket+.35&&b.minY<bucket+1.5),12,.27);
  function clearRecoveryPath(x,z){
   const dx=x-actor.x,dz=z-actor.z,steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.04));
   for(let i=1;i<=steps;i++)if(others.contains(actor.x+dx*i/steps,actor.z+dz*i/steps))return false;
   return true;
  }
  // A refreshed obstacle cache can invalidate the current pose. Only reuse
  // a nearby valid pose; doors may have moved this same actor across the map.
  if(last&&Math.hypot(last.x-actor.x,last.y-actor.y,last.z-actor.z)<.8&&clearHeightChange(last.x,last.z,actor.y,last.y)&&clearRecoveryPath(last.x,last.z)){Object.assign(actor,last);return;}
  for(let radius=.04;radius<=.64;radius+=.04)for(let n=0;n<32;n++){
   const dx=Math.cos(n*Math.PI/16)*radius,dz=Math.sin(n*Math.PI/16)*radius,x=actor.x+dx,z=actor.z+dz,y=heightAt(x,z,actor.y);
   if(y>actor.y+.48||!clearHeightChange(x,z,actor.y,y))continue;
   if(!clearRecoveryPath(x,z))continue;
   Object.assign(actor,{x,y:y<actor.y-.5?actor.y:y,z,verticalTrend:0});remember(actor);return;
  }
 }
 function update(actor,dx,dz,dt){
  if(jumper?.update(actor,dx,dz,dt)){actor.verticalTrend=0;return;}
  recover(actor);
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.08));
  for(let i=0;i<steps;i++)for(const [mx,mz] of [[dx/steps,0],[0,dz/steps]]){
   if(!mx&&!mz)continue;
   const x=actor.x+mx,z=actor.z+mz;if(indexAt(actor.y).contains(x,z))continue;
   const y=heightAt(x,z,actor.y,actor.verticalTrend??0),prior=actor.y;
   if(y>actor.y+.48||!clearHeightChange(x,z,actor.y,y))continue;
   actor.x=x;actor.z=z;actor.y=y<actor.y-.5?Math.max(y,actor.y-5*dt/steps):y;
   if(Math.abs(actor.y-prior)>.05)actor.verticalTrend=Math.sign(actor.y-prior);
  }
  // Continue settling after the player releases movement, using the same
  // clearance checks as a walking descent.
  if(!dx&&!dz){const y=heightAt(actor.x,actor.z,actor.y,actor.verticalTrend??0);if(y<actor.y&&clearHeightChange(actor.x,actor.z,actor.y,y))actor.y=Math.max(y,actor.y-5*dt);}
  if(!indexAt(actor.y).contains(actor.x,actor.z))remember(actor);
 }
 return {refresh,heightAt,update,
  jump(actor){
   if(jumper?.airborne)return false;
   // Door destinations use the nominal landing height; the rendered tread
   // can sit a few centimetres above it, just as in ordinary stair walking.
   const support=heightAt(actor.x,actor.z,actor.y);
   if(support>=actor.y&&support<=actor.y+.48&&clearHeightChange(actor.x,actor.z,actor.y,support))actor.y=support;
   jumper??=createObstacleJump(createObstacleIndex(jumpObstacles,12,.27),{groundAt:(x,z,y)=>heightAt(x,z,y-.48+1e-7)});return jumper.start(actor);
  },
  resetJump(){jumper?.reset();},get airborne(){return jumper?.airborne??false;},
  clear:(x,z,y=0)=>!indexAt(y).contains(x,z)};
}
