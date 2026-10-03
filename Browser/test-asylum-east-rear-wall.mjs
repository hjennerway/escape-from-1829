import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,flatWalkable,moveAsylumActor,segmentDistance,stairRoute} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)));
if(process.argv.includes('--baseline')){
 for(const floor of [0,1])delete plan.rooms.find(r=>r.id==='R5').variants[floor].solidEdges;
 delete plan.rooms.find(r=>r.id==='R16').variants[1].solidEdges;
}
const floors=buildAsylumLayout(plan).floors,ray=new THREE.Raycaster();let samples=0,walks=0;
for(const floor of floors.slice(0,2)){
 const scene=new THREE.Scene();buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
 for(const side of [-1,1]){
  const roomId=side<0?'R5':'R16',stairId=side<0?'S3':'S4';
  // Fixed survey of the purple-line span and its mirrored counterpart,
  // independent of the generated wall segments, on both playable floors.
  for(let i=1;i<25;i++){
   const x=side*(29.110869565217392+(34.6-29.110869565217392)*i/25),z=-32.4;
   assert(!flatWalkable(floor,x,z,.01),roomId+'/'+floor.id+' marked wall is solid in collision and map data');
   for(const face of [-1,1])for(const [kind,y,depth] of [['Brick',.55,.09],['Plaster',1.65,.09],['Plaster',4.19,.09],['Skirting',.13,.1075]]){
    ray.set(new THREE.Vector3(x,y,z+face*.4),new THREE.Vector3(0,0,-face));ray.far=.6;
    const hit=ray.intersectObject(scene.getObjectByName('Asylum '+kind),false)[0];
    assert(hit&&Math.abs(hit.distance-(.4-depth))<1e-5,roomId+'/'+floor.id+' '+kind+' continuously joins both wall faces at '+x+','+z);samples++;
   }
  }
  assert(floor.walls.filter(w=>segmentDistance(side*34.6,-32.4,w.a,w.b)<1e-6).length>=2,roomId+'/'+floor.id+' new wall joins the doorway side wall');
  for(const face of [-1,1]){
   const actor={x:side*32,z:-32.4+face*.7,y:floor.elevation,floor:floor.id};
   moveAsylumActor(floors,actor,0,-face*1.4);
   assert((actor.z+32.4)*face>.42,roomId+'/'+floor.id+' walking stops at both new wall faces');walks++;
  }
  for(const route of [
   [[35.8,-34],[33,-34],[30,-34]], // Existing framed room entrance.
   [[35.8,-31.7],[32,-31.7],[29.95,-31.7]], // Clear landing in front of the wall.
   [[35.8,-25.8],[28,-25.8],[25.55,-25.8]], // Retained fire-exit lobby.
   [[29.8,-33],[33.8,-33]], // Room side of the new wall.
  ])for(const reverse of [false,true]){
   const points=(reverse?[...route].reverse():route).map(([x,z])=>[side*x,z]),actor={x:points[0][0],z:points[0][1],y:floor.elevation,floor:floor.id};
   for(const [x,z] of points.slice(1)){
    moveAsylumActor(floors,actor,x-actor.x,z-actor.z);
    assert(Math.hypot(actor.x-x,actor.z-z)<1e-6,roomId+'/'+floor.id+' room, stair and fire-exit approaches remain walkable both ways');
   }
   walks++;
  }
  assert(floor.doorways.some(d=>d.roomId===roomId&&d.depth===.18),roomId+'/'+floor.id+' retains its regularly fitted doorway');
  // Unlike the deliberately open Reception stair hall, these rear stairs
  // must have no unframed free wall ends beside their enclosed rooms.
  for(const [i,w] of floor.walls.entries())if(!w.exterior)for(const p of [w.a,w.b]){
   const stair=floor.stairs.find(s=>s.id===stairId&&p[0]>Math.min(...s.points.map(v=>v[0]))-.4&&p[0]<Math.max(...s.points.map(v=>v[0]))+.4&&p[1]>Math.min(...s.points.map(v=>v[1]))-.4&&p[1]<Math.max(...s.points.map(v=>v[1]))+.4);
   if(!stair||floor.walls.some((v,j)=>j!==i&&segmentDistance(...p,v.a,v.b)<.12))continue;
   const doorway=floor.doorways.some(d=>Math.abs((p[0]-d.x)*-d.dz+(p[1]-d.z)*d.dx)<.001&&Math.abs(Math.abs((p[0]-d.x)*d.dx+(p[1]-d.z)*d.dz)-d.width/2)<.001);
   assert(doorway,stairId+'/'+floor.id+' has no remaining unframed room-wall end at '+p);
  }
 }
}
// Independent side-turn departures keep the player on the landing, clear of
// the new walls. Walk complete ascents and descents, then release each flight.
for(const id of ['S3','S4']){
 const route=stairRoute(plan.stairs.find(s=>s.id===id),0,4.2);
 for(const reverse of [false,true]){
  const points=reverse?[...route].reverse():route,first=points[0],actor={x:first[0],z:first[2]-.1,y:first[1],floor:reverse?1:0};
  const departures=id==='S3'?[[-33.45,0,-31.75],[-29.55,4.2,-31.75]]:[[30.45,0,-31.75],[34.35,4.2,-31.75]],departure=departures[reverse?0:1];
  for(const [x,,z] of [...points,departure]){
   for(let n=0;n<1000&&Math.hypot(actor.x-x,actor.z-z)>.025;n++){
    const dx=x-actor.x,dz=z-actor.z,d=Math.hypot(dx,dz),step=Math.min(.055,d);moveAsylumActor(floors,actor,dx/d*step,dz/d*step);
   }
   assert(Math.hypot(actor.x-x,actor.z-z)<.04,id+' is walked completely, including the landing turn');
  }
  assert.equal(actor.floor,reverse?0:1);assert.equal(actor.stair,null,'The landing turn leaves the flight');walks++;
 }
}
console.log('PASS: four rear-stair room closures, '+samples+' two-face masonry/skirting rays, joined doorway walls, '+walks+' collision/approach/stair walks, regular frames and no loose rear-stair wall ends.');
