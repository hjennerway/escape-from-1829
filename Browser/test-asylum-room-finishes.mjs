import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,insidePolygon,segmentDistance} from './dist/asylum-layout.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
import {createAsylumRoomFinisher,roomWallColour} from './dist/asylum-room-finishes.mjs';

const ray=new THREE.Raycaster();
function cast(objects,x,y,z,dx,dz,far=100){
 ray.set(new THREE.Vector3(x,y,z),new THREE.Vector3(dx,0,dz).normalize());ray.far=far;return ray.intersectObjects(objects,false)[0];
}
function colour(hit){return hit?.object.geometry.attributes.roomFinish.getX(hit.face.a);}
// A single long face crosses three uses and a corridor. Its two sides must
// differ, including the precise corridor edges inside a larger room envelope.
const fixture={id:0,rooms:[
 {id:'R2',points:[[-4,0],[0,0],[0,8],[-4,8]]},
 {id:'R3',points:[[0,0],[4,0],[4,4],[0,4]]},
 {id:'R1',points:[[0,4],[4,4],[4,8],[0,8]]}
],corridors:[{points:[[-4,3],[0,3]],width:1}],shafts:[]};
const finisher=createAsylumRoomFinisher(THREE,fixture,3.8),source=new THREE.BoxGeometry(.18,3.8,8).toNonIndexed();source.translate(0,1.9,4);
const wall=new THREE.Mesh(finisher.geometry(source),new THREE.MeshBasicMaterial()),rail=new THREE.Mesh(finisher.rail(),new THREE.MeshBasicMaterial());wall.updateMatrixWorld(true);rail.updateMatrixWorld(true);
assert.equal(colour(cast([wall],-1,2,1,1,0)),3,'Ward side has faded blue wallpaper');
assert.equal(colour(cast([wall],1,2,1,-1,0)),1,'Opposite nursing room has rose wallpaper');
assert.equal(colour(cast([wall],1,2,6,-1,0)),0,'Treatment side retains masonry');
assert.equal(colour(cast([wall],-1,2,6,1,0)),3,'Ward side of treatment partition stays decorated');
for(const z of [2.56,2.8,3.2,3.44])assert.equal(colour(cast([wall],-1,2,z,1,0)),0,'Corridor remains plain across a split long face');
for(const z of [2.54,3.46])assert.equal(colour(cast([wall],-1,2,z,1,0)),3,'Wallpaper starts precisely outside corridor');
const railHit=cast([rail],-1,1.52,1,1,0);
assert(railHit&&Math.abs(railHit.point.x+.125)<1e-5,'Raised cream rail projects 35mm into the room');
assert.equal(cast([rail],-1,1.52,3,1,0,1.5),undefined,'Rail does not cross a corridor');
assert(!cast([rail],1,1.52,6,-1,0,1),'No rail on treatment side');

const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))),snapshot=JSON.stringify(plan),floors=buildAsylumLayout(plan).floors,scenes=[];
let roomSamples=0,doors=0,windows=0,decoratedRooms=0,brickBoundaries=0;
for(const floor of floors){
 const before=JSON.stringify({walls:floor.walls,doorways:floor.doorways,roomDoors:floor.roomDoors,cells:Array.from(floor.cells)});
 const scene=new THREE.Scene();buildAsylumArchitecture(THREE,scene,floor);scene.updateMatrixWorld(true);scenes.push(scene);
 const walls=['Asylum Brick','Asylum Plaster'].map(name=>scene.getObjectByName(name)),dado=scene.getObjectByName('Asylum Dado'),height=floor.id===2?1.16:1.52;
 assert.equal(dado.geometry.userData.height,height,'Dado remains at 40% of each floor ceiling height');
 assert.equal(scene.children.filter(m=>m.name==='Asylum Dado').length,1,'All room rails share one draw per floor');
 // Inspect the actual corridor faces either side of the ninth mortar joint.
 // A split at the former 1.1m height leaves no red samples here and fails.
 let floorBoundaries=0;
 for(const c of floor.corridors)for(let j=1;j<c.points.length;j++){
  const a=c.points[j-1],b=c.points[j],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  if(length<.1)continue;
  const nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
  for(const t of [.2,.5,.8])for(const side of [-1,1]){
   const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
   const lower=cast(walls,x,1.124,z,nx*side,nz*side,c.width/2+.3);
   if(lower?.object.name!=='Asylum Brick'||colour(lower)!==0)continue;
   const upper=cast(walls,x,1.126,z,nx*side,nz*side,c.width/2+.3);
   assert.equal(upper?.object.name,'Asylum Plaster','Cream starts immediately above the complete red course');
   assert.equal(colour(upper),0,'Corridor face retains brickwork above the joint');
   assert(Math.abs(lower.distance-upper.distance)<1e-5,'Both colours meet on the same wall face');
   floorBoundaries++;brickBoundaries++;
  }
 }
 assert(floorBoundaries>5,'Every floor has exposed corridor boundaries at the mortar joint');
 const glass=scene.getObjectByName('Asylum Glass'),matrix=new THREE.Matrix4();
 if(floor.id===2||floor.windowMode==='scheduled')for(let i=0;i<glass.count;i++){
  glass.getMatrixAt(i,matrix);
  const p=new THREE.Vector3().setFromMatrixPosition(matrix),size=new THREE.Vector3().setFromMatrixScale(matrix),n=new THREE.Vector3(0,0,1).transformDirection(matrix),sill=p.y-size.y/2;
  if(sill<=1.225)continue;
  for(const side of [-1,1]){
   const hit=cast(walls,p.x+n.x*.4*side,(1.125+sill-.1)/2,p.z+n.z*.4*side,-n.x*side,-n.z*side,.5);
   assert.equal(hit?.object.name,'Asylum Plaster','Raised window bases follow the same brick colour boundary');
  }
 }
 for(const room of floor.rooms){
  const expected=roomWallColour(floor,room)+1;let samples=0;
  for(let i=0;i<32;i++)for(const y of [.65,2.15]){
   const angle=i*Math.PI/16,hit=cast(walls,...[room.label[0],y,room.label[1]],Math.cos(angle),Math.sin(angle));
   if(!hit)continue;
   const x=hit.point.x+hit.face.normal.x*.025,z=hit.point.z+hit.face.normal.z*.025;
   if(!insidePolygon(x,z,room.points)||floor.corridors.some(c=>c.points.slice(1).some((b,j)=>segmentDistance(x,z,c.points[j],b)<c.width/2-.05)))continue;
   if(floor.shafts.some(s=>x>s.minX&&x<s.maxX&&z>s.minZ&&z<s.maxZ))continue;
   assert.equal(colour(hit),expected,`${floor.id}:${room.id} at ${hit.point.toArray()} has its assigned finish`);samples++;roomSamples++;
  }
  if(expected){assert(samples>0,`${floor.id}:${room.id} has visible decorated walls`);decoratedRooms++;}
 }
 for(const d of floor.doorways){
  assert(!cast([dado],d.x-d.dz*.4,height,d.z+d.dx*.4,d.dz,-d.dx,.8),'Dado never crosses a door aperture');doors++;
 }
 for(let i=0;i<glass.count;i++){
  glass.getMatrixAt(i,matrix);const p=new THREE.Vector3().setFromMatrixPosition(matrix),size=new THREE.Vector3().setFromMatrixScale(matrix),n=new THREE.Vector3(0,0,1).transformDirection(matrix);
  if(height<=p.y-size.y/2||height>=p.y+size.y/2)continue;
  assert(!cast([dado],p.x+n.x*.4,height,p.z+n.z*.4,-n.x,-n.z,.8),'Dado never crosses a window aperture');windows++;
 }
 assert.equal(JSON.stringify({walls:floor.walls,doorways:floor.doorways,roomDoors:floor.roomDoors,cells:Array.from(floor.cells)}),before,'Room finishes leave walking, doors and room layout intact');
}
assert.equal(scenes[0].getObjectByName('Asylum Plaster').material,scenes[1].getObjectByName('Asylum Plaster').material,'Floors share wallpaper materials');
assert.equal(scenes[0].getObjectByName('Asylum Dado').material,scenes[2].getObjectByName('Asylum Dado').material,'Basement shares cream rail material');
assert.equal(JSON.stringify(plan),snapshot);
console.log(`PASS: ${decoratedRooms} decorated rooms, ${roomSamples} lower/upper wall rays, ${brickBoundaries} corridor colour boundaries at mortar joints, two-sided treatment/ward partition and corridor-edge fixture, 40% raised rails, ${doors} clear doors, ${windows} clear windows, shared batches and unchanged navigation.`);
