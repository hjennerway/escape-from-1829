import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,flatWalkable,moveAsylumActor} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
import {buildRoomDoors,roomDoorContains,roomDoorPose,roomDoorHandle,roomDoorPanels,roomDoorHandlePlate} from './dist/asylum-doors.mjs';
import {furnishAsylum} from './dist/asylum-furniture.mjs';
import {ROOM_USES} from './dist/asylum-room-uses.mjs';

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))),snapshot=JSON.stringify(plan);
const floors=buildAsylumLayout(plan).floors,poses=structuredClone(floors.map(f=>f.roomDoors));
assert.deepEqual(buildAsylumLayout(plan).floors.map(f=>f.roomDoors),poses,'Angles and ties are repeatable across construction and game/exploration');
assert.equal(JSON.stringify(plan),snapshot,'Door fitting leaves the shared plan intact');
let doors=0,limited=0,wallProbes=0,walks=0,hingeContacts=0;
const ray=new THREE.Raycaster(),matrix=new THREE.Matrix4();
function renderedBox(mesh,index){
 const transform=new THREE.Matrix4();mesh.getMatrixAt(index,transform);
 const centre=new THREE.Vector3().setFromMatrixPosition(transform),axes=[0,1,2].map(i=>new THREE.Vector3().setFromMatrixColumn(transform,i)),half=axes.map(v=>v.length()/2);
 axes.forEach(v=>v.normalize());return {centre,axes,half};
}
// Independent box SAT uses actual instance transforms, including the hinge
// plates. A disconnected plate cannot pass by sharing the planner's pin data.
function boxesTouch(a,b){
 const delta=b.centre.clone().sub(a.centre);
 for(const axis of [...a.axes,...b.axes,...a.axes.flatMap(u=>b.axes.map(v=>u.clone().cross(v)))]){
  if(axis.lengthSq()<1e-12)continue;axis.normalize();
  const span=box=>box.axes.reduce((sum,v,i)=>sum+Math.abs(v.dot(axis))*box.half[i],0);
  if(Math.abs(delta.dot(axis))>span(a)+span(b)+.00001)return false;
 }
 return true;
}
// Inspect actual rendered timber and handle edges against actual masonry,
// rather than reusing the planner's polygon overlap calculation.
for(const floor of floors){
 const scene=new THREE.Scene();buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);
 const expected=floor.doorways.filter(d=>d.roomId&&!['stairs','porch','circulation'].includes(ROOM_USES[floor.id]?.[d.roomId]));
 assert.deepEqual(floor.roomDoors.map(d=>d.roomId),expected.map(d=>d.roomId),'Every enclosed room gets a leaf; corridor links and circulation stay clear');
 const leaves=scene.getObjectByName('Asylum RoomDoor');assert.equal(leaves.count,floor.roomDoors.length*5,'Leaves and four raised panels share one paint batch per floor');
 const brick=scene.getObjectByName('Asylum Brick'),plaster=scene.getObjectByName('Asylum Plaster'),skirting=scene.getObjectByName('Asylum Skirting');
 const frame=scene.getObjectByName('Asylum DoorFrame'),iron=scene.getObjectByName('Asylum Iron');
 for(const [i,d] of floor.roomDoors.entries()){
  doors++;const label=`${floor.id} ${d.roomId}`;
  assert(d.targetAngle>=100&&d.targetAngle<=130,`${label}: target is 100–130 degrees`);
  assert(d.openAngle>90&&d.openAngle<=d.targetAngle,`${label}: open, with no over-rotation`);
  assert(d.hingeDistances[d.hingeSide<0?0:1]<=Math.min(...d.hingeDistances)+1e-7,`${label}: hinge faces the nearest perpendicular room wall`);
  const closed=roomDoorPose(d,0),fullyOpen=roomDoorPose(d,180);
  assert(Math.abs(closed.tx*d.dx+closed.tz*d.dz+d.hingeSide)<1e-9,'0 degrees spans the closed aperture');
  assert(Math.abs(fullyOpen.tx*d.dx+fullyOpen.tz*d.dz-d.hingeSide)<1e-9,'180 degrees reverses the leaf along the hinge-side wall');
  assert(Math.abs(closed.x-d.openingX)<.20&&Math.abs(closed.z-d.openingZ)<.20,'Hinge stays on the room face of its existing frame');
  leaves.getMatrixAt(i*5,matrix);
  assert(new THREE.Vector3().setFromMatrixPosition(matrix).distanceTo(new THREE.Vector3(d.x,d.y+d.height/2,d.z))<1e-5,'Rendered leaf uses the walking pose');
  const leafBox=renderedBox(leaves,i*5),opening=floor.doorways.find(o=>o.roomId===d.roomId),frameStart=floor.doorways.indexOf(opening)*9;
  const frameBoxes=Array.from({length:9},(_,j)=>renderedBox(frame,frameStart+j));
  const casing=frameBoxes[(d.hingeSide<0?0:3)+(d.roomSide<0?1:2)];
  for(let j=0;j<3;j++){
   const fixed=renderedBox(iron,i*9+j*3),moving=renderedBox(iron,i*9+j*3+1),pin=renderedBox(iron,i*9+j*3+2);
   assert(boxesTouch(fixed,casing),`${label}: fixed hinge plate attaches to the actual frame`);
   assert(boxesTouch(moving,leafBox),`${label}: moving hinge plate attaches to the actual leaf`);
   assert(boxesTouch(fixed,pin)&&boxesTouch(moving,pin),`${label}: both plates meet the same hinge pin`);
   assert(Math.hypot(pin.centre.x-d.hingeX,pin.centre.z-d.hingeZ)<1e-5,`${label}: leaf pivots on its rendered hinge`);
   hingeContacts+=4;
  }
  // Check the opening sweep, including its final pose, against all rendered
  // jambs, casings and heads in addition to the masonry obstruction checks.
  for(let sample=0;sample<=Math.ceil(d.openAngle/2);sample++){
   const angle=Math.min(sample*2,d.openAngle),pose=roomDoorPose(d,angle),c=Math.cos(pose.rotation),s=Math.sin(pose.rotation),hingeFace=-d.hingeSide*d.roomSide;
   const corner=new THREE.Vector3(pose.x-pose.tx*pose.width/2+s*hingeFace*pose.depth/2,.30,pose.z-pose.tz*pose.width/2+c*hingeFace*pose.depth/2);
   assert(Math.hypot(corner.x-d.hingeX,corner.z-d.hingeZ)<1e-9,`${label}: hinge corner remains fixed through the swing`);
   const sweep={centre:new THREE.Vector3(pose.x,leafBox.centre.y,pose.z),axes:[new THREE.Vector3(c,0,-s),new THREE.Vector3(0,1,0),new THREE.Vector3(s,0,c)],half:leafBox.half};
   assert(frameBoxes.every(box=>!boxesTouch(sweep,box)),`${label}: leaf clears its frame at ${angle} degrees`);
  }
  let contact=Infinity;
  for(const [item,y,objects] of [[d,.13,[brick,skirting]],[d,1.65,[plaster]],[roomDoorPanels(d),.23,[brick,skirting]],[roomDoorPanels(d),1.75,[plaster]],[roomDoorHandle(d),1.10,[plaster,brick]],[roomDoorHandlePlate(d),1.10,[plaster,brick]]]){
   const c=Math.cos(item.rotation),s=Math.sin(item.rotation),corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>new THREE.Vector3(item.x+c*u*item.width/2+s*v*item.depth/2,y,item.z-s*u*item.width/2+c*v*item.depth/2));
   for(let j=0;j<4;j++){
    const a=corners[j],b=corners[(j+1)%4],centre=new THREE.Vector3(item.x,y,item.z);
    // Float32 wall vertices can move a touching mitre by a few microns.
    // Probe just inside the door volume so a valid tangency is not a hit.
    const inset=p=>new THREE.Vector3(item.x,y,item.z).addScaledVector(p.clone().sub(centre),1-.0002/Math.min(item.width,item.depth));
    const start=inset(a),v=inset(b).sub(start),length=v.length();
    ray.set(start,v.normalize());ray.far=length;
    assert.equal(ray.intersectObjects(objects,false).length,0,`${label}: rendered door edge never penetrates masonry/skirting`);wallProbes++;
    const edge=b.clone().sub(a);ray.set(a,edge.clone().normalize());ray.far=edge.length();
    if(ray.intersectObjects(objects,false).length)contact=0;
    // From each corner, measure the nearest wall in all cardinal directions.
    for(const direction of [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]]){
     const vector=new THREE.Vector3(...direction);ray.set(a.clone().addScaledVector(vector,-.001),vector);ray.far=.10;
     const hit=ray.intersectObjects(objects,false)[0];if(hit)contact=Math.min(contact,Math.abs(hit.distance-.001));
    }
   }
  }
  if(d.wallLimited){limited++;assert(d.openAngle<d.targetAngle);assert(contact<.0001,`${label}: constrained leaf/handle touches the rendered wall (${contact})`);}
  else assert.equal(d.openAngle,d.targetAngle,'Unconstrained doors retain their varied target');
  assert(!flatWalkable(floor,d.x,d.z,.02),`${label}: visible leaf blocks walking`);
  const start={x:d.x+Math.sin(d.rotation)*.7,z:d.z+Math.cos(d.rotation)*.7,floor:floor.id,y:floor.elevation};
  if(flatWalkable(floor,start.x,start.z)){
   moveAsylumActor(floors,start,d.x-start.x,d.z-start.z);assert(!roomDoorContains(d,start.x,start.z,.32),'A walked approach stops outside the door');walks++;
  }
 }
}
assert.equal(doors,92,'The three absorbed first-floor central rooms no longer have separate doors');assert(limited>=4,'The real floor layouts exercise wall contact, including the oblique bay and first-floor return');
assert(new Set(floors.flatMap(f=>f.roomDoors.map(d=>d.targetAngle.toFixed(1)))).size>60,'Angles visibly vary between rooms and floors');

// Tight perpendicular wall fixture: the handle meets x=4-.09 first. Solve
// its corner's x coordinate analytically, independently of the planner.
const fixture={id:0,rooms:[{id:'Test',doorSide:'north',points:[[-4,0],[4,0],[4,4],[-4,4]]}],doorways:[{roomId:'Test',x:2.85,z:0,dx:1,dz:0,width:1.9,height:2.5,depth:.18}],walls:[{a:[-4,0],b:[1.90,0]},{a:[3.80,0],b:[4,0]},{a:[4,0],b:[4,4]},{a:[4,4],b:[-4,4]},{a:[-4,4],b:[-4,0]}]};
const [tight]=buildRoomDoors(fixture);assert.equal(tight.hingeSide,1);assert(tight.wallLimited&&tight.openAngle<100);
const handleReach=.08-tight.depth/2,r=Math.hypot(tight.width-.18+.0325,handleReach),alpha=Math.atan2(handleReach,tight.width-.18+.0325),expected=90+(Math.asin((4-.09-tight.hingeX)/r)-alpha)*180/Math.PI;
assert(Math.abs(tight.openAngle-expected)<1e-5,'Tight room stops at the analytically calculated handle/wall contact angle');
fixture.doorways[0].x=-2.85;fixture.walls[0].b=[-3.80,0];fixture.walls[1].a=[-1.90,0];
const [mirrored]=buildRoomDoors(fixture);assert.equal(mirrored.hingeSide,-1);assert(Math.abs(mirrored.openAngle-tight.openAngle)<1e-7,'Mirrored hinges stop at the same physical contact angle');
fixture.doorways[0].x=0;fixture.walls[0].b=[-.95,0];fixture.walls[1].a=[.95,0];fixture.walls[2]={a:[1.2,-100],b:[1.2,100]};
const [longWall]=buildRoomDoors(fixture);
assert.equal(longWall.hingeSide,1,'Visible wall offsets choose the hinge rather than the symmetric room envelope');
assert(longWall.wallLimited&&longWall.openAngle<100,'A long wall blocks the swing even with both endpoints far outside the doorway bounds');
assert.equal(floors[0].roomDoors.find(d=>d.roomId==='R31').hingeSide,1,'East bay uses its closer actual perpendicular return');

furnishAsylum(floors);
// Every solid furnishing and full shelf access strip must stay clear of leaves.
for(const floor of floors)for(const item of floor.furniture){
 if(item.decorative)continue;
 const c=Math.cos(item.rotation),s=Math.sin(item.rotation);
 for(const u of [-.5,0,.5])for(const v of [-.5,0,.5])assert(!floor.roomDoors.some(d=>roomDoorContains(d,item.x+c*u*item.width+s*v*item.depth,item.z-s*u*item.width+c*v*item.depth)),`${item.id}: furniture stays outside doors`);
}
console.log(`PASS: ${doors} open room doors, ${hingeContacts} rendered hinge attachments, fixed hinge corners and casing clearance through every swing, nearest-wall hinges, 0/180 angle convention, stable 100–130 degree variation, ${limited} rendered wall contacts, analytic/mirrored tight-wall fixtures, ${wallProbes} wall edge rays, ${walks} walked door collisions, clear circulation and furniture.`);
